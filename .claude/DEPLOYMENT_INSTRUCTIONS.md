# 🚀 Client Deployment Instructions - EdgeApp

> **For Beginners:** This guide assumes you're new to app deployment. Each step is explained in detail with screenshots references where helpful.

## 📋 Overview

This guide walks you through creating separate, secure environments for each client using Vercel (frontend) and Supabase (backend), starting with **Lucerne International** as your first client.

## 🏗️ Architecture Overview

```
YOU (Master Admin) → Multiple Client Deployments
├── Lucerne International (lucerneintl.com)
│   ├── Frontend: lucerne-edge-app.vercel.app
│   └── Backend: lucerne-edge-supabase
├── Future Client 2
└── Future Client 3
```

---

## 🎯 PART 1: Master Admin Setup (Do This Once)

### Step 1: Create Your "God Mode" Accounts

#### Vercel Master Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with **your personal email** (dokonoski@gmail.com or similar)
3. This will be your master account that can access ALL client deployments

#### Supabase Master Account  
1. Go to [supabase.com](https://supabase.com)
2. Sign up with **the same personal email**
3. This ensures you have admin access across all client projects

---

## 🏢 PART 2: Lucerne International Setup

### Step 2: Create Supabase Organization for Lucerne

#### Create New Organization
1. **Login to Supabase Dashboard** → [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Create Organization using one of these methods:**
   - **Option A:** Go directly to → [supabase.com/dashboard/new](https://supabase.com/dashboard/new)
   - **Option B:** Look for **Organization picker** in the top header and click to switch/create
   - **Option C:** Navigate to `/organizations` page if available and click "New Organization"
3. **Organization Settings:**
   - **Name:** `Lucerne International`
   - **Description:** Use company/department name
   - **Plan:** Start with Free, upgrade as needed

#### Create Lucerne Project
1. **Inside Lucerne Organization** → Click **"New Project"** or go to: [supabase.com/dashboard/new/new-project](https://supabase.com/dashboard/new/new-project)
2. **Project Settings:**
   - **Name:** `lucerne-edge-app`
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Choose closest to your clients
   - **Pricing Plan:** Free to start

#### Set Up Your Access (Optional - You're Owner by default)
1. **Navigate to:** `/dashboard/org/[org-id]/team` (Organization Team Settings)
2. **If needed, invite additional users:**
   - **Email:** `dokonoski@lucerneintl.com` 
   - **Role:** `Owner` or `Administrator`
3. **Accept invitations** (check email if sent)

### Step 3: Configure Lucerne Supabase Database

#### Deploy Database Schema
**Since this is a NEW Supabase project, we use our prepared script:**

1. **In your new Lucerne project** → Go to **SQL Editor**
2. **Copy the entire contents** of `scripts/deploy-lucerne.sql` (from your local files)
3. **Paste and RUN** the script in SQL Editor
   
   This script will:
   - ✅ Create all necessary tables
   - ✅ Set up multi-tenant structure  
   - ✅ Enable Row Level Security
   - ✅ Create your admin user

**Note:** All multi-tenant RLS policies are included in the `deploy-lucerne.sql` script above.

#### Configure Authentication
1. **Go to Authentication → Settings**
2. **Site URL:** `https://lucerne-edge-app.vercel.app`
3. **Redirect URLs:** 
   - `https://lucerne-edge-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for testing)

### Step 4: Create Vercel Project for Lucerne

#### Set Up New Vercel Project
1. **Go to Vercel Dashboard** → [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Click "Add New..." → Project**
3. **Import your EdgeApp repository**
4. **Configure:**
   - **Project Name:** `lucerne-edge-app`
   - **Framework:** Next.js (auto-detected)
   - **Root Directory:** `./` (unless using monorepo)

#### Environment Variables Setup
1. **In Project Settings → Environment Variables**, add:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-lucerne-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[lucerne-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[lucerne-service-role-key]

# Tenant Configuration
NEXT_PUBLIC_TENANT_ID=lucerne
NEXT_PUBLIC_CLIENT_NAME=Lucerne International
NEXT_PUBLIC_CLIENT_DOMAIN=lucerneintl.com

# Admin Configuration
NEXT_PUBLIC_ADMIN_EMAIL=dokonoski@lucerneintl.com
```

#### Deploy
1. **Click "Deploy"**
2. **Wait for deployment** (usually 2-3 minutes)
3. **Your app will be available at:** `https://lucerne-edge-app.vercel.app`

### Step 5: Set Up Custom Domain (Optional but Professional)

#### Configure Custom Domain
1. **In Vercel Project → Settings → Domains**
2. **Add Domain:** `app.lucerneintl.com` (or similar)
3. **Follow DNS setup instructions** (you'll need access to their domain)

#### Update Supabase URLs
1. **Go back to Supabase → Authentication → Settings**
2. **Update Site URL to:** `https://app.lucerneintl.com`
3. **Update Redirect URLs accordingly**

---

## 👤 PART 3: Admin User Setup

### Step 6: Create Your Admin Account in Lucerne System

#### Set Up Database Admin Role
1. **In Supabase SQL Editor**, create your admin user:
   ```sql
   -- Insert your admin user
   INSERT INTO employees (
     id, email, first_name, last_name, role, 
     is_active, tenant_id, created_at
   ) VALUES (
     gen_random_uuid(),
     'dokonoski@lucerneintl.com',
     'David',
     'Okonoski', 
     'admin',
     true,
     'lucerne',
     now()
   );
   ```

#### Create Super Admin Role (Optional)
```sql
-- Add super_admin role for cross-tenant access
UPDATE employees 
SET role = 'super_admin' 
WHERE email = 'dokonoski@lucerneintl.com';

-- Create policy for super admins
CREATE POLICY "Super admins can access all tenant data" ON employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'super_admin'
    )
  );
```

---

## 🔒 PART 4: God Mode Access Setup

### Step 7: Cross-Client Access Configuration

#### Vercel Team Management
1. **Create a Team** for yourself:
   - **Go to Vercel → Account Settings → Teams**
   - **Create Team:** "Your Consulting Business"
   - **Add all client projects to this team**

#### Supabase Organization Access
1. **For each client organization** you create:
   - **Invite your master email** as Owner
   - **This gives you access across all client databases**

#### Environment Variable for God Mode
```env
# Add to all deployments
NEXT_PUBLIC_GOD_MODE_EMAIL=dokonoski@[your-personal-domain]
GOD_MODE_ENABLED=true
```

#### Code Implementation for God Mode
```typescript
// utils/permissions.ts
export const isGodModeUser = (email: string): boolean => {
  return email === process.env.NEXT_PUBLIC_GOD_MODE_EMAIL;
};

export const canAccessAllTenants = (userEmail: string): boolean => {
  return isGodModeUser(userEmail) || 
         getUserRole(userEmail) === 'super_admin';
};
```

---

## 📱 PART 5: Testing Your Setup

### Step 8: Verify Everything Works

#### Test Lucerne Deployment
1. **Go to:** `https://lucerne-edge-app.vercel.app`
2. **Sign up with:** `dokonoski@lucerneintl.com`
3. **Verify you can:**
   - ✅ Log in successfully
   - ✅ See admin dashboard
   - ✅ Create/edit employees
   - ✅ Access all admin features

#### Test Multi-Tenancy
1. **Create a test employee** with different tenant_id
2. **Verify data isolation** - you should only see Lucerne data
3. **Test your god mode access** - you should be able to override tenant restrictions

---

## 🔄 PART 6: Adding Future Clients

### Step 9: Repeat Process for Each New Client

#### For Each New Client:
1. **Create new Supabase Organization**
   - Name: `[Client Company Name]`
   - Invite yourself as Owner

2. **Create new Supabase Project**
   - Copy your schema
   - Set tenant_id to unique value
   - Configure auth settings

3. **Create new Vercel Project**
   - Import same repository
   - Set client-specific environment variables
   - Deploy with unique name

4. **Set up custom domain** (recommended)
   - `app.[clientdomain].com`

---

## 🛡️ PART 7: Security Best Practices

### Step 10: Secure Your Deployments

#### Database Security
- ✅ **Enable RLS on all tables**
- ✅ **Use strong, unique passwords per client**
- ✅ **Regular backups** (Supabase handles this)
- ✅ **Monitor access logs**

#### Application Security
- ✅ **Environment variables are secure**
- ✅ **HTTPS only** (Vercel does this automatically)
- ✅ **Regular dependency updates**
- ✅ **Input validation on all forms**

#### Access Control
- ✅ **Principle of least privilege**
- ✅ **Regular audit of user permissions**
- ✅ **Secure password policies**
- ✅ **MFA where possible**

---

## 💰 PART 8: Pricing Considerations

### Current Costs per Client:

#### Vercel (per project)
- **Free Tier:** $0 (good for testing)
- **Pro Tier:** $20/month (recommended for production)
  - Custom domains
  - Better performance
  - Analytics

#### Supabase (per project)  
- **Free Tier:** $0 (up to 2 projects, 500MB database)
- **Pro Tier:** $25/month (recommended for production)
  - Unlimited projects
  - Better performance
  - Daily backups

#### Your Pricing Model
Consider charging clients:
- **Setup Fee:** $500-1000 per client
- **Monthly Fee:** $100-200/month per client
- **Your Costs:** ~$45/month per client (Vercel Pro + Supabase Pro)
- **Your Profit:** $55-155/month per client

---

## 📞 PART 9: Client Onboarding Process

### Step 11: What to Tell Your Clients

#### Information You Need from Clients:
1. **Company Details:**
   - Official company name
   - Domain name (for custom URLs)
   - Primary admin email address
   - Logo/branding (optional)

2. **Technical Requirements:**
   - Number of employees
   - Preferred URL (app.theircompany.com)
   - Any specific compliance requirements

#### What Clients Get:
- ✅ **Dedicated application instance**
- ✅ **Custom domain** (app.theircompany.com)
- ✅ **Secure, isolated database**
- ✅ **Admin dashboard access**
- ✅ **24/7 uptime** (via Vercel/Supabase)
- ✅ **Regular backups**
- ✅ **Your ongoing support**

---

## 🚨 PART 10: Troubleshooting

### Common Issues:

#### "Can't connect to database"
- ✅ Check environment variables are correct
- ✅ Verify Supabase project is running
- ✅ Check database password

#### "Authentication not working"
- ✅ Verify redirect URLs match exactly
- ✅ Check site URL in Supabase auth settings
- ✅ Ensure HTTPS (not HTTP) for production

#### "Wrong tenant data showing"
- ✅ Check RLS policies are enabled
- ✅ Verify tenant_id is set correctly
- ✅ Test with different user accounts

#### "Deployment failing"
- ✅ Check build logs in Vercel
- ✅ Verify all environment variables are set
- ✅ Check for TypeScript errors

---

## 📋 PART 11: Checklist for Each New Client

### Before Starting:
- [ ] Client contract signed
- [ ] Domain information collected
- [ ] Admin email confirmed
- [ ] Payment setup complete

### Technical Setup:
- [ ] Supabase organization created
- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] RLS policies activated
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Domain configured (if applicable)
- [ ] Admin user created
- [ ] Testing completed

### Client Handoff:
- [ ] Credentials provided securely
- [ ] Training session scheduled
- [ ] Documentation provided
- [ ] Support contact established

---

## 📖 Additional Resources

### Documentation Links:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

### Support Contacts:
- **Your Support:** dokonoski@lucerneintl.com
- **Vercel Support:** Via dashboard
- **Supabase Support:** Via dashboard

---

## 🎉 Congratulations!

You now have a complete system for deploying client-specific instances of your EdgeApp. Each client gets their own secure environment while you maintain god-mode access across all deployments.

**Next Steps:**
1. Set up Lucerne International following this guide
2. Test thoroughly with sample data
3. Create client onboarding materials
4. Prepare pricing and contract templates
5. Start marketing to additional clients!

---

*Last Updated: August 8, 2025*
*Version: 1.0*