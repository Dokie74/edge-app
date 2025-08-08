# EDGE Application - Multi-Client Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the EDGE (Employee Development & Growth Engine) application as a multi-tenant SaaS solution. Each client gets their own isolated "sandbox" environment with complete data separation and their own admin user who can manage their team.

## Architecture Overview

**Multi-Tenancy Approach:**
- Each client gets their own Supabase project (complete database isolation)
- Each client has their own deployment URL
- No data crossover between clients
- Each client admin manages only their organization

---

## Part 1: Preparation and Setup

### Prerequisites

Before starting, ensure you have:
- [ ] Supabase account with ability to create new projects
- [ ] Vercel account (for hosting)
- [ ] GitHub repository access
- [ ] Domain names for each client (optional but recommended)
- [ ] Client organization details (company name, admin email, etc.)

---

## Part 2: For Each New Client Deployment

### Step 1: Create Client-Specific Supabase Project

1. **Log into Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Click "New Project"

2. **Configure Project**
   ```
   Project Name: EDGE-[CLIENT-NAME]
   Database Password: [Generate Strong Password]
   Region: [Choose closest to client]
   ```
   
3. **Save Project Details**
   - Project URL: `https://[project-id].supabase.co`
   - Anon Key: `eyJ...`
   - Service Role Key: `eyJ...` (keep secure)

### Step 2: Set Up Database Schema

**Option A: Agent Assistance Available**
> *Note: You can ask Claude Code agent to perform this step by providing the Supabase credentials*

1. **Upload Database Schema**
   - Navigate to SQL Editor in Supabase
   - Copy contents from `EDGE-App-Supabase-Backup.sql`
   - Execute the SQL to create all tables, functions, and policies

**Option B: Manual Setup**

1. **Apply Database Migration**
   ```bash
   # If using Supabase CLI
   supabase link --project-ref [project-id]
   supabase db push
   ```

2. **Verify Schema**
   - Check that all essential tables exist:
     - `employees`
     - `departments` 
     - `review_cycles`
     - `assessments`
     - `development_plans`
     - `feedback`
     - `notifications`

### Step 3: Create Client Admin User

**Important: This must be done for each client**

1. **Create Auth User**
   - Go to Supabase > Authentication > Users
   - Click "Add User"
   - Email: `admin@[client-domain].com`
   - Password: Generate secure password
   - Email Confirm: Skip (manual creation)

2. **Create Employee Record**
   - Go to Table Editor > employees
   - Insert new record:
     ```sql
     INSERT INTO employees (
       id, user_id, name, email, role, job_title, 
       is_active, created_at, updated_at
     ) VALUES (
       gen_random_uuid(),
       '[auth-user-id]',
       '[Client Admin Name]',
       'admin@[client-domain].com',
       'admin',
       'Administrator',
       true,
       now(),
       now()
     );
     ```

### Step 4: Configure Application Environment

1. **Create Client-Specific Environment File**
   ```env
   # .env.production.[client-name]
   REACT_APP_SUPABASE_URL=https://[client-project-id].supabase.co
   REACT_APP_SUPABASE_ANON_KEY=[client-anon-key]
   REACT_APP_ENV=production
   REACT_APP_CLIENT_NAME=[Client Company Name]
   ```

### Step 5: Deploy Client Application

**Option A: Vercel Deployment (Recommended)**

1. **Create New Vercel Project**
   - Import from GitHub repository
   - Create separate deployment for each client

2. **Configure Environment Variables**
   - Add client-specific environment variables
   - Ensure `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are correct

3. **Custom Domain (Optional)**
   - Add custom domain: `edge.[client-domain].com`
   - Configure DNS settings

**Option B: Alternative Hosting**
- Build with: `npm run build:prod`
- Deploy static files to hosting provider
- Ensure environment variables are properly set

---

## Part 3: Client Onboarding Process

### Step 1: Provide Client Admin Credentials

**Deliver to Client:**
```
Application URL: https://edge-[client].vercel.app
Admin Email: admin@[client-domain].com
Admin Password: [Generated Password]

First Login Instructions:
1. Go to the application URL
2. Login with provided credentials
3. Change password immediately
4. Begin adding team members
```

### Step 2: Client Admin Training

**Provide Instructions for:**
- Adding employees to the system
- Creating review cycles
- Managing departments
- Setting up development plans
- Monitoring team performance

---

## Part 4: Data Isolation Verification

### Security Checklist

For each deployment, verify:

- [ ] **Database Isolation**: Each client has separate Supabase project
- [ ] **Row Level Security**: RLS policies prevent cross-tenant access
- [ ] **Authentication**: Each client has separate auth system
- [ ] **Environment Variables**: Correct URLs and keys for each client
- [ ] **Admin Access**: Only client admin can access their data
- [ ] **Employee Data**: No cross-contamination between clients

### Testing Data Isolation

1. **Create Test Users in Multiple Client Systems**
2. **Verify Users Cannot Access Other Client Data**
3. **Test Admin Functions Are Limited to Their Organization**

---

## Part 5: Ongoing Management

### Client Management Spreadsheet

Track each client deployment:

| Client Name | Supabase Project | Deployment URL | Admin Email | Created Date | Status |
|-------------|------------------|----------------|-------------|--------------|---------|
| Company A   | abc123.supabase.co | edge-a.vercel.app | admin@companya.com | 2025-01-01 | Active |
| Company B   | def456.supabase.co | edge-b.vercel.app | admin@companyb.com | 2025-01-02 | Active |

### Maintenance Tasks

**Monthly:**
- [ ] Check all client deployments are running
- [ ] Monitor Supabase usage and costs
- [ ] Review client feedback and feature requests

**Quarterly:**
- [ ] Apply security updates to all deployments
- [ ] Review and update client admin training materials
- [ ] Analyze usage patterns across clients

---

## Part 6: Troubleshooting Common Issues

### Authentication Issues
```bash
# Check Supabase project configuration
# Verify environment variables
# Test admin login flow
```

### Database Connection Problems
```bash
# Verify Supabase project is active
# Check API keys are correct
# Test database connectivity
```

### Deployment Failures
```bash
# Check build logs in Vercel
# Verify environment variables
# Test local build first
```

---

## Part 7: Agent Automation Opportunities

**Tasks That Can Be Automated with Claude Code Agent:**

1. **Database Schema Setup**
   - "Apply the database schema to new Supabase project [project-id]"
   - Agent can execute SQL scripts automatically

2. **Environment Configuration** 
   - "Create environment file for client [name] with Supabase project [id]"
   - Agent can generate proper .env files

3. **Verification Scripts**
   - "Test data isolation for client deployment [url]"
   - Agent can run automated tests

4. **Client Admin Creation**
   - "Create admin user for client [name] in Supabase project [id]"
   - Agent can execute the user creation process

---

## Part 8: Cost Management

### Supabase Pricing Considerations
- Each client project has separate billing
- Monitor database size and API requests
- Consider upgrading clients to paid tiers as they grow

### Vercel Pricing
- Free tier supports multiple deployments
- Monitor bandwidth usage
- Consider Pro plan for custom domains

---

## Part 9: Legal and Compliance

### Data Processing Agreements
- Each client should have separate DPA
- Ensure GDPR compliance per client
- Document data retention policies

### Service Level Agreements
- Define uptime guarantees
- Support response times
- Data backup and recovery procedures

---

## Conclusion

This multi-tenant approach provides complete data isolation while allowing you to scale the EDGE application across multiple clients. Each client operates in their own secure environment with full administrative control over their team data.

**Key Benefits:**
- ✅ Complete data isolation
- ✅ Scalable architecture  
- ✅ Client-specific customization
- ✅ Independent billing and management
- ✅ No cross-contamination risks

**Next Steps:**
1. Choose your first client for deployment
2. Follow this guide step-by-step
3. Document any custom requirements
4. Scale to additional clients as needed

For technical assistance with any of these steps, you can leverage Claude Code agents to automate the deployment process and ensure consistent, error-free client setups.