# EDGE App Backup System Documentation

## Overview

This backup system provides comprehensive backup capabilities for the EDGE Performance Review Application, including both Supabase database components and frontend application code.

**Last Updated:** August 8, 2025  
**Backup Location:** `./backups/`  
**Scripts Created:** `supabase-backup.js`, `frontend-backup.js`

## Quick Start

```bash
# Run complete backup (from project root)
node backups/supabase-backup.js
node backups/frontend-backup.js

# Check backup files
ls backups/
```

## Backup Components

### 1. Supabase Database Backup (`supabase-backup.js`)

**Purpose:** Backs up all Supabase database components including tables, schema, functions, and migrations.

**What it backs up:**
- ✅ **Database Tables:** All application data from key tables
- ✅ **Schema Information:** Table structures, columns, constraints
- ✅ **Edge Functions:** Supabase serverless functions
- ✅ **Migrations:** Database migration files
- ✅ **Backup Summary:** Complete backup metadata

**Key Tables Backed Up:**
- `employees` - User profiles and role information
- `review_cycles` - Performance review periods
- `assessments` - Self-assessments and manager reviews
- `development_plans` - Individual development plans
- `pulse_questions` - Employee wellbeing survey questions
- `team_health_pulse_responses` - Survey responses
- `kudos` - Recognition and appreciation system
- `notifications` - System notifications

**Edge Functions Backed Up:**
- `admin-operations` - Administrative database operations
- `database-cleanup` - Database maintenance functions

**Output Files:**
- `supabase-tables-backup-YYYY-MM-DD.json` - Complete table data
- `supabase-schema-backup-YYYY-MM-DD.json` - Database schema information
- `supabase-functions-backup-YYYY-MM-DD.json` - Edge function source code
- `supabase-migrations-backup-YYYY-MM-DD.json` - Migration history
- `backup-summary-YYYY-MM-DD.json` - Backup metadata and summary

### 2. Frontend Application Backup (`frontend-backup.js`)

**Purpose:** Backs up essential application source code, configurations, and assets while excluding development artifacts and secrets.

**What it backs up:**
- ✅ **Source Code:** Complete React application (`src/` directory)
- ✅ **Configuration Files:** TypeScript, Tailwind, package configuration
- ✅ **Public Assets:** Favicon, manifest, robots.txt
- ✅ **Test Suites:** Cypress E2E tests and fixtures
- ✅ **Documentation:** Project guides and technical docs
- ✅ **Environment Template:** Sanitized environment variables

**What it excludes (to prevent loops and reduce size):**
- ❌ `node_modules/` - Dependencies (restored via npm install)
- ❌ `build/`, `dist/` - Build artifacts (regenerated)
- ❌ `.git/` - Git history and version control
- ❌ `backups/` - Prevents recursive backup loops
- ❌ `.env` files with secrets - Template provided instead
- ❌ Cache files, logs, temporary files

**File Categories:**
- **Source Code** - React components, services, utilities, hooks
- **Configuration** - package.json, TypeScript config, Tailwind config
- **Tests** - Cypress E2E test suites and support files
- **Documentation** - CLAUDE.md, README.md, deployment guides
- **Assets** - Public files, icons, manifests

**Output Files:**
- `frontend-app-backup-YYYY-MM-DD.json` - Complete source code backup
- `package-info-backup-YYYY-MM-DD.json` - Dependencies and package metadata
- `environment-template-YYYY-MM-DD.json` - Environment variable template
- `frontend-backup-summary-YYYY-MM-DD.json` - Backup metadata and restore instructions

## Running Backups

### Prerequisites

```bash
# Ensure you're in the project root directory
cd /path/to/edgeapp

# Verify environment file exists
ls .env

# Check Node.js version (requires >=22.0.0)
node --version
```

### Executing Backups

#### Complete Backup (Recommended)
```bash
# Run both backups sequentially
node backups/supabase-backup.js && node backups/frontend-backup.js
```

#### Individual Backups
```bash
# Database backup only
node backups/supabase-backup.js

# Frontend backup only  
node backups/frontend-backup.js
```

### Backup Verification

```bash
# Check backup files were created
ls -la backups/*2025-08-08*

# Verify JSON files are valid
node -e "console.log('✅ Valid JSON') || JSON.parse(require('fs').readFileSync('backups/backup-summary-2025-08-08.json'))"
```

## Restore Procedures

### Database Restore

1. **Prepare Supabase Project**
   ```bash
   # Ensure Supabase CLI is installed and authenticated
   supabase --version
   supabase login
   ```

2. **Restore Tables Data**
   ```javascript
   // Use the table backup JSON to restore data
   const backup = require('./supabase-tables-backup-YYYY-MM-DD.json');
   
   // Restore each table using Supabase client
   for (const [tableName, tableData] of Object.entries(backup)) {
     if (tableData.data && tableData.data.length > 0) {
       await supabase.from(tableName).insert(tableData.data);
     }
   }
   ```

3. **Restore Functions**
   ```bash
   # Extract functions from backup and deploy
   # See supabase-functions-backup-*.json for function code
   supabase functions deploy
   ```

### Frontend Restore

1. **Extract Source Code**
   ```javascript
   // Parse the frontend backup JSON
   const backup = require('./frontend-app-backup-YYYY-MM-DD.json');
   
   // Recreate file structure from backup.files
   ```

2. **Restore Dependencies**
   ```bash
   # Install packages from backup
   npm install
   
   # Verify installation
   npm run type-check
   ```

3. **Configure Environment**
   ```bash
   # Copy environment template
   cp backups/environment-template-*.json .env.template
   
   # Fill in actual values in .env file
   ```

4. **Verify Restore**
   ```bash
   # Type check
   npm run type-check
   
   # Run tests
   npm test
   
   # Test build
   npm run build
   
   # Start development server
   npm start
   ```

## Automation Options

### Scheduled Backups

Create a scheduled backup script:

```bash
#!/bin/bash
# backup-scheduled.sh

echo "🚀 Starting scheduled backup - $(date)"

cd /path/to/edgeapp

# Run backups
node backups/supabase-backup.js
node backups/frontend-backup.js

# Optional: Archive old backups (keep last 30 days)
find backups/ -name "*.json" -mtime +30 -delete

echo "✅ Scheduled backup completed - $(date)"
```

### Windows Task Scheduler
```cmd
# Create scheduled task for Windows
schtasks /create /tn "EDGE App Backup" /tr "C:\path\to\backup-scheduled.bat" /sc daily /st 02:00
```

### Cron Job (Linux/Mac)
```bash
# Add to crontab for daily 2 AM backup
0 2 * * * /path/to/backup-scheduled.sh >> /path/to/backup.log 2>&1
```

## Backup File Structure

```
backups/
├── supabase-tables-backup-2025-08-08.json      # Database table data
├── supabase-schema-backup-2025-08-08.json      # Database schema info
├── supabase-functions-backup-2025-08-08.json   # Edge function source code
├── supabase-migrations-backup-2025-08-08.json  # Migration files
├── backup-summary-2025-08-08.json              # Supabase backup summary
├── frontend-app-backup-2025-08-08.json         # Frontend source code
├── package-info-backup-2025-08-08.json         # Package dependencies
├── environment-template-2025-08-08.json        # Environment variables template
├── frontend-backup-summary-2025-08-08.json     # Frontend backup summary
├── supabase-backup.js                          # Supabase backup script
├── frontend-backup.js                          # Frontend backup script
└── BACKUP_DOCUMENTATION.md                     # This documentation
```

## Security Considerations

### Environment Variables
- ✅ Scripts automatically sanitize sensitive values (keys, secrets, passwords)
- ✅ Environment template provided with placeholder values
- ✅ Actual `.env` file excluded from backups
- ⚠️  Manually verify no secrets are included in backups before storing externally

### Access Control
- ✅ Backup files contain application source code - protect accordingly
- ✅ Database backups may contain sensitive user data - encrypt if storing externally
- ✅ Store backups in secure, access-controlled locations
- ⚠️  Never commit backup files to version control

### Data Privacy
- ✅ Review backup contents before sharing or archiving
- ✅ Consider data retention policies for user data
- ✅ Implement encryption for long-term backup storage

## Troubleshooting

### Common Issues

**❌ "Missing Supabase configuration"**
```bash
# Solution: Verify .env file exists and contains required variables
ls .env
grep REACT_APP_SUPABASE .env
```

**❌ "Permission denied" errors**
```bash
# Solution: Check file permissions and run from correct directory
chmod +x backups/*.js
cd /path/to/edgeapp
```

**❌ "Cannot read property" JSON errors**
```bash
# Solution: Check backup file integrity
node -c backups/backup-file.json
```

**❌ Large backup file sizes**
```bash
# Solution: Review included files and adjust EXCLUDE_PATTERNS
ls -lh backups/*.json
```

### Backup Validation

```javascript
// Validate backup completeness
const validateBackup = (backupFile) => {
  const backup = JSON.parse(fs.readFileSync(backupFile));
  
  console.log(`Timestamp: ${backup.metadata?.timestamp}`);
  console.log(`Files: ${backup.metadata?.totalFiles}`);
  console.log(`Size: ${backup.metadata?.totalSize} bytes`);
  
  return backup.metadata?.totalFiles > 0;
};
```

## Version History

- **v1.0** (2025-08-08): Initial backup system implementation
  - Supabase database backup with tables, schema, functions, migrations
  - Frontend source code backup with smart exclusions
  - Environment variable sanitization
  - Comprehensive documentation

## Support

For backup system issues:
1. Check this documentation first
2. Verify scripts are running from project root directory
3. Confirm `.env` file contains required Supabase configuration
4. Review backup logs for specific error messages

**Script Locations:**
- Supabase Backup: `backups/supabase-backup.js`
- Frontend Backup: `backups/frontend-backup.js`
- Documentation: `backups/BACKUP_DOCUMENTATION.md`