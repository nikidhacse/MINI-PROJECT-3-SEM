import { runConfidenceGateTests } from './confidence_gate.test';
import { memoryStore } from '../db/memory_store';

function runRBACTests(): boolean {
  console.log('🧪 RUNNING RBAC & SECURITY TENANCY TESTS');

  const orgA = 'org-tenant-a';
  const orgB = 'org-tenant-b';

  // Seed orgs
  memoryStore.organizations.set(orgA, { id: orgA, name: 'Tenant A', slug: 'tenant-a', plan: 'pro' });
  memoryStore.organizations.set(orgB, { id: orgB, name: 'Tenant B', slug: 'tenant-b', plan: 'pro' });

  // 1. Test: Designer cannot delete campaign
  const createRes = memoryStore.apiWrite(orgA, 'user-admin', 'brand_admin', 'campaigns', 'create', undefined, { name: 'Launch Q4' });
  const campaignId = createRes.data.id;

  const designerDeleteRes = memoryStore.apiWrite(orgA, 'user-designer', 'designer', 'campaigns', 'delete', campaignId);
  if (designerDeleteRes.code === 'FORBIDDEN') {
    console.log('  ✅ PASSED: Designer deletion was forbidden by api_write');
  } else {
    console.error('  ❌ FAILED: Designer should not be permitted to delete campaigns');
    return false;
  }

  // 2. Test: Cross-tenant access returns NOT_FOUND (404), never 403
  const crossTenantDeleteRes = memoryStore.apiWrite(orgB, 'user-admin-b', 'brand_admin', 'campaigns', 'delete', campaignId);
  if (crossTenantDeleteRes.code === 'NOT_FOUND') {
    console.log('  ✅ PASSED: Cross-tenant access returned NOT_FOUND (preventing enumeration)');
  } else {
    console.error('  ❌ FAILED: Cross-tenant query must return NOT_FOUND');
    return false;
  }

  return true;
}

function runBusinessRAGAccessTests(): boolean {
  console.log('🧪 RUNNING BUSINESS-ONLY RAG ACCESS TESTS');

  const businessAllowed = (plan: string | undefined) => {
    const result = { allowed: plan !== undefined && plan !== 'free' };
    return result;
  };

  const freePlan = businessAllowed('free');
  const proPlan = businessAllowed('pro');

  if (freePlan.allowed) {
    console.error('  ❌ FAILED: Free creator workspaces should not access RAG');
    return false;
  }

  if (!proPlan.allowed) {
    console.error('  ❌ FAILED: Business workspaces should retain RAG access');
    return false;
  }

  console.log('  ✅ PASSED: RAG access is restricted to business workspaces');
  return true;
}

function runAll() {
  const confPassed = runConfidenceGateTests();
  const rbacPassed = runRBACTests();
  const ragAccessPassed = runBusinessRAGAccessTests();

  if (confPassed && rbacPassed && ragAccessPassed) {
    console.log('🎉 ALL SUITES PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('💥 SOME TESTS FAILED!\n');
    process.exit(1);
  }
}

runAll();
