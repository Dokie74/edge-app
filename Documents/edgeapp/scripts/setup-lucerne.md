# Lucerne International Setup Checklist

## ✅ Step-by-Step Setup Guide

### 1. Supabase Setup (Complete First)

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login with your master account**
3. **Create Organization:**
   - **Method 1:** Go directly to: `https://supabase.com/dashboard/new`
   - **Method 2:** In dashboard, look for **Organization picker** in the top header
   - **Method 3:** If you see `/organizations` page, click "New Organization"
   - Name: `Lucerne International`
   - Description: Use for company/department name
4. **Create Project:**
   - Once in Lucerne organization, click "New Project" or go to: `https://supabase.com/dashboard/new/new-project`
   - Name: `lucerne-edge-app`
   - Generate strong password (SAVE IT!)
   - Choose region closest to clients
5. **Run Database Setup:**
   - Go to **SQL Editor** in your new Lucerne project
   - Open the file `scripts/deploy-lucerne.sql` in VS Code (or your editor)
   - **Copy ALL contents** (Ctrl+A, Ctrl+C)
   - **Paste into SQL Editor** and click **RUN**
   - ✅ This creates all tables, RLS policies, and your admin user
6. **Get Credentials:**
   - Settings → API
   - Copy: Project URL, anon key, service_role key

### 2. Vercel Setup (Do After Supabase)

1. **Go to [vercel.com](https://vercel.com)**
2. **Import Project:**
   - Click "Add New..." → "Project"
   - Import from GitHub (connect if needed)
   - Select this repository
3. **Configure Project:**
   - Project Name: `lucerne-edge-app`
   - Framework: React (auto-detected)
   - Build Command: `npm run build:prod`
4. **Add Environment Variables:**
   ```
   REACT_APP_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   REACT_APP_TENANT_ID=lucerne
   REACT_APP_CLIENT_NAME=Lucerne International
   REACT_APP_CLIENT_DOMAIN=lucerneintl.com
   REACT_APP_ADMIN_EMAIL=dokonoski@lucerneintl.com
   REACT_APP_GOD_MODE_EMAIL=dokonoski@lucerneintl.com
   REACT_APP_GOD_MODE_ENABLED=true
   REACT_APP_MULTI_TENANT_ENABLED=true
   ```
5. **Deploy:** Click "Deploy"

### 3. Test Deployment

1. **Visit:** `https://lucerne-edge-app.vercel.app`
2. **Sign up with:** `dokonoski@lucerneintl.com`
3. **Verify:**
   - ✅ Login works
   - ✅ Admin dashboard appears
   - ✅ Can create/manage employees
   - ✅ Only sees Lucerne data

### 4. Optional: Custom Domain

1. **In Vercel Project → Settings → Domains**
2. **Add:** `app.lucerneintl.com` 
3. **Update Supabase auth settings** with new URL

### 5. Update Supabase Auth (After Domain Setup)

1. **In Supabase → Authentication → Settings**
2. **Site URL:** `https://app.lucerneintl.com` (or vercel URL)
3. **Redirect URLs:** 
   - `https://app.lucerneintl.com/`
   - `http://localhost:3000/` (for testing)

---

## 🚨 If You Get Stuck:

### Database Won't Connect:
- Check environment variables match exactly
- Verify Supabase project is running
- Check database password

### Authentication Fails:
- Verify redirect URLs match exactly
- Check site URL in Supabase
- Ensure HTTPS (not HTTP) for production

### Wrong Data Showing:
- Check tenant_id in database
- Verify RLS policies are enabled
- Test with different user accounts

---

## 📝 What You'll Have:

✅ **Secure, isolated database** for Lucerne
✅ **Professional web app** at custom URL  
✅ **Admin access** for dokonoski@lucerneintl.com
✅ **God mode access** across all future clients
✅ **Multi-tenant foundation** for more clients

---

## 💰 Next Steps:

1. **Test everything thoroughly**
2. **Create client onboarding materials** 
3. **Set up pricing/contracts**
4. **Start marketing to more clients**
5. **Repeat this process** for each new client

Your first client deployment is ready! 🎉