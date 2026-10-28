export type MembershipRole = 'owner' | 'brand_admin' | 'marketing_manager' | 'designer' | 'approver';
export type PlanType = 'free' | 'pro' | 'enterprise';

export interface Capabilities {
  generate: boolean;
  templates: boolean;
  assetLibrary: boolean;
  editor: boolean;
  schedule: boolean;
  campaigns: boolean;
  brandKit: boolean;
  brandKitEdit: boolean;
  approvals: boolean;
  approvalDecide: boolean;
  analytics: boolean;
  members: boolean;
  isSolo: boolean;
  workspaceLabel: string;
}

export function capabilitiesFor(role: MembershipRole = 'designer', plan: PlanType = 'free'): Capabilities {
  const isTeam = plan !== 'free';
  return {
    // available to everyone
    generate: true,
    templates: true,
    assetLibrary: true,
    editor: true,
    schedule: true,
    // paid plans only
    campaigns:      isTeam,
    brandKit:       isTeam,
    brandKitEdit:   isTeam && ['owner', 'brand_admin'].includes(role),
    approvals:      isTeam,
    approvalDecide: isTeam && ['owner', 'brand_admin', 'approver'].includes(role),
    analytics:      isTeam && ['owner', 'brand_admin', 'marketing_manager'].includes(role),
    members:        isTeam && ['owner', 'brand_admin'].includes(role),
    isSolo:         !isTeam,
    workspaceLabel: isTeam ? 'Business Workspace' : 'Creator Studio',
  };
}
