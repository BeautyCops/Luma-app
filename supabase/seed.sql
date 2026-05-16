-- اختياري — بيانات تجريبية بعد schema.sql

insert into public.services (name, description, price, duration_hours, icon, active)
values
  ('عاملة منزلية بالساعة', 'خدمة مرنة حسب وقتك', 90, 3, 'home', true)
on conflict do nothing;

-- عاملات افتراضية — لوحة الإدارة (/admin/workers) فقط
insert into public.workers (name, nationality, age, bio, hourly_rate, rating, status)
select v.name, v.nationality, v.age, v.bio, v.hourly_rate, v.rating, v.status::public.worker_status
from (
  values
    ('سارة', 'فلبينية', 32, 'خبرة في التنظيف والترتيب المنزلي', 45, 4.9, 'available'),
    ('مريم', 'إندونيسية', 28, 'متخصصة في العناية بالمنزل والمطبخ', 45, 4.8, 'available'),
    ('أمنة', 'إثيوبية', 30, 'دقة في التفاصيل وخدمة ممتازة', 45, 4.9, 'available'),
    ('روز', 'فلبينية', 29, 'خبرة مع العائلات والأطفال', 45, 4.7, 'available'),
    ('سيتي', 'إندونيسية', 27, 'تنظيم وترتيب احترافي', 45, 4.8, 'busy'),
    ('هاجر', 'إثيوبية', 31, 'سرعة وإتقان في أعمال المنزل', 45, 4.9, 'available')
) as v(name, nationality, age, bio, hourly_rate, rating, status)
where not exists (
  select 1 from public.workers w where w.name = v.name
);
