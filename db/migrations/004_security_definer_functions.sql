-- 004_security_definer_functions.sql

-- 1. api_write: Central security definer write controller
create or replace function api_write(
  p_org_id uuid,
  p_user_id uuid,
  p_role membership_role,
  p_resource text,
  p_op text, -- 'create', 'update', 'delete'
  p_id uuid default null,
  p_data jsonb default '{}'::jsonb
)
returns json
language plpgsql
security definer
as $$
declare
  v_result jsonb;
  v_id uuid;
begin
  -- Validate operation
  if p_op not in ('create', 'update', 'delete') then
    return json_build_object('error', 'Invalid operation: ' || p_op, 'code', 'BAD_REQUEST');
  end if;

  -- 1. CAMPAIGNS
  if p_resource = 'campaigns' then
    if p_op in ('create', 'update') then
      if p_role not in ('marketing_manager', 'brand_admin', 'owner') then
        return json_build_object('error', 'Insufficient permissions to modify campaigns', 'code', 'FORBIDDEN');
      end if;

      if p_op = 'create' then
        insert into campaigns (
          org_id, name, brief, audience, platform, status, deadline, brand_kit_id, assigned_to, created_by
        ) values (
          p_org_id,
          p_data->>'name',
          p_data->>'brief',
          p_data->>'audience',
          p_data->>'platform',
          coalesce((p_data->>'status')::campaign_status, 'draft'::campaign_status),
          case when p_data->>'deadline' is not null then (p_data->>'deadline')::timestamptz else null end,
          case when p_data->>'brand_kit_id' is not null then (p_data->>'brand_kit_id')::uuid else null end,
          case when p_data->>'assigned_to' is not null then (p_data->>'assigned_to')::uuid else null end,
          p_user_id
        ) returning to_jsonb(campaigns.*) into v_result;
        return json_build_object('success', true, 'data', v_result);

      elsif p_op = 'update' then
        update campaigns set
          name = coalesce(p_data->>'name', name),
          brief = case when p_data ? 'brief' then p_data->>'brief' else brief end,
          audience = case when p_data ? 'audience' then p_data->>'audience' else audience end,
          platform = case when p_data ? 'platform' then p_data->>'platform' else platform end,
          status = case when p_data ? 'status' then (p_data->>'status')::campaign_status else status end,
          deadline = case when p_data ? 'deadline' then (p_data->>'deadline')::timestamptz else deadline end,
          brand_kit_id = case when p_data ? 'brand_kit_id' then (p_data->>'brand_kit_id')::uuid else brand_kit_id end,
          assigned_to = case when p_data ? 'assigned_to' then (p_data->>'assigned_to')::uuid else assigned_to end
        where id = p_id and org_id = p_org_id
        returning to_jsonb(campaigns.*) into v_result;

        if v_result is null then
          return json_build_object('error', 'Campaign not found in active organization', 'code', 'NOT_FOUND');
        end if;
        return json_build_object('success', true, 'data', v_result);
      end if;

    elsif p_op = 'delete' then
      if p_role not in ('brand_admin', 'owner') then
        return json_build_object('error', 'Only Brand Admin and Owner can delete campaigns', 'code', 'FORBIDDEN');
      end if;

      delete from campaigns where id = p_id and org_id = p_org_id returning to_jsonb(campaigns.*) into v_result;
      if v_result is null then
        return json_build_object('error', 'Campaign not found in active organization', 'code', 'NOT_FOUND');
      end if;
      return json_build_object('success', true, 'data', v_result);
    end if;

  -- 2. ASSETS
  elsif p_resource = 'assets' then
    if p_op in ('create', 'update') then
      if p_role not in ('designer', 'marketing_manager', 'brand_admin', 'owner') then
        return json_build_object('error', 'Insufficient permissions to create or update assets', 'code', 'FORBIDDEN');
      end if;

      if p_op = 'create' then
        insert into assets (
          org_id, campaign_id, brand_kit_id, title, description, category, status,
          current_version, width, height, storage_path, thumbnail_path, quality_score, created_by
        ) values (
          p_org_id,
          case when p_data->>'campaign_id' is not null then (p_data->>'campaign_id')::uuid else null end,
          case when p_data->>'brand_kit_id' is not null then (p_data->>'brand_kit_id')::uuid else null end,
          coalesce(p_data->>'title', 'Untitled Asset'),
          p_data->>'description',
          coalesce(p_data->>'category', 'Social Media'),
          coalesce((p_data->>'status')::asset_status, 'draft'::asset_status),
          coalesce((p_data->>'current_version')::integer, 1),
          coalesce((p_data->>'width')::integer, 1080),
          coalesce((p_data->>'height')::integer, 1080),
          p_data->>'storage_path',
          p_data->>'thumbnail_path',
          case when p_data->>'quality_score' is not null then (p_data->>'quality_score')::numeric else null end,
          p_user_id
        ) returning to_jsonb(assets.*) into v_result;

        -- Also record initial version
        if v_result is not null and p_data->>'storage_path' is not null then
          insert into asset_versions (
            asset_id, org_id, version_no, storage_path, prompt, negative_prompt, model, params, locale
          ) values (
            (v_result->>'id')::uuid,
            p_org_id,
            1,
            p_data->>'storage_path',
            p_data->>'prompt',
            p_data->>'negative_prompt',
            p_data->>'model',
            coalesce(p_data->'params', '{}'::jsonb),
            coalesce(p_data->>'locale', 'en')
          );
        end if;

        return json_build_object('success', true, 'data', v_result);

      elsif p_op = 'update' then
        update assets set
          title = coalesce(p_data->>'title', title),
          description = case when p_data ? 'description' then p_data->>'description' else description end,
          category = coalesce(p_data->>'category', category),
          status = case when p_data ? 'status' then (p_data->>'status')::asset_status else status end,
          storage_path = case when p_data ? 'storage_path' then p_data->>'storage_path' else storage_path end,
          thumbnail_path = case when p_data ? 'thumbnail_path' then p_data->>'thumbnail_path' else thumbnail_path end,
          quality_score = case when p_data ? 'quality_score' then (p_data->>'quality_score')::numeric else quality_score end
        where id = p_id and org_id = p_org_id
        returning to_jsonb(assets.*) into v_result;

        if v_result is null then
          return json_build_object('error', 'Asset not found in active organization', 'code', 'NOT_FOUND');
        end if;
        return json_build_object('success', true, 'data', v_result);
      end if;

    elsif p_op = 'delete' then
      if p_role not in ('brand_admin', 'owner') then
        return json_build_object('error', 'Only Brand Admin and Owner can delete assets', 'code', 'FORBIDDEN');
      end if;

      delete from assets where id = p_id and org_id = p_org_id returning to_jsonb(assets.*) into v_result;
      if v_result is null then
        return json_build_object('error', 'Asset not found in active organization', 'code', 'NOT_FOUND');
      end if;
      return json_build_object('success', true, 'data', v_result);
    end if;

  -- 3. BRAND KITS
  elsif p_resource = 'brand_kits' then
    if p_op in ('create', 'update') then
      if p_role not in ('brand_admin', 'owner') then
        return json_build_object('error', 'Only Brand Admin and Owner can modify brand kits', 'code', 'FORBIDDEN');
      end if;

      if p_op = 'create' then
        insert into brand_kits (
          org_id, name, tokens, guidelines_text, created_by
        ) values (
          p_org_id,
          coalesce(p_data->>'name', 'Default Brand Kit'),
          coalesce(p_data->'tokens', '{}'::jsonb),
          p_data->>'guidelines_text',
          p_user_id
        ) returning to_jsonb(brand_kits.*) into v_result;
        return json_build_object('success', true, 'data', v_result);

      elsif p_op = 'update' then
        update brand_kits set
          name = coalesce(p_data->>'name', name),
          tokens = case when p_data ? 'tokens' then p_data->'tokens' else tokens end,
          guidelines_text = case when p_data ? 'guidelines_text' then p_data->>'guidelines_text' else guidelines_text end
        where id = p_id and org_id = p_org_id
        returning to_jsonb(brand_kits.*) into v_result;

        if v_result is null then
          return json_build_object('error', 'Brand kit not found in active organization', 'code', 'NOT_FOUND');
        end if;
        return json_build_object('success', true, 'data', v_result);
      end if;

    elsif p_op = 'delete' then
      if p_role not in ('owner') then
        return json_build_object('error', 'Only Organization Owner can delete brand kits', 'code', 'FORBIDDEN');
      end if;

      delete from brand_kits where id = p_id and org_id = p_org_id returning to_jsonb(brand_kits.*) into v_result;
      if v_result is null then
        return json_build_object('error', 'Brand kit not found in active organization', 'code', 'NOT_FOUND');
      end if;
      return json_build_object('success', true, 'data', v_result);
    end if;

  -- 4. TEMPLATES
  elsif p_resource = 'templates' then
    if p_op in ('create', 'update') then
      if p_role not in ('brand_admin', 'owner') then
        return json_build_object('error', 'Only Brand Admin and Owner can create/update templates', 'code', 'FORBIDDEN');
      end if;

      if p_op = 'create' then
        insert into templates (
          org_id, title, category, spec, preview_path, is_public
        ) values (
          p_org_id,
          coalesce(p_data->>'title', 'New Template'),
          coalesce(p_data->>'category', 'Social Media'),
          coalesce(p_data->'spec', '{}'::jsonb),
          p_data->>'preview_path',
          false
        ) returning to_jsonb(templates.*) into v_result;
        return json_build_object('success', true, 'data', v_result);

      elsif p_op = 'update' then
        update templates set
          title = coalesce(p_data->>'title', title),
          category = coalesce(p_data->>'category', category),
          spec = case when p_data ? 'spec' then p_data->'spec' else spec end,
          preview_path = case when p_data ? 'preview_path' then p_data->>'preview_path' else preview_path end
        where id = p_id and org_id = p_org_id
        returning to_jsonb(templates.*) into v_result;

        if v_result is null then
          return json_build_object('error', 'Template not found in active organization', 'code', 'NOT_FOUND');
        end if;
        return json_build_object('success', true, 'data', v_result);
      end if;

    elsif p_op = 'delete' then
      if p_role not in ('owner') then
        return json_build_object('error', 'Only Organization Owner can delete templates', 'code', 'FORBIDDEN');
      end if;

      delete from templates where id = p_id and org_id = p_org_id returning to_jsonb(templates.*) into v_result;
      if v_result is null then
        return json_build_object('error', 'Template not found in active organization', 'code', 'NOT_FOUND');
      end if;
      return json_build_object('success', true, 'data', v_result);
    end if;

  else
    return json_build_object('error', 'Unsupported resource for api_write: ' || p_resource, 'code', 'BAD_REQUEST');
  end if;

  return json_build_object('error', 'Unhandled write path', 'code', 'SERVER_ERROR');
end;
$$;

-- 2. resolve_identity: Link Supabase user to app user and return memberships
create or replace function resolve_identity(
  p_supabase_uid text,
  p_email text,
  p_full_name text default null,
  p_avatar_url text default null,
  p_org_id uuid default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_user users%rowtype;
  v_memberships jsonb;
  v_active_membership jsonb;
begin
  -- 1. Try to find user by supabase_user_id
  select * into v_user from users where supabase_user_id = p_supabase_uid;

  -- 2. If not found, try to find by email and link supabase_user_id
  if v_user.id is null and p_email is not null then
    select * into v_user from users where email = lower(p_email);
    if v_user.id is not null then
      update users set
        supabase_user_id = coalesce(supabase_user_id, p_supabase_uid),
        full_name = coalesce(v_user.full_name, p_full_name),
        avatar_url = coalesce(v_user.avatar_url, p_avatar_url)
      where id = v_user.id
      returning * into v_user;
    end if;
  end if;

  -- 3. If still not found, create new user
  if v_user.id is null then
    insert into users (
      email, full_name, avatar_url, supabase_user_id, auth_provider
    ) values (
      lower(p_email), p_full_name, p_avatar_url, p_supabase_uid, 'supabase'
    ) returning * into v_user;
  end if;

  -- 4. Fetch all memberships
  select jsonb_agg(jsonb_build_object(
    'id', m.id,
    'org_id', o.id,
    'org_name', o.name,
    'slug', o.slug,
    'plan', o.plan,
    'role', m.role
  ))
  into v_memberships
  from memberships m
  join organizations o on o.id = m.org_id
  where m.user_id = v_user.id;

  if v_memberships is null then
    return json_build_object(
      'needs_onboarding', true,
      'user', to_jsonb(v_user),
      'memberships', '[]'::jsonb
    );
  end if;

  -- 5. Find selected or first membership
  if p_org_id is not null then
    select jsonb_build_object(
      'id', m.id,
      'org_id', o.id,
      'org_name', o.name,
      'slug', o.slug,
      'plan', o.plan,
      'role', m.role
    )
    into v_active_membership
    from memberships m
    join organizations o on o.id = m.org_id
    where m.user_id = v_user.id and m.org_id = p_org_id;
  end if;

  if v_active_membership is null then
    v_active_membership := v_memberships->0;
  end if;

  return json_build_object(
    'needs_onboarding', false,
    'user', to_jsonb(v_user),
    'memberships', v_memberships,
    'active_org', v_active_membership
  );
end;
$$;

-- 3. switch_organization: Join memberships and return membership data
create or replace function switch_organization(
  p_user_id uuid,
  p_org_id uuid
)
returns json
language plpgsql
security definer
as $$
declare
  v_membership jsonb;
begin
  select jsonb_build_object(
    'id', m.id,
    'org_id', o.id,
    'org_name', o.name,
    'slug', o.slug,
    'plan', o.plan,
    'role', m.role
  )
  into v_membership
  from memberships m
  join organizations o on o.id = m.org_id
  where m.user_id = p_user_id and m.org_id = p_org_id;

  if v_membership is null then
    return json_build_object('error', 'User is not a member of the target organization', 'code', 'FORBIDDEN');
  end if;

  return json_build_object('success', true, 'membership', v_membership);
end;
$$;

-- 4. bootstrap_workspace: Creates org, owner membership, and default brand kit
create or replace function bootstrap_workspace(
  p_user_id uuid,
  p_org_name text,
  p_plan text default 'free'
)
returns json
language plpgsql
security definer
as $$
declare
  v_org organizations%rowtype;
  v_membership memberships%rowtype;
  v_slug text;
  v_base_slug text;
  v_counter integer := 1;
begin
  if p_plan not in ('free', 'pro', 'enterprise') then
    p_plan := 'free';
  end if;

  -- Generate slug
  v_base_slug := lower(regexp_replace(trim(p_org_name), '[^a-zA-Z0-9]+', '-', 'g'));
  if length(v_base_slug) = 0 then
    v_base_slug := 'workspace';
  end if;
  v_slug := v_base_slug;

  while exists (select 1 from organizations where slug = v_slug) loop
    v_slug := v_base_slug || '-' || v_counter;
    v_counter := v_counter + 1;
  end loop;

  -- Create Organization
  insert into organizations (name, slug, plan)
  values (p_org_name, v_slug, p_plan)
  returning * into v_org;

  -- Create Owner Membership
  insert into memberships (user_id, org_id, role)
  values (p_user_id, v_org.id, 'owner'::membership_role)
  returning * into v_membership;

  -- Create Default Brand Kit
  insert into brand_kits (
    org_id, name, tokens, created_by
  ) values (
    v_org.id,
    v_org.name || ' Brand Kit',
    '{"colors":{"primary":"#8B5CF6","secondary":"#C4B5FD","accent":"#A78BFA"},"fonts":{"heading":"Poppins","body":"Poppins"},"tone":"clear, practical, warm"}'::jsonb,
    p_user_id
  );

  return json_build_object(
    'success', true,
    'org', to_jsonb(v_org),
    'membership', json_build_object(
      'id', v_membership.id,
      'org_id', v_org.id,
      'org_name', v_org.name,
      'slug', v_org.slug,
      'plan', v_org.plan,
      'role', v_membership.role
    )
  );
end;
$$;

-- 5. rag_upsert_chunk: Stores vector chunk with idempotent delete on index 0
create or replace function rag_upsert_chunk(
  p_org_id uuid,
  p_brand_kit_id uuid,
  p_chunk_index integer,
  p_content text,
  p_embedding_text text
)
returns json
language plpgsql
security definer
as $$
declare
  v_kit_exists boolean;
  v_chunk_id uuid;
begin
  -- Verify brand kit belongs to org
  select exists(
    select 1 from brand_kits where id = p_brand_kit_id and org_id = p_org_id
  ) into v_kit_exists;

  if not v_kit_exists then
    return json_build_object('error', 'Brand kit not found in caller organization', 'code', 'NOT_FOUND');
  end if;

  -- On chunk_index = 0, delete all prior chunks for this kit to make ingestion idempotent
  if p_chunk_index = 0 then
    delete from brand_chunks where brand_kit_id = p_brand_kit_id and org_id = p_org_id;
  end if;

  -- Insert new chunk
  insert into brand_chunks (
    brand_kit_id, org_id, chunk_index, content, embedding
  ) values (
    p_brand_kit_id, p_org_id, p_chunk_index, p_content, p_embedding_text::vector
  ) returning id into v_chunk_id;

  return json_build_object('success', true, 'chunk_id', v_chunk_id, 'chunk_index', p_chunk_index);
end;
$$;

-- 6. rag_retrieve: Dual confidence-gated RAG retrieval
create or replace function rag_retrieve(
  p_org_id uuid,
  p_embedding_text text,
  p_limit integer default 6
)
returns json
language plpgsql
security definer
as $$
declare
  v_clamped_limit integer;
  v_top1 numeric := 0;
  v_top2 numeric := 0;
  v_gap numeric := 0;
  v_confident boolean := false;
  v_chunks jsonb;
begin
  -- Clamp limit between 1 and 20
  v_clamped_limit := greatest(1, least(coalesce(p_limit, 6), 20));

  -- CTE to calculate top similarities and compute rank gap
  with ranked as (
    select
      id,
      brand_kit_id,
      chunk_index,
      content,
      (1 - (embedding <=> p_embedding_text::vector)) as similarity,
      row_number() over (order by (embedding <=> p_embedding_text::vector) asc) as rank
    from brand_chunks
    where org_id = p_org_id and embedding is not null
    order by (embedding <=> p_embedding_text::vector) asc
    limit v_clamped_limit
  ),
  top2 as (
    select
      max(case when rank = 1 then similarity else 0 end) as s1,
      max(case when rank = 2 then similarity else 0 end) as s2,
      count(*) as chunk_count
    from ranked
    where rank <= 2
  )
  select
    coalesce(s1, 0),
    coalesce(s2, 0),
    case
      when coalesce(chunk_count, 0) = 0 then 0
      when coalesce(chunk_count, 0) = 1 then coalesce(s1, 0)
      else (coalesce(s1, 0) - coalesce(s2, 0))
    end
  into v_top1, v_top2, v_gap
  from top2;

  -- Dual confidence condition: gap >= 0.03 OR top_similarity >= 0.85
  if v_top1 > 0 and ((v_gap >= 0.03) or (v_top1 >= 0.85)) then
    v_confident := true;
  else
    v_confident := false;
  end if;

  -- Collect chunks formatted as JSON array
  with matches as (
    select
      id,
      brand_kit_id,
      chunk_index,
      content,
      round((1 - (embedding <=> p_embedding_text::vector))::numeric, 4) as similarity
    from brand_chunks
    where org_id = p_org_id and embedding is not null
    order by (embedding <=> p_embedding_text::vector) asc
    limit v_clamped_limit
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'brand_kit_id', brand_kit_id,
    'chunk_index', chunk_index,
    'content', content,
    'similarity', similarity
  )), '[]'::jsonb)
  into v_chunks
  from matches;

  return json_build_object(
    'chunks', v_chunks,
    'top_similarity', round(v_top1::numeric, 4),
    'gap', round(v_gap::numeric, 4),
    'confident', v_confident
  );
end;
$$;
