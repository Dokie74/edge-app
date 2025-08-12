# 🚨 DIRECT CREATE EMPLOYEE FIX - Bypass API Route Issues

## Current Status 📊

**Problem:** API routes are failing with `FUNCTION_INVOCATION_FAILED` regardless of TypeScript or JavaScript  
**Root Cause:** Vercel deployment configuration issues beyond environment variables  
**Solution:** Implement direct browser-based create employee using client-side approach with proper admin validation

## ⚡ IMMEDIATE WORKING FIX

Since the API routes are having deployment issues, here's a **working alternative** that creates auth users properly:

### Option 1: Direct Admin Panel Implementation 

Create a direct admin function that works in the browser console for immediate testing:

```javascript
// PASTE THIS IN BROWSER CONSOLE ON YOUR ADMIN PAGE
// This bypasses the API route and creates employees directly

async function createEmployeeDirectly(employeeData) {
  console.log('🔥 Direct employee creation starting...');
  
  // Get current admin session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Admin not logged in');
  }
  
  console.log('👤 Admin session found:', session.user.email);
  
  // Call the Edge Function directly (this works when API routes don't)
  console.log('📡 Calling admin-operations Edge Function...');
  
  const { data: result, error } = await supabase.functions.invoke('admin-operations', {
    body: { 
      action: 'create_user',
      data: {
        name: employeeData.name,
        email: employeeData.email,
        role: employeeData.role,
        job_title: employeeData.jobTitle || 'Staff',
        department: employeeData.department,
        manager_id: employeeData.managerId || null,
        temp_password: employeeData.password || 'TempPass123!'
      }
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (error) {
    console.error('💥 Edge Function error:', error);
    throw error;
  }

  if (result?.error) {
    console.error('💥 Edge Function result error:', result);
    throw new Error(result.error);
  }

  // Verify auth user was created
  if (!result.user?.id) {
    console.error('💥 No auth user created');
    throw new Error('Auth user creation failed');
  }

  console.log('✅ SUCCESS! Auth user created:', result.user.id);
  console.log('✅ Employee created:', result.employee?.id);
  
  return result;
}

// TEST IT NOW - Run this in browser console:
createEmployeeDirectly({
  name: 'Test User Direct',
  email: 'direct-test-' + Date.now() + '@lucerneintl.com',
  role: 'employee',
  jobTitle: 'Direct Test Position',
  password: 'TempPass123!'
}).then(result => {
  console.log('🎉 DIRECT CREATE SUCCESS:', result);
}).catch(error => {
  console.error('❌ DIRECT CREATE FAILED:', error);
});
```

### Option 2: Fix AdminService to Use Edge Function Only

Since the API route is problematic, modify the AdminService to use **only** the Edge Function approach:

**File: `src/services/AdminService.ts`**

```typescript
// Replace the createEmployee function with this EDGE-FUNCTION-ONLY version:
static async createEmployee(employeeData: EmployeeFormData): Promise<ApiResponse> {
  AdminService.getVersion();
  console.log('🔥 AdminService.createEmployee - EDGE FUNCTION ONLY approach');
  
  try {
    // Input validation and sanitization
    const validation: ValidationResult = validateEmployeeForm(employeeData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    const secureData = validation.data as EmployeeFormData;
    logger.logUserAction('create_employee_attempt', null, { role: secureData.role });

    console.log('🚀 CALLING EDGE FUNCTION DIRECTLY - bypassing broken API routes');
    
    // Get current session for auth headers
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Admin not authenticated - cannot create users');
    }

    console.log('👤 Admin session found:', session.user.email);

    // Call Edge Function directly with proper auth
    const { data: result, error } = await supabase.functions.invoke('admin-operations', {
      body: { 
        action: 'create_user',
        data: {
          name: secureData.name,
          email: secureData.email,
          role: secureData.role,
          job_title: secureData.jobTitle || 'Staff',
          department: secureData.department,
          manager_id: secureData.managerId || null,
          temp_password: secureData.password || 'TempPass123!'
        }
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('💥 Edge Function error:', error);
      throw error;
    }

    if (result?.error) {
      console.error('💥 Edge Function result error:', result);
      throw new Error(result.error + (result.debug ? ` | Debug: ${JSON.stringify(result.debug)}` : ''));
    }

    // CRITICAL: Verify auth user was created
    if (!result.user?.id) {
      console.error('💥 CRITICAL: Edge Function succeeded but no user_id returned');
      throw new Error('Edge Function failed: No auth user created');
    }

    console.log('✅ Edge Function succeeded with auth user:', result.user.id);
    
    logger.logUserAction('create_employee_success', null, { 
      user_id: result.user.id,
      employee_id: result.employee?.id,
      role: secureData.role,
      approach: 'edge_function_only'
    });
    
    return {
      success: true,
      data: {
        user_id: result.user.id,
        employee_id: result.employee?.id,
        message: 'Employee created successfully with login account!',
        next_steps: {
          can_login_immediately: true,
          signup_required: false,
          login_credentials: {
            email: secureData.email,
            password: secureData.password || 'TempPass123!'
          },
          instructions: `User can log in immediately with email: ${secureData.email} and the provided temporary password.`
        }
      }
    };

  } catch (error: any) {
    logger.logError(error, { action: 'create_employee', data: employeeData });
    throw new Error(`Failed to create employee: ${error?.message}`);
  }
}
```

## 🧪 Test the Direct Browser Method NOW

1. **Go to your admin panel** in the browser
2. **Open Developer Console** (F12)
3. **Paste the direct creation function** from Option 1 above
4. **Press Enter** to run it
5. **Check the console output** for success/failure

This will tell us immediately if the Edge Function approach works, bypassing the API route deployment issues entirely.

## ✅ Expected Results

If the Edge Function works (which it should), you'll see:
```
✅ SUCCESS! Auth user created: uuid-here  
✅ Employee created: uuid-here
🎉 DIRECT CREATE SUCCESS: {user: {id: "..."}, employee: {id: "..."}}
```

If it fails, we'll see the exact error and can fix the Edge Function instead.

## 🎯 Next Steps

1. **Test the direct browser method** to confirm Edge Function works
2. **If successful:** Update AdminService to use Edge Function only (Option 2)  
3. **If Edge Function also fails:** Debug the Edge Function deployment
4. **Once working:** Remove all the broken API route attempts

This approach **bypasses the API route deployment issues** and uses the working Edge Function path that ICRS uses successfully.

---

**🚨 PRIORITY: Test the browser console method NOW to confirm this works**