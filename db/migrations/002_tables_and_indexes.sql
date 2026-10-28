-- 002_tables_and_indexes.sql

-- 1. Organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  full_name text,
  avatar_url text,
  password_hash text,
  auth_provider text not null default 'email',
  supabase_user_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Memberships
create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  role membership_role not null default 'designer',
  created_at timestamptz not null default now(),
  unique(user_id, org_id)
);

-- 4. Brand Kits
create table if not exists brand_kits (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  tokens jsonb not null default '{"colors":{"primary":"#8B5CF6","secondary":"#C4B5FD","accent":"#A78BFA"},"fonts":{"heading":"Poppins","body":"Poppins"},"tone":"clear, practical, warm"}'::jsonb,
  guidelines_text text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Brand Chunks
create table if not exists brand_chunks (
  id uuid primary key default gen_random_uuid(),
  brand_kit_id uuid not null references brand_kits(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding vector(256),
  created_at timestamptz not null default now()
);

-- 6. Campaigns
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  brief text,
  audience text,
  platform text,
  status campaign_status not null default 'draft',
  deadline timestamptz,
  brand_kit_id uuid references brand_kits(id) on delete set null,
  assigned_to uuid references users(id) on delete set null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Assets
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  brand_kit_id uuid references brand_kits(id) on delete set null,
  title text not null,
  description text,
  category text default 'Social Media',
  status asset_status not null default 'draft',
  current_version integer not null default 1,
  width integer not null default 1080,
  height integer not null default 1080,
  storage_path text,
  thumbnail_path text,
  embedding vector(256),
  quality_score numeric(4,2),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. Asset Versions
create table if not exists asset_versions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  version_no integer not null,
  storage_path text not null,
  prompt text,
  negative_prompt text,
  model text,
  params jsonb default '{}'::jsonb,
  locale text default 'en',
  quality_score numeric(4,2),
  created_at timestamptz not null default now(),
  unique(asset_id, version_no)
);

-- 9. Approvals
create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  asset_id uuid not null references assets(id) on delete cascade,
  asset_version_id uuid references asset_versions(id) on delete set null,
  reviewer_id uuid references users(id) on delete set null,
  decision approval_decision not null,
  comment text,
  requested_by uuid references users(id) on delete set null,
  requested_at timestamptz not null default now(),
  decided_at timestamptz not null default now()
);

-- 10. Generation Jobs
create table if not exists generation_jobs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  brand_kit_id uuid references brand_kits(id) on delete set null,
  prompt text not null,
  refined_prompt text,
  status job_status not null default 'queued',
  progress integer default 0,
  error_message text,
  result_asset_id uuid references assets(id) on delete set null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 11. Templates
create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  title text not null,
  category text not null default 'Social Media',
  spec jsonb not null default '{}'::jsonb,
  preview_path text,
  is_public boolean default false,
  created_at timestamptz not null default now()
);

-- 12. Platform Presets
create table if not exists platform_presets (
  key text primary key,
  label text not null,
  width integer not null,
  height integer not null,
  aspect text not null,
  description text
);

-- 13. Support Tickets
create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete set null,
  user_id uuid references users(id) on delete set null,
  email text not null,
  name text not null,
  topic ticket_topic not null default 'other',
  subject text not null,
  message text not null,
  status ticket_status not null default 'open',
  chat_transcript jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes on org_id
create index if not exists idx_memberships_org on memberships(org_id);
create index if not exists idx_brand_kits_org on brand_kits(org_id);
create index if not exists idx_brand_chunks_org on brand_chunks(org_id);
create index if not exists idx_campaigns_org on campaigns(org_id);
create index if not exists idx_assets_org on assets(org_id);
create index if not exists idx_asset_versions_org on asset_versions(org_id);
create index if not exists idx_approvals_org on approvals(org_id);
create index if not exists idx_generation_jobs_org on generation_jobs(org_id);
create index if not exists idx_templates_org on templates(org_id);
create index if not exists idx_support_tickets_org on support_tickets(org_id);

-- Composite indexes on (org_id, status)
create index if not exists idx_campaigns_org_status on campaigns(org_id, status);
create index if not exists idx_assets_org_status on assets(org_id, status);

-- Vector HNSW indexes
create index if not exists idx_brand_chunks_embedding on brand_chunks using hnsw (embedding vector_cosine_ops);
create index if not exists idx_assets_embedding on assets using hnsw (embedding vector_cosine_ops);
