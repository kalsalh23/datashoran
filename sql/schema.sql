-- سكربت إنشاء جداول قاعدة البيانات لمشروع «أطباء وصيدليات مدينة سوران»
-- يمكن تنفيذه من: Supabase Dashboard > SQL Editor

-- ===== جدول الأطباء =====
create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  location text,
  work_days text,
  work_hours text,
  day_off text,
  phone text,
  created_at timestamptz not null default now()
);

-- ===== جدول الصيدليات =====
create table if not exists public.pharmacies (
  id uuid primary key default gen_random_uuid(),
  pharmacy_name text not null,
  doctor_name text,
  location text,
  work_hours text,
  created_at timestamptz not null default now()
);

-- ===== تفعيل الحماية على مستوى الصفوف (RLS) =====
alter table public.doctors enable row level security;
alter table public.pharmacies enable row level security;

-- السماح للزوار (anon) بالإضافة فقط — القراءة تتم من لوحة Supabase
drop policy if exists "anon can insert doctors" on public.doctors;
create policy "anon can insert doctors"
  on public.doctors for insert
  to anon
  with check (true);

drop policy if exists "anon can insert pharmacies" on public.pharmacies;
create policy "anon can insert pharmacies"
  on public.pharmacies for insert
  to anon
  with check (true);
