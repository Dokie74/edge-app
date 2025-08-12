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

# Dual-system backups
node backups/create-primary-backup.js && node clients/lucerne-international/create-backup.js
```

## 🚨 CRITICAL BACKUP & DEPLOYMENT REMINDER

**⚠️ CLIENT-CENTERED ORGANIZATION:**
1. ✅ **Client Folders** - Each client has dedicated folder in `clients/[client-name]/`
2. ✅ **Lucerne Reference** - Use `clients/lucerne-international/` as template
3. ✅ **Deployment Guide** - Follow `clients/CLIENT_DEPLOYMENT_GUIDE.md`
4. ✅ **Template Available** - Copy `clients/CLIENT_TEMPLATE/` for new clients

**⚠️ AFTER SUCCESSFUL CLIENT DEPLOYMENT:**
1. ✅ Create client folder with all configuration files
2. ✅ Test admin authentication and basic functionality  
3. ✅ Update client documentation with any specific issues
4. ✅ Create/update client backup with working configuration

**❌ NEVER deploy without proper authentication testing!**

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

# Client Organization (Outside .claude folder)
clients/
├── CLIENT_DEPLOYMENT_GUIDE.md       # Complete deployment methodology
├── CLIENT_TEMPLATE/                 # Template for new client setup
└── lucerne-international/           # ★ **REFERENCE CLIENT** - Working example
    ├── DEPLOYMENT_STATUS.md         # Current status and configuration
    ├── database-config.json         # Supabase project details
    ├── environment-variables.env    # Production environment setup
    ├── vercel-config.json           # Frontend deployment settings
    ├── troubleshooting-log.md       # Issues and solutions log
    ├── deployment-history.md        # Complete deployment timeline
    └── schema-files/                # Applied database schema files
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

### 🏢 clients/ Directory (Root Level)
Client-specific deployments and templates:
- **CLIENT_DEPLOYMENT_GUIDE.md**: Complete deployment methodology based on real experience
- **CLIENT_TEMPLATE/**: Copy this for new client setups with placeholder values
- **lucerne-international/**: ⭐ **Reference implementation** - working client deployment
  - Use as template for troubleshooting and new deployments
  - Contains all working configurations and documentation
  - Complete deployment history and lessons learned

## Usage Guidelines

1. **New Claude Sessions**: Always reference `DEVELOPERS_GUIDE.md` first
2. **Technical Work**: Reference `CLAUDE_CONFIGURATION.md` for commands and patterns
3. **Client Deployments**: 
   - **New Client**: Copy `clients/CLIENT_TEMPLATE/` and follow `clients/CLIENT_DEPLOYMENT_GUIDE.md`
   - **Client Issues**: Check `clients/[client-name]/` folder first, compare with `clients/lucerne-international/`
   - **Reference**: Use Lucerne International as working example for troubleshooting
4. **General Deployment**: Use guides in `deployment/` folder for infrastructure workflows
5. **Project Communications**: Keep all Claude-related docs in this folder
6. **Clean Main Directory**: Main project root stays focused on application code
7. **Version Control**: This folder is part of the repository for team consistency

## 🧹 Clean Project Organization

All Claude-related files are now centralized in this `.claude/` directory:
- **Clean main project root** - focuses only on application code
- **Organized documentation** - everything Claude needs is here
- **Version controlled** - ensures consistent experience across team
- **Easy to find** - single location for all Claude communications and configurations