# Pulse Questions Management - Deployment Checklist

## 🚀 Step-by-Step Deployment

### **1. First Time Setup**
Run these SQL files in your Supabase SQL Editor **in this exact order**:

```sql
-- Step 1: Create the core tables and functions
pulse_questions_management.sql

-- Step 2: Fix the ambiguous column reference error
fix_question_performance_function.sql

-- Step 3: (Optional) Verify everything works
check_pulse_questions_status.sql
```

### **2. Verification Steps**

After running the SQL, check:

**✅ Admin Page:**
- Go to Admin page (not dashboard)
- Scroll to bottom - should see "Pulse Questions Management" section
- Should see list of 8 default questions
- "Add Question" button should work
- Statistics tab should show response data

**✅ Question Performance KPIs:**
- Admin Dashboard: "Company Question Performance" widget should load
- Manager Dashboard: "Top Team Question" and "Team Area for Improvement" cards should show

**✅ Employee Dashboard:**
- "Org Health Pulse" should stop saying "Loading next question"
- Should show actual questions from database

### **3. Common Issues & Fixes**

| Issue | Error Message | Solution |
|-------|---------------|----------|
| Admin shows error | "make sure the pulse_questions table exists" | Run `pulse_questions_management.sql` |
| KPI shows error | "column reference avg_response is ambiguous" | Run `fix_question_performance_function.sql` |
| No questions appear | "Setting up questions..." | Check console for errors, verify SQL ran successfully |

### **4. Features Now Available**

**For Admins:**
- ✅ Add/delete questions in Admin Dashboard
- ✅ View detailed statistics per question
- ✅ See company-wide top/bottom 2 questions
- ✅ Response distribution charts

**For Managers:**
- ✅ Team-specific top performing question
- ✅ Team area for improvement
- ✅ Team satisfaction insights

**For Employees:**
- ✅ Dynamic questions from database
- ✅ Same popup experience with new questions

### **5. Testing the Features**

1. **Admin Functions:**
   - Go to Admin page → Scroll to bottom → Pulse Questions Management
   - Try adding a new question
   - Switch to Statistics tab to view data

2. **Dashboard KPIs:**
   - Admin Dashboard: Look for "Company Question Performance"
   - Manager Dashboard: Look for question performance cards

3. **Employee Experience:**
   - Employee Dashboard: Org Health Pulse widget should work
   - Questions should appear as popups every 10-52 minutes

### **6. Data Migration**
If you had existing pulse responses, run:
```sql
migrate_existing_responses.sql
```

## 🎯 Success Criteria

✅ No console errors
✅ Admin can add/delete questions
✅ KPI widgets show top/bottom questions
✅ Employee questions come from database
✅ All responses save to database with department tracking

## 🔧 Troubleshooting

If something doesn't work:
1. Check browser console for specific error messages
2. Verify all SQL files ran without errors in Supabase
3. Check that RLS policies allow your user role to access tables
4. Use the "Retry" buttons in error messages to reload

The system now has comprehensive error messages that will tell you exactly what's wrong and how to fix it!