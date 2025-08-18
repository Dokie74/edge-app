-- Emergency Admin Restore Script
-- Run this in your Supabase SQL Editor to restore your admin access

-- First, let's check if the record exists
SELECT * FROM employees WHERE email = 'dokonoski@lucerneintl.com';

-- If no record found, restore the admin record
-- Replace 'YOUR_USER_ID' with your actual auth user ID from the logs (35fd75f3-b770-4f3f-a7ad-c5b35d9b95c1)
INSERT INTO employees (
  user_id, 
  email, 
  name, 
  role, 
  is_active,
  must_change_password,
  created_at,
  updated_at
) VALUES (
  '35fd75f3-b770-4f3f-a7ad-c5b35d9b95c1',  -- Your auth user ID from the logs
  'dokonoski@lucerneintl.com',
  'David Okonoski',
  'admin',
  true,
  false,  -- Admin doesn't need to change password
  NOW(),
  NOW()
) 
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  must_change_password = EXCLUDED.must_change_password,
  updated_at = NOW();

-- Verify the restore worked
SELECT * FROM employees WHERE email = 'dokonoski@lucerneintl.com';