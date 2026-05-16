-- Run in Supabase → SQL Editor after creating a user (Auth → Users or sign up in the app).
-- Replace YOUR_USER_UUID with the user's id from Authentication → Users.

insert into public.user_roles (user_id, role)
values ('YOUR_USER_UUID', 'admin')
on conflict do nothing;

-- Verify:
-- select * from public.user_roles where role = 'admin';
