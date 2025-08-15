# EDGE Peer Review – Findings & Step‑by‑Step Recommendations

Audience: **Claude Code in VS Terminal**

Goal: Make the app **production‑safe** and **maintainable** with clear, atomic tasks Claude can execute and verify.

---

## Executive Summary

Your architecture is sound: clean schema, RLS‑first security, pragmatic React structure, and thoughtful backups. The remaining gaps are fixable with a short, well‑sequenced hardening sprint. Focus areas:

1. **Auth & Edge functions** correctness and CORS scope
2. **RLS write coverage** and employee↔auth uniqueness guarantees
3. **RPC contract alignment** between FE/BE
4. **Realtime convention standardization**
5. **Set‑based SQL for scale** (review seeding) + indexes that match policies
6. **Backup hardening** (encryption, restore drills)
7. **Observability** (structured logs, correlation IDs)

---

## Strengths (keep doing these)

- UUIDs, unique constraints on business keys, timestamps
- RLS‑first design and role derivation in SQL
- Edge functions used only for privileged ops
- Frontend: Context + reducer, service layer, role‑aware UI
- Backups: code + DB + migrations with restore instructions

---

## Critical Issues (blockers)

1. **Edge function uses undefined user client + permissive CORS**
2. **Admin RLS lacks ****\`\`**** on write paths** (insert/update can be blocked unpredictably)
3. \`\`\*\* not UNIQUE\*\* (ambiguity breaks RLS logic and joins)
4. **RPC contract mismatch** (`get_my_role` takes no params in SQL, but FE passes one)
5. **Realtime channel naming inconsistent** (ghost subscriptions)

---

## High‑Value Improvements (next)

- Replace row loops with **set‑based** `INSERT … SELECT` + `ON CONFLICT`
- Add indexes matching common RLS predicates and joins
- Add **structured logs**, correlation IDs, and error reporting
- Encrypt backups, add immutable copies, and run a monthly restore drill

---

## Baby‑Steps Roadmap (atomic, testable tasks)

Each step has: **Action → Code/Command → Test → Definition of Done**.

### 1) Edge Function Auth & CORS

**Action:** Define a user client for token introspection and restrict CORS in prod.

**Code:** (e.g., `supabase/functions/admin-op/index.ts`)

```ts
// Create clients
const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!);
const supabaseUser  = createClient(supabaseUrl!, anonKey!);

// Extract bearer token
const authHeader = req.headers.get('Authorization') || '';
const token = authHeader.replace('Bearer ', '');

// Get user
const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
if (userError || !user) return json({ error: 'unauthorized' }, { status: 401, headers: corsHeaders });

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://yourapp.com' : '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
```

**Test:** Call function with/without `Authorization: Bearer <jwt>`; verify 401 when missing; 200 on valid tokens.

**DoD:** No reference errors; prod CORS limited to app origin; unauthorized requests denied.

---

### 2) Enforce 1:1 Employee↔Auth Mapping

**Action:** Add unique index on `employees.user_id`.

**SQL:**

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_user_id ON public.employees(user_id);
```

**Test:** Attempt to insert two employees with same `user_id` → second insert fails.

**DoD:** Unique constraint exists; RLS functions relying on `auth.uid()` map to a single employee.

---

### 3) RLS Write Coverage for Admins

**Action:** Add mirrored `WITH CHECK` policies for write operations.

**SQL pattern (example for ****\`\`****):**

```sql
-- Read policy (already present in most tables)
CREATE POLICY admin_read_employees
ON public.employees FOR SELECT
USING (exists(
  select 1 from public.employees me where me.user_id = auth.uid() and me.role = 'admin'
));

-- Write policies
CREATE POLICY admin_insert_employees
ON public.employees FOR INSERT
WITH CHECK (exists(
  select 1 from public.employees me where me.user_id = auth.uid() and me.role = 'admin'
));

CREATE POLICY admin_update_employees
ON public.employees FOR UPDATE
USING (exists(
  select 1 from public.employees me where me.user_id = auth.uid() and me.role = 'admin'
))
WITH CHECK (exists(
  select 1 from public.employees me where me.user_id = auth.uid() and me.role = 'admin'
));
```

**Test:** As admin, perform insert/update; as non‑admin, verify denial.

**DoD:** Admins can write reliably; non‑admins cannot escalate privileges.

---

### 4) Align RPC Contract: `get_my_role`

**Action:** Frontend stops passing `user_id` to RPC that derives from `auth.uid()`.

**Frontend Code:**

```ts
// before: supabase.rpc('get_my_role', { user_id })
const { data, error } = await supabase.rpc('get_my_role');
```

**Test:** Authenticated user receives a valid role string; unauthenticated receives error/null.

**DoD:** No parameter mismatch; single source of truth is the DB session.

---

### 5) Realtime Convention Standardization

**Action:** Use Supabase table channel naming consistently, remove stray `pg_notify` patterns unless actively consumed.

**Frontend Code:**

```ts
const channel = supabase
  .channel('public:kudos')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'kudos' }, () => refreshKudos())
  .subscribe();
```

**Test:** Insert/update/delete `kudos`; client receives one event per change.

**DoD:** Single convention in codebase; no dead subscriptions.

---

### 6) Set‑Based Review Seeding (Scale‑Ready)

**Action:** Replace plpgsql loops with `INSERT … SELECT` + `ON CONFLICT`.

**SQL:**

```sql
-- Seed self assessments
INSERT INTO assessments (employee_id, review_cycle_id, type, status)
SELECT e.id, $1, 'self', 'draft'
FROM employees e
WHERE e.is_active
ON CONFLICT (employee_id, review_cycle_id, type) DO NOTHING;

-- Seed manager assessments
INSERT INTO assessments (employee_id, review_cycle_id, type, status)
SELECT e.id, $1, 'manager', 'draft'
FROM employees e
WHERE e.is_active AND e.manager_id IS NOT NULL
ON CONFLICT (employee_id, review_cycle_id, type) DO NOTHING;
```

**Test:** Run twice; row counts do not duplicate; completes quickly for 1k+ employees.

**DoD:** Idempotent, performant seeding.

---

### 7) Indexes That Match Policies & Joins

**Action:** Add targeted indexes.

**SQL:**

```sql
CREATE INDEX IF NOT EXISTS ix_employees_manager_active ON public.employees(manager_id) WHERE is_active;
CREATE INDEX IF NOT EXISTS ix_assessments_employee_cycle ON public.assessments(employee_id, review_cycle_id);
```

**Test:** `EXPLAIN ANALYZE` on role‑filtered selects shows index usage; p95 latency drops.

**DoD:** Query plans use indexes; measurable latency improvement.

---

### 8) Observability for Edge Functions

**Action:** Add structured logs and correlation IDs; integrate with Sentry/Logflare.

**Code:**

```ts
const requestId = crypto.randomUUID();
console.log(JSON.stringify({ level: 'info', requestId, event: 'admin-op:start' }));
try {
  // ... do work
} catch (err) {
  console.error(JSON.stringify({ level: 'error', requestId, error: String(err) }));
  return json({ requestId, error: 'internal_error' }, { status: 500, headers: corsHeaders });
}
```

**Test:** Trigger success and failure; logs include `requestId`; errors bubble with code.

**DoD:** Errors traceable end‑to‑end; alerts fire on failures.

---

### 9) Backup Hardening (Encryption + Restore Drill)

**Action:** Encrypt artifacts, store immutable copy, and schedule monthly restore test.

**Commands (example using ****\`\`****):**

```bash
# Encrypt
age -r $PUBLIC_KEY -o backups/db_$(date +%F).sql.age backups/db.sql

# Immutable S3 (bucket with Object Lock enabled)
aws s3 cp backups/db_$(date +%F).sql.age s3://org-edge-backups/ --metadata object-lock-mode=GOVERNANCE,object-lock-retain-until-date=$(date -d "+30 days" --iso-8601=seconds)
```

**Restore Drill:**

1. Provision scratch Supabase/project
2. Decrypt → restore
3. Run smoke tests (login, CRUD, realtime event)

**DoD:** Encrypted artifacts present; immutable copy exists; successful monthly restore log.

---

## Sequenced Plan (1–2 week hardening sprint)

**Day 1–2:** Tasks 1–3 (Edge function, UNIQUE index, RLS WITH CHECK)\
**Day 3:** Task 4–5 (RPC contract, Realtime standardization)\
**Day 4–5:** Task 6–7 (Set‑based SQL, indexes)\
**Day 6:** Task 8 (Observability)\
**Day 7:** Task 9 (Backup encryption + restore drill)\
**Day 8:** Pen‑test pass: attempt privilege escalation, verify RLS denies, run perf checks

---

## Verification Checklist (copy/paste to PR template)

-

---

## Suggested Commit Messages

- `feat(edge): add user client auth + prod CORS restrictions`
- `feat(db): enforce UNIQUE employees.user_id`
- `feat(db/rls): add admin WITH CHECK write policies across tables`
- `refactor(fe): align rpc(get_my_role) to session‑derived contract`
- `chore(realtime): standardize on public:kudos channel`
- `perf(sql): set‑based seeding w/ ON CONFLICT`
- `perf(db): add indexes for common RLS filters`
- `chore(obs): structured logs + correlation IDs`
- `sec(backup): encrypt artifacts + monthly restore drill`

---

## Notes for Future Work

- Consider React Router if deep links become necessary
- Add end‑to‑end RLS tests (vitest + postgrest client) to thwart regressions
- Formalize RPO/RTO targets and add to backup doc

---

**End of peer review.** Proceed with the sequence above. Each step is atomic and verifiable for Claude Code to execute in the VS terminal.

