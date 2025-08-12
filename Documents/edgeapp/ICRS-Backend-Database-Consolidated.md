# ICRS Backend & Database Code Consolidated Backup

**Project**: ICRS (Inventory Control and Reconciliation System)  
**Created**: August 9, 2025  
**Purpose**: Complete standalone backend/database reference for external AI evaluation

## Table of Contents

1. [Database Schema](#database-schema)
2. [Test Data Scripts](#test-data-scripts)
3. [Backup & Restore Scripts](#backup--restore-scripts)
4. [UAT Setup Scripts](#uat-setup-scripts)
5. [Node.js Utility Scripts](#nodejs-utility-scripts)
6. [PowerShell Automation](#powershell-automation)
7. [RLS Policies & Security](#rls-policies--security)

---

## Database Schema

### Core Tables Creation Script

```sql
-- File: scripts/test-data/00-CREATE-EXACT-TABLES.sql

-- Create employees table first (referenced by other tables)
CREATE TABLE IF NOT EXISTS public.employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    job_title text,
    department text,
    role text CHECK (role IN ('admin', 'manager', 'warehouse_staff', 'viewer')),
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id serial PRIMARY KEY,
    name text NOT NULL,
    ein text,
    address text,
    broker_name text,
    contact_email text
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id serial PRIMARY KEY,
    name text NOT NULL,
    address text,
    contact_person text,
    contact_email text,
    contact_phone text
);

-- Create storage locations table
CREATE TABLE IF NOT EXISTS public.storage_locations (
    id serial PRIMARY KEY,
    location_code text UNIQUE NOT NULL,
    description text,
    location_type text CHECK (location_type IN ('rack', 'shelf', 'bin', 'dock', 'wall')),
    zone text,
    aisle text,
    level text,
    position text,
    capacity_weight numeric(10,2),
    capacity_volume numeric(10,2),
    active boolean DEFAULT true
);

-- Create parts table
CREATE TABLE IF NOT EXISTS public.parts (
    id text PRIMARY KEY,
    description text NOT NULL,
    hts_code text,
    country_of_origin text,
    standard_value numeric(10,2),
    unit_of_measure text,
    manufacturer_id text,
    gross_weight numeric(10,3),
    package_quantity integer,
    package_type text,
    material_price numeric(10,2),
    labor_price numeric(10,2),
    overhead_price numeric(10,2),
    price_source text,
    last_price_update timestamp with time zone,
    material_weight numeric(10,3),
    material text
);

-- Create preadmissions table
CREATE TABLE IF NOT EXISTS public.preadmissions (
    id text PRIMARY KEY,
    customer_id integer REFERENCES public.customers(id),
    manifest_number text,
    conveyance_name text,
    arrival_date date,
    estimated_value numeric(12,2),
    stage text DEFAULT 'Pending Review',
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid REFERENCES public.employees(id)
);

-- Create inventory_lots table
CREATE TABLE IF NOT EXISTS public.inventory_lots (
    id text PRIMARY KEY,
    part_id text REFERENCES public.parts(id),
    customer_id integer REFERENCES public.customers(id),
    quantity numeric(10,2) NOT NULL,
    unit_value numeric(10,2),
    total_value numeric(12,2),
    status text,
    storage_location_id integer REFERENCES public.storage_locations(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id serial PRIMARY KEY,
    lot_id text REFERENCES public.inventory_lots(id),
    type text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit_price numeric(10,2),
    total_value numeric(12,2),
    reference_id text,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid REFERENCES public.employees(id)
);

-- Create preshipments table
CREATE TABLE IF NOT EXISTS public.preshipments (
    id text PRIMARY KEY,
    customer_id integer REFERENCES public.customers(id),
    manifest_number text,
    vessel_name text,
    estimated_ship_date date,
    estimated_value numeric(12,2),
    stage text DEFAULT 'Draft',
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid REFERENCES public.employees(id)
);

-- Create material_indices table for pricing
CREATE TABLE IF NOT EXISTS public.material_indices (
    id serial PRIMARY KEY,
    material text NOT NULL,
    price_date date NOT NULL,
    price_usd_per_mt numeric(10,2) NOT NULL,
    source text DEFAULT 'SHSPI',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Test Data Population

```sql
-- File: scripts/test-data/01-create-users-employees-FIXED.sql

-- Insert employees (linked to Supabase auth users)
INSERT INTO public.employees (id, name, email, job_title, role) VALUES
('b1699256-4487-4a44-9a32-d4a03dda7b6e', 'System Administrator', 'admin@lucerne.com', 'System Administrator', 'admin'),
('c2799356-5587-5b55-a443-e5b04eeb8c7f', 'John Manager', 'manager@lucerne.com', 'Operations Manager', 'manager'),
('d3899456-6687-6c66-b554-f6c05ffc9d8g', 'Jane Staff', 'staff@lucerne.com', 'Warehouse Staff', 'warehouse_staff'),
('e4999556-7787-7d77-c665-g7d06ggd0e9h', 'Bob Viewer', 'viewer@lucerne.com', 'Data Analyst', 'viewer');

-- Insert customers
INSERT INTO public.customers (id, name, ein, address, broker_name, contact_email) VALUES
(1, 'Ford Motor Company', '38-0549190', '1 American Road, Dearborn, MI 48126', 'Expeditors International', 'ftz@ford.com'),
(2, 'General Motors', '38-0572515', '300 Renaissance Center, Detroit, MI 48265', 'C.H. Robinson', 'supply@gm.com'),
(3, 'Stellantis (Chrysler)', '38-0572394', '1000 Chrysler Dr, Auburn Hills, MI 48326', 'Kuehne + Nagel', 'logistics@stellantis.com'),
(4, 'Toyota Motor Manufacturing', '38-3892381', '1001 Plum Street, Georgetown, KY 40324', 'DHL Global Forwarding', 'ftz@toyota.com');

-- Insert suppliers
INSERT INTO public.suppliers (name, address, contact_person, contact_email, contact_phone) VALUES
('ArcelorMittal Dofasco', '1330 Burlington St E, Hamilton, ON L8N 3J5, Canada', 'Sarah Chen', 'sarah.chen@arcelormittal.com', '+1-905-544-3761'),
('Nucor Corporation', '1915 Rexford Road, Charlotte, NC 28211', 'Michael Rodriguez', 'm.rodriguez@nucor.com', '+1-704-366-7000'),
('Steel Dynamics Inc', '7575 West Jefferson Blvd, Fort Wayne, IN 46804', 'Jennifer Park', 'j.park@steeldynamics.com', '+1-260-969-3500'),
('United States Steel', '600 Grant Street, Pittsburgh, PA 15219', 'David Kim', 'd.kim@ussteel.com', '+1-412-433-1121'),
('Cleveland-Cliffs Inc', '200 Public Square, Cleveland, OH 44114', 'Lisa Wang', 'l.wang@clevelandcliffs.com', '+1-216-694-5700'),
('Tenaris', '1 Manhattan West, 395 9th Ave, New York, NY 10001', 'Carlos Silva', 'c.silva@tenaris.com', '+1-713-676-1000');

-- Insert storage locations
INSERT INTO public.storage_locations (location_code, description, location_type, zone, aisle, level, capacity_weight, capacity_volume, active) VALUES
('Z1-A1-L1-P01', 'Zone 1 Aisle A1 Level 1 Position 01', 'rack', 'Zone 1', 'A1', 'Level 1', 5000.00, 100.00, true),
('Z1-A1-L1-P02', 'Zone 1 Aisle A1 Level 1 Position 02', 'rack', 'Zone 1', 'A1', 'Level 1', 5000.00, 100.00, true),
('Z1-A2-L1-P01', 'Zone 1 Aisle A2 Level 1 Position 01', 'rack', 'Zone 1', 'A2', 'Level 1', 7500.00, 150.00, true),
('Z2-B1-L1-P01', 'Zone 2 Aisle B1 Level 1 Position 01', 'shelf', 'Zone 2', 'B1', 'Level 1', 2500.00, 75.00, true),
('DOCK-01', 'Loading Dock 1', 'dock', 'Dock Area', null, 'Ground', 25000.00, 500.00, true),
('DOCK-02', 'Loading Dock 2', 'dock', 'Dock Area', null, 'Ground', 25000.00, 500.00, true);
```

---

## Test Data Scripts

### Parts Data

```sql
-- File: scripts/test-data/06-create-parts.sql

INSERT INTO public.parts (id, description, hts_code, country_of_origin, standard_value, unit_of_measure, manufacturer_id, gross_weight, package_quantity, package_type, material_price, labor_price, overhead_price, price_source, material_weight, material) VALUES
('STL-HR-001', 'Hot Rolled Steel Coil - Grade A36', '7208.10.0000', 'United States', 850.00, 'MT', 'NUCOR-001', 1000.000, 1, 'Coil', 750.00, 50.00, 50.00, 'Market Rate', 1000.000, 'hot_rolled_steel'),
('STL-CR-002', 'Cold Rolled Steel Sheet - Grade 1010', '7209.15.0000', 'Canada', 950.00, 'MT', 'ARCEL-001', 1000.000, 1, 'Sheet', 850.00, 60.00, 40.00, 'Contract Price', 1000.000, 'cold_rolled_steel'),
('STL-GA-003', 'Galvanized Steel Coil - Grade 340', '7210.49.0090', 'United States', 1050.00, 'MT', 'STEEL-001', 1000.000, 1, 'Coil', 900.00, 100.00, 50.00, 'SHSPI Index', 1000.000, 'galvanized_steel'),
('ALU-SHT-004', 'Aluminum Sheet 6061-T6', '7606.12.3096', 'Canada', 2250.00, 'MT', 'ALCOA-001', 1000.000, 50, 'Sheet', 2000.00, 150.00, 100.00, 'LME Price', 1000.000, 'aluminum_alloy'),
('STN-304-005', 'Stainless Steel 304 Coil', '7219.14.0090', 'Japan', 3500.00, 'MT', 'NIPPON-001', 1000.000, 1, 'Coil', 3200.00, 200.00, 100.00, 'Market Rate', 1000.000, 'stainless_steel_304'),
('STN-316-006', 'Stainless Steel 316L Sheet', '7219.24.0090', 'Germany', 4200.00, 'MT', 'THYSSEN-001', 1000.000, 25, 'Sheet', 3800.00, 300.00, 100.00, 'Contract Price', 1000.000, 'stainless_steel_316'),
('COP-TUB-007', 'Copper Tubing Type L', '7411.10.1050', 'Chile', 8500.00, 'MT', 'CODELCO-001', 1000.000, 100, 'Tube', 8000.00, 300.00, 200.00, 'LME Price', 1000.000, 'copper'),
('TIT-BAR-008', 'Titanium Bar Grade 2', '8108.20.3000', 'United States', 35000.00, 'MT', 'TIMET-001', 1000.000, 10, 'Bar', 32000.00, 2000.00, 1000.00, 'Market Rate', 1000.000, 'titanium'),
('STL-TUB-009', 'Carbon Steel Pipe Schedule 40', '7306.30.5090', 'Mexico', 1200.00, 'MT', 'TENARIS-001', 1000.000, 20, 'Pipe', 1000.00, 150.00, 50.00, 'Contract Price', 1000.000, 'carbon_steel'),
('ALU-EXT-010', 'Aluminum Extrusion 6063-T5', '7604.29.5090', 'United States', 2800.00, 'MT', 'NORSK-001', 1000.000, 25, 'Profile', 2500.00, 200.00, 100.00, 'LME Price', 1000.000, 'aluminum_alloy'),
('STL-BAR-011', 'Alloy Steel Bar 4140', '7228.30.8050', 'Canada', 1800.00, 'MT', 'STELCO-001', 1000.000, 50, 'Bar', 1600.00, 150.00, 50.00, 'Market Rate', 1000.000, 'alloy_steel'),
('NIC-PLA-012', 'Nickel Plate 99.9%', '7502.10.0000', 'Russia', 25000.00, 'MT', 'NORNICKEL-001', 1000.000, 5, 'Plate', 23000.00, 1500.00, 500.00, 'LME Price', 1000.000, 'nickel');
```

### Inventory Lots

```sql
-- File: scripts/test-data/08-create-inventory-lots.sql

INSERT INTO public.inventory_lots (id, part_id, customer_id, quantity, unit_value, total_value, status, storage_location_id) VALUES
('LOT-HR-001-2025-001', 'STL-HR-001', 1, 50000.00, 850.00, 42500000.00, 'PF', 1),
('LOT-CR-002-2025-001', 'STL-CR-002', 2, 35000.00, 950.00, 33250000.00, 'NPF', 2),
('LOT-GA-003-2025-001', 'STL-GA-003', 1, 25000.00, 1050.00, 26250000.00, 'PF', 3),
('LOT-AL-004-2025-001', 'ALU-SHT-004', 3, 15000.00, 2250.00, 33750000.00, 'D', 4),
('LOT-SS-005-2025-001', 'STN-304-005', 2, 8000.00, 3500.00, 28000000.00, 'PF', 1),
('LOT-SS-006-2025-001', 'STN-316-006', 4, 5000.00, 4200.00, 21000000.00, 'NPF', 2),
('LOT-CU-007-2025-001', 'COP-TUB-007', 1, 2500.00, 8500.00, 21250000.00, 'PF', 3),
('LOT-TI-008-2025-001', 'TIT-BAR-008', 3, 500.00, 35000.00, 17500000.00, 'D', 4),
('LOT-CS-009-2025-001', 'STL-TUB-009', 2, 20000.00, 1200.00, 24000000.00, 'NPF', 5),
('LOT-AL-010-2025-001', 'ALU-EXT-010', 4, 12000.00, 2800.00, 33600000.00, 'PF', 6),
('LOT-AS-011-2025-001', 'STL-BAR-011', 1, 18000.00, 1800.00, 32400000.00, 'PF', 1),
('LOT-NI-012-2025-001', 'NIC-PLA-012', 2, 800.00, 25000.00, 20000000.00, 'NPF', 2);
```

---

## Backup & Restore Scripts

### PowerShell Backup Script

```powershell
# File: scripts/backup-with-connection-string.ps1

param(
    [string]$OutputPath = "backups\",
    [switch]$IncludeSchema = $true,
    [switch]$IncludeData = $true
)

# Configuration
$SUPABASE_HOST = "db.opgvskfowbodukxrosaz.supabase.co"
$SUPABASE_PORT = "5432"
$SUPABASE_USER = "postgres"
$SUPABASE_DB = "postgres"

# Set password environment variable
$env:PGPASSWORD = "DavidOkonoski2025@"

# Generate timestamp for backup filename
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFileName = "supabase-backup-$timestamp.sql"
$fullBackupPath = Join-Path $OutputPath $backupFileName

# Ensure backup directory exists
if (!(Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

# Build pg_dump command
$pgDumpPath = "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe"
$arguments = @(
    "--host=$SUPABASE_HOST",
    "--port=$SUPABASE_PORT", 
    "--username=$SUPABASE_USER",
    "--dbname=$SUPABASE_DB",
    "--no-password",
    "--verbose",
    "--clean",
    "--no-owner",
    "--no-privileges",
    "--file=`"$fullBackupPath`""
)

if (-not $IncludeData) {
    $arguments += "--schema-only"
}

if (-not $IncludeSchema) {
    $arguments += "--data-only"
}

Write-Host "Starting Supabase backup..." -ForegroundColor Green
Write-Host "Host: $SUPABASE_HOST" -ForegroundColor Yellow
Write-Host "Output: $fullBackupPath" -ForegroundColor Yellow

try {
    $process = Start-Process -FilePath $pgDumpPath -ArgumentList $arguments -Wait -PassThru -NoNewWindow
    
    if ($process.ExitCode -eq 0) {
        Write-Host "Backup completed successfully!" -ForegroundColor Green
        Write-Host "File saved: $fullBackupPath" -ForegroundColor Yellow
        
        # Show file size
        $fileSize = (Get-Item $fullBackupPath).Length / 1MB
        Write-Host "Backup size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
    } else {
        Write-Error "Backup failed with exit code: $($process.ExitCode)"
    }
} catch {
    Write-Error "Error running pg_dump: $($_.Exception.Message)"
} finally {
    # Clean up environment variable
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
```

---

## UAT Setup Scripts

### UAT Orchestrator

```javascript
// File: scripts/uat-setup/00-uat-orchestrator.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://opgvskfowbodukxrosaz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_KEY environment variable is required');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class UATOrchestrator {
    constructor() {
        this.setupLog = [];
        this.errors = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
        
        console.log(logEntry);
        this.setupLog.push(logEntry);
        
        if (type === 'error') {
            this.errors.push(message);
        }
    }

    async createAuthUsers() {
        this.log('Creating UAT authentication users...');
        
        const testUsers = [
            { email: 'admin@lucerne.com', password: 'Admin', role: 'admin' },
            { email: 'manager@lucerne.com', password: 'Manager', role: 'manager' },
            { email: 'staff@lucerne.com', password: 'Staff', role: 'warehouse_staff' },
            { email: 'viewer@lucerne.com', password: 'Viewer', role: 'viewer' }
        ];

        for (const user of testUsers) {
            try {
                const { data, error } = await supabase.auth.admin.createUser({
                    email: user.email,
                    password: user.password,
                    email_confirm: true
                });

                if (error) {
                    if (error.message.includes('already registered')) {
                        this.log(`User ${user.email} already exists, skipping...`, 'warn');
                    } else {
                        throw error;
                    }
                } else {
                    this.log(`Created auth user: ${user.email}`);
                }
            } catch (error) {
                this.log(`Failed to create user ${user.email}: ${error.message}`, 'error');
            }
        }
    }

    async executeDatabaseSetup() {
        this.log('Executing database setup script...');
        
        try {
            // Read and execute the SQL setup script
            const sqlPath = path.join(__dirname, '02-setup-uat-database.sql');
            const sqlContent = fs.readFileSync(sqlPath, 'utf8');
            
            // Split SQL into individual statements
            const statements = sqlContent
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            let successCount = 0;
            
            for (const statement of statements) {
                try {
                    const { error } = await supabase.rpc('exec_sql', { 
                        sql_query: statement 
                    });
                    
                    if (error) {
                        throw error;
                    }
                    successCount++;
                } catch (error) {
                    this.log(`SQL statement failed: ${statement.substring(0, 100)}... Error: ${error.message}`, 'error');
                }
            }
            
            this.log(`Executed ${successCount}/${statements.length} SQL statements successfully`);
        } catch (error) {
            this.log(`Database setup failed: ${error.message}`, 'error');
        }
    }

    async verifySetup() {
        this.log('Verifying UAT setup...');
        
        try {
            // Check if tables exist
            const { data: tables, error } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public');

            if (error) {
                throw error;
            }

            const requiredTables = [
                'employees', 'customers', 'suppliers', 'parts', 
                'inventory_lots', 'transactions', 'preadmissions', 
                'preshipments', 'storage_locations'
            ];

            const existingTables = tables.map(t => t.table_name);
            const missingTables = requiredTables.filter(t => !existingTables.includes(t));

            if (missingTables.length > 0) {
                this.log(`Missing tables: ${missingTables.join(', ')}`, 'error');
            } else {
                this.log('All required tables exist');
            }

            // Check if test data exists
            const { data: employeeCount, error: empError } = await supabase
                .from('employees')
                .select('count', { count: 'exact' });

            if (!empError && employeeCount) {
                this.log(`Found ${employeeCount.length} employee records`);
            }

        } catch (error) {
            this.log(`Verification failed: ${error.message}`, 'error');
        }
    }

    async generateReport() {
        const reportContent = `
# UAT Setup Report

**Generated**: ${new Date().toISOString()}
**Status**: ${this.errors.length === 0 ? 'SUCCESS' : 'FAILED'}
**Errors**: ${this.errors.length}

## Setup Log

${this.setupLog.join('\n')}

## Errors

${this.errors.length > 0 ? this.errors.map(e => `- ${e}`).join('\n') : 'No errors'}

## Test Credentials

- **Admin**: admin@lucerne.com / Admin
- **Manager**: manager@lucerne.com / Manager  
- **Staff**: staff@lucerne.com / Staff
- **Viewer**: viewer@lucerne.com / Viewer

## Next Steps

${this.errors.length === 0 
    ? '✅ UAT environment is ready for testing'
    : '❌ Fix the errors above and re-run setup'
}
        `;

        fs.writeFileSync(path.join(__dirname, 'UAT-SETUP-REPORT.md'), reportContent);
        this.log('Generated UAT setup report');
    }

    async run() {
        this.log('Starting UAT environment setup...');
        
        await this.createAuthUsers();
        await this.executeDatabaseSetup();
        await this.verifySetup();
        await this.generateReport();
        
        if (this.errors.length === 0) {
            this.log('UAT setup completed successfully!', 'success');
        } else {
            this.log(`UAT setup completed with ${this.errors.length} errors`, 'error');
            process.exit(1);
        }
    }
}

// Run the orchestrator
if (require.main === module) {
    const orchestrator = new UATOrchestrator();
    orchestrator.run().catch(console.error);
}

module.exports = UATOrchestrator;
```

---

## RLS Policies & Security

### Row Level Security Policies

```sql
-- File: scripts/fix-rls-policies.sql

-- Enable RLS on all tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preadmissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preshipments ENABLE ROW LEVEL SECURITY;

-- Employees table policies
DROP POLICY IF EXISTS "employees_select_policy" ON public.employees;
CREATE POLICY "employees_select_policy" ON public.employees
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "employees_insert_policy" ON public.employees;
CREATE POLICY "employees_insert_policy" ON public.employees
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.employees 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "employees_update_policy" ON public.employees;
CREATE POLICY "employees_update_policy" ON public.employees
    FOR UPDATE USING (
        id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.employees 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Customers table policies  
DROP POLICY IF EXISTS "customers_select_policy" ON public.customers;
CREATE POLICY "customers_select_policy" ON public.customers
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "customers_modify_policy" ON public.customers;
CREATE POLICY "customers_modify_policy" ON public.customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.employees 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Parts table policies
DROP POLICY IF EXISTS "parts_select_policy" ON public.parts;
CREATE POLICY "parts_select_policy" ON public.parts
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "parts_modify_policy" ON public.parts;
CREATE POLICY "parts_modify_policy" ON public.parts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.employees 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Inventory lots policies
DROP POLICY IF EXISTS "inventory_lots_select_policy" ON public.inventory_lots;
CREATE POLICY "inventory_lots_select_policy" ON public.inventory_lots
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "inventory_lots_modify_policy" ON public.inventory_lots;
CREATE POLICY "inventory_lots_modify_policy" ON public.inventory_lots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.employees 
            WHERE id = auth.uid() AND role IN ('admin', 'manager', 'warehouse_staff')
        )
    );

-- Transactions policies
DROP POLICY IF EXISTS "transactions_select_policy" ON public.transactions;
CREATE POLICY "transactions_select_policy" ON public.transactions
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "transactions_insert_policy" ON public.transactions;
CREATE POLICY "transactions_insert_policy" ON public.transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.employees 
            WHERE id = auth.uid() AND role IN ('admin', 'manager', 'warehouse_staff')
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

---

## Node.js Utility Scripts

### User Management Script

```javascript
// File: scripts/update-user-passwords.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://opgvskfowbodukxrosaz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
    console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
    console.log('Please set it with: set SUPABASE_SERVICE_KEY=your_service_key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateUserPasswords() {
    console.log('🔧 Starting user password updates...\n');

    const users = [
        { email: 'admin@lucerne.com', newPassword: 'Admin' },
        { email: 'manager@lucerne.com', newPassword: 'Manager' },  
        { email: 'staff@lucerne.com', newPassword: 'Staff' },
        { email: 'viewer@lucerne.com', newPassword: 'Viewer' }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const userData of users) {
        try {
            console.log(`🔄 Updating password for ${userData.email}...`);

            // Update user password using admin API
            const { data, error } = await supabase.auth.admin.updateUserById(
                userData.email, // Using email as ID for now
                { 
                    password: userData.newPassword,
                    email_confirm: true 
                }
            );

            if (error) {
                throw error;
            }

            console.log(`✅ Successfully updated password for ${userData.email}`);
            successCount++;

        } catch (error) {
            console.error(`❌ Failed to update ${userData.email}: ${error.message}`);
            errorCount++;
        }
    }

    console.log(`\n📊 Update Summary:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📝 Total: ${users.length}`);

    if (errorCount === 0) {
        console.log('\n🎉 All user passwords updated successfully!');
        console.log('\n🔑 Updated Credentials:');
        users.forEach(user => {
            console.log(`   ${user.email} / ${user.newPassword}`);
        });
    } else {
        console.log('\n⚠️  Some updates failed. Please check the errors above.');
    }
}

// Run the update
updateUserPasswords().catch(error => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
});
```

---

This consolidated backup contains all the essential backend/database infrastructure needed to recreate the ICRS system, including complete schema definitions, test data, security policies, and automation scripts.