# EDGE Hardening Patch Plan

**Audience:** Claude Code in VS Terminal\
**Outcome:** Apply production‑safety fixes and ship PRs in small, verifiable steps.

---

## Repo Layout Assumptions

- Database SQL lives under `db/patches/*.sql` and is applied via Supabase SQL editor or migration runner.
- Edge Functions live under `supabase/functions/*`.
- Frontend lives under `frontend/src/*`.
- Backup scripts live under `ops/backup/*`.

Adjust paths if your repo differs.

---

## Patch Set Overview (create these files)

1. `db/patches/001_unique_user_id.sql` – enforce 1:1 employee↔auth mapping
2. `db/patches/002_admin_with_check_policies.sql` – fix RLS write coverage for admins
3. `db/patches/003_indexes_rls_hotpaths.sql` – indexes that match policies/joins
4. `db/patches/004_set_based_review_seeding.sql` – scalable, idempotent seeding
5. `supabase/functions/admin-op/index.ts` – auth fix + prod CORS + structured logs
6. `frontend/src/services/role.ts` – align `get_my_role` RPC contract
7. `frontend/src/realtime/kudos.ts` – standardize realtime channel
8. `ops/backup/backup_policy.md` – encryption + restore drill

Each patch is atomic and includes a simple verification step.

---

## 1) Enforce 1:1 Employee↔Auth Mapping

**File:** `db/patches/001_unique_user_id.sql`

```sql
-- Enforce 1:1 mapping between auth.users.id and employees.user_id
-- Safe to run multiple times
CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_user_id
  ON public.employees(user_id);
```

**Verify:** Attempt inserting a second `employees` row with the same `user_id` → should fail with unique violation.

---

## 2) RLS Write Coverage for Admins

**File:** `db/patches/002_admin_with_check_policies.sql`

```sql
-- Admin read policy (idempotent sample; adjust if it already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='employees' AND policyname='admin_read_employees'
  ) THEN
    CREATE POLICY admin_read_employees ON public.employees FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.employees me
        WHERE me.user_id = auth.uid() AND me.role = 'admin'
      )
    );
  END IF;
END $$;

-- Admin INSERT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='employees' AND policyname='admin_insert_employees'
  ) THEN
    CREATE POLICY admin_insert_employees ON public.employees FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.employees me
        WHERE me.user_id = auth.uid() AND me.role = 'admin'
      )
    );
  END IF;
END $$;

-- Admin UPDATE (USING + WITH CHECK)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='employees' AND policyname='admin_update_employees'
  ) THEN
    CREATE POLICY admin_update_employees ON public.employees FOR UPDATE
    USING (
      EXISTS (
        SELECT 1
        FROM public.employees me
        WHERE me.user_id = auth.uid() AND me.role = 'admin'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.employees me
        WHERE me.user_id = auth.uid() AND me.role = 'admin'
      )
    );
  END IF;
END $$;

-- Repeat/write equivalents for other writeable tables as needed
-- (assessments, kudos, goals, notes, etc.) using the same pattern.
```

**Verify:** As an admin, insert/update in `employees` succeeds; as a non‑admin, the same ops are denied.

---

## 3) Indexes for RLS Hot Paths

**File:** `db/patches/003_indexes_rls_hotpaths.sql`

```sql
-- Manager lookups limited to active employees
CREATE INDEX IF NOT EXISTS ix_employees_manager_active
  ON public.employees(manager_id)
  WHERE is_active;

-- Join common path for assessment retrieval
CREATE INDEX IF NOT EXISTS ix_assessments_employee_cycle
  ON public.assessments(employee_id, review_cycle_id);
```

**Verify:** `EXPLAIN ANALYZE` your typical role‑filtered queries; expect index usage and lower latency.

---

## 4) Set‑Based Review Seeding (Idempotent)

**File:** `db/patches/004_set_based_review_seeding.sql`

```sql
-- $1: review_cycle_id provided by caller (e.g., via a wrapper function)
-- Seed self assessments
INSERT INTO public.assessments (employee_id, review_cycle_id, type, status)
SELECT e.id, $1, 'self', 'draft'
FROM public.employees e
WHERE e.is_active
ON CONFLICT (employee_id, review_cycle_id, type) DO NOTHING;

-- Seed manager assessments (only when a manager exists)
INSERT INTO public.assessments (employee_id, review_cycle_id, type, status)
SELECT e.id, $1, 'manager', 'draft'
FROM public.employees e
WHERE e.is_active AND e.manager_id IS NOT NULL
ON CONFLICT (employee_id, review_cycle_id, type) DO NOTHING;
```

**Verify:** Run twice with same `$1`; row counts don’t duplicate.

---

## 5) Edge Function Auth Fix + CORS + Logs

**File:** `supabase/functions/admin-op/index.ts`

```ts
// Minimal example; adapt to your function’s purpose
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anonKey = process.env.SUPABASE_ANON_KEY!;

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NODE_ENV === "production" ? "https://yourapp.com" : "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export async function POST(req: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const supabaseUser = createClient(supabaseUrl, anonKey);

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !user) {
      console.error(JSON.stringify({ level: "warn", requestId, msg: "unauthorized" }));
      return new Response(JSON.stringify({ error: "unauthorized", requestId }), { status: 401, headers: corsHeaders });
    }

    // TODO: your privileged logic using supabaseAdmin goes here

    console.log(JSON.stringify({ level: "info", requestId, msg: "admin-op:success" }));
    return new Response(JSON.stringify({ ok: true, requestId }), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error(JSON.stringify({ level: "error", requestId, err: String(err) }));
    return new Response(JSON.stringify({ error: "internal_error", requestId }), { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response("", { headers: corsHeaders });
}
```

**Verify:**

- Call without `Authorization` → `401` with `requestId`.
- Call with valid JWT → `200` and structured logs in function output.
- In prod, `Access-Control-Allow-Origin` equals your app domain.

---

## 6) Align RPC Contract (`get_my_role`)

**File:** `frontend/src/services/role.ts`

```ts
import { supabase } from "../supabaseClient";

export async function getMyRole(): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_my_role"); // no params
  if (error) {
    console.error("get_my_role failed", error);
    return null;
  }
  return data ?? null;
}
```

**Verify:** Authenticated user gets a role; unauthenticated returns null and logs error.

---

## 7) Standardize Realtime Channel

**File:** `frontend/src/realtime/kudos.ts`

```ts
import { supabase } from "../supabaseClient";

let channel: ReturnType<typeof supabase.channel> | null = null;

export function subscribeKudos(onChange: () => void) {
  if (channel) return channel; // idempotent
  channel = supabase
    .channel("public:kudos")
    .on("postgres_changes", { event: "*", schema: "public", table: "kudos" }, onChange)
    .subscribe();
  return channel;
}

export function unsubscribeKudos() {
  if (!channel) return;
  supabase.removeChannel(channel);
  channel = null;
}
```

**Verify:** Create/update/delete a `kudos` row; the callback fires exactly once per change.

---

## 8) Backup Policy: Encryption + Restore Drill

**File:** `ops/backup/backup_policy.md`

````md
# Backup Policy (EDGE)

## Objectives
- Encrypt all backup artifacts at rest
- Maintain an immutable copy (Object Lock) for at least 30 days
- Perform a monthly restore drill into a scratch environment

## Tooling
- Encryption: `age` (or GPG)
- Storage: S3 with Object Lock (governance mode)

## Process
1. **Create artifacts** (DB dumps, migrations, app tarballs)
2. **Encrypt** with `age`:
   ```bash
   age -r $PUBLIC_KEY -o backups/db_$(date +%F).sql.age backups/db.sql
````

3. **Upload immutable copy** (example):
   ```bash
   aws s3 cp backups/db_$(date +%F).sql.age s3://org-edge-backups/ \
     --metadata object-lock-mode=GOVERNANCE,object-lock-retain-until-date=$(date -d "+30 days" --iso-8601=seconds)
   ```
4. **Restore drill (monthly)**
   - Provision scratch project
   - Decrypt & restore
   - Run smoke tests: login → CRUD → realtime event

## RPO/RTO

- RPO: 24h (daily DB dumps)
- RTO: 4h (automated restore runbook)

```
**Verify:** Store an encrypted dump, confirm Object Lock retention, and perform one restore drill; document timestamps and outcomes.

---

## Suggested PR Sequence
1. PR‑1: `001_unique_user_id.sql` + tests
2. PR‑2: `002_admin_with_check_policies.sql` + tests
3. PR‑3: `003_indexes_rls_hotpaths.sql` + query plan screenshots
4. PR‑4: `004_set_based_review_seeding.sql` + idempotency test
5. PR‑5: Edge function (`admin-op/index.ts`) + OPTIONS handler + logs
6. PR‑6: Frontend RPC contract (`get_my_role`) alignment
7. PR‑7: Realtime channel standardization (`public:kudos`)
8. PR‑8: Backup policy doc + first restore drill record

Each PR is independently mergeable and safe to deploy.

---

## Post‑Merge Checklist
- [ ] Run end‑to‑end permission tests (admin vs non‑admin)
- [ ] Confirm realtime events across environments
- [ ] Capture baseline p95 latencies for key queries
- [ ] Schedule monthly restore drill in calendar

---

**Done.** Proceed PR‑by‑PR; ping me when you want the DB patch runner commands tailored to your environment.

```
