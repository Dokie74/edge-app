# 🚨 URGENT: Fix Create Employee - Vercel Environment Variables Setup

## Problem Confirmed ✅

**Issue:** Create Employee fails because API route `/api/admin/create-employee` returns 500 error  
**Root Cause:** Missing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel deployment  
**Status:** API route exists and is correctly coded - only environment configuration missing

## Test Results 🧪

```bash
# Test run: 2025-08-12 16:33:30
URL: https://lucerne-edge-app.vercel.app/api/admin/create-employee
Response: 500 - FUNCTION_INVOCATION_FAILED
Error: A server error has occurred
```

This confirms the serverless function is failing to initialize due to missing environment variables.

## IMMEDIATE FIX - Set Vercel Environment Variables 🔧

### Step 1: Get Your Supabase Credentials
1. Go to https://supabase.com/dashboard
2. Select your project (likely "lucerne-edge-app" or similar)  
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (e.g., `https://wvggehrxhnuvlxpaghft.supabase.co`)
   - **service_role** key (the long key starting with `eyJ...` - this is secret!)

### Step 2: Add Environment Variables to Vercel
1. Go to https://vercel.com/dashboard
2. Find your project: `lucerne-edge-app` 
3. Click **Settings** → **Environment Variables**
4. Add these TWO variables:

```
Variable Name: SUPABASE_URL
Value: https://wvggehrxhnuvlxpaghft.supabase.co
Environment: Production, Preview, Development

Variable Name: SUPABASE_SERVICE_ROLE_KEY  
Value: eyJ... (your actual service role key)
Environment: Production, Preview, Development
```

### Step 3: Redeploy
After adding the variables, trigger a new deployment:
- **Option A:** Go to **Deployments** tab → click **Redeploy** on latest deployment
- **Option B:** Push any git commit to trigger auto-deployment

## Verification Test 🧪

After redeployment, run this test:

```javascript
// Browser Console Test (on https://lucerne-edge-app.vercel.app)
fetch('/api/admin/create-employee', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test-' + Date.now() + '@lucerneintl.com',
    password: 'TempPass123!',
    full_name: 'Test User Fix',
    role: 'employee'
  })
}).then(r => r.json()).then(console.log);
```

**Expected Success Response:**
```json
{
  "success": true,
  "user_id": "uuid-here",
  "employee_id": "uuid-here", 
  "message": "Employee created successfully with auth user"
}
```

## Why This Fixes the Issue 🎯

**BEFORE (Current State):**
1. Frontend calls `/api/admin/create-employee`
2. Vercel function tries to access `process.env.SUPABASE_URL` → `undefined`
3. Function crashes during initialization → 500 error
4. Frontend falls back to Edge Function (which has other issues)
5. Result: No auth user created, only employee record (maybe)

**AFTER (With Environment Variables):**
1. Frontend calls `/api/admin/create-employee` 
2. Vercel function loads `process.env.SUPABASE_URL` → ✅ valid URL
3. Function loads `process.env.SUPABASE_SERVICE_ROLE_KEY` → ✅ valid key
4. Function creates admin Supabase client → ✅ works
5. Function calls `auth.admin.createUser()` → ✅ creates auth user
6. Function inserts employee record → ✅ creates employee
7. Result: ✅ Both auth user AND employee created successfully

## Security Notes 🔒

- **Service Role Key** bypasses Row Level Security - only use server-side
- **Never expose** service role key in client-side code  
- Client continues to use `REACT_APP_SUPABASE_ANON_KEY` (safe, RLS-protected)
- Server uses `SUPABASE_SERVICE_ROLE_KEY` (admin privileges for user creation)

## Alternative Setup Method (CLI) 💻

If you prefer command line:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Set environment variables
vercel env add SUPABASE_URL production
# Enter: https://wvggehrxhnuvlxpaghft.supabase.co

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Enter: your-actual-service-role-key

# Deploy
vercel --prod
```

## Next Steps After Fix ✅

1. **Verify** environment variables are set in Vercel dashboard
2. **Redeploy** the application
3. **Test** employee creation from the UI
4. **Confirm** both auth user and employee record are created
5. **Verify** new employee can log in immediately

---

**Priority Level:** 🚨 CRITICAL - This is the primary fix needed for Create Employee functionality**