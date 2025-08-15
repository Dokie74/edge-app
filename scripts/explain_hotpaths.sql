-- Performance Analysis for Critical Query Paths
-- Run with EXPLAIN ANALYZE to verify index usage

-- Test 1: Auth user lookup (should use ix_employees_user_id_active)
EXPLAIN ANALYZE
SELECT e.*
FROM public.employees e
WHERE e.user_id = auth.uid()
  AND e.is_active = true;

-- Test 2: Manager hierarchy query (should use ix_employees_manager_active)
EXPLAIN ANALYZE
SELECT e.*
FROM public.employees e
WHERE e.manager_id = (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
)
AND e.is_active = true;

-- Test 3: Assessment joins (should use ix_assessments_employee_cycle)
EXPLAIN ANALYZE
SELECT a.*, e.name as employee_name
FROM public.assessments a
JOIN public.employees e ON e.id = a.employee_id
WHERE a.review_cycle_id = '00000000-0000-0000-0000-000000000000'::uuid
  AND e.is_active = true;

-- Test 4: Role-based queries (should use ix_employees_role_active)
EXPLAIN ANALYZE
SELECT COUNT(*)
FROM public.employees e
WHERE e.role = 'admin'
  AND e.is_active = true;

-- Test 5: Assessment status filtering (should use ix_assessments_status)
EXPLAIN ANALYZE
SELECT COUNT(*)
FROM public.assessments a
WHERE a.status = 'draft';

-- Performance expectations:
-- - All queries should complete in < 50ms for small datasets
-- - Index scans should be used where available
-- - Sequential scans acceptable only for very small tables (<50 rows)