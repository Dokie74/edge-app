# 📋 Client Template - New Client Setup

> **Purpose:** Template folder structure and files for new client deployments  
> **Instructions:** Copy this entire folder and customize for each new client

## 🎯 Quick Setup Process

### Step 1: Copy and Rename
```bash
# Copy template to new client folder
cp -r clients/CLIENT_TEMPLATE clients/[NEW_CLIENT_NAME]
cd clients/[NEW_CLIENT_NAME]
```

### Step 2: Global Find/Replace Values
Replace these template placeholders throughout all files:

| Template Value | Replace With | Example |
|---|---|---|
| `[CLIENT_NAME]` | Full company name | `Acme Corporation` |
| `[CLIENT_DOMAIN]` | Company domain | `acme.com` |
| `[CLIENT_TENANT_ID]` | Unique tenant identifier | `acme` |
| `[CLIENT_ADMIN_EMAIL]` | Primary admin email | `admin@acme.com` |
| `[CLIENT_ADMIN_NAME]` | Admin user name | `John Smith` |
| `[VERCEL_PROJECT_NAME]` | Vercel project name | `acme-edge-app` |
| `[DEPLOYMENT_DATE]` | Current date | `2025-08-15` |

### Step 3: Customize Configuration Files
Update all template files with client-specific information:

- [ ] `DEPLOYMENT_STATUS.md` - Client details and status
- [ ] `database-config.json` - Supabase project configuration
- [ ] `environment-variables.env` - Production environment variables
- [ ] `vercel-config.json` - Vercel project settings
- [ ] `troubleshooting-log.md` - Clear for new deployment
- [ ] `deployment-history.md` - New timeline starts

### Step 4: Follow Deployment Guide
Reference `../CLIENT_DEPLOYMENT_GUIDE.md` for complete deployment instructions.

---

## 📁 Template File Structure

```
[CLIENT_NAME]/
├── README.md                          # This file - delete after setup
├── DEPLOYMENT_STATUS.md               # Client-specific status tracking
├── database-config.json              # Supabase configuration
├── environment-variables.env         # Production environment settings
├── vercel-config.json                # Frontend deployment settings  
├── troubleshooting-log.md            # Issue tracking and solutions
├── deployment-history.md             # Timeline and milestones
└── schema-files/                     # Database schema files
    ├── [client]-schema.sql           # Primary database schema
    ├── [client]-functions.sql        # Database functions
    └── [client]-policies.sql         # Row Level Security policies
```

---

## 🎯 Customization Checklist

### Before Starting Deployment
- [ ] All template values replaced with client-specific information
- [ ] Client folder renamed from CLIENT_TEMPLATE
- [ ] Schema files updated with correct tenant_id
- [ ] Admin email and contact information updated
- [ ] Deployment date set to current date

### During Deployment
- [ ] Update files with actual Supabase project details
- [ ] Update files with actual Vercel project details  
- [ ] Document any issues in troubleshooting-log.md
- [ ] Track progress in deployment-history.md

### After Successful Deployment
- [ ] Update DEPLOYMENT_STATUS.md with final status
- [ ] Create client backup using backup scripts
- [ ] Remove this README.md file (no longer needed)
- [ ] Notify client admin of successful deployment

---

## 🔗 Reference Resources

- **Successful Example:** `../lucerne-international/` - Complete working client
- **Deployment Guide:** `../CLIENT_DEPLOYMENT_GUIDE.md` - Step-by-step process
- **Primary System:** `../../backups/edge-primary/` - Reference configuration
- **Backup Scripts:** `../../backups/create-[client]-backup.js` - Update after deployment

---

**Template Version:** 1.0  
**Based On:** Lucerne International successful deployment  
**Last Updated:** August 11, 2025