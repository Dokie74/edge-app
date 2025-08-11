# 🔧 Lucerne International - Troubleshooting Log

> **Purpose:** Document all issues encountered and solutions applied during deployment and maintenance.

## 📅 Deployment Issues (August 10-11, 2025)

### Issue #1: Vercel Build Failures
**Date:** August 10, 2025  
**Symptom:** "react-scripts: command not found" during build  
**Root Cause:** Incorrect `rootDirectory: "edge-app"` in vercel.json  

**Solution Applied:**
1. Removed `rootDirectory` setting from vercel.json
2. Set Vercel Root Directory to empty/blank
3. Ensured React app is at repository root level

**Result:** ✅ Build successful  
**Credit:** Gemini identified the core issue

### Issue #2: Node.js Version Deprecation
**Date:** August 10, 2025  
**Symptom:** Build warnings about deprecated Node.js 18.x  
**Root Cause:** package.json specified Node >=18.17.0  

**Solution Applied:**
1. Updated package.json: `"node": ">=22.0.0"`
2. Set Vercel project to use Node.js 22.x
3. Redeployed project

**Result:** ✅ Using current Node.js version

### Issue #3: Authentication Not Working
**Date:** August 11, 2025  
**Symptom:** Users could authenticate but weren't recognized as admin  
**Error:** `⚠️ User not found in employees table, using fallback logic`

**Root Cause:** Missing user_id linkage between auth.users and employees tables

**Solution Applied:**
```sql
UPDATE employees 
SET user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'dokonoski@lucerneintl.com'
)
WHERE email = 'dokonoski@lucerneintl.com';
```

**Result:** ✅ Admin role recognition working  
**Console Output:** `✅ Found user in employees table: {role: 'admin', name: 'David Okonoski'}`

### Issue #4: PostgREST Function 404 Errors (RESOLVED)
**Date:** August 11, 2025  
**Symptom:** Functions return 404 via REST API despite existing in database  
**Affected Functions:**
- `get_dashboard_stats_enhanced`
- `get_company_satisfaction` 
- `get_question_performance_ranking`
- `get_employee_primary_department`

**Root Cause:** Parameter signature mismatches between app calls and function definitions

**Diagnostic Process:**
1. Verified functions exist in database ✅
2. Tested direct PostgREST API calls ✅  
3. Analyzed actual app source code for exact function calls
4. Identified parameter name and count mismatches

**Specific Issues Found:**
- `get_question_performance_ranking`: App sends 3 params, function only accepted 2
- `get_employee_primary_department`: App sends `emp_id`, function expected `p_employee_id`
- `get_manager_employees`: Function missing entirely (caused ManagerPlaybook crash)
- `get_employee_notes`: Function missing entirely

**Solution Applied:**
1. Created comprehensive function analysis of all 63 RPC calls in app
2. Recreated functions with exact signatures app expects
3. Fixed frontend property references (`employee_id` → `id`)
4. Applied database fixes via `comprehensive-function-fix-final.sql`

**Result:** ✅ All dashboard widgets now functional with real data  
**Impact:** Dashboard, Manager Playbook, and Admin pages fully operational

### Issue #4: RLS Policy Infinite Recursion
**Date:** August 11, 2025  
**Symptom:** `infinite recursion detected in policy for relation "employees"`  
**Root Cause:** Complex RLS policies referencing same table in nested subqueries

**Solution Applied:**
1. Temporarily disabled RLS: `ALTER TABLE employees DISABLE ROW LEVEL SECURITY`
2. Applied user_id linkage fixes
3. Created simple policies: `CREATE POLICY ... USING (true)`
4. Re-enabled RLS with simplified policies

**Result:** ✅ Database queries working without recursion

### Issue #5: Database Functions API 404 Errors
**Date:** August 11, 2025  
**Symptom:** Functions return 404 via REST API despite existing in database  
**Affected Functions:**
- `get_dashboard_stats_enhanced`
- `get_company_satisfaction` 
- `get_question_performance_ranking`

**Root Cause:** PostgREST API cache not recognizing created functions

**Attempted Solutions:**
1. Recreated functions with different signatures
2. Used SQL language instead of PLpgSQL
3. Added NOTIFY commands to trigger cache refresh
4. Updated function comments to force metadata refresh

**Result:** ⚠️ Partially resolved - functions exist but API cache issue persists  
**Workaround:** App gracefully degrades to fallback data  
**Impact:** Low - core functionality unaffected

---

## 🔍 Current Known Issues

### Non-Blocking Issues

#### Function API Cache Issue  
- **Status:** Active but non-blocking
- **Impact:** Some admin dashboard widgets show fallback data
- **Workaround:** App functions normally with sample data
- **Resolution:** Monitoring for PostgREST cache refresh

#### Missing Advanced Features
- **Status:** Partially addressed
- **Added Columns:** `last_login`, `manager_review_status`, `sort_order`
- **Impact:** Advanced analytics limited
- **Priority:** Low - core functionality complete

---

## 🎯 Resolution Patterns

### Successful Patterns
1. **Start Simple:** Begin with minimal configurations, add complexity incrementally
2. **Test Authentication First:** Verify user linking before adding features
3. **Use Exact Environment Variable Names:** `REACT_APP_` prefix is critical
4. **Repository Structure Matters:** App must be at repository root
5. **RLS Policy Simplicity:** Avoid complex nested queries initially

### Common Pitfalls
1. **Incorrect Root Directory:** Always leave empty for React apps at root
2. **Environment Variable Prefixes:** Wrong prefix causes silent failures
3. **Complex RLS Policies:** Can cause infinite recursion errors
4. **Function API Caching:** Functions may not appear immediately in REST API

---

## 📋 Verification Checklist

### After Any Fix, Verify:
- [ ] App loads at https://lucerne-edge-app.vercel.app
- [ ] User can sign up/login with admin email
- [ ] Console shows: `✅ Found user in employees table: {role: 'admin'}`
- [ ] Admin dashboard loads (even with fallback data)
- [ ] Navigation between sections works
- [ ] No console errors related to authentication

### Database Verification:
```sql
-- Verify admin user exists and is linked
SELECT email, role, user_id, is_active 
FROM employees 
WHERE email = 'dokonoski@lucerneintl.com';

-- Should return: admin role, non-null user_id, active=true
```

### Environment Variable Verification:
```bash
# In browser console, check:
console.log(process.env.REACT_APP_SUPABASE_URL);
console.log(process.env.REACT_APP_TENANT_ID);

# Should return correct values, not undefined
```

---

## 📞 Escalation Process

### For New Issues:
1. **Document symptom** with exact error messages
2. **Check this log** for similar issues and solutions
3. **Apply known patterns** from successful resolutions
4. **Test verification checklist** after any changes
5. **Update this log** with new solutions discovered

### For Recurring Issues:
1. **Review patterns** - what's causing repeated problems?
2. **Update deployment process** to prevent recurrence
3. **Enhance verification checklist** with new checks
4. **Document prevention strategies**

---

**Log Maintained By:** System Administrator  
**Last Updated:** August 11, 2025  
**Next Review:** When new issues arise or monthly maintenance