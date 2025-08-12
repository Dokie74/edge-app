# 🔧 Fix Vercel Environment Variables - Server 500 Error Resolution

**Issue:** API route `/api/admin/create-employee` returns 500 error  
**Root Cause:** Missing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel  
**Solution:** Add server-side environment variables to Vercel project

---

## 🚨 **IMMEDIATE FIX - Set Environment Variables**

### **Method 1: Vercel Dashboard (Recommended)**

1. **Go to Vercel Project Settings:**
   - Visit: https://vercel.com/dashboard
   - Click your project: `lucerne-edge-app`
   - Go to Settings → Environment Variables

2. **Add Server-Side Variables:**
   ```
   SUPABASE_URL = https://wvggehrxhnuvlxpaghft.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = [GET_FROM_SUPABASE_PROJECT_SETTINGS]
   ```

3. **Get Service Role Key:**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Settings → API → service_role (secret key)
   - Copy the key that starts with `eyJ...`

4. **Deploy to Activate:**
   - Click "Redeploy" in Vercel dashboard
   - OR push a git commit to trigger deployment

---

### **Method 2: Vercel CLI** 
```bash
# Install Vercel CLI first
npm install -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add SUPABASE_URL production
# Enter: https://wvggehrxhnuvlxpaghft.supabase.co

vercel env add SUPABASE_SERVICE_ROLE_KEY production  
# Enter: [your actual service role key]

# Deploy
vercel --prod
```

---

## 🧪 **Test the Fix**

### **Before Fix - API Route Test:**
```javascript
// Browser Console Test
fetch('/api/admin/create-employee', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@lucerneintl.com',
    password: 'TempPass123!',
    full_name: 'Test User',
    role: 'employee'
  })
}).then(r => r.text()).then(console.log);

// Expected: 500 error with HTML page
```

### **After Fix - Expected Success:**
```javascript
// Should return JSON with:
{
  "success": true,
  "user_id": "uuid-here",
  "employee_id": "uuid-here", 
  "message": "Employee created successfully with auth user"
}
```

---

## 🔍 **Environment Variables Checklist**

### **Client-Side (REACT_APP_ prefix):**
- ✅ `REACT_APP_SUPABASE_URL` - Already working  
- ✅ `REACT_APP_SUPABASE_ANON_KEY` - Already working
- ✅ `REACT_APP_TENANT_ID` - Already working

### **Server-Side (NO prefix - for API routes):**
- ❌ `SUPABASE_URL` - **MISSING** (causing 500 error)
- ❌ `SUPABASE_SERVICE_ROLE_KEY` - **MISSING** (causing 500 error)

---

## ⚡ **Why This Fixes the 500 Error**

**Current Problem:**
- API route `api/admin/create-employee.ts` line 25-26 tries to access `process.env.SUPABASE_URL`
- These variables are `undefined` in Vercel environment
- Code throws error trying to create Supabase client with `undefined` URL

**After Fix:**
- API route can access proper Supabase URL and service key
- Creates admin Supabase client successfully 
- Can create auth users with elevated permissions

---

## 🎯 **Next Steps**

1. **Set environment variables** using Method 1 or 2 above
2. **Redeploy** the Vercel project
3. **Test employee creation** - should now see dual approach working:
   - ✅ Server-side API route succeeds (instead of 500 error)
   - ✅ Edge Function used as fallback if needed
4. **Verify success logs** show real `user_id` instead of `null`

---

## 🔒 **Security Notes**

- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - only use server-side
- Never expose service role key in client-side code
- Client uses `REACT_APP_SUPABASE_ANON_KEY` (safe, RLS-protected)
- Server uses `SUPABASE_SERVICE_ROLE_KEY` (admin privileges)

---

**✅ Priority:** Set environment variables in Vercel dashboard first, then test employee creation.