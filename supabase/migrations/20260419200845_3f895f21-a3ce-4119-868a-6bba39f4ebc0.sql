INSERT INTO public.user_roles (user_id, role)
SELECT 'f4089d20-066c-436a-98f6-ee646751ac99'::uuid, 'admin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = 'f4089d20-066c-436a-98f6-ee646751ac99'::uuid AND role = 'admin'
);