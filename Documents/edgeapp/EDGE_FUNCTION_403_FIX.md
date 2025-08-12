# 🔧 Fix Edge Function 403 Forbidden Error

**Issue:** Edge Function `admin-operations` returns 403 Forbidden  
**Root Cause:** Missing or invalid Authorization header in Edge Function call  
**Location:** `callAdminFunction` method in AdminService.ts line 33-35

---

## 🚨 **Root Cause Analysis**

**The Problem:**
- Edge Function requires valid JWT token in Authorization header (line 27-42)  
- `supabase.functions.invoke()` should auto-include auth token, but isn't working
- User may not be properly authenticated when calling createEmployee

**The Code:**
```typescript
// AdminService.ts line 33-35
const { data: result, error } = await supabase.functions.invoke('admin-operations', {
  body: { action, data }
  // Missing: No explicit auth headers
});
```

**Edge Function Expects:**
```typescript
// admin-operations/index.ts line 27
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(JSON.stringify({ error: 'No authorization header' }), {
    status: 403  // This is the 403 error you're seeing
  });
}
```

---

## 🔧 **Fix Options**

### **Option 1: Ensure User is Authenticated (Recommended)**

The `supabase.functions.invoke()` should automatically include auth headers if user is logged in. Check authentication:

```javascript
// Browser Console Test - Check current auth status
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
console.log('Authenticated:', !!user);

if (!user) {
  console.log('❌ User not authenticated - this explains the 403 error');
  // Need to login first
  await supabase.auth.signInWithPassword({
    email: 'dokonoski@lucerneintl.com',
    password: '[admin_password]'
  });
}
```

### **Option 2: Modify Edge Function for Admin Creation**

Create a special admin-only endpoint that doesn't require user authentication for employee creation:

**Add to Edge Function (line 27 area):**
```typescript
// Special case: Allow unauthenticated admin user creation
if (action === 'create_user' && !authHeader) {
  // Verify request is from admin dashboard page
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  
  if (origin !== 'https://lucerne-edge-app.vercel.app' || 
      !referer?.includes('/admin')) {
    return new Response(JSON.stringify({ error: 'Unauthorized origin' }), {
      status: 403,
      headers: corsHeaders
    });
  }
  
  console.log('⚠️ Allowing admin user creation without auth (admin dashboard)');
  // Skip auth check for create_user action from admin dashboard
} else if (!authHeader) {
  // Normal auth check for other actions
  return new Response(JSON.stringify({ error: 'No authorization header' }), {
    status: 403,
    headers: corsHeaders
  });
}
```

### **Option 3: Fix Client Auth Headers**

Explicitly add auth headers to function call:

```typescript
// Modified callAdminFunction method
static async callAdminFunction(action: string, data: any): Promise<AdminFunctionResponse> {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    const invokeOptions: any = {
      body: { action, data }
    };
    
    // Add auth headers if available
    if (session?.access_token) {
      invokeOptions.headers = {
        Authorization: `Bearer ${session.access_token}`
      };
    }
    
    const { data: result, error } = await supabase.functions.invoke('admin-operations', invokeOptions);
    // ... rest of method
  }
}
```

---

## ⚡ **Quick Test - Check Authentication Status**

```javascript
// Browser Console - Check if this explains the 403 error
console.log('🔍 Checking authentication status...');

const { data: { user }, error } = await supabase.auth.getUser();
console.log('Current user:', user ? user.email : 'Not authenticated');
console.log('User ID:', user?.id);

const { data: { session } } = await supabase.auth.getSession();
console.log('Session exists:', !!session);
console.log('Access token exists:', !!session?.access_token);

if (!user) {
  console.log('❌ PROBLEM FOUND: User not authenticated');
  console.log('   This explains the 403 Forbidden error');
  console.log('   Admin must be logged in to create employees');
} else {
  console.log('✅ User is authenticated');
  console.log('   The 403 error has a different cause');
}
```

---

## 🎯 **Recommended Fix Order**

1. **Test authentication status** using browser console script above
2. **If not authenticated:** Admin needs to login first
3. **If authenticated but still 403:** Apply Option 2 (modify Edge Function)
4. **Alternative:** Set up server-side environment variables to use API route instead

---

## 🔒 **Why This Happens**

**Authentication Flow:**
1. Admin logs into dashboard 
2. Supabase client stores session/token
3. `supabase.functions.invoke()` should auto-include `Authorization: Bearer <token>`
4. Edge Function validates token against auth user

**If any step fails → 403 Forbidden**

**Most Likely Cause:**
Admin is not logged in or session expired when trying to create employees.

---

**✅ Priority:** Check authentication status first, then apply appropriate fix based on results.