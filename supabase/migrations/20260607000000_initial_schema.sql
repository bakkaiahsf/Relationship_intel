create extension if not exists "pgcrypto";

create type public.organization_role as enum ('owner', 'admin', 'member');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organization_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text unique,
  provider_subscription_id text unique,
  status public.subscription_status not null default 'trialing',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = auth.uid()
  );
$$;

grant execute on function public.is_organization_member(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles are readable by owner"
on public.profiles for select using (id = auth.uid());

create policy "profiles are editable by owner"
on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "organizations are readable by members"
on public.organizations for select using (public.is_organization_member(id));

create policy "authenticated users create organizations"
on public.organizations for insert to authenticated with check (created_by = auth.uid());

create policy "memberships are readable by organization members"
on public.organization_members for select
using (public.is_organization_member(organization_id));

create policy "projects are readable by organization members"
on public.projects for select using (public.is_organization_member(organization_id));

create policy "members create projects"
on public.projects for insert to authenticated
with check (created_by = auth.uid() and public.is_organization_member(organization_id));

create policy "members update projects"
on public.projects for update
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));

create policy "subscriptions are readable by organization members"
on public.subscriptions for select using (public.is_organization_member(organization_id));

create policy "audit logs are readable by organization members"
on public.audit_logs for select using (public.is_organization_member(organization_id));

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
