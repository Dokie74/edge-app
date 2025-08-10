# Backup Encryption & Restore Policy - EDGE App

## Security Objective
Protect sensitive employee data in backups through encryption, immutable storage, and regular restore validation.

## Current State Assessment
✅ **Strengths:**
- Comprehensive backup scripts (DB + frontend + migrations)
- Automated backup generation with timestamps
- Restore instructions documented
- JSON format preservation for configuration

❌ **Security Gaps:**
- Backups stored in plaintext
- No immutable storage protection
- No encryption at rest
- Manual restore process without validation

## Implementation Plan

### Phase 1: Encryption Setup

#### Tool Selection: Age (Modern, Simple)
```bash
# Install age encryption tool
# Windows: scoop install age
# Mac: brew install age  
# Linux: apt install age

# Generate keypair (one-time setup)
age-keygen -o backup-private.key
# Public key: age1abc123... (for encryption)
# Private key: AGE-SECRET-KEY-... (for decryption, secure storage)
```

#### Backup Script Enhancement
```bash
#!/bin/bash
# Enhanced backup with encryption

BACKUP_DIR="backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
PUBLIC_KEY="age1ql3n8q3h9rjz6x8m2k5w7v4t3e8r9y2u1i6o5p4a3s2d1f9g8h7j6k"

# Create encrypted database backup
supabase db dump > "$BACKUP_DIR/raw/db_$DATE.sql"
age -r $PUBLIC_KEY -o "$BACKUP_DIR/encrypted/db_$DATE.sql.age" "$BACKUP_DIR/raw/db_$DATE.sql"

# Create encrypted frontend backup  
tar -czf "$BACKUP_DIR/raw/frontend_$DATE.tar.gz" src/ public/ package.json
age -r $PUBLIC_KEY -o "$BACKUP_DIR/encrypted/frontend_$DATE.tar.gz.age" "$BACKUP_DIR/raw/frontend_$DATE.tar.gz"

# Clean raw files (keep only encrypted)
rm "$BACKUP_DIR/raw/db_$DATE.sql"
rm "$BACKUP_DIR/raw/frontend_$DATE.tar.gz"

echo "✅ Encrypted backup created: $DATE"
```

### Phase 2: Immutable Storage

#### AWS S3 with Object Lock
```bash
# Upload to S3 with governance lock (30-day retention)
RETENTION_DATE=$(date -d "+30 days" --iso-8601=seconds)

aws s3 cp "$BACKUP_DIR/encrypted/db_$DATE.sql.age" \
    "s3://edge-app-backups-immutable/" \
    --metadata "object-lock-mode=GOVERNANCE,object-lock-retain-until-date=$RETENTION_DATE"

aws s3 cp "$BACKUP_DIR/encrypted/frontend_$DATE.tar.gz.age" \
    "s3://edge-app-backups-immutable/" \
    --metadata "object-lock-mode=GOVERNANCE,object-lock-retain-until-date=$RETENTION_DATE"
```

#### Alternative: GitHub Encrypted Releases
```bash
# For organizations without AWS, use GitHub releases
gh release create "backup-$DATE" \
    "$BACKUP_DIR/encrypted/db_$DATE.sql.age" \
    "$BACKUP_DIR/encrypted/frontend_$DATE.tar.gz.age" \
    --title "Encrypted Backup $DATE" \
    --notes "Automated encrypted backup - requires private key for decryption"
```

### Phase 3: Restore Validation

#### Monthly Restore Drill Script
```bash
#!/bin/bash
# restore-drill.sh - Monthly restore validation

DRILL_DATE=$(date +%Y-%m-%d)
PRIVATE_KEY_PATH="/secure/backup-private.key"
DRILL_PROJECT="edge-restore-test-$DRILL_DATE"

echo "🔧 Starting restore drill: $DRILL_DATE"

# Step 1: Create scratch Supabase project
supabase projects create "$DRILL_PROJECT" --plan free
DRILL_PROJECT_ID=$(supabase projects list --output json | jq -r ".[] | select(.name==\"$DRILL_PROJECT\") | .id")

# Step 2: Download and decrypt latest backup
LATEST_BACKUP=$(ls -t backups/encrypted/db_*.sql.age | head -1)
age -d -i "$PRIVATE_KEY_PATH" -o "restore-test-$DRILL_DATE.sql" "$LATEST_BACKUP"

# Step 3: Restore to scratch project
supabase db reset --project-ref "$DRILL_PROJECT_ID" --file "restore-test-$DRILL_DATE.sql"

# Step 4: Smoke tests
echo "🧪 Running smoke tests..."

# Test 1: Basic structure
EMPLOYEE_COUNT=$(supabase db query --project-ref "$DRILL_PROJECT_ID" "SELECT COUNT(*) FROM employees")
echo "Employee count: $EMPLOYEE_COUNT"

# Test 2: RLS policies active
POLICY_COUNT=$(supabase db query --project-ref "$DRILL_PROJECT_ID" "SELECT COUNT(*) FROM pg_policies WHERE schemaname='public'")
echo "RLS policies: $POLICY_COUNT"

# Test 3: Functions exist
FUNCTION_COUNT=$(supabase db query --project-ref "$DRILL_PROJECT_ID" "SELECT COUNT(*) FROM pg_proc WHERE proname LIKE 'get_my_%'")
echo "Custom functions: $FUNCTION_COUNT"

# Step 5: Cleanup
supabase projects delete "$DRILL_PROJECT_ID" --force
rm "restore-test-$DRILL_DATE.sql"

echo "✅ Restore drill completed: $DRILL_DATE"
echo "📊 Results: $EMPLOYEE_COUNT employees, $POLICY_COUNT policies, $FUNCTION_COUNT functions"
```

## Security Benefits

### Encryption Protection
- **At Rest**: Backups encrypted with age (ChaCha20-Poly1305)
- **In Transit**: HTTPS for S3 uploads, TLS for GitHub releases
- **Key Management**: Separate private key storage (never in repo)

### Immutable Storage Protection
- **Tamper-Proof**: Object Lock prevents deletion/modification
- **Retention**: 30-day minimum retention period
- **Compliance**: Meets data protection requirements

### Restore Confidence
- **Monthly Validation**: Automated restore testing
- **Smoke Tests**: Verify structure, security, and functionality
- **Documentation**: Clear procedures for emergency restore

## Implementation Timeline

**Week 1: Setup**
- Install age encryption tools
- Generate keypair (store private key securely)
- Update backup scripts with encryption

**Week 2: Storage**
- Configure S3 bucket with Object Lock
- Test upload/download workflows
- Document access procedures

**Week 3: Validation**
- Create restore drill script
- Schedule monthly automated runs
- Document test results template

**Week 4: Production**
- Deploy encrypted backup pipeline
- Perform first restore drill
- Train team on procedures

## Risk Mitigation

### Key Loss Prevention
- **Multiple Locations**: Private key in secure vault + offline backup
- **Documentation**: Recovery procedures for key management
- **Testing**: Regular key access validation

### Storage Failures
- **Multi-Region**: S3 cross-region replication
- **Multiple Providers**: GitHub releases as secondary option
- **Local Retention**: Keep recent encrypted backups locally

### Compliance Requirements
- **Audit Trail**: All backup operations logged
- **Access Controls**: IAM policies for S3 access
- **Documentation**: This policy serves as compliance documentation

## Success Metrics

- ✅ 100% of backups encrypted within 30 days
- ✅ Monthly restore drill completion rate >95%
- ✅ Recovery Time Objective (RTO) < 4 hours demonstrated
- ✅ Recovery Point Objective (RPO) < 24 hours maintained
- ✅ Zero incidents of plaintext backup exposure

---

**Next Steps:**
1. Review and approve this policy
2. Implement Phase 1 (encryption) immediately
3. Schedule Phase 2 (immutable storage) for next sprint
4. Calendar monthly restore drills starting next month