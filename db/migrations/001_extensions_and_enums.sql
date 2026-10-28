-- 001_extensions_and_enums.sql
-- Enable vector and pgcrypto extensions
create extension if not exists vector;
create extension if not exists pgcrypto;

-- Enums (wrapped in exception blocks for idempotent re-runs)
do $$ begin
  create type membership_role as enum ('owner', 'brand_admin', 'marketing_manager', 'designer', 'approver');
exception when duplicate_object then null; end $$;

do $$ begin
  create type asset_status as enum ('draft', 'in_review', 'approved', 'rejected', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_status as enum ('draft', 'active', 'paused', 'completed', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_status as enum ('queued', 'retrieving', 'generating', 'storing', 'done', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_decision as enum ('approved', 'rejected', 'changes_requested');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_topic as enum ('generation', 'editing', 'campaigns', 'account', 'billing', 'publishing', 'other');
exception when duplicate_object then null; end $$;
