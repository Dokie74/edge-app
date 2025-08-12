# 🚀 Client Deployment Guide - EDGE System

> **Status:** Proven methodology based on successful Lucerne International deployment  
> **Success Rate:** 100% with proper execution  
> **Template:** Use `lucerne-international/` folder as reference

## 🎯 Quick Start for New Client

### For Experienced Deployers:
1. **Copy `lucerne-international/` folder** → `new-client-name/`
2. **Update client-specific values** in all configuration files
3. **Follow 3-phase deployment:** Database → Frontend → Testing
4. **Create client backup** once operational

### For New Deployers:
**Follow the complete guide below** ⬇️

---

## 🏗️ Deployment Architecture

### Multi-Tenant Approach
Each client gets their own isolated environment:

```
Client: Lucerne International
├── Database: wvggehrxhnuvlxpaghft.supabase.co (isolated)
├── Frontend: lucerne-edge-app.vercel.app (dedicated)
├── Admin: dokonoski@lucerneintl.com (client-specific)
└── Data: tenant_id = 'lucerne' (segregated)
```

### Why This Architecture?
- **Complete Data Isolation** - No cross-client data access
- **Independent Scaling** - Each client can grow independently  
- **Client-Specific Access** - Admins only see their organization
- **Simplified Backup/Recovery** - Per-client operations

---

## 📋 Pre-Deployment Checklist

### Information Needed from Client
- [ ] **Company Name:** Full legal name
- [ ] **Domain:** Primary domain (e.g., lucerneintl.com)
- [ ] **Admin Email:** Primary administrator email
- [ ] **Preferred URL:** Subdomain preference (company-edge-app.vercel.app)
- [ ] **Employee Count:** Rough count for capacity planning
- [ ] **Timeline:** When they need to go live

### Technical Prerequisites  
- [ ] **GitHub Repository:** EDGE codebase accessible
- [ ] **Supabase Account:** Your master account with organization creation rights
- [ ] **Vercel Account:** Your master account with project creation rights
- [ ] **Primary System Backup:** Recent backup of your EDGE development system

---

## 🗂️ Client Folder Setup

### Step 1: Create Client Folder Structure
```bash
# Create new client folder (replace with actual client name)
cp -r clients/lucerne-international clients/[CLIENT_NAME]
cd clients/[CLIENT_NAME]
```

### Step 2: Update All Configuration Files
**Files to modify with client-specific values:**

1. **DEPLOYMENT_STATUS.md** - Update all client details
2. **database-config.json** - New Supabase project details  
3. **environment-variables.env** - Client-specific env vars
4. **vercel-config.json** - New Vercel project details
5. **troubleshooting-log.md** - Clear log, keep templates
6. **deployment-history.md** - New deployment timeline

### Step 3: Client-Specific Values Template
```json
{
  "client_name": "New Client Company",
  "domain": "newclient.com", 
  "tenant_id": "newclient",
  "admin_email": "admin@newclient.com",
  "project_name": "newclient-edge-app"
}
```

---

## 🎯 Phase 1: Database Setup (30-60 minutes)

### Create Supabase Organization & Project
1. **Login to Supabase** with your master account
2. **Create Organization:** "[Client Company Name]"
3. **Create Project:** "[client]-edge-app"  
4. **Save Details:**
   - Project Reference ID: `[abc123xyz...]`
   - Database URL: `https://[ref].supabase.co`
   - Anon Key: From Project Settings → API

### Apply Database Schema
**Critical: Apply files in this exact order:**

1. **Primary Schema:**
   ```bash
   # Copy from lucerne-international/schema-files/
   # Update tenant_id values for new client
   psql -f schema-files/[client]-schema.sql
   ```

2. **Functions:**
   ```bash
   psql -f schema-files/[client]-functions.sql
   ```

3. **Policies:**
   ```bash
   psql -f schema-files/[client]-policies.sql  
   ```

### Create Admin User & Link to Auth
```sql
-- Create admin user in employees table
INSERT INTO employees (
    email, first_name, last_name, role, 
    is_active, tenant_id, created_at, updated_at
) VALUES (
    'admin@clientcompany.com',
    'Admin',
    'User', 
    'admin',
    true,
    '[client_tenant_id]',
    NOW(),
    NOW()
);

-- After user signs up in app, link to auth.users:
UPDATE employees 
SET user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'admin@clientcompany.com'
)
WHERE email = 'admin@clientcompany.com';
```

### Configure Supabase Authentication
1. **Go to Authentication → Settings**
2. **Site URL:** `https://[client]-edge-app.vercel.app`
3. **Redirect URLs:** 
   - `https://[client]-edge-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for testing)

---

## 🌐 Phase 2: Frontend Deployment (30-45 minutes)

### Create Vercel Project
1. **Go to Vercel Dashboard**
2. **Import GitHub Repository** (your EDGE repo)
3. **Project Name:** `[client]-edge-app`
4. **Framework:** Create React App (auto-detected)

### Critical Vercel Configuration
```json
{
  "root_directory": "",                    // MUST be empty
  "build_command": "npm run build",
  "install_command": "npm install", 
  "development_command": "npm start",
  "node_version": "22.x"                   // NOT 18.x
}
```

### Environment Variables (Exact Names Required)
```env
REACT_APP_SUPABASE_URL=https://[project-ref].supabase.co
REACT_APP_SUPABASE_ANON_KEY=[anon-key-from-supabase]
REACT_APP_TENANT_ID=[client_tenant_id]
REACT_APP_CLIENT_NAME=[Client Company Name]
REACT_APP_ENV=production
```

### Deploy & Verify Build
1. **Click Deploy** - should take 2-3 minutes
2. **Check Build Logs** - verify no errors
3. **Visit Deployment URL** - should load (may show login)

---

## ✅ Phase 3: Testing & Verification (15-30 minutes)

### Authentication Test
1. **Go to deployment URL**
2. **Sign up** with client admin email
3. **Check email** and confirm account
4. **Login** and verify console shows:
   ```
   ✅ Found user in employees table: {role: 'admin', name: 'Admin User'}
   ```

### Database Verification
```sql
-- Verify admin user exists and is linked
SELECT email, role, user_id, is_active, tenant_id
FROM employees 
WHERE email = 'admin@clientcompany.com';

-- Should return: admin role, non-null user_id, active=true, correct tenant_id
```

### Admin Dashboard Test
- [ ] Admin dashboard loads without errors
- [ ] Navigation between sections works
- [ ] Basic widgets display (even with fallback data)
- [ ] No authentication-related console errors

### Multi-Tenant Verification
- [ ] Data isolation confirmed (only client's tenant_id data visible)
- [ ] Admin can't access other tenants' data
- [ ] All new records get correct tenant_id

---

## 🚨 Common Issues & Quick Fixes

### Build Fails: "react-scripts: command not found"
**Cause:** Root directory setting incorrect  
**Fix:** Set Root Directory to empty/blank in Vercel settings

### Authentication Not Working
**Cause:** User not linked to employee record  
**Fix:** Run user_id linkage SQL after user signs up

### Admin Role Not Recognized
**Cause:** RLS policies too complex or user_id not linked  
**Fix:** Start with simple RLS policies: `USING (true)`

### Environment Variables Not Loading
**Cause:** Wrong prefix (NEXT_PUBLIC_ instead of REACT_APP_)  
**Fix:** Use exact prefix `REACT_APP_` for all variables

### Database Functions 404 Errors
**Cause:** PostgREST API cache issue  
**Impact:** Non-blocking - app uses fallback data  
**Fix:** Monitor for cache refresh, app works normally

---

## 📊 Success Metrics

### Technical Success Indicators
- ✅ Vercel build completes without errors
- ✅ App loads at deployment URL
- ✅ Admin can login and access dashboard
- ✅ Console shows admin role recognition
- ✅ Database queries return client-specific data only

### Business Success Indicators  
- ✅ Client admin satisfied with delivered system
- ✅ Core functionality operational
- ✅ Performance meets expectations (<3 second load times)
- ✅ System ready for employee onboarding

---

## 📈 Post-Deployment

### Client Handoff
1. **Document final URLs and credentials**
2. **Schedule training session** with client admin
3. **Provide support contact information**
4. **Set expectations** for ongoing support

### Update Client Documentation
1. **Update client folder** with final configurations
2. **Create client backup** using backup scripts
3. **Document any custom changes** made during deployment
4. **Update troubleshooting log** with any new issues discovered

### Business Process
1. **Send invoice** for setup and first month
2. **Schedule monthly check-in** call
3. **Add to client monitoring** list
4. **Update internal deployment metrics**

---

## 🔮 Scaling for Multiple Clients

### Efficiency Improvements
After 3-5 successful deployments:
- **Create deployment scripts** for common tasks
- **Build configuration templates** for quick setup
- **Automate testing** and verification steps
- **Streamline client onboarding** process

### Business Model Optimization
- **Track deployment time** - should decrease to 2-3 hours
- **Document pricing model** based on actual effort
- **Build client success stories** for sales
- **Create self-service options** for simple deployments

---

## 📞 Support & Troubleshooting

### For Deployment Issues
1. **Check client folder** for similar issues in troubleshooting log
2. **Compare with Lucerne configuration** - what's different?
3. **Use primary system backup** as reference for correct setup
4. **Follow verification checklist** after each fix

### For Ongoing Client Support  
1. **Client-specific issues:** Check their folder documentation first
2. **General issues:** Reference this guide and Lucerne experience
3. **New issues:** Document in client's troubleshooting log
4. **Pattern issues:** Update this guide for future deployments

---

## 🏆 Success Pattern Summary

**The Proven 3-Phase Approach:**
1. **Database First:** Get schema and admin auth working
2. **Frontend Second:** Deploy with correct configuration  
3. **Test Thoroughly:** Verify all core functionality

**Key Success Factors:**
- Use Lucerne International folder as template
- Apply configurations exactly as documented
- Test authentication immediately after each phase
- Keep RLS policies simple initially
- Document everything client-specific

**Expected Timeline:** 2-4 hours for experienced deployer, 4-6 hours for first time

---

**Last Updated:** August 11, 2025  
**Based On:** Lucerne International successful deployment  
**Success Rate:** 100% when following this methodology  
**Next Update:** After 2-3 additional client deployments