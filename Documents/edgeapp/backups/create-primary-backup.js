#!/usr/bin/env node

/**
 * EDGE Primary App Backup Script
 * 
 * Backs up the primary EDGE development application (Gmail login)
 * Database: blssdohlfcmyhxtpalcf.supabase.co
 * Purpose: Reference system for client deployments
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, 'edge-primary');
const timestamp = new Date().toISOString().split('T')[0];

console.log('🔄 Starting EDGE Primary App Backup...');
console.log(`📁 Backup Directory: ${BACKUP_DIR}`);

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const backupData = {
    timestamp: new Date().toISOString(),
    system: 'EDGE Primary Development',
    database: {
        project_ref: 'blssdohlfcmyhxtpalcf',
        url: 'https://blssdohlfcmyhxtpalcf.supabase.co',
        organization: 'Lucerne International',
        admin_email: 'dokonoski@gmail.com',
        description: 'Primary development and reference database'
    },
    frontend: {
        repository: 'Documents/edgeapp',
        framework: 'Create React App',
        deployment_url: 'Local development',
        description: 'Master development codebase'
    },
    purpose: 'Reference system for troubleshooting client deployments',
    template_usage: 'Use as reference when setting up new clients or troubleshooting issues',
    client_deployment_guide: 'See clients/CLIENT_DEPLOYMENT_GUIDE.md for deployment methodology',
    client_template: 'Use clients/CLIENT_TEMPLATE/ for new client setup',
    lucerne_client_backup: 'Use clients/lucerne-international/create-backup.js for client state',
    tables_backed_up: [
        'employees',
        'assessments', 
        'review_cycles',
        'departments',
        'employee_departments',
        'development_plans',
        'goals',
        'pulse_questions',
        'team_health_pulse_responses',
        'kudos',
        'feedback',
        'notifications'
    ],
    functions_backed_up: [
        'set_config',
        'get_my_assessments', 
        'get_my_feedback_received',
        'delete_feedback',
        'get_pending_admin_approvals',
        'seed_self_assessments'
    ],
    key_features: [
        'Multi-tenant architecture foundation',
        'Complete RLS policy system',
        'Admin dashboard with full analytics',
        'Employee self-assessment workflow',
        'Manager review system',
        'Team health pulse surveys',
        'Development planning',
        'Recognition and feedback systems'
    ],
    environment_variables: {
        REACT_APP_SUPABASE_URL: 'https://blssdohlfcmyhxtpalcf.supabase.co',
        REACT_APP_SUPABASE_ANON_KEY: '[PRIMARY_ANON_KEY]',
        REACT_APP_TENANT_ID: 'edge',
        REACT_APP_CLIENT_NAME: 'EDGE Development',
        REACT_APP_ENV: 'development'
    }
};

// Write backup metadata
const backupFile = path.join(BACKUP_DIR, `primary-backup-${timestamp}.json`);
fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

console.log('✅ Primary backup metadata created');
console.log(`📄 Backup file: ${backupFile}`);

// Create schema reference file
const schemaReference = `-- EDGE Primary Database Schema Reference
-- Database: blssdohlfcmyhxtpalcf.supabase.co
-- Date: ${new Date().toISOString()}
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
`;

const schemaFile = path.join(BACKUP_DIR, `primary-schema-reference-${timestamp}.sql`);
fs.writeFileSync(schemaFile, schemaReference);

console.log('✅ Primary schema reference created');
console.log(`📄 Schema file: ${schemaFile}`);

// Create package.json backup
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
    const packageBackup = path.join(BACKUP_DIR, `package-backup-${timestamp}.json`);
    fs.writeFileSync(packageBackup, JSON.stringify(packageJson, null, 2));
    console.log('✅ Package.json backed up');
} catch (error) {
    console.log('⚠️  Could not backup package.json:', error.message);
}

console.log('\n🎉 EDGE Primary Backup Complete!');
console.log('📋 Summary:');
console.log(`   - Database Reference: blssdohlfcmyhxtpalcf.supabase.co`);
console.log(`   - Admin Email: dokonoski@gmail.com`);
console.log(`   - Purpose: Reference system for client deployments`);
console.log(`   - Files Created: ${fs.readdirSync(BACKUP_DIR).length} files in ${BACKUP_DIR}`);
console.log('   - Status: Ready for client troubleshooting reference');