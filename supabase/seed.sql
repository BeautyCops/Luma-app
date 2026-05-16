-- اختياري — بيانات تجريبية بعد schema.sql

insert into public.services (name, description, price, duration_hours, icon, active)
values
  ('عاملة منزلية بالساعة', 'خدمة مرنة حسب وقتك', 90, 3, 'home', true)
on conflict do nothing;
