export type MembershipRole = 'owner' | 'brand_admin' | 'marketing_manager' | 'designer' | 'approver';
export type PlanType = 'free' | 'pro' | 'enterprise';
export type AssetStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | 'archived';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type JobStatus = 'queued' | 'retrieving' | 'generating' | 'storing' | 'done' | 'failed';
export type ApprovalDecision = 'approved' | 'rejected' | 'changes_requested';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketTopic = 'generation' | 'editing' | 'campaigns' | 'account' | 'billing' | 'publishing' | 'other';

export interface UserClaims {
  sub: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  org_id?: string;
  org_name?: string;
  role?: MembershipRole;
  plan?: PlanType;
  exp?: number;
}

export interface BrandTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    [key: string]: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  tone: string;
}

export interface BrandChunk {
  id: string;
  brand_kit_id: string;
  org_id: string;
  chunk_index: number;
  content: string;
  similarity?: number;
}

export interface RagRetrieveResult {
  chunks: Array<{
    id: string;
    brand_kit_id?: string;
    chunk_index: number;
    content: string;
    similarity: number;
  }>;
  top_similarity: number;
  gap: number;
  confident: boolean;
}

export interface CreativeDirectorBrief {
  intent: string;
  subject: string;
  composition: string;
  palette: string[];
  mood: string;
  avoid: string[];
  image_prompt: string;
  negative_prompt: string;
}

export interface PlatformPreset {
  key: string;
  label: string;
  width: number;
  height: number;
  aspect: string;
  description?: string;
}
