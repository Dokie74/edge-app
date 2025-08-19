-- UAT Feedback System with Admin Response and Logging
-- This migration creates comprehensive UAT feedback tracking with admin responses

-- Create UAT feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS uat_feedback (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    category VARCHAR(50) NOT NULL CHECK (category IN ('bug', 'ui_ux', 'feature_request', 'question', 'other')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'dismissed')) DEFAULT 'open',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reproduction_steps TEXT,
    current_url TEXT,
    browser_info TEXT,
    screenshot_data TEXT, -- Base64 encoded image
    screenshot_name VARCHAR(255),
    metadata JSONB, -- Additional system info
    
    -- Admin response fields
    admin_response TEXT,
    admin_notes TEXT,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Dismissal tracking
    dismissed_by_admin BOOLEAN DEFAULT FALSE,
    dismissed_by_user BOOLEAN DEFAULT FALSE,
    admin_dismissed_at TIMESTAMP WITH TIME ZONE,
    user_dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Create admin feedback responses table for tracking admin communications back to users
CREATE TABLE IF NOT EXISTS admin_feedback_responses (
    id SERIAL PRIMARY KEY,
    uat_feedback_id INTEGER REFERENCES uat_feedback(id) ON DELETE CASCADE,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    response_message TEXT NOT NULL,
    response_type VARCHAR(50) DEFAULT 'response' CHECK (response_type IN ('response', 'acknowledgment', 'resolution', 'update')),
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'read', 'dismissed')),
    
    -- Dismissal tracking
    dismissed_by_admin BOOLEAN DEFAULT FALSE,
    dismissed_by_user BOOLEAN DEFAULT FALSE,
    admin_dismissed_at TIMESTAMP WITH TIME ZONE,
    user_dismissed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback activity log for comprehensive tracking
CREATE TABLE IF NOT EXISTS uat_feedback_activity_log (
    id SERIAL PRIMARY KEY,
    uat_feedback_id INTEGER REFERENCES uat_feedback(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- 'created', 'status_changed', 'admin_responded', 'dismissed', 'reopened'
    action_details JSONB,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_uat_feedback_user_id ON uat_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_uat_feedback_status ON uat_feedback(status);
CREATE INDEX IF NOT EXISTS idx_uat_feedback_priority ON uat_feedback(priority);
CREATE INDEX IF NOT EXISTS idx_uat_feedback_category ON uat_feedback(category);
CREATE INDEX IF NOT EXISTS idx_uat_feedback_submitted_at ON uat_feedback(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_uat_feedback_admin_response ON uat_feedback(admin_user_id) WHERE admin_response IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_admin_feedback_responses_recipient ON admin_feedback_responses(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_feedback_responses_feedback_id ON admin_feedback_responses(uat_feedback_id);
CREATE INDEX IF NOT EXISTS idx_admin_feedback_responses_status ON admin_feedback_responses(status);

CREATE INDEX IF NOT EXISTS idx_uat_feedback_activity_log_feedback_id ON uat_feedback_activity_log(uat_feedback_id);
CREATE INDEX IF NOT EXISTS idx_uat_feedback_activity_log_created_at ON uat_feedback_activity_log(created_at DESC);

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_uat_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_uat_feedback_timestamp ON uat_feedback;
CREATE TRIGGER trigger_update_uat_feedback_timestamp
    BEFORE UPDATE ON uat_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_uat_feedback_timestamp();

DROP TRIGGER IF EXISTS trigger_update_admin_feedback_responses_timestamp ON admin_feedback_responses;
CREATE TRIGGER trigger_update_admin_feedback_responses_timestamp
    BEFORE UPDATE ON admin_feedback_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_uat_feedback_timestamp();

-- Function to log feedback activity
CREATE OR REPLACE FUNCTION log_uat_feedback_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO uat_feedback_activity_log (uat_feedback_id, user_id, action_type, action_details, new_values)
        VALUES (NEW.id, NEW.user_id, 'created', 
                jsonb_build_object('category', NEW.category, 'priority', NEW.priority), 
                to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log status changes
        IF OLD.status != NEW.status THEN
            INSERT INTO uat_feedback_activity_log (uat_feedback_id, user_id, action_type, action_details, old_values, new_values)
            VALUES (NEW.id, NEW.admin_user_id, 'status_changed', 
                    jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status),
                    to_jsonb(OLD), to_jsonb(NEW));
        END IF;
        
        -- Log admin responses
        IF OLD.admin_response IS DISTINCT FROM NEW.admin_response AND NEW.admin_response IS NOT NULL THEN
            INSERT INTO uat_feedback_activity_log (uat_feedback_id, user_id, action_type, action_details, new_values)
            VALUES (NEW.id, NEW.admin_user_id, 'admin_responded',
                    jsonb_build_object('response_added', true),
                    to_jsonb(NEW));
        END IF;
        
        -- Log dismissals
        IF OLD.dismissed_by_admin != NEW.dismissed_by_admin AND NEW.dismissed_by_admin = TRUE THEN
            INSERT INTO uat_feedback_activity_log (uat_feedback_id, user_id, action_type, action_details)
            VALUES (NEW.id, NEW.admin_user_id, 'dismissed_by_admin', jsonb_build_object('dismissed', true));
        END IF;
        
        IF OLD.dismissed_by_user != NEW.dismissed_by_user AND NEW.dismissed_by_user = TRUE THEN
            INSERT INTO uat_feedback_activity_log (uat_feedback_id, user_id, action_type, action_details)
            VALUES (NEW.id, NEW.user_id, 'dismissed_by_user', jsonb_build_object('dismissed', true));
        END IF;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for activity logging
DROP TRIGGER IF EXISTS trigger_log_uat_feedback_activity ON uat_feedback;
CREATE TRIGGER trigger_log_uat_feedback_activity
    AFTER INSERT OR UPDATE ON uat_feedback
    FOR EACH ROW
    EXECUTE FUNCTION log_uat_feedback_activity();

-- Enhanced function to submit UAT feedback
CREATE OR REPLACE FUNCTION submit_uat_feedback(
    p_user_id UUID,
    p_user_email VARCHAR(255),
    p_category VARCHAR(50),
    p_priority VARCHAR(20),
    p_title VARCHAR(255),
    p_description TEXT,
    p_reproduction_steps TEXT DEFAULT NULL,
    p_current_url TEXT DEFAULT NULL,
    p_browser_info TEXT DEFAULT NULL,
    p_screenshot_data TEXT DEFAULT NULL,
    p_screenshot_name VARCHAR(255) DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_feedback_id INTEGER;
    v_result JSON;
BEGIN
    -- Insert feedback
    INSERT INTO uat_feedback (
        user_id, user_email, category, priority, title, description,
        reproduction_steps, current_url, browser_info, screenshot_data, 
        screenshot_name, metadata
    )
    VALUES (
        p_user_id, p_user_email, p_category, p_priority, p_title, p_description,
        p_reproduction_steps, p_current_url, p_browser_info, p_screenshot_data,
        p_screenshot_name, p_metadata
    )
    RETURNING id INTO v_feedback_id;
    
    -- Return success result
    v_result := json_build_object(
        'success', true,
        'feedback_id', v_feedback_id,
        'message', 'Feedback submitted successfully'
    );
    
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to submit feedback'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get UAT feedback for admin dashboard
CREATE OR REPLACE FUNCTION get_uat_feedback(
    p_limit INTEGER DEFAULT 50,
    p_status VARCHAR(20) DEFAULT NULL,
    p_category VARCHAR(50) DEFAULT NULL,
    p_priority VARCHAR(20) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_query TEXT;
    v_result JSON;
BEGIN
    v_query := 'SELECT 
                    uf.id,
                    uf.user_id,
                    uf.user_email,
                    uf.category,
                    uf.priority,
                    uf.status,
                    uf.title,
                    uf.description,
                    uf.reproduction_steps,
                    uf.current_url,
                    uf.browser_info,
                    uf.screenshot_data,
                    uf.screenshot_name,
                    uf.metadata,
                    uf.admin_response,
                    uf.admin_notes,
                    uf.admin_user_id,
                    uf.responded_at,
                    uf.submitted_at,
                    uf.updated_at,
                    uf.dismissed_by_admin,
                    uf.dismissed_by_user,
                    uf.admin_dismissed_at,
                    uf.user_dismissed_at,
                    e.name as admin_name
                FROM uat_feedback uf
                LEFT JOIN employees e ON uf.admin_user_id = e.user_id
                WHERE 1=1';
    
    IF p_status IS NOT NULL THEN
        v_query := v_query || ' AND uf.status = ''' || p_status || '''';
    END IF;
    
    IF p_category IS NOT NULL THEN
        v_query := v_query || ' AND uf.category = ''' || p_category || '''';
    END IF;
    
    IF p_priority IS NOT NULL THEN
        v_query := v_query || ' AND uf.priority = ''' || p_priority || '''';
    END IF;
    
    v_query := v_query || ' ORDER BY 
                    CASE WHEN uf.priority = ''critical'' THEN 1
                         WHEN uf.priority = ''high'' THEN 2
                         WHEN uf.priority = ''medium'' THEN 3
                         ELSE 4 END,
                    uf.submitted_at DESC
                    LIMIT ' || p_limit;
    
    EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || v_query || ') t' INTO v_result;
    
    RETURN COALESCE(v_result, '[]'::json);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update UAT feedback status and add admin response
CREATE OR REPLACE FUNCTION update_uat_feedback_status(
    p_feedback_id INTEGER,
    p_status VARCHAR(20),
    p_admin_notes TEXT DEFAULT NULL,
    p_admin_response TEXT DEFAULT NULL,
    p_admin_user_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Update the feedback
    UPDATE uat_feedback 
    SET 
        status = p_status,
        admin_notes = COALESCE(p_admin_notes, admin_notes),
        admin_response = COALESCE(p_admin_response, admin_response),
        admin_user_id = COALESCE(p_admin_user_id, admin_user_id),
        responded_at = CASE WHEN p_admin_response IS NOT NULL THEN NOW() ELSE responded_at END
    WHERE id = p_feedback_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Feedback not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Feedback updated successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add admin response to user
CREATE OR REPLACE FUNCTION add_admin_feedback_response(
    p_uat_feedback_id INTEGER,
    p_admin_user_id UUID,
    p_recipient_user_id UUID,
    p_response_message TEXT,
    p_response_type VARCHAR(50) DEFAULT 'response'
)
RETURNS JSON AS $$
DECLARE
    v_response_id INTEGER;
    v_result JSON;
BEGIN
    -- Insert admin response
    INSERT INTO admin_feedback_responses (
        uat_feedback_id, admin_user_id, recipient_user_id,
        response_message, response_type
    )
    VALUES (
        p_uat_feedback_id, p_admin_user_id, p_recipient_user_id,
        p_response_message, p_response_type
    )
    RETURNING id INTO v_response_id;
    
    -- Update the original feedback with admin response
    UPDATE uat_feedback 
    SET 
        admin_response = p_response_message,
        admin_user_id = p_admin_user_id,
        responded_at = NOW()
    WHERE id = p_uat_feedback_id;
    
    RETURN json_build_object(
        'success', true,
        'response_id', v_response_id,
        'message', 'Admin response sent successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin responses for a user
CREATE OR REPLACE FUNCTION get_user_admin_responses(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10,
    p_include_dismissed BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    v_query TEXT;
    v_result JSON;
BEGIN
    v_query := 'SELECT 
                    afr.id,
                    afr.uat_feedback_id,
                    afr.response_message,
                    afr.response_type,
                    afr.status,
                    afr.dismissed_by_user,
                    afr.sent_at,
                    afr.read_at,
                    uf.title as original_feedback_title,
                    uf.category as original_feedback_category,
                    uf.priority as original_feedback_priority,
                    e.name as admin_name
                FROM admin_feedback_responses afr
                JOIN uat_feedback uf ON afr.uat_feedback_id = uf.id
                LEFT JOIN employees e ON afr.admin_user_id = e.user_id
                WHERE afr.recipient_user_id = ''' || p_user_id || '''';
    
    IF NOT p_include_dismissed THEN
        v_query := v_query || ' AND afr.dismissed_by_user = FALSE';
    END IF;
    
    v_query := v_query || ' ORDER BY afr.sent_at DESC LIMIT ' || p_limit;
    
    EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || v_query || ') t' INTO v_result;
    
    RETURN COALESCE(v_result, '[]'::json);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to dismiss feedback/response (bidirectional)
CREATE OR REPLACE FUNCTION dismiss_uat_feedback(
    p_feedback_id INTEGER DEFAULT NULL,
    p_response_id INTEGER DEFAULT NULL,
    p_user_id UUID,
    p_dismissed_by VARCHAR(10) -- 'admin' or 'user'
)
RETURNS JSON AS $$
BEGIN
    IF p_feedback_id IS NOT NULL THEN
        -- Dismiss original feedback
        IF p_dismissed_by = 'admin' THEN
            UPDATE uat_feedback 
            SET dismissed_by_admin = TRUE, admin_dismissed_at = NOW()
            WHERE id = p_feedback_id;
        ELSE
            UPDATE uat_feedback 
            SET dismissed_by_user = TRUE, user_dismissed_at = NOW()
            WHERE id = p_feedback_id;
        END IF;
    END IF;
    
    IF p_response_id IS NOT NULL THEN
        -- Dismiss admin response
        IF p_dismissed_by = 'admin' THEN
            UPDATE admin_feedback_responses 
            SET dismissed_by_admin = TRUE, admin_dismissed_at = NOW()
            WHERE id = p_response_id;
        ELSE
            UPDATE admin_feedback_responses 
            SET dismissed_by_user = TRUE, user_dismissed_at = NOW()
            WHERE id = p_response_id;
        END IF;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Dismissed successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get feedback statistics
CREATE OR REPLACE FUNCTION get_uat_feedback_stats()
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'total', (SELECT COUNT(*) FROM uat_feedback),
        'open', (SELECT COUNT(*) FROM uat_feedback WHERE status = 'open'),
        'in_progress', (SELECT COUNT(*) FROM uat_feedback WHERE status = 'in_progress'),
        'resolved', (SELECT COUNT(*) FROM uat_feedback WHERE status = 'resolved'),
        'dismissed', (SELECT COUNT(*) FROM uat_feedback WHERE status = 'dismissed'),
        'by_category', (
            SELECT json_object_agg(category, count)
            FROM (
                SELECT category, COUNT(*) as count
                FROM uat_feedback 
                GROUP BY category
            ) cat_stats
        ),
        'by_priority', (
            SELECT json_object_agg(priority, count)
            FROM (
                SELECT priority, COUNT(*) as count
                FROM uat_feedback 
                GROUP BY priority
            ) pri_stats
        ),
        'recent_activity', (
            SELECT COUNT(*) 
            FROM uat_feedback 
            WHERE submitted_at > NOW() - INTERVAL '7 days'
        ),
        'pending_admin_responses', (
            SELECT COUNT(*) 
            FROM uat_feedback 
            WHERE status IN ('open', 'in_progress') AND admin_response IS NULL
        )
    ) INTO v_result;
    
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION submit_uat_feedback TO authenticated;
GRANT EXECUTE ON FUNCTION get_uat_feedback TO authenticated;
GRANT EXECUTE ON FUNCTION update_uat_feedback_status TO authenticated;
GRANT EXECUTE ON FUNCTION add_admin_feedback_response TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_admin_responses TO authenticated;
GRANT EXECUTE ON FUNCTION dismiss_uat_feedback TO authenticated;
GRANT EXECUTE ON FUNCTION get_uat_feedback_stats TO authenticated;

-- Row Level Security (RLS) Policies
ALTER TABLE uat_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE uat_feedback_activity_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view their own UAT feedback" ON uat_feedback
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Users can insert their own feedback
CREATE POLICY "Users can submit UAT feedback" ON uat_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins can update feedback
CREATE POLICY "Admins can update UAT feedback" ON uat_feedback
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Admin responses policies
CREATE POLICY "Users can view responses to their feedback" ON admin_feedback_responses
    FOR SELECT USING (
        auth.uid() = recipient_user_id OR
        EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can insert responses" ON admin_feedback_responses
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users and admins can update responses" ON admin_feedback_responses
    FOR UPDATE USING (
        auth.uid() = recipient_user_id OR
        EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Activity log policies
CREATE POLICY "Users can view activity for their feedback" ON uat_feedback_activity_log
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM uat_feedback uf 
            WHERE uf.id = uat_feedback_activity_log.uat_feedback_id 
            AND uf.user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "System can insert activity logs" ON uat_feedback_activity_log
    FOR INSERT WITH CHECK (true);

-- Comment the tables
COMMENT ON TABLE uat_feedback IS 'Stores UAT feedback reports with admin response capabilities';
COMMENT ON TABLE admin_feedback_responses IS 'Stores admin responses sent back to users who submitted feedback';
COMMENT ON TABLE uat_feedback_activity_log IS 'Comprehensive activity log for all feedback-related actions';

COMMENT ON COLUMN uat_feedback.admin_response IS 'Admin response message that will be shown to the user';
COMMENT ON COLUMN uat_feedback.dismissed_by_admin IS 'Whether admin has dismissed this from their dashboard';
COMMENT ON COLUMN uat_feedback.dismissed_by_user IS 'Whether user has dismissed admin response from their dashboard';