-- EDGE Primary Database Schema Reference
-- Database: blssdohlfcmyhxtpalcf.supabase.co
-- Date: 2025-08-11T20:39:45.425Z
-- Purpose: Reference schema for client deployments

-- TO RESTORE THIS SCHEMA TO A CLIENT DATABASE:
-- 1. Use lucerne-client-clean-schema.sql as the base
-- 2. Apply lucerne-client-functions.sql for functions
-- 3. Apply lucerne-client-policies.sql for RLS policies
-- 4. Update tenant_id values for the specific client

-- KEY TABLES:
-- - employees: Core user management with multi-tenant support
-- - assessments: Performance review data
-- - review_cycles: Review period management  
-- - pulse_questions: Employee survey questions
-- - team_health_pulse_responses: Survey responses
-- - feedback: Continuous feedback system
-- - kudos: Recognition system

-- CRITICAL FEATURES:
-- - tenant_id columns on all tables for multi-tenant isolation
-- - user_id foreign key links to auth.users table
-- - Row Level Security (RLS) policies for data protection
-- - Admin/Manager/Employee role-based access control

-- DEPLOYMENT NOTES:
-- - Always link authenticated users to employee records via user_id
-- - Test admin role recognition immediately after schema deployment
-- - Start with simple RLS policies, add complexity incrementally
-- - Verify environment variables use REACT_APP_ prefix

SELECT 'Primary schema reference created' AS status;
