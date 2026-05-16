-- نفّذي في Supabase → SQL Editor (مشروع vsjlhvzoowulfcmcqjqm)
-- إذا فشل سطر "already exists" تجاهليه وكمّلي أو شغّلي الملف مرة ثانية بعد التصحيح

-- 1) الأنواع
do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.booking_status as enum (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.worker_status as enum ('available', 'busy', 'inactive');
exception when duplicate_object then null;
end $$;

-- 2) الجداول (قبل الدوال التي تشير إليها)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nationality text,
  age int,
  bio text,
  image_url text,
  hourly_rate numeric not null default 0,
  rating numeric,
  status public.worker_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null default 0,
  duration_hours int not null default 3,
  icon text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  worker_id uuid references public.workers (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  booking_date date not null,
  booking_time time,
  hours int not null default 3,
  total_price numeric not null default 0,
  status public.booking_status not null default 'pending',
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  worker_id uuid references public.workers (id) on delete set null,
  booking_id uuid references public.bookings (id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- 3) الدوال (بعد إنشاء الجداول)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = _user_id and ur.role = _role
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.workers enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_admin_all" on public.profiles for all using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "user_roles_admin" on public.user_roles;
create policy "user_roles_admin" on public.user_roles for all using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "workers_read" on public.workers;
drop policy if exists "workers_admin" on public.workers;
create policy "workers_read" on public.workers for select using (true);
create policy "workers_admin" on public.workers for all using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "services_read" on public.services;
drop policy if exists "services_admin" on public.services;
create policy "services_read" on public.services for select using (true);
create policy "services_admin" on public.services for all using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "bookings_customer_select" on public.bookings;
drop policy if exists "bookings_customer_insert" on public.bookings;
drop policy if exists "bookings_admin" on public.bookings;
create policy "bookings_customer_select" on public.bookings for select using (auth.uid() = customer_id);
create policy "bookings_customer_insert" on public.bookings for insert with check (auth.uid() = customer_id);
create policy "bookings_admin" on public.bookings for all using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "reviews_read" on public.reviews;
drop policy if exists "reviews_customer_insert" on public.reviews;
drop policy if exists "reviews_admin" on public.reviews;
create policy "reviews_read" on public.reviews for select using (true);
create policy "reviews_customer_insert" on public.reviews for insert with check (auth.uid() = customer_id);
create policy "reviews_admin" on public.reviews for all using (public.has_role(auth.uid(), 'admin'));
