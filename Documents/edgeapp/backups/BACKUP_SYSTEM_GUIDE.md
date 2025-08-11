# 📦 EDGE Dual-System Backup Guide

> **Purpose:** Maintain separate backups of the primary EDGE development system and client deployments to enable effective troubleshooting and reference.

## 🎯 Backup Philosophy

### Two-System Approach
1. **Primary EDGE System** - Your development reference (Gmail login)
2. **Client Deployments** - Individual client production systems 

### Why This Matters
- **Troubleshooting:** When a client deployment has issues, compare against working primary
- **Reference:** Primary system contains all features and correct configurations
- **Deployment:** Use primary as template for new client setups
- **Recovery:** Restore client systems using primary as reference

---

## 🗂️ Backup Structure

```
backups/
├── BACKUP_SYSTEM_GUIDE.md        # This file
├── create-primary-backup.js      # Primary system backup script  
├── edge-primary/                 # Primary EDGE development system
│   ├── primary-backup-YYYY-MM-DD.json
│   ├── primary-schema-reference-YYYY-MM-DD.sql
│   └── package-backup-YYYY-MM-DD.json
└── lucerne-client/               # Historical backups (client files moved to client folder)
    ├── lucerne-backup-YYYY-MM-DD.json
    └── lucerne-client-reference-YYYY-MM-DD.md

# Client-specific backup scripts now in client folders:
clients/lucerne-international/create-backup.js
```

---

## 🚀 Primary System Backup (EDGE Development)

### System Details
- **Database:** `blssdohlfcmyhxtpalcf.supabase.co`
- **Admin:** `dokonoski@gmail.com`
- **Purpose:** Master development and reference system
- **Status:** Full feature set with all functionality

### What's Backed Up
- ✅ Complete database schema structure
- ✅ All functions and stored procedures  
- ✅ Row Level Security policies
- ✅ Package.json dependencies
- ✅ Environment variable templates
- ✅ Full feature documentation

### When to Use Primary Backup
- **New client deployment** - Use as schema template
- **Client troubleshooting** - Compare configurations
- **Feature reference** - See how features should work
- **Database restore** - Reference for missing functions/tables

### Creating Primary Backup
```bash
node backups/create-primary-backup.js
```

---

## 🏢 Client Deployment Backups (Lucerne Example)

### System Details
- **Database:** `wvggehrxhnuvlxpaghft.supabase.co`
- **Frontend:** `https://lucerne-edge-app.vercel.app`
- **Admin:** `dokonoski@lucerneintl.com` 
- **Status:** Production ready with working authentication

### What's Backed Up
- ✅ Client-specific database configuration
- ✅ Working deployment settings
- ✅ Environment variables (production)
- ✅ Known issues and workarounds
- ✅ Troubleshooting guide
- ✅ Actual working schema files used

### When to Use Client Backup
- **Issue reproduction** - Understand exact client setup
- **Configuration comparison** - What's different from primary
- **Status reference** - Current deployment state
- **Recovery** - Restore client to last working state

### Creating Client Backup
```bash
# Lucerne International client backup
node clients/lucerne-international/create-backup.js
```

---

## 🔧 Using Backups for Troubleshooting

### Client Deployment Issues

#### Step 1: Compare Systems
1. **Read client backup** - Understand current client state
2. **Read primary backup** - Reference how it should work  
3. **Identify differences** - What's missing or misconfigured?

#### Step 2: Common Issues & Solutions

**Authentication Problems:**
- Check: user_id linkage between auth.users and employees
- Reference: Primary system has working auth configuration
- Fix: Use primary backup to see correct user setup

**Database Function Errors:**
- Check: Client backup shows known 404 function issues
- Reference: Primary has all functions working
- Fix: Compare function signatures and permissions

**Environment Variable Issues:**
- Check: Client backup shows exact working env vars
- Reference: Primary has template environment setup
- Fix: Ensure REACT_APP_ prefix is exact

**RLS Policy Problems:**
- Check: Client backup notes simplified policies
- Reference: Primary has full RLS implementation
- Fix: Start simple, add complexity incrementally

#### Step 3: Recovery Process
1. **Use primary schema** as baseline for client database
2. **Apply client-specific settings** (tenant_id, admin users)
3. **Test authentication** before adding advanced features
4. **Update client backup** once fixed

---

## 📋 Backup Maintenance

### Regular Backup Schedule
- **After major development** - Update primary backup
- **After client deployment** - Create/update client backup  
- **Weekly** - Refresh both systems if actively developing
- **Before major changes** - Backup current state

### File Management
- **Keep last 3 backups** of each system
- **Delete backups older than 30 days**
- **Clean up obsolete files** when no longer relevant

### Backup Verification
Each backup should include:
- [x] System identification (primary vs client)
- [x] Database connection details
- [x] Current status and known issues  
- [x] Environment variables
- [x] Working configurations
- [x] Troubleshooting notes

---

## 🎯 Instructions for Future Claude Sessions

### When Working on Client Issues:

1. **Read Both Backups First**
   ```bash
   # Check primary system reference
   cat backups/edge-primary/primary-backup-[latest].json
   
   # Check client deployment state  
   cat backups/lucerne-client/lucerne-backup-[latest].json
   ```

2. **Compare Configurations**
   - Environment variables (naming, values)
   - Database schemas (tables, columns, functions)
   - Authentication setup (user linking)
   - RLS policies (complexity level)

3. **Use Primary as Reference**
   - Primary system = "how it should work"
   - Client system = "current state with issues"
   - Fix client by making it match primary (with client-specific changes)

4. **Update Backups After Fixes**
   ```bash
   # Update client backup after successful fix
   node clients/[client-name]/create-backup.js
   ```

### Key Success Pattern:
**Primary System → Template → Client Deployment → Troubleshooting Reference**

---

## 🚨 Critical Reminders

### For New Client Deployments:
1. **Always use primary backup** as schema reference
2. **Test authentication immediately** after database setup
3. **Start with simple RLS policies** to avoid recursion
4. **Create client backup** once deployment works

### For Client Issue Resolution:
1. **Compare against primary backup** first
2. **Use client backup** to understand current state
3. **Fix by making client match primary** (with customizations)
4. **Update client backup** after successful resolution

### For System Maintenance:
1. **Keep both backups current**
2. **Document any new patterns** discovered
3. **Update this guide** with new troubleshooting methods
4. **Clean up obsolete files** regularly

---

**Last Updated:** August 11, 2025  
**Primary System:** blssdohlfcmyhxtpalcf.supabase.co (Gmail)  
**Client Example:** wvggehrxhnuvlxpaghft.supabase.co (Lucerne)  
**Status:** Both systems backed up and documented