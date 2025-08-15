-- Migration: Add admin WITH CHECK policies for write operations
-- Description: Ensure admin users can reliably perform INSERT/UPDATE operations
-- Issue: Missing WITH CHECK policies can cause unpredictable write failures for admins

-- Step 1: Add WITH CHECK policies for employees table
DO $$ 
BEGIN
    -- Admin INSERT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='employees' AND policyname='admin_insert_employees'
    ) THEN
        CREATE POLICY admin_insert_employees 
        ON public.employees FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_insert_employees policy';
    ELSE
        RAISE NOTICE 'Policy admin_insert_employees already exists';
    END IF;

    -- Admin UPDATE policy (both USING and WITH CHECK)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='employees' AND policyname='admin_update_employees'
    ) THEN
        CREATE POLICY admin_update_employees 
        ON public.employees FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_update_employees policy';
    ELSE
        RAISE NOTICE 'Policy admin_update_employees already exists';
    END IF;
END $$;

-- Step 2: Add WITH CHECK policies for assessments table
DO $$ 
BEGIN
    -- Admin INSERT policy for assessments
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='assessments' AND policyname='admin_insert_assessments'
    ) THEN
        CREATE POLICY admin_insert_assessments 
        ON public.assessments FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_insert_assessments policy';
    ELSE
        RAISE NOTICE 'Policy admin_insert_assessments already exists';
    END IF;

    -- Admin UPDATE policy for assessments
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='assessments' AND policyname='admin_update_assessments'
    ) THEN
        CREATE POLICY admin_update_assessments 
        ON public.assessments FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_update_assessments policy';
    ELSE
        RAISE NOTICE 'Policy admin_update_assessments already exists';
    END IF;
END $$;

-- Step 3: Add WITH CHECK policies for review_cycles table
DO $$ 
BEGIN
    -- Admin INSERT policy for review_cycles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='review_cycles' AND policyname='admin_insert_review_cycles'
    ) THEN
        CREATE POLICY admin_insert_review_cycles 
        ON public.review_cycles FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_insert_review_cycles policy';
    ELSE
        RAISE NOTICE 'Policy admin_insert_review_cycles already exists';
    END IF;

    -- Admin UPDATE policy for review_cycles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='review_cycles' AND policyname='admin_update_review_cycles'
    ) THEN
        CREATE POLICY admin_update_review_cycles 
        ON public.review_cycles FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_update_review_cycles policy';
    ELSE
        RAISE NOTICE 'Policy admin_update_review_cycles already exists';
    END IF;
END $$;

-- Step 4: Add WITH CHECK policies for development_plans table  
DO $$ 
BEGIN
    -- Admin INSERT policy for development_plans
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='development_plans' AND policyname='admin_insert_development_plans'
    ) THEN
        CREATE POLICY admin_insert_development_plans 
        ON public.development_plans FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_insert_development_plans policy';
    ELSE
        RAISE NOTICE 'Policy admin_insert_development_plans already exists';
    END IF;

    -- Admin UPDATE policy for development_plans
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='development_plans' AND policyname='admin_update_development_plans'
    ) THEN
        CREATE POLICY admin_update_development_plans 
        ON public.development_plans FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_update_development_plans policy';
    ELSE
        RAISE NOTICE 'Policy admin_update_development_plans already exists';
    END IF;
END $$;

-- Step 5: Verification - List all policies created
SELECT 
    'Policy Summary' as status,
    tablename,
    policyname,
    cmd as operation,
    CASE WHEN qual IS NOT NULL THEN 'USING' END as using_clause,
    CASE WHEN with_check IS NOT NULL THEN 'WITH CHECK' END as with_check_clause
FROM pg_policies 
WHERE schemaname = 'public' 
  AND policyname LIKE 'admin_%'
ORDER BY tablename, policyname;