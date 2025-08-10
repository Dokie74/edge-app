-- RLS Policy Smoke Tests
-- Tests that security policies prevent unauthorized access

-- Test 1: Verify admin policies prevent non-admin writes
BEGIN;
  -- This should be blocked by RLS policies if not admin
  INSERT INTO public.employees (email, name, role, is_active)
  VALUES ('blocked@test.io', 'Should Be Blocked', 'employee', true);
  
  -- If we reach here without error, policies might be missing
  SELECT 'WARNING: Non-admin insert succeeded - check RLS policies' as warning;
ROLLBACK;

-- Test 2: Verify unique constraint prevents duplicate user_id
BEGIN;
  -- Try to create duplicate user_id (should fail)
  INSERT INTO public.employees (user_id, email, name, role, is_active)
  VALUES (
    (SELECT user_id FROM public.employees WHERE user_id IS NOT NULL LIMIT 1),
    'duplicate@test.io',
    'Duplicate Test',
    'employee',
    true
  );
  
  SELECT 'WARNING: Duplicate user_id insert succeeded - check unique constraint' as warning;
ROLLBACK;

-- Test 3: Verify performance indexes exist
SELECT 
  CASE 
    WHEN COUNT(*) >= 7 THEN 'PASS: Performance indexes present'
    ELSE 'FAIL: Missing performance indexes - expected 7+, found ' || COUNT(*)::text
  END as index_check
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'ix_%';

-- Test 4: Verify admin WITH CHECK policies exist
SELECT 
  CASE 
    WHEN COUNT(*) >= 8 THEN 'PASS: Admin WITH CHECK policies present'
    ELSE 'FAIL: Missing admin policies - expected 8+, found ' || COUNT(*)::text
  END as policy_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND policyname LIKE 'admin_%'
  AND cmd IN ('INSERT', 'UPDATE');

-- Test 5: Verify unique constraint on employees.user_id
SELECT 
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'employees' 
        AND indexname = 'uq_employees_user_id'
    ) THEN 'PASS: Unique constraint on user_id exists'
    ELSE 'FAIL: Missing unique constraint on employees.user_id'
  END as unique_constraint_check;