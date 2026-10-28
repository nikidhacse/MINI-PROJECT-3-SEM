import { Router, Response } from 'express';
import { verifyAuth, requireActiveOrg, AuthenticatedRequest } from '../middleware/auth';
import { memoryStore } from '../db/memory_store';
import { query, pool, isConnected } from '../db/pool';
import { MembershipRole, AssetStatus, ApprovalDecision } from '../types';

const router = Router();

const ALLOWED_RESOURCES = [
  'campaigns',
  'assets',
  'asset_versions',
  'brand_kits',
  'approvals',
  'templates',
  'generation_jobs',
  'memberships',
  'platform_presets'
];

// 1. GET /api/:resource
router.get('/:resource', verifyAuth, requireActiveOrg, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { resource } = req.params;
    if (!ALLOWED_RESOURCES.includes(resource)) {
      return res.status(400).json({ error: `Invalid resource: ${resource}`, code: 'INVALID_RESOURCE' });
    }

    const orgId = req.user!.org_id!;
    const { id, campaign_id, status, limit = 50, offset = 0 } = req.query;
    const clampedLimit = Math.max(1, Math.min(Number(limit) || 50, 200));
    const numOffset = Math.max(0, Number(offset) || 0);

    // Platform Presets (Global)
    if (resource === 'platform_presets') {
      const presets = Array.from(memoryStore.platform_presets.values());
      return res.status(200).json({ data: presets });
    }

    // 1. Gather PostgreSQL items if available
    let pgItems: any[] = [];
    if (pool && isConnected) {
      try {
        let sql = `SELECT * FROM ${resource} WHERE `;
        const params: any[] = [];
        let pIdx = 1;

        if (resource === 'templates') {
          sql += `(org_id = $${pIdx} OR (org_id IS NULL AND is_public = true)) `;
          params.push(orgId);
          pIdx++;
        } else {
          sql += `org_id = $${pIdx} `;
          params.push(orgId);
          pIdx++;
        }

        if (id) {
          sql += `AND id = $${pIdx} `;
          params.push(id);
          pIdx++;
        }
        if (campaign_id) {
          sql += `AND campaign_id = $${pIdx} `;
          params.push(campaign_id);
          pIdx++;
        }
        if (status) {
          sql += `AND status = $${pIdx} `;
          params.push(status);
          pIdx++;
        }

        sql += `ORDER BY created_at DESC LIMIT $${pIdx} OFFSET $${pIdx + 1}`;
        params.push(clampedLimit, numOffset);

        const r = await query(sql, params);
        if (r && r.rows) {
          pgItems = r.rows;
        }
      } catch (err: any) {
        console.warn('Postgres query notice, using memory store:', err.message);
      }
    }

    // 2. Gather Memory Store items
    let memItems: any[] = [];
    if (resource === 'campaigns') memItems = Array.from(memoryStore.campaigns.values());
    else if (resource === 'assets') memItems = Array.from(memoryStore.assets.values());
    else if (resource === 'asset_versions') memItems = Array.from(memoryStore.asset_versions.values());
    else if (resource === 'brand_kits') memItems = Array.from(memoryStore.brand_kits.values());
    else if (resource === 'approvals') memItems = Array.from(memoryStore.approvals.values());
    else if (resource === 'generation_jobs') memItems = Array.from(memoryStore.generation_jobs.values());
    else if (resource === 'memberships') memItems = Array.from(memoryStore.memberships.values());
    else if (resource === 'templates') memItems = Array.from(memoryStore.templates.values());

    // Filter memory items by organization (or public templates)
    const filteredMem = memItems.filter(item => {
      if (resource === 'templates' && item.is_public && item.org_id === null) return true;
      return item.org_id === orgId;
    });

    // 3. Merge both sources (memory items take priority for latest in-memory writes)
    const itemMap = new Map<string, any>();
    pgItems.forEach(i => itemMap.set(i.id, i));
    filteredMem.forEach(i => itemMap.set(i.id, i));
    let items = Array.from(itemMap.values());

    if (id) {
      const match = items.find(item => item.id === id);
      if (!match) {
        return res.status(404).json({ error: 'Record not found in active organization', code: 'NOT_FOUND' });
      }
      return res.status(200).json({ data: match });
    }

    if (campaign_id) items = items.filter(i => i.campaign_id === campaign_id);
    if (status) items = items.filter(i => i.status === status);

    // Sort by created_at desc
    items.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    const paginated = items.slice(numOffset, numOffset + clampedLimit);
    return res.status(200).json({ data: paginated, count: items.length });
  } catch (err: any) {
    console.error('Resource fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch resource', code: 'SERVER_ERROR' });
  }
});

// 2. POST /api/:resource (Create / Update / Delete / Approval Transition)
router.post('/:resource', verifyAuth, requireActiveOrg, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { resource } = req.params;
    if (!ALLOWED_RESOURCES.includes(resource)) {
      return res.status(400).json({ error: `Invalid resource: ${resource}`, code: 'INVALID_RESOURCE' });
    }

    const orgId = req.user!.org_id!;
    const userId = req.user!.sub;
    const role = (req.user!.role || 'designer') as MembershipRole;
    const { op = 'create', id, data = {} } = req.body;

    // Special State Machine: Approvals Workflow (Section 10)
    if (resource === 'approvals') {
      const { asset_id, decision, comment } = data;
      if (!asset_id || !decision) {
        return res.status(400).json({ error: 'asset_id and decision are required', code: 'VALIDATION_ERROR' });
      }

      // Check permissions: owner, brand_admin, approver
      if (!['owner', 'brand_admin', 'approver'].includes(role)) {
        return res.status(403).json({ error: 'Insufficient permissions to review assets', code: 'FORBIDDEN' });
      }

      // Fetch asset
      const asset = memoryStore.assets.get(asset_id);
      if (!asset || asset.org_id !== orgId) {
        return res.status(404).json({ error: 'Asset not found in active organization', code: 'NOT_FOUND' });
      }

      const currentStatus: AssetStatus = asset.status;
      const targetDecision: ApprovalDecision = decision;

      // Section 10 State Machine Validations:
      // draft -> in_review -> approved -> archived
      // in_review -> rejected -> draft (creates version n+1)
      // in_review -> changes_requested
      let newAssetStatus: AssetStatus;

      if (currentStatus === 'in_review') {
        if (targetDecision === 'approved') {
          newAssetStatus = 'approved';
        } else if (targetDecision === 'rejected') {
          newAssetStatus = 'rejected';
        } else if (targetDecision === 'changes_requested') {
          newAssetStatus = 'in_review'; // changes requested keeps in review or pending creator rework
        } else {
          return res.status(409).json({ error: 'Invalid transition', code: 'BAD_TRANSITION' });
        }
      } else if (currentStatus === 'draft' && targetDecision === 'approved') {
        // Can submit and approve
        newAssetStatus = 'approved';
      } else if (currentStatus === 'approved' && data.archive) {
        newAssetStatus = 'archived';
      } else {
        return res.status(409).json({ error: 'Invalid transition', code: 'BAD_TRANSITION' });
      }

      // Atomic record: Approvals row + update asset
      const approvalId = 'appr-' + Math.random().toString(36).substring(2, 10);
      const approvalRecord = {
        id: approvalId,
        org_id: orgId,
        asset_id: asset.id,
        asset_version_id: null,
        reviewer_id: userId,
        decision: targetDecision,
        comment: comment || '',
        requested_by: asset.created_by,
        requested_at: asset.created_at,
        decided_at: new Date().toISOString()
      };
      memoryStore.approvals.set(approvalId, approvalRecord);

      // On rejection, create version n+1 and preserve prior version
      if (targetDecision === 'rejected') {
        const nextVersionNo = (asset.current_version || 1) + 1;
        const newVersionId = 'ver-' + Math.random().toString(36).substring(2, 10);
        memoryStore.asset_versions.set(newVersionId, {
          id: newVersionId,
          asset_id: asset.id,
          org_id: orgId,
          version_no: nextVersionNo,
          storage_path: asset.storage_path,
          prompt: asset.description || '',
          negative_prompt: '',
          model: 'flux-1-schnell',
          params: {},
          locale: 'en',
          quality_score: asset.quality_score,
          created_at: new Date().toISOString()
        });
        asset.current_version = nextVersionNo;
      }

      asset.status = newAssetStatus;
      asset.updated_at = new Date().toISOString();
      memoryStore.assets.set(asset.id, asset);
      memoryStore.saveToDisk();

      return res.status(200).json({
        success: true,
        approval: approvalRecord,
        asset: asset
      });
    }

    // Call api_write
    let writeResult: any = null;
    if (pool && isConnected) {
      try {
        const r = await query(
          'SELECT api_write($1::uuid, $2::uuid, $3::membership_role, $4::text, $5::text, $6::uuid, $7::jsonb) as result',
          [orgId, userId, role, resource, op, id || null, JSON.stringify(data)]
        );
        if (r && r.rows && r.rows[0]) {
          writeResult = r.rows[0].result;
        }
      } catch (err: any) {
        console.warn('Postgres api_write failed, falling back to memory store:', err.message);
      }
    }

    if (!writeResult) {
      writeResult = memoryStore.apiWrite(orgId, userId, role, resource, op, id, data);
    }

    if (writeResult.error) {
      const statusCode = writeResult.code === 'FORBIDDEN' ? 403 :
        writeResult.code === 'NOT_FOUND' ? 404 :
        writeResult.code === 'BAD_REQUEST' ? 400 : 500;
      return res.status(statusCode).json(writeResult);
    }

    return res.status(op === 'create' ? 201 : 200).json(writeResult);
  } catch (err: any) {
    console.error('API write error:', err);
    return res.status(500).json({ error: 'Failed to process write operation', code: 'SERVER_ERROR' });
  }
});

export default router;
