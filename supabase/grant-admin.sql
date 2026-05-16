-- لوحة الإدارة في التطبيق مربوطة بالبريد: r.s.althobaiti@gmail.com
-- لصلاحيات قاعدة البيانات (RLS) أضفي أيضاً صفاً في user_roles:

insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where lower(email) = lower('r.s.althobaiti@gmail.com')
on conflict do nothing;
