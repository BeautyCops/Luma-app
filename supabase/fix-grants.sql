-- نفّذي في SQL Editor إذا ظهر: permission denied for function has_role
grant usage on schema public to anon, authenticated, service_role;
grant execute on function public.has_role(uuid, public.app_role) to anon, authenticated, service_role;
