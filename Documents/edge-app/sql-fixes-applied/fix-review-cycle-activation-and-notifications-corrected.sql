-- Fix Review Cycle Activation and Notifications Issues - CORRECTED VERSION
-- This addresses missing activate_review_cycle_with_assessments function and notifications table issues

-- ============================================================================
-- STEP 1: FIX NOTIFICATIONS TABLE STRUCTURE
-- ============================================================================

-- Add missing columns to notifications table if they don't exist
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure all required columns exist with proper types
ALTER TABLE notifications 
ALTER COLUMN recipient_id SET NOT NULL,
ALTER COLUMN type SET NOT NULL,
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN message SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);

-- ============================================================================
-- STEP 2: CREATE ACTIVATE REVIEW CYCLE FUNCTION - FIXED PARAMETER ORDER
-- ============================================================================

-- Function to activate review cycle and create assessments for all active employees
CREATE OR REPLACE FUNCTION public.activate_review_cycle_with_assessments(
    p_cycle_id UUID,
    _csrf_token TEXT DEFAULT NULL,
    _nonce TEXT DEFAULT NULL,
    _timestamp TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
    v_employee_role TEXT;
    v_cycle_record review_cycles%ROWTYPE;
    v_assessment_count INTEGER := 0;
    v_employee_record RECORD;
    v_assessment_id UUID;
BEGIN
    -- Get current user's employee ID and role
    SELECT id, role INTO v_current_employee_id, v_employee_role
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Check if user is admin
    IF v_employee_role != 'admin' THEN
        RETURN json_build_object('error', 'Access denied: Admin privileges required');
    END IF;
    
    -- Get and validate the review cycle
    SELECT * INTO v_cycle_record
    FROM review_cycles 
    WHERE id = p_cycle_id;
    
    IF v_cycle_record.id IS NULL THEN
        RETURN json_build_object('error', 'Review cycle not found');
    END IF;
    
    -- Check if cycle is in a valid state for activation
    IF v_cycle_record.status = 'active' THEN
        RETURN json_build_object('error', 'Review cycle is already active');
    END IF;
    
    IF v_cycle_record.status = 'closed' THEN
        RETURN json_build_object('error', 'Cannot activate a closed review cycle');
    END IF;
    
    -- Update review cycle status to active
    UPDATE review_cycles 
    SET 
        status = 'active',
        updated_at = NOW()
    WHERE id = p_cycle_id;
    
    -- Create assessments for all active employees
    FOR v_employee_record IN 
        SELECT id, name, email, manager_id
        FROM employees 
        WHERE is_active = true
    LOOP
        -- Insert assessment record
        INSERT INTO assessments (
            employee_id,
            cycle_id,
            self_assessment_status,
            manager_review_status,
            due_date,
            created_at,
            updated_at
        ) VALUES (
            v_employee_record.id,
            p_cycle_id,
            'not_started',
            'pending',
            v_cycle_record.end_date,
            NOW(),
            NOW()
        ) RETURNING id INTO v_assessment_id;
        
        v_assessment_count := v_assessment_count + 1;
        
        -- Create notification for employee about new review cycle
        BEGIN
            PERFORM create_notification(
                v_employee_record.id,
                v_current_employee_id,
                'review_cycle_opened',
                'New Review Cycle Started',
                'A new review cycle "' || v_cycle_record.name || '" has been activated. Please complete your self-assessment by ' || v_cycle_record.end_date::DATE
            );
        EXCEPTION
            WHEN undefined_function THEN
                -- Ignore if notification function doesn't exist
                NULL;
        END;
        
        -- Create notification for manager if employee has one
        IF v_employee_record.manager_id IS NOT NULL THEN
            BEGIN
                PERFORM create_notification(
                    v_employee_record.manager_id,
                    v_current_employee_id,
                    'review_cycle_opened',
                    'New Review Cycle - Team Member Assessment',
                    'Review cycle "' || v_cycle_record.name || '" activated. Your team member ' || v_employee_record.name || ' will need manager review.'
                );
            EXCEPTION
                WHEN undefined_function THEN
                    -- Ignore if notification function doesn't exist
                    NULL;
            END;
        END IF;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Review cycle activated successfully',
        'cycle_id', p_cycle_id,
        'cycle_name', v_cycle_record.name,
        'assessments_created', v_assessment_count,
        'status', 'active'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to activate review cycle: ' || SQLERRM);
END;
$$;

-- ============================================================================
-- STEP 3: CREATE MISSING NOTIFICATION FUNCTIONS (IF NEEDED) - FIXED PARAMETER ORDER
-- ============================================================================

-- Function to create notifications (if it doesn't exist) - CORRECTED PARAMETER ORDER
CREATE OR REPLACE FUNCTION public.create_notification(
    p_recipient_id UUID,
    p_sender_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSON DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    -- Insert notification
    INSERT INTO notifications (
        recipient_id,
        sender_id,
        type,
        title,
        message,
        data,
        created_at,
        updated_at
    ) VALUES (
        p_recipient_id,
        p_sender_id,
        p_type,
        p_title,
        p_message,
        COALESCE(p_data, '{}'::json),
        NOW(),
        NOW()
    ) RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;

-- Function to get user notifications (updated to handle missing columns)
CREATE OR REPLACE FUNCTION public.get_user_notifications()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
    result JSON;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_current_employee_id
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN '[]'::json;
    END IF;
    
    -- Get notifications for current user
    SELECT json_agg(
        json_build_object(
            'id', n.id,
            'recipient_id', n.recipient_id,
            'sender_id', n.sender_id,
            'sender_name', COALESCE(sender.name, 'System'),
            'type', n.type,
            'title', n.title,
            'message', n.message,
            'data', COALESCE(n.data, '{}'::json),
            'read_at', n.read_at,
            'is_read', (n.read_at IS NOT NULL),
            'created_at', COALESCE(n.created_at, NOW()),
            'updated_at', COALESCE(n.updated_at, NOW())
        ) ORDER BY COALESCE(n.created_at, NOW()) DESC
    ) INTO result
    FROM notifications n
    LEFT JOIN employees sender ON n.sender_id = sender.id
    WHERE n.recipient_id = v_current_employee_id;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
    v_count INTEGER;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_current_employee_id
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Count unread notifications
    SELECT COUNT(*) INTO v_count
    FROM notifications 
    WHERE recipient_id = v_current_employee_id 
    AND read_at IS NULL;
    
    RETURN COALESCE(v_count, 0);
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(
    p_notification_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
    v_affected_rows INTEGER;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_current_employee_id
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Update notification read status
    UPDATE notifications 
    SET 
        read_at = NOW(),
        updated_at = NOW()
    WHERE id = p_notification_id 
    AND recipient_id = v_current_employee_id
    AND read_at IS NULL;
    
    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
    
    IF v_affected_rows = 0 THEN
        RETURN json_build_object('error', 'Notification not found or already read');
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Notification marked as read',
        'notification_id', p_notification_id
    );
END;
$$;

-- ============================================================================
-- STEP 4: ENSURE ASSESSMENTS TABLE HAS REQUIRED COLUMNS
-- ============================================================================

-- Add missing columns to assessments table if they don't exist
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing records that might have NULL timestamps
UPDATE assessments 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE assessments 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- ============================================================================
-- STEP 5: GRANT PERMISSIONS - CORRECTED PARAMETER ORDER
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.activate_review_cycle_with_assessments(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, UUID, TEXT, TEXT, TEXT, JSON) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_notifications() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_read(UUID) TO authenticated;

-- ============================================================================
-- STEP 6: UPDATE RLS POLICIES IF NEEDED
-- ============================================================================

-- Ensure notifications table has proper RLS policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS notifications_select_own ON notifications;
    DROP POLICY IF EXISTS notifications_insert_own ON notifications;
    DROP POLICY IF EXISTS notifications_update_own ON notifications;
    
    -- Create new policies
    CREATE POLICY notifications_select_own ON notifications 
    FOR SELECT TO authenticated 
    USING (
        recipient_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
        )
    );
    
    CREATE POLICY notifications_insert_own ON notifications 
    FOR INSERT TO authenticated 
    WITH CHECK (
        recipient_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
        )
        OR
        sender_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
        )
    );
    
    CREATE POLICY notifications_update_own ON notifications 
    FOR UPDATE TO authenticated 
    USING (
        recipient_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
        )
    );
END
$$;

SELECT '✅ Review cycle activation and notifications issues fixed successfully!' as status;