-- Migration: Enforce 1:1 employee↔auth mapping
-- Description: Add unique constraint on employees.user_id to prevent duplicate auth mappings
-- Issue: Multiple employee records could reference the same auth user, breaking RLS logic

-- Step 1: Check for and resolve any existing duplicates (safety check)
-- This will identify any duplicate user_id values that would prevent the unique constraint
DO $$
DECLARE
    duplicate_count INTEGER;
    duplicate_record RECORD;
BEGIN
    -- Check for existing duplicates
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT user_id 
        FROM public.employees 
        WHERE user_id IS NOT NULL
        GROUP BY user_id 
        HAVING COUNT(*) > 1
    ) dups;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Found % duplicate user_id values in employees table', duplicate_count;
        
        -- List the duplicates for manual review
        FOR duplicate_record IN 
            SELECT user_id, string_agg(id::text || ':' || email, ', ') as records
            FROM public.employees 
            WHERE user_id IS NOT NULL
            GROUP BY user_id 
            HAVING COUNT(*) > 1
        LOOP
            RAISE NOTICE 'Duplicate user_id %: records %', duplicate_record.user_id, duplicate_record.records;
        END LOOP;
        
        RAISE EXCEPTION 'Cannot add unique constraint: duplicate user_id values exist. Please resolve manually.';
    END IF;
    
    RAISE NOTICE 'No duplicates found. Safe to proceed with unique constraint.';
END $$;

-- Step 2: Add the unique constraint
-- This ensures each auth.users.id can only be referenced by one employee record
CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_user_id 
ON public.employees(user_id) 
WHERE user_id IS NOT NULL;

-- Step 3: Add a comment explaining the constraint
COMMENT ON INDEX uq_employees_user_id IS 
'Ensures 1:1 mapping between auth.users and employees. Critical for RLS policy correctness.';

-- Verification query (will be logged in migration output)
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_employees,
    COUNT(DISTINCT user_id) as unique_user_ids,
    COUNT(*) - COUNT(user_id) as null_user_ids
FROM public.employees;