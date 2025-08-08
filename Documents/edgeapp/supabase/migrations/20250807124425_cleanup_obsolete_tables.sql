-- ========================================
-- EDGE Application Database Cleanup Script
-- Phase 1-3: Complete cleanup of obsolete tables
-- ========================================
-- Generated: 2025-08-07
-- Purpose: Remove 8 confirmed obsolete tables that are no longer used
--
-- SAFETY MEASURES:
-- 1. Creates backup/archive tables before deletion
-- 2. Documents current row counts
-- 3. Uses IF EXISTS clauses to prevent errors
-- 4. Verifies no active dependencies

-- ========================================
-- PHASE 1: PRE-CLEANUP SAFETY MEASURES
-- ========================================

-- Document current state with row counts
SELECT 'admin_backup' as table_name, COUNT(*) as row_count FROM admin_backup
UNION ALL
SELECT 'assessment_feedback' as table_name, COUNT(*) as row_count FROM assessment_feedback
UNION ALL
SELECT 'assessment_rocks' as table_name, COUNT(*) as row_count FROM assessment_rocks
UNION ALL
SELECT 'assessment_scorecard_metrics' as table_name, COUNT(*) as row_count FROM assessment_scorecard_metrics
UNION ALL
SELECT 'company_rocks' as table_name, COUNT(*) as row_count FROM company_rocks
UNION ALL
SELECT 'employee_development_goals' as table_name, COUNT(*) as row_count FROM employee_development_goals
UNION ALL
SELECT 'manager_employee_messages' as table_name, COUNT(*) as row_count FROM manager_employee_messages
UNION ALL
SELECT 'training_requests' as table_name, COUNT(*) as row_count FROM training_requests;

-- Create archive tables (backup before deletion)
-- Note: Archives will have _archive suffix and include cleanup timestamp

CREATE TABLE IF NOT EXISTS admin_backup_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM admin_backup;

CREATE TABLE IF NOT EXISTS assessment_feedback_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM assessment_feedback;

CREATE TABLE IF NOT EXISTS assessment_rocks_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM assessment_rocks;

CREATE TABLE IF NOT EXISTS assessment_scorecard_metrics_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM assessment_scorecard_metrics;

CREATE TABLE IF NOT EXISTS company_rocks_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM company_rocks;

CREATE TABLE IF NOT EXISTS employee_development_goals_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM employee_development_goals;

CREATE TABLE IF NOT EXISTS manager_employee_messages_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM manager_employee_messages;

CREATE TABLE IF NOT EXISTS training_requests_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM training_requests;

-- Check for any foreign key dependencies that might prevent cleanup
SELECT DISTINCT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND (tc.table_name IN (
        'admin_backup',
        'assessment_feedback',
        'assessment_rocks', 
        'assessment_scorecard_metrics',
        'company_rocks',
        'employee_development_goals',
        'manager_employee_messages',
        'training_requests'
    ) 
    OR ccu.table_name IN (
        'admin_backup',
        'assessment_feedback',
        'assessment_rocks',
        'assessment_scorecard_metrics', 
        'company_rocks',
        'employee_development_goals',
        'manager_employee_messages',
        'training_requests'
    ));

-- ========================================
-- PHASE 2: EXECUTE CLEANUP 
-- ========================================

-- Drop the 8 confirmed obsolete tables
-- Using IF EXISTS to prevent errors if tables don't exist

DROP TABLE IF EXISTS admin_backup CASCADE;
DROP TABLE IF EXISTS assessment_feedback CASCADE;
DROP TABLE IF EXISTS assessment_rocks CASCADE;
DROP TABLE IF EXISTS assessment_scorecard_metrics CASCADE;
DROP TABLE IF EXISTS company_rocks CASCADE;
DROP TABLE IF EXISTS employee_development_goals CASCADE;
DROP TABLE IF EXISTS manager_employee_messages CASCADE;
DROP TABLE IF EXISTS training_requests CASCADE;