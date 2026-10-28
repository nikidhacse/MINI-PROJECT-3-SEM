-- 003_triggers_and_seeds.sql

-- Trigger function to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply triggers
drop trigger if exists set_orgs_updated_at on organizations;
create trigger set_orgs_updated_at before update on organizations for each row execute function update_updated_at_column();

drop trigger if exists set_users_updated_at on users;
create trigger set_users_updated_at before update on users for each row execute function update_updated_at_column();

drop trigger if exists set_brand_kits_updated_at on brand_kits;
create trigger set_brand_kits_updated_at before update on brand_kits for each row execute function update_updated_at_column();

drop trigger if exists set_campaigns_updated_at on campaigns;
create trigger set_campaigns_updated_at before update on campaigns for each row execute function update_updated_at_column();

drop trigger if exists set_assets_updated_at on assets;
create trigger set_assets_updated_at before update on assets for each row execute function update_updated_at_column();

drop trigger if exists set_generation_jobs_updated_at on generation_jobs;
create trigger set_generation_jobs_updated_at before update on generation_jobs for each row execute function update_updated_at_column();

drop trigger if exists set_support_tickets_updated_at on support_tickets;
create trigger set_support_tickets_updated_at before update on support_tickets for each row execute function update_updated_at_column();

-- Seed platform_presets with exact values
insert into platform_presets (key, label, width, height, aspect, description)
values
  ('instagram_square', 'Instagram Post', 1080, 1080, '1:1', 'Standard square post optimized for feed visibility'),
  ('instagram_story', 'Instagram Story', 1080, 1920, '9:16', 'Full screen vertical format for stories and reels'),
  ('facebook_link', 'Facebook Link', 1200, 630, '16:9', 'Landscape banner optimized for Facebook feeds & link previews'),
  ('linkedin_post', 'LinkedIn Post', 1200, 1200, '1:1', 'High resolution square format for LinkedIn professional feed'),
  ('email_banner', 'Email Banner', 1200, 400, '3:1', 'Wide header banner for email marketing campaigns'),
  ('web_hero', 'Website Hero', 1600, 600, '8:3', 'Ultra-wide banner for website landing hero sections'),
  ('pinterest_pin', 'Pinterest Pin', 1000, 1500, '2:3', 'High-engagement portrait pin for Pinterest boards')
on conflict (key) do update set
  label = excluded.label,
  width = excluded.width,
  height = excluded.height,
  aspect = excluded.aspect,
  description = excluded.description;

-- Seed default public templates
insert into templates (id, org_id, title, category, spec, is_public)
values
  ('a0000000-0000-0000-0000-000000000001', null, 'Minimal Product Showcase', 'Social Media', '{"elements":[{"type":"text","content":"SUMMER COLLECTION","fontSize":48,"color":"#2D1B69","fontFamily":"Poppins","x":100,"y":150},{"type":"text","content":"Now Available Online","fontSize":24,"color":"#6B7280","fontFamily":"Poppins","x":100,"y":230}]}', true),
  ('a0000000-0000-0000-0000-000000000002', null, 'Tech Webinar Hero', 'Banner', '{"elements":[{"type":"text","content":"NEXT-GEN AI WORKFLOWS","fontSize":54,"color":"#8B5CF6","fontFamily":"Poppins","x":80,"y":120},{"type":"text","content":"Join us live this Thursday","fontSize":22,"color":"#2D1B69","fontFamily":"Poppins","x":80,"y":200}]}', true),
  ('a0000000-0000-0000-0000-000000000003', null, 'Creative Brand Announcement', 'Poster', '{"elements":[{"type":"text","content":"BIG NEWS AHEAD","fontSize":64,"color":"#2D1B69","fontFamily":"Poppins","x":120,"y":200},{"type":"text","content":"Stay tuned for what is coming","fontSize":26,"color":"#8B5CF6","fontFamily":"Poppins","x":120,"y":300}]}', true),
  ('a0000000-0000-0000-0000-000000000004', null, 'SaaS Growth Story', 'Marketing', '{"elements":[{"type":"text","content":"10X YOUR DESIGN VELOCITY","fontSize":44,"color":"#2D1B69","fontFamily":"Poppins","x":90,"y":160},{"type":"text","content":"Automated brand consistency","fontSize":20,"color":"#7C3AED","fontFamily":"Poppins","x":90,"y":230}]}', true)
on conflict (id) do nothing;
