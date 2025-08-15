-- Team Deployment Cleanup Script
-- Run this in Supabase Dashboard SQL Editor
-- Clears test data while preserving reference data

-- Step 1: Clear test data tables (preserve departments & popup_questions)
TRUNCATE TABLE review_cycles CASCADE;
TRUNCATE TABLE employees CASCADE; 
TRUNCATE TABLE users CASCADE;

-- Step 2: Clear any feedback or user-generated content
TRUNCATE TABLE feedback CASCADE;

-- Step 3: Clear auth users (run this separately in Authentication > Users)
-- Go to Dashboard > Authentication > Users and delete all users manually
-- OR run: DELETE FROM auth.users;

-- Step 4: Reset sequences for clean IDs
SELECT setval(pg_get_serial_sequence('users', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('employees', 'id'), 1, false); 
SELECT setval(pg_get_serial_sequence('review_cycles', 'id'), 1, false);

-- Verify cleanup
SELECT 'users' as table_name, COUNT(*) as remaining_records FROM users
UNION ALL
SELECT 'employees' as table_name, COUNT(*) as remaining_records FROM employees  
UNION ALL
SELECT 'review_cycles' as table_name, COUNT(*) as remaining_records FROM review_cycles
UNION ALL
SELECT 'departments' as table_name, COUNT(*) as remaining_records FROM departments
UNION ALL
SELECT 'popup_questions' as table_name, COUNT(*) as remaining_records FROM popup_questions;