# Claude Code Configuration for EDGE App

**🚀 Welcome to the EDGE Performance Review System!**

This directory contains all Claude Code documentation, configurations, and project communications. **Start here** for any work on this project.

## 🎯 Quick Start for New Claude Sessions

**📖 ESSENTIAL READING ORDER:**
1. **DEVELOPERS_GUIDE.md** → ★ **READ FIRST** - Project philosophy, vision, and architecture
2. **CLAUDE_CONFIGURATION.md** → Technical commands, patterns, and workflows
3. **deployment/** → When working on production deployments

## ⚡ Quick Commands

```bash
# Start development server
npm start

# Run type checking and tests  
npm run type-check && npm test

# Complete backup
node backups/supabase-backup.js && node backups/frontend-backup.js
```

## 🚨 CRITICAL WORKFLOW REMINDER

**⚠️ AFTER ANY BACKUP OPERATION:**
1. ✅ Execute backup script
2. ✅ Verify backup files created  
3. ✅ **IMMEDIATELY update `backups/BACKUP_DOCUMENTATION.md`**
4. ✅ Update "Latest Backup Status" section with:
   - Current date/time
   - Files backed up count and size
   - Any changes or new components
   - Backup file listings

**❌ NEVER skip updating backup documentation!**

## Structure

```
.claude/
├── README.md                         # This file - directory documentation
├── DEVELOPERS_GUIDE.md               # ★ **ESSENTIAL** - Project philosophy & vision  
├── CLAUDE_CONFIGURATION.md           # Technical commands, architecture, patterns
├── settings.local.json               # Claude Code permissions and settings
├── deployment/                       # Deployment procedures & checklists
│   ├── CLIENT_DEPLOYMENT_GUIDE.md    # Client-specific deployment guide
│   └── PRODUCTION_DEPLOYMENT_CHECKLIST.md  # Production deployment checklist
├── agents/                           # Specialized Claude agents
│   ├── agent-registry.json          # Registry of available agents
│   ├── cypress-testing-expert.md    # E2E testing specialist
│   ├── supabase-backend-manager.md  # Database & backend specialist  
│   └── ...                          # Additional specialized agents
├── conversations/                    # Future: Conversation logs (when implemented)
└── documentation/                   # Additional project documentation
```

## Key Files

### 🔗 DEVELOPERS_GUIDE.md
**This is the MOST IMPORTANT file** - Contains:
- EDGE application philosophy and vision
- Complete architecture overview
- Current implementation status
- Development roadmap and next steps
- **Must be read by Claude at start of any work session**

### ⚙️ CLAUDE_CONFIGURATION.md
Comprehensive technical configuration including:
- Development commands and workflows
- Architecture patterns and conventions
- Environment setup requirements
- Code quality guidelines
- Testing strategies

### 📋 deployment/ Directory
Production and client deployment resources:
- **CLIENT_DEPLOYMENT_GUIDE.md**: Client-specific deployment procedures
- **PRODUCTION_DEPLOYMENT_CHECKLIST.md**: Production deployment checklist and verification steps

### ⚙️ settings.local.json
Claude Code configuration including:
- Pre-approved bash commands for common operations
- Permission settings for automated workflows
- Project-specific tool allowances

### 🤖 agents/ Directory
Specialized Claude agents for specific domains:
- Testing automation and Cypress expertise
- Supabase database management
- Future: Frontend components, security, performance

## Usage Guidelines

1. **New Claude Sessions**: Always reference `DEVELOPERS_GUIDE.md` first
2. **Technical Work**: Reference `CLAUDE_CONFIGURATION.md` for commands and patterns
3. **Deployment**: Use guides in `deployment/` folder for production workflows
4. **Project Communications**: Keep all Claude-related docs in this folder
5. **Clean Main Directory**: Main project root stays focused on application code
6. **Version Control**: This folder is part of the repository for team consistency

## 🧹 Clean Project Organization

All Claude-related files are now centralized in this `.claude/` directory:
- **Clean main project root** - focuses only on application code
- **Organized documentation** - everything Claude needs is here
- **Version controlled** - ensures consistent experience across team
- **Easy to find** - single location for all Claude communications and configurations