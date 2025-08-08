#!/usr/bin/env node

/**
 * Frontend App Code Backup Script for EDGE App
 * Backs up essential application source code, configurations, and assets
 * Excludes node_modules, build artifacts, and development files
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BACKUP_DIR = path.join(__dirname);
const APP_ROOT = path.join(__dirname, '..');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

console.log('🚀 Starting Frontend App backup...');
console.log(`📁 App directory: ${APP_ROOT}`);
console.log(`📁 Backup directory: ${BACKUP_DIR}`);

// Files and directories to include in backup
const INCLUDE_PATTERNS = [
  // Source code
  'src/**/*',
  'public/**/*',
  
  // Configuration files
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tailwind.config.js',
  'cypress.config.ts',
  
  // Project documentation
  'CLAUDE.md',
  'CLIENT_DEPLOYMENT_GUIDE.md',
  'CYPRESS_TEST_REPORT.md',
  'README.md',
  
  // Cypress tests (essential app functionality)
  'cypress/e2e/**/*',
  'cypress/fixtures/**/*',
  'cypress/support/**/*',
  
  // Environment template (without secrets)
  '.env.example'
];

// Files and directories to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  'build',
  'dist',
  '.git',
  '.vscode',
  '.claude',
  'backups',
  'coverage',
  'cypress/videos',
  'cypress/screenshots',
  '.env',
  '.env.local',
  '*.log',
  '*.tmp',
  '.DS_Store',
  'Thumbs.db'
];

function shouldIncludeFile(filePath, relativePath) {
  // Check exclude patterns first
  for (const pattern of EXCLUDE_PATTERNS) {
    if (relativePath.includes(pattern) || relativePath.startsWith(pattern)) {
      return false;
    }
  }
  
  // Check if it matches any include pattern
  for (const pattern of INCLUDE_PATTERNS) {
    if (pattern.endsWith('/**/*')) {
      const basePattern = pattern.slice(0, -5);
      if (relativePath.startsWith(basePattern + '/') || relativePath === basePattern) {
        return true;
      }
    } else if (pattern === relativePath || relativePath.endsWith('/' + pattern)) {
      return true;
    }
  }
  
  return false;
}

function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    
    if (entry.isDirectory()) {
      if (shouldIncludeFile(fullPath, relativePath)) {
        files.push(...getAllFiles(fullPath, baseDir));
      }
    } else if (entry.isFile()) {
      if (shouldIncludeFile(fullPath, relativePath)) {
        files.push({
          path: fullPath,
          relativePath: relativePath,
          size: fs.statSync(fullPath).size
        });
      }
    }
  }
  
  return files;
}

async function createAppBackup() {
  console.log('\n📦 Scanning app files...');
  
  const files = getAllFiles(APP_ROOT);
  const backup = {
    metadata: {
      timestamp: new Date().toISOString(),
      appName: 'EDGE App',
      backupType: 'frontend-source-code',
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0)
    },
    files: {}
  };
  
  console.log(`📊 Found ${files.length} files to backup`);
  console.log(`📏 Total size: ${(backup.metadata.totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  // Group files by category for better organization
  const categories = {
    'source-code': [],
    'configuration': [],
    'tests': [],
    'documentation': [],
    'assets': []
  };
  
  for (const file of files) {
    const content = fs.readFileSync(file.path, 'utf8');
    const fileData = {
      path: file.relativePath,
      content: content,
      size: file.size,
      lastModified: fs.statSync(file.path).mtime.toISOString()
    };
    
    // Categorize files
    if (file.relativePath.startsWith('src/')) {
      categories['source-code'].push(fileData);
    } else if (file.relativePath.startsWith('cypress/')) {
      categories['tests'].push(fileData);
    } else if (file.relativePath.startsWith('public/')) {
      categories['assets'].push(fileData);
    } else if (file.relativePath.includes('config') || file.relativePath === 'package.json' || file.relativePath === 'tsconfig.json') {
      categories['configuration'].push(fileData);
    } else if (file.relativePath.endsWith('.md')) {
      categories['documentation'].push(fileData);
    } else {
      categories['configuration'].push(fileData); // Default to configuration
    }
    
    console.log(`  ✅ ${file.relativePath} (${(file.size / 1024).toFixed(1)}KB)`);
  }
  
  backup.files = categories;
  
  // Save main backup file
  const filename = `frontend-app-backup-${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
  console.log(`\n✅ Frontend backup saved: ${filename}`);
  
  return filename;
}

async function createPackageInfo() {
  console.log('\n📋 Creating package information backup...');
  
  const packageJsonPath = path.join(APP_ROOT, 'package.json');
  const packageLockPath = path.join(APP_ROOT, 'package-lock.json');
  
  const packageInfo = {
    timestamp: new Date().toISOString(),
    packageJson: null,
    packageLock: null,
    nodeVersion: process.version,
    npmVersion: null
  };
  
  if (fs.existsSync(packageJsonPath)) {
    packageInfo.packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`  ✅ package.json (dependencies: ${Object.keys(packageInfo.packageJson.dependencies || {}).length})`);
  }
  
  if (fs.existsSync(packageLockPath)) {
    // Don't include full package-lock.json as it's huge, just metadata
    const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
    packageInfo.packageLock = {
      name: packageLock.name,
      version: packageLock.version,
      lockfileVersion: packageLock.lockfileVersion,
      packageCount: Object.keys(packageLock.packages || {}).length
    };
    console.log(`  ✅ package-lock.json metadata (packages: ${packageInfo.packageLock.packageCount})`);
  }
  
  const filename = `package-info-backup-${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(packageInfo, null, 2));
  console.log(`✅ Package info backup saved: ${filename}`);
  
  return filename;
}

async function createEnvironmentTemplate() {
  console.log('\n🔐 Creating environment template...');
  
  const envPath = path.join(APP_ROOT, '.env');
  const envTemplate = {
    timestamp: new Date().toISOString(),
    note: 'Environment template with sanitized values - fill in actual values when restoring',
    variables: {}
  };
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          // Sanitize sensitive values
          const value = valueParts.join('=');
          if (key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('password')) {
            envTemplate.variables[key] = 'YOUR_VALUE_HERE';
          } else if (key.includes('URL')) {
            envTemplate.variables[key] = value; // URLs are generally safe to include
          } else {
            envTemplate.variables[key] = value;
          }
        }
      } else if (trimmed.startsWith('#')) {
        // Preserve comments
        envTemplate.variables[`_comment_${Object.keys(envTemplate.variables).length}`] = trimmed;
      }
    }
    
    console.log(`  ✅ Environment template created (${Object.keys(envTemplate.variables).length} entries)`);
  } else {
    console.log('  ⚠️  No .env file found');
  }
  
  const filename = `environment-template-${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(envTemplate, null, 2));
  console.log(`✅ Environment template saved: ${filename}`);
  
  return filename;
}

async function createBackupSummary(files) {
  const summary = {
    timestamp: new Date().toISOString(),
    backupType: 'frontend-app-code',
    appName: 'EDGE App - Performance Review System',
    backupFiles: files,
    backupLocation: BACKUP_DIR,
    restoreInstructions: [
      '1. Extract source code from frontend-app-backup-*.json',
      '2. Run npm install to restore dependencies',
      '3. Configure environment variables from environment-template-*.json',
      '4. Run npm run type-check to verify TypeScript compilation',
      '5. Run npm test to verify functionality',
      '6. Run npm run build to test production build'
    ],
    includedComponents: [
      'React application source code (src/)',
      'TypeScript configuration and types',
      'Tailwind CSS styles and configuration',
      'Cypress E2E test suites',
      'Public assets and manifest files',
      'Package dependencies and lock file',
      'Project documentation and guides'
    ],
    excludedComponents: [
      'node_modules (restore via npm install)',
      'Build artifacts (regenerate via npm run build)',
      'Environment secrets (template provided)',
      'Development cache files',
      'Git history and IDE settings'
    ]
  };

  const filename = `frontend-backup-summary-${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(summary, null, 2));
  console.log(`\n📋 Frontend backup summary saved: ${filename}`);
  
  return filename;
}

async function main() {
  try {
    const backupFiles = [];
    
    // Create all backup components
    backupFiles.push(await createAppBackup());
    backupFiles.push(await createPackageInfo());
    backupFiles.push(await createEnvironmentTemplate());
    
    // Create summary
    const summaryFile = await createBackupSummary(backupFiles);
    backupFiles.push(summaryFile);
    
    console.log('\n🎉 Frontend backup completed successfully!');
    console.log(`📁 Backup files created in: ${BACKUP_DIR}`);
    backupFiles.forEach(file => console.log(`   • ${file}`));
    
  } catch (error) {
    console.error('❌ Frontend backup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };