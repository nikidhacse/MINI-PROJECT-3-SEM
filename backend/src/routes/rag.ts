import { Router, Response } from 'express';
import { z } from 'zod';
import { verifyAuth, requireActiveOrg, AuthenticatedRequest } from '../middleware/auth';
import { ingestBrandGuidelines, retrieveBrandGuidelines } from '../lib/rag';

const router = Router();

const IngestSchema = z.object({
  brand_kit_id: z.string().min(1),
  guidelines_text: z.string().min(5)
});

const RetrieveSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(20).optional().default(6)
});

// POST /rag/ingest
router.post('/ingest', verifyAuth, requireActiveOrg, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = IngestSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Valid brand_kit_id and guidelines_text required', code: 'VALIDATION_ERROR' });
    }

    const orgId = req.user!.org_id!;
    const { brand_kit_id, guidelines_text } = parse.data;

    const result = await ingestBrandGuidelines(orgId, brand_kit_id, guidelines_text);
    return res.status(200).json({
      success: true,
      message: `Successfully indexed ${result.chunks_count} guideline chunks into vector database`,
      chunks_count: result.chunks_count
    });
  } catch (err: any) {
    console.error('RAG Ingest error:', err);
    return res.status(500).json({ error: 'Failed to ingest brand guidelines', code: 'SERVER_ERROR' });
  }
});

// POST /rag/retrieve
router.post('/retrieve', verifyAuth, requireActiveOrg, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = RetrieveSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Valid search query required', code: 'VALIDATION_ERROR' });
    }

    const orgId = req.user!.org_id!;
    const { query: queryText, limit } = parse.data;

    const result = await retrieveBrandGuidelines(orgId, queryText, limit);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('RAG Retrieve error:', err);
    return res.status(500).json({ error: 'Failed to retrieve guidelines', code: 'SERVER_ERROR' });
  }
});

export default router;
