# 🧪 Comprehensive Testing Guide - Employee Creation Fixes

**Status:** Both issues diagnosed, fixes ready to implement  
**Issues:** Server API 500 error + Edge Function 403 error  
**Next:** Test fixes step-by-step

---

## 🎯 **Test Plan Summary**

1. **Fix server-side environment variables** (500 error)
2. **Check admin authentication status** (403 error)  
3. **Test both approaches** (API route + Edge Function)
4. **Verify auth user creation** (no more user_id: null)

---

## 🔧 **STEP 1: Fix Server-Side Environment Variables**

### **Add Missing Variables to Vercel:**
1. Go to: https://vercel.com/dashboard
2. Select project: `lucerne-edge-app` 
3. Settings → Environment Variables
4. Add these variables:

```
SUPABASE_URL = https://wvggehrxhnuvlxpaghft.supabase.co
SUPABASE_SERVICE_ROLE_KEY = [GET_FROM_SUPABASE_PROJECT_SETTINGS]
```

5. **Get Service Role Key:**
   - Supabase Dashboard → Your Project → Settings → API
   - Copy `service_role` key (starts with `eyJ...`)

6. **Redeploy:**
   - Click "Redeploy" in Vercel dashboard
   - OR push a git commit to trigger deployment

### **Test Server-Side Fix:**
```javascript
// Browser Console - Test API route
fetch('/api/admin/create-employee', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test-api@lucerneintl.com',
    password: 'TempPass123!',
    full_name: 'API Test User',
    role: 'employee'
  })
}).then(r => r.json()).then(console.log);

// Expected BEFORE fix: 500 error
// Expected AFTER fix: Success with user_id
```

---

## 🔐 **STEP 2: Check Admin Authentication**

### **Verify Authentication Status:**
```javascript
// Browser Console - Check if admin is logged in
console.log('🔍 Checking authentication status...');

const { data: { user }, error } = await supabase.auth.getUser();
console.log('Current user:', user ? user.email : '❌ Not authenticated');
console.log('User ID:', user?.id);

const { data: { session } } = await supabase.auth.getSession();
console.log('Session exists:', !!session);
console.log('Access token exists:', !!session?.access_token);

if (!user) {
  console.log('❌ AUTHENTICATION PROBLEM FOUND');
  console.log('   This explains the Edge Function 403 error');
  console.log('   Admin must login first');
} else {
  console.log('✅ Admin is authenticated');
}
```

### **Login if Not Authenticated:**
```javascript
// If above shows "Not authenticated", login:
await supabase.auth.signInWithPassword({
  email: 'dokonoski@lucerneintl.com',
  password: '[YOUR_ADMIN_PASSWORD]'
});

console.log('Login attempt completed - check status again');
```

---

## 🚀 **STEP 3: Test Employee Creation**

### **Full Test with Both Approaches:**
```javascript
// Browser Console - Create test employee
console.log('🧪 Testing employee creation with both approaches...');

// This should now work with both fixes applied
AdminService.createEmployee({
  name: 'Test Complete User',
  email: 'test-complete@lucerneintl.com',
  role: 'employee',
  jobTitle: 'Test Position',
  password: 'TempPass123!'
}).then(result => {
  console.log('✅ Employee creation result:', result);
  
  if (result.success && result.data.user_id) {
    console.log('🎉 SUCCESS: Auth user created with ID:', result.data.user_id);
  } else {
    console.log('❌ STILL FAILING: No auth user created');
  }
}).catch(error => {
  console.error('💥 Employee creation failed:', error);
});
```

### **Expected Results After Fixes:**

**Scenario 1: Server API Works (Best Case)**
```
🚀 TRYING SERVER-SIDE API ROUTE APPROACH FIRST
📡 Server-side API route response: {success: true, user_id: "uuid...", employee_id: "uuid..."}
✅ Server-side API route succeeded with auth user: uuid...
```

**Scenario 2: Server API Fails, Edge Function Works (Fallback)**
```
🚀 TRYING SERVER-SIDE API ROUTE APPROACH FIRST
💥 Server-side API route FAILED - detailed error: [error details]
⚠️ Server-side API route not available, falling back to Edge Function
🚀 FALLBACK: USING EDGE FUNCTION APPROACH - calling admin-operations
✅ Edge Function fallback succeeded with auth user: uuid...
```

**Scenario 3: Both Still Failing**
```
💥 Server-side API route FAILED - detailed error: [error details]
💥 Edge Function call failed: [error details]
❌ Both approaches failed
```

---

## 🔍 **STEP 4: Diagnose Remaining Issues**

### **If Server API Still Returns 500:**
```javascript
// Check if environment variables were applied
fetch('/api/admin/health-check')
  .then(r => r.json())
  .then(health => {
    console.log('Server health:', health);
    console.log('Environment variables set:', health.env_vars_set);
  });
```

### **If Edge Function Still Returns 403:**
```javascript
// Test Edge Function directly
supabase.functions.invoke('admin-operations', {
  body: { 
    action: 'create_user',
    data: {
      name: 'Edge Test User',
      email: 'edge-test@lucerneintl.com',
      role: 'employee',
      temp_password: 'TempPass123!'
    }
  }
}).then(result => {
  console.log('Direct Edge Function result:', result);
}).catch(error => {
  console.log('Direct Edge Function error:', error);
});
```

---

## ✅ **Success Criteria**

### **Fixed Server API Route:**
- ✅ Returns 201 status (not 500)
- ✅ Response includes `user_id` and `employee_id` 
- ✅ Console shows: "✅ Server-side API route succeeded with auth user"

### **Fixed Edge Function:**
- ✅ No 403 Forbidden errors
- ✅ Returns success with auth user data
- ✅ Console shows: "✅ Edge Function fallback succeeded with auth user"

### **Fixed Employee Creation:**
- ✅ No more `create_employee_success {user_id: null}` logs
- ✅ Real UUID shown in success logs  
- ✅ Employee can login immediately with created credentials
- ✅ New employee appears in admin dashboard

---

## 🚨 **Priority Action Items**

1. **IMMEDIATE:** Set Vercel environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
2. **IMMEDIATE:** Check admin authentication status in browser console
3. **TEST:** Run employee creation test after applying fixes
4. **VERIFY:** Confirm both approaches work or identify remaining issues

---

**⏰ Expected Timeline:** 15-30 minutes to apply both fixes and verify functionality