# EDGE App Cypress Test Data Implementation Guide

## 🎯 Overview
This guide provides step-by-step instructions to create comprehensive test data for Cypress E2E testing of the EDGE application.

## 📋 Prerequisites
- Access to Supabase Dashboard
- Database connection with appropriate permissions
- Understanding of Supabase Auth system

## 🔄 Implementation Steps

### Step 1: Create Database Test Data
Run the main test data creation script:

```sql
-- Execute in Supabase SQL Editor
\i create-cypress-test-data.sql
```

**What this creates:**
- 8 test employees (1 admin, 3 managers, 5 employees)
- 3 review cycles (active, upcoming, closed)
- 5 assessments in various states
- 5 development plans in different statuses
- 10+ notifications for dashboard testing
- Proper organizational hierarchy and relationships

### Step 2: Create Supabase Auth Users

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" for each test user:

**Test Users to Create:**
- **Email:** `employee1@lucerne.com` | **Password:** `Employee1`
- **Email:** `manager1@lucerne.com` | **Password:** `Manager1`  
- **Email:** `cypress-admin@lucerne.com` | **Password:** `CypressAdmin123!`

**Option B: Using SQL (Development Only)**
```sql
-- Only for development environments
\i create-cypress-auth-users.sql
```

### Step 3: Link Auth Users to Employee Records
```sql
-- Run after creating auth users
\i update-cypress-user-links.sql
```

### Step 4: Verify Implementation
```sql
-- Check data integrity
SELECT * FROM cypress_test_data_summary ORDER BY table_name;

-- Verify user authentication linkage
SELECT 
    e.name, e.email, e.role, 
    CASE WHEN e.user_id IS NOT NULL THEN '✅ LINKED' ELSE '❌ NOT LINKED' END as status
FROM public.employees e
WHERE e.email IN ('employee1@lucerne.com', 'manager1@lucerne.com', 'cypress-admin@lucerne.com')
ORDER BY e.role DESC;
```

## 👥 Test User Specifications

### Authentication Credentials
| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| `employee1@lucerne.com` | `Employee1` | Employee | Basic employee workflow testing |
| `manager1@lucerne.com` | `Manager1` | Manager | Manager dashboard and team view testing |
| `cypress-admin@lucerne.com` | `CypressAdmin123!` | Admin | Administrative functions and system-wide views |

### Employee Hierarchy
```
Cypress Admin User (Admin)
├── Test Manager One (Manager) → Engineering Dept
│   ├── Test Employee One (Employee1) → Engineering
│   └── Test Employee Four → Engineering
├── Test Manager Two (Manager) → Quality Dept  
│   ├── Test Employee Two → Quality
│   └── Test Employee Five → Quality
└── Test Manager Three (Manager) → Production Dept
    └── Test Employee Three → Production
```

## 📊 Test Data Specifications

### Review Cycles
- **Active Cycle:** Currently running (2025-07-01 to 2025-09-30)
- **Upcoming Cycle:** Future cycle (2025-10-01 to 2025-12-31)
- **Closed Cycle:** Completed cycle (2025-01-01 to 2025-03-31)

### Assessment States
- **Not Started:** Employee1 assessment
- **In Progress:** Employee2 assessment (with partial content)
- **Submitted:** Employee3 assessment
- **Manager Review:** Employee4 assessment
- **Completed:** Employee5 assessment (with manager feedback)

### Development Plan States
- **Draft:** Employee1 plan
- **Pending Approval:** Employee2 plan
- **Approved:** Employee3 plan
- **In Progress:** Employee4 plan
- **Completed:** Employee5 plan

### Notification Types
- Assessment reminders (high priority)
- Development plan updates (medium priority)
- System alerts (low priority)
- Training notifications
- Feedback requests

## 🧪 Testing Scenarios Enabled

### Employee Dashboard Testing
- ✅ Login as `employee1@lucerne.com`
- ✅ View personal assessments in various states
- ✅ Access development plans
- ✅ Check notifications and alerts
- ✅ Update assessment content

### Manager Dashboard Testing
- ✅ Login as `manager1@lucerne.com`
- ✅ View team assessments summary
- ✅ Review submitted assessments
- ✅ Approve/reject development plans
- ✅ Monitor team performance metrics

### Admin Dashboard Testing
- ✅ Login as `cypress-admin@lucerne.com`
- ✅ View system-wide statistics
- ✅ Manage review cycles
- ✅ Access pending approvals
- ✅ Monitor user activity

## 🔍 Verification Commands

### Check Data Creation
```sql
-- Verify all tables have test data
SELECT table_name, record_count FROM cypress_test_data_summary;

-- Check employee hierarchy
SELECT 
    e.name, 
    e.email, 
    e.role,
    m.name as manager_name,
    d.name as department
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id
LEFT JOIN employee_departments ed ON e.id = ed.employee_id AND ed.is_primary = true
LEFT JOIN departments d ON ed.department_id = d.id
WHERE e.email LIKE '%@lucerne.com'
ORDER BY e.role DESC, e.name;
```

### Test Authentication
```sql
-- Verify auth user linkage
SELECT 
    u.email,
    e.name,
    e.role,
    CASE WHEN e.user_id = u.id THEN '✅ LINKED' ELSE '❌ BROKEN' END as link_status
FROM auth.users u
JOIN employees e ON u.id = e.user_id
WHERE u.email IN ('employee1@lucerne.com', 'manager1@lucerne.com', 'cypress-admin@lucerne.com');
```

## 🧹 Cleanup (If Needed)

### Remove All Test Data
```sql
-- Delete test data (CAUTION: This removes all test records)
DELETE FROM notifications WHERE recipient_id IN (
    SELECT id FROM employees WHERE email LIKE '%@lucerne.com' 
    AND (email LIKE 'cypress-%' OR email LIKE 'manager%' OR email LIKE 'employee%')
);

DELETE FROM development_plans WHERE employee_id IN (
    SELECT id FROM employees WHERE email LIKE '%@lucerne.com'
    AND (email LIKE 'cypress-%' OR email LIKE 'manager%' OR email LIKE 'employee%')
);

DELETE FROM assessments WHERE employee_id IN (
    SELECT id FROM employees WHERE email LIKE '%@lucerne.com'
    AND (email LIKE 'cypress-%' OR email LIKE 'manager%' OR email LIKE 'employee%')
);

DELETE FROM employee_departments WHERE employee_id IN (
    SELECT id FROM employees WHERE email LIKE '%@lucerne.com'
    AND (email LIKE 'cypress-%' OR email LIKE 'manager%' OR email LIKE 'employee%')
);

DELETE FROM employees WHERE email LIKE '%@lucerne.com' 
    AND (email LIKE 'cypress-%' OR email LIKE 'manager%' OR email LIKE 'employee%');

DELETE FROM review_cycles WHERE name LIKE 'Cypress%';

-- Remove auth users (from Dashboard or API)
```

## 🚀 Success Criteria

After successful implementation, you should be able to:

1. **Authentication Test:** Log in with all three test user accounts
2. **Role-Based Access:** Verify each user sees appropriate dashboard content
3. **Workflow Testing:** Navigate through assessment and development plan workflows
4. **Data Relationships:** Confirm manager-employee relationships work correctly
5. **Notification System:** Verify notifications display properly for each user type

## 🛠️ Troubleshooting

### Common Issues

**Issue:** Users can't log in
**Solution:** Check that auth users were created and passwords are correct

**Issue:** Users see empty dashboards  
**Solution:** Verify user_id linkage between auth.users and employees table

**Issue:** Manager can't see team members
**Solution:** Check manager_id relationships in employees table

**Issue:** Assessments not showing
**Solution:** Confirm review_cycle_id references are valid

### Support Queries
```sql
-- Check auth users exist
SELECT email, id, created_at FROM auth.users WHERE email LIKE '%lucerne.com';

-- Check employee linkages
SELECT email, user_id, role FROM employees WHERE user_id IS NOT NULL;

-- Validate relationships
SELECT COUNT(*) as assessment_count FROM assessments WHERE employee_id IN (
    SELECT id FROM employees WHERE email LIKE '%@lucerne.com'
);
```

---

## 📞 Support

If you encounter issues during implementation, check:
1. Database permissions for creating records
2. Supabase Auth configuration
3. Row Level Security policies
4. Foreign key constraints

The test data is designed to be comprehensive yet isolated, ensuring it doesn't interfere with production data while providing complete E2E testing coverage.