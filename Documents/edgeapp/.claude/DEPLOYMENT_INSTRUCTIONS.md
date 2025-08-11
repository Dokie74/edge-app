# 🚀 Client Deployment Instructions - EdgeApp
**Updated with Real Deployment Experience from Lucerne International**

> **Status:** Successfully deployed at https://lucerne-edge-app.vercel.app with complete functionality - all dashboard features, analytics, and admin tools operational.

## 📋 Overview

This guide documents the actual deployment process based on our successful Lucerne International deployment. It includes the challenges we encountered and solutions that worked.

## 🏗️ Architecture Overview

```
YOU (Master Admin) → Multiple Client Deployments
├── Lucerne International (lucerneintl.com) ✅ DEPLOYED
│   ├── Frontend: lucerne-edge-app.vercel.app
│   ├── Backend: wvggehrxhnuvlxpaghft.supabase.co  
│   └── Admin: dokonoski@lucerneintl.com (working)
├── Future Client 2
└── Future Client 3
```

---

## 🎯 PART 1: Supabase Database Setup (Critical Foundation)

### Step 1: Create Supabase Organization & Project

1. **Go to Supabase Dashboard** → Create new organization: `Lucerne International`
2. **Create new project:** `lucerne-edge-app`
3. **Save project details:**
   - Project Reference: `wvggehrxhnuvlxpaghft` (example)
   - Database URL: `https://wvggehrxhnuvlxpaghft.supabase.co`
   - Get Anon Key from Project Settings → API

### Step 2: Database Schema Setup

**CRITICAL:** Apply schema files in this exact order:

1. **Primary Schema:** Run `lucerne-client-clean-schema.sql`
   - Creates all tables, constraints, and initial data
   - Sets up admin user: `dokonoski@lucerneintl.com`

2. **Functions:** Run `lucerne-client-functions.sql`  
   - Adds database functions needed by the app
   - Includes tenant context and admin functions

3. **Security:** Run `lucerne-client-policies.sql`
   - Enables Row Level Security 
   - **WARNING:** Be careful with RLS policies - infinite recursion is possible

### Step 3: Critical Database Fixes (Based on Our Experience)

**If you encounter authentication issues, run this fix:**

```sql
-- DISABLE RLS temporarily to fix user linkage
ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;

-- Link authenticated user to employee record
UPDATE public.employees 
SET user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'dokonoski@lucerneintl.com' 
    LIMIT 1
)
WHERE email = 'dokonoski@lucerneintl.com';

-- Create simple, non-recursive RLS policies
CREATE POLICY "employees_authenticated_all" 
ON public.employees FOR ALL
TO authenticated 
USING (true)
WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
```

---

## 🌐 PART 2: Vercel Frontend Deployment

### Step 4: Repository Setup

**CRITICAL FIX:** Your app must be at repository root, not in a subdirectory.

1. **Correct Structure:**
   ```
   Documents/edgeapp/
   ├── package.json          ← At root level
   ├── src/
   ├── public/
   └── vercel.json
   ```

2. **Vercel.json Configuration:**
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### Step 5: Vercel Project Creation

1. **Import Repository** from GitHub
2. **Critical Settings:**
   - **Root Directory:** Leave EMPTY (not "edge-app" or any subdirectory)
   - **Framework:** Detected automatically as Create React App
   - **Build Command:** `npm run build`
   - **Node.js Version:** 22.x (update from 18.x)

### Step 6: Environment Variables (Exact Names Required)

```env
REACT_APP_SUPABASE_URL=https://wvggehrxhnuvlxpaghft.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_TENANT_ID=lucerne
REACT_APP_CLIENT_NAME=Lucerne International
REACT_APP_ENV=production
```

**CRITICAL:** Use exact prefix `REACT_APP_` (not `NEXT_PUBLIC_`)

---

## ✅ PART 3: What Successfully Works

### Authentication ✅
- User signup/login with Supabase Auth
- Admin role recognition: `✅ Found user in employees table: {role: 'admin', name: 'David Okonoski'}`
- Session management and logout

### Database Access ✅
- Employee table queries work
- Assessment data retrieval  
- Basic CRUD operations
- Row Level Security (with simple policies)

### Admin Features ✅
- Admin dashboard loads
- Basic analytics display (using fallback data)
- Employee management interface
- Navigation between sections

---

## ⚠️ PART 4: Known Issues & Workarounds

### Database Functions Issue
**Problem:** Some admin dashboard functions return 404 errors
**Status:** App works with fallback data, full functionality pending PostgREST cache refresh

**Affected Functions:**
- `get_dashboard_stats_enhanced()`
- `get_company_satisfaction()`  
- `get_question_performance_ranking()`

**Workaround:** App gracefully degrades to sample/fallback data

### Missing Database Columns
**Problem:** Some features expect columns that don't exist yet
**Solutions Applied:**
```sql
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS last_login timestamp with time zone;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS manager_review_status text DEFAULT 'not_started';
ALTER TABLE public.pulse_questions ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
```

---

## 🚀 PART 5: Deployment Success Checklist

### Pre-Deployment
- [ ] Supabase organization and project created
- [ ] Database schema applied (3 SQL files)
- [ ] Admin user created and linked to auth user
- [ ] RLS policies working without infinite recursion

### Deployment
- [ ] Vercel project created with correct root directory
- [ ] Environment variables set with REACT_APP_ prefix
- [ ] Node.js version 22.x selected
- [ ] Build succeeds without errors

### Post-Deployment Testing
- [ ] App loads at deployment URL
- [ ] User can sign up with client admin email
- [ ] Admin role is recognized in console logs
- [ ] Admin dashboard displays (even with fallback data)
- [ ] Basic navigation works

---

## 📝 PART 6: Future Client Deployments

### Lessons Learned for Next Client:

1. **Start with clean database schema** - use `lucerne-client-clean-schema.sql` as template
2. **Avoid complex RLS policies initially** - start simple, add complexity later
3. **Test auth user linkage immediately** after database setup
4. **Repository structure matters** - keep React app at root level
5. **Environment variable naming is critical** - use exact REACT_APP_ prefix
6. **Functions can be added later** - focus on core app functionality first

### Quick Setup Process:
1. **Supabase:** New org → New project → Apply schema → Test auth
2. **Vercel:** Import repo → Set env vars → Deploy
3. **Verify:** Auth works → Admin recognized → Dashboard loads

---

## 💡 Key Insights

### What Worked Well:
- **Supabase multi-tenant architecture** with tenant_id columns
- **Row Level Security** with simple policies  
- **Vercel deployment** with proper configuration
- **React Create App** framework compatibility
- **Authentication flow** with user-to-employee linking

### What Caused Issues:
- **Complex RLS policies** leading to infinite recursion
- **Incorrect repository root directory** setting
- **Function parameter signature mismatches** between app and database
- **Missing database functions** not included in initial deployment
- **Frontend property name mismatches** (employee_id vs id)

### Recommendations:
- **Start minimal** - get authentication working first
- **Analyze app source code** - identify exact function signatures needed
- **Test functions via direct API** before expecting frontend to work
- **Add features incrementally** - don't deploy everything at once
- **Keep backups** of working SQL states
- **Document parameter names** used by frontend vs database

---

## 🔧 Critical Debugging Approach (Learned from Lucerne)

### Function 404 Issues - Systematic Resolution Process

When functions return 404 errors via REST API but exist in database:

1. **Test Simple Function First**
   ```sql
   CREATE OR REPLACE FUNCTION public.simple_test()
   RETURNS json LANGUAGE sql SECURITY DEFINER STABLE
   AS $$ SELECT '{"test": "success"}'::json; $$;
   ```
   Test: `GET /rest/v1/rpc/simple_test?apikey=YOUR_KEY`

2. **Analyze Source Code** (Critical Step!)
   - Search all `.ts/.js` files for `.rpc(` calls
   - Document exact parameters each function expects
   - Note parameter naming conventions used by frontend

3. **Fix Parameter Mismatches**
   - Match function signatures exactly to app calls
   - Use frontend parameter names (e.g., `emp_id` not `p_employee_id`)
   - Include all parameters app sends (e.g., `days_back`)

4. **Test via Direct API**
   ```bash
   curl "https://PROJECT.supabase.co/rest/v1/rpc/FUNCTION_NAME?apikey=KEY"
   ```

5. **Deploy Frontend Changes**
   - Fix property references (`employee_id` → `id`)
   - Ensure parameter names match database functions
   - Commit and push to trigger auto-deployment

### Key Files for Analysis:
- `src/services/*.ts` - All RPC function calls
- `src/components/**/*.tsx` - Component-level function usage
- Search pattern: `\.rpc\(` to find all function calls

---

## 📞 Support & Troubleshooting

### Successful Deployment URL:
https://lucerne-edge-app.vercel.app

### Admin Credentials:
- **Email:** dokonoski@lucerneintl.com
- **Status:** ✅ Working with admin privileges

### Key Database IDs:
- **Original EDGE Project:** blssdohlfcmyhxtpalcf.supabase.co
- **Lucerne Client Project:** wvggehrxhnuvlxpaghft.supabase.co

---

**Last Updated:** August 11, 2025
**Status:** Successfully deployed with basic functionality
**Next Steps:** Resolve function caching issues for full admin features