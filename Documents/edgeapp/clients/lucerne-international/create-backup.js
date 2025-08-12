#!/usr/bin/env node

/**
 * Lucerne International - Client Backup Script
 * 
 * Creates backup of this specific client's deployment state
 * Database: wvggehrxhnuvlxpaghft.supabase.co
 * Frontend: https://lucerne-edge-app.vercel.app
 */

const fs = require('fs');
const path = require('path');

const CLIENT_DIR = __dirname;
const BACKUP_DIR = path.join(__dirname, '../../backups/lucerne-client');
const timestamp = new Date().toISOString().split('T')[0];

console.log('🔄 Starting Lucerne International Client Backup...');
console.log(`📁 Client Directory: ${CLIENT_DIR}`);
console.log(`📁 Backup Directory: ${BACKUP_DIR}`);

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Read current client configuration
const databaseConfig = JSON.parse(fs.readFileSync(path.join(CLIENT_DIR, 'database-config.json'), 'utf8'));
const deploymentStatus = fs.readFileSync(path.join(CLIENT_DIR, 'DEPLOYMENT_STATUS.md'), 'utf8');

const backupData = {
    timestamp: new Date().toISOString(),
    system: 'Lucerne International Client',
    client_folder: CLIENT_DIR,
    database: databaseConfig.supabase,
    frontend: {
        deployment_url: 'https://lucerne-edge-app.vercel.app',
        vercel_project: 'lucerne-edge-app',
        framework: 'Create React App',
        description: 'Production client deployment'
    },
    client_documentation: {
        deployment_status: 'DEPLOYMENT_STATUS.md',
        database_config: 'database-config.json',
        environment_vars: 'environment-variables.env',
        vercel_config: 'vercel-config.json',
        troubleshooting: 'troubleshooting-log.md',
        deployment_history: 'deployment-history.md',
        case_study: 'LUCERNE_DEPLOYMENT_CASE_STUDY.md',
        schema_files: 'schema-files/'
    },
    deployment_status: extractStatusFromMarkdown(deploymentStatus),
    backup_purpose: 'Client-specific deployment state and troubleshooting reference',
    usage_instructions: [
        'Use this backup to understand Lucerne client configuration',
        'Compare with primary system backup for troubleshooting',
        'Reference for setting up similar client deployments'
    ]
};

function extractStatusFromMarkdown(markdown) {
    // Extract key status information from deployment status markdown
    const isProduction = markdown.includes('PRODUCTION READY');
    const hasWorkingAuth = markdown.includes('Authentication: ✅ **WORKING**');
    const hasWorkingDashboard = markdown.includes('Dashboard Access: ✅ **WORKING**');
    
    return {
        overall_status: isProduction ? 'Production Ready' : 'In Progress',
        authentication: hasWorkingAuth ? 'Working' : 'Unknown',
        dashboard: hasWorkingDashboard ? 'Working' : 'Unknown',
        last_updated: new Date().toISOString()
    };
}

// Write backup metadata
const backupFile = path.join(BACKUP_DIR, `lucerne-backup-${timestamp}.json`);
fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

console.log('✅ Lucerne backup metadata created');
console.log(`📄 Backup file: ${backupFile}`);

// Copy current schema files to backup
try {
    const schemaDir = path.join(CLIENT_DIR, 'schema-files');
    if (fs.existsSync(schemaDir)) {
        const schemaFiles = fs.readdirSync(schemaDir);
        schemaFiles.forEach(file => {
            const sourcePath = path.join(schemaDir, file);
            const destPath = path.join(BACKUP_DIR, file);
            fs.copyFileSync(sourcePath, destPath);
            console.log(`✅ Copied ${file} to backup`);
        });
    }
} catch (error) {
    console.log('⚠️  Could not copy schema files:', error.message);
}

// Create reference file for backup system
const referenceFile = path.join(BACKUP_DIR, `lucerne-client-reference-${timestamp}.md`);
const referenceContent = `# Lucerne International Client Backup Reference

**Generated:** ${new Date().toISOString()}
**Client Folder:** ${CLIENT_DIR}

## Client Configuration Files

All current client configuration is maintained in:
\`${CLIENT_DIR}\`

Key files:
- DEPLOYMENT_STATUS.md - Current system status
- database-config.json - Supabase configuration  
- environment-variables.env - Production environment settings
- vercel-config.json - Frontend deployment settings
- troubleshooting-log.md - Issue resolution history
- deployment-history.md - Complete deployment timeline
- schema-files/ - Applied database schema

## Using This Backup

1. **For Troubleshooting:** Compare current state with this backup
2. **For New Deployments:** Use as template for similar clients  
3. **For Understanding:** Reference the complete client documentation
4. **For Recovery:** Client folder contains all necessary configurations

## Status at Backup Time

${backupData.deployment_status.overall_status}

Last Updated: ${backupData.deployment_status.last_updated}
`;

fs.writeFileSync(referenceFile, referenceContent);
console.log(`✅ Reference documentation: ${referenceFile}`);

console.log('\n🎉 Lucerne International Backup Complete!');
console.log('📋 Summary:');
console.log(`   - Client Folder: ${CLIENT_DIR}`);
console.log(`   - Backup Location: ${BACKUP_DIR}`);
console.log(`   - Status: ${backupData.deployment_status.overall_status}`);
console.log(`   - Files Created: ${fs.readdirSync(BACKUP_DIR).length} files in backup`);
console.log('   - Purpose: Client deployment state reference');
console.log('\n💡 Note: All live client documentation is in the client folder.');
console.log('   This backup provides a snapshot for comparison and recovery.');