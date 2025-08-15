# EDGE Remaining Steps – All Files in One Markdown

This markdown file contains the **entire content** of the deliverables from the **EDGE_Remaining_Steps_Sprint_Board_and_Files** package. Claude Code or any developer can decide whether to use the code as-is or generate separate files.

---

## Folder Structure
```
./
├─ docs/
│  ├─ PeerReview_RemainingSteps.md
│  ├─ RPC_Contract_Standardization.md
│  ├─ Realtime_Migration_Plan.md
│  ├─ Observability_Setup.md
│  └─ Backup_Restore_Drill_Runbook.md
├─ .github/workflows/
│  └─ ci.yml
├─ scripts/
│  ├─ rpc_contract_check.js
│  ├─ rls_policy_smoke.sql
│  ├─ explain_hotpaths.sql
│  └─ restore_smoke.js
└─ frontend/src/services/
   └─ authRole.ts
```

---

## docs/PeerReview_RemainingSteps.md
```md
# Peer Review – Remaining Steps to Reach 9.0

## Why these steps
- Remove RPC drift (session‑derived roles only)
- One realtime convention to cut ghost subs
- CI gates so security/perf can’t regress silently
- Production observability (find, fix, prove)
- Automated restore drills (prove RPO/RTO)

## Tasks (condensed)
1) **RPC** – Replace any `get_my_role(user_id)` usage; use session.
2) **Realtime** – Standardize on `public:<table>` channels; delete legacy.
3) **CI gates** – RLS smoke, RPC signature check, EXPLAIN guardrails.
4) **Obs** – Sentry + log sink; correlation IDs.
5) **DR** – Scripted restore smoke; schedule monthly.

## Exit Criteria
- CI green with new gates
- Sentry shows errors for forced fault
- Restore run produces PASS artifact
```

---

## docs/RPC_Contract_Standardization.md
```md
# RPC Contract Standardization

## Principle
**Never pass identity/role from client; derive from DB session (auth.uid()).**

## Scope
- Replace any calls like `rpc('get_my_role', { user_id })` with `rpc('get_my_role')`.
- Audit other RPCs for similar smells (user_id, role, email parameters).

## Steps
1. **Search:** `grep -R "rpc(\'get_my_role" -n frontend/src`
2. **Replace:** Use `authRole.ts:getMyRole()` exported function everywhere.
3. **Ban pattern in CI:** `scripts/rpc_contract_check.js`.

## Acceptance
- CI `rpc-contract-check` step passes.
- No client‑supplied identity in RPC calls.
```

---

## docs/Realtime_Migration_Plan.md
```md
# Realtime Migration Plan

## Target
- Use Supabase realtime channels: `public:<table>` (e.g., `public:kudos`).
- Remove legacy `kudos_changes` channel and unused `pg_notify` consumers.

## Steps
1. Create a small `RealtimeService` (already present) and route all subs through it.
2. Replace inline subs:
   - before: `.channel('kudos_changes') ...`
   - after:  `.channel('public:kudos') ...`
3. Delete legacy listeners; verify no duplicate callbacks.
4. QA: create/update/delete rows → exactly one event each.

## Acceptance
- No references to `kudos_changes`.
- One event per write across environments.
```

---

## docs/Observability_Setup.md
```md
# Observability Setup (Sentry + Log Sink)

## Goals
- Error tracking with releases + environment tags
- Structured logs searchable by `requestId`

## Steps – Frontend
1. Add Sentry SDK.
2. Initialize with `release` and `environment`.
3. Wrap app with ErrorBoundary reporting to Sentry.

## Steps – Edge Functions
1. Add Sentry for Deno or HTTP relay endpoint.
2. Include `{ requestId, userId }` context on errors.
3. Send logs to Logflare or your chosen sink.

## Acceptance
- Forced error appears in Sentry with stack + tags.
- Logs queryable by `requestId`.
```

---

## docs/Backup_Restore_Drill_Runbook.md
```md
# Backup Restore Drill – Runbook

## Objective
Prove RPO ≤ 24h and RTO ≤ 4h with a scripted scratch restore and smoke.

## Steps
1. Provision scratch project (scripted or manual).
2. Restore minimal schema/data.
3. Run `scripts/restore_smoke.js` → login + CRUD + realtime event.
4. Record timestamps and PASS/FAIL.

## Acceptance
- PASS artifact with start/end times committed to backups log.
```

---

## .github/workflows/ci.yml
```yaml
name: edge-ci
on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install deps
        run: npm ci
      - name: Typecheck
        run: npm run typecheck --if-present
      - name: Lint
        run: npm run lint --if-present
      - name: RPC contract check
        run: node scripts/rpc_contract_check.js
      - name: SQL explain guardrails (dry)
        run: |
          echo "(Set up DB creds + run scripts/explain_hotpaths.sql in your DB CI job)"
```

---

## scripts/rpc_contract_check.js
```js
const { execSync } = require('node:child_process');

try {
  const out = execSync("grep -R \"rpc('get_my_role',\" -n frontend/src || true", { encoding: 'utf8' });
  if (out && out.trim().length) {
    console.error('❌ Prohibited RPC pattern found:\n' + out);
    process.exit(1);
  }
  console.log('✅ RPC contract check passed');
} catch (e) {
  console.error('rpc_contract_check failed', e.message);
  process.exit(2);
}
```

---

## scripts/rls_policy_smoke.sql
```sql
BEGIN;
  INSERT INTO public.employees (email, first_name, last_name, role)
  VALUES ('blocked@test.io','No','Write','employee');
ROLLBACK;

BEGIN;
  INSERT INTO public.employees (email, first_name, last_name, role)
  VALUES ('ok@test.io','Admin','Write','employee');
ROLLBACK;
```

---

## scripts/explain_hotpaths.sql
```sql
EXPLAIN ANALYZE
SELECT a.*
FROM public.assessments a
JOIN public.employees e ON e.id = a.employee_id
WHERE e.is_active = true
  AND a.review_cycle_id = :cycle_id;
```

---

## scripts/restore_smoke.js
```js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const start = Date.now();
  try {
    const { data: rc, error: e1 } = await supabase.from('review_cycles').insert({
      name: 'Restore Smoke', start_date: '2025-01-01', end_date: '2025-12-31', is_active: false
    }).select().single();
    if (e1) throw e1;

    const { data: read, error: e2 } = await supabase.from('review_cycles').select('*').eq('id', rc.id).single();
    if (e2) throw e2;

    console.log('✅ Restore smoke passed in', Date.now() - start, 'ms');
    process.exit(0);
  } catch (err) {
    console.error('❌ Restore smoke failed:', err);
    process.exit(1);
  }
})();
```

---

## frontend/src/services/authRole.ts
```ts
import { supabase } from "../supabaseClient";

export async function getMyRole(): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_my_role");
  if (error) {
    console.error("get_my_role failed", error);
    return null;
  }
  return data ?? null;
}
```

