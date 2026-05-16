-- نفّذي هذا الملف كاملاً في Supabase → SQL Editor (مشروعك الجديد)

-- أنواع
create type public.app_role as enum ('admin', 'user');
create type public.booking_status as enum (
  'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
);
create type public.worker_status as enum ('available', 'busy', 'inactive');

-- صلاحيات
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

-- جداول
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table public.workers (
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

create table public.services (
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

create table public.bookings (
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

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  worker_id uuid references public.workers (id) on delete set null,
  booking_id uuid references public.bookings (id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ملف تعريف تلقائي عند التسجيل
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.workers enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_admin_all" on public.profiles for all using (public.has_role(auth.uid(), 'admin'));

-- user_roles (الأدمن فقط)
create policy "user_roles_admin" on public.user_roles for all using (public.has_role(auth.uid(), 'admin'));

-- workers & services — قراءة للجميع، تعديل للأدمن
create policy "workers_read" on public.workers for select using (true);
create policy "workers_admin" on public.workers for all using (public.has_role(auth.uid(), 'admin'));

create policy "services_read" on public.services for select using (true);
create policy "services_admin" on public.services for all using (public.has_role(auth.uid(), 'admin'));

-- bookings
create policy "bookings_customer_select" on public.bookings for select using (auth.uid() = customer_id);
create policy "bookings_customer_insert" on public.bookings for insert with check (auth.uid() = customer_id);
create policy "bookings_admin" on public.bookings for all using (public.has_role(auth.uid(), 'admin'));

-- reviews
create policy "reviews_read" on public.reviews for select using (true);
create policy "reviews_customer_insert" on public.reviews for insert with check (auth.uid() = customer_id);
create policy "reviews_admin" on public.reviews for all using (public.has_role(auth.uid(), 'admin'));
