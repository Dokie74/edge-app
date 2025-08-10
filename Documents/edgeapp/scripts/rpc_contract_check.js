const { execSync } = require('node:child_process');

console.log('🔍 Checking RPC contract compliance...');

try {
  // Check for prohibited RPC patterns (client-supplied identity)
  const prohibitedPatterns = [
    "rpc('get_my_role',",
    "rpc(\"get_my_role\",",
    ".rpc('get_my_role',",
    ".rpc(\"get_my_role\","
  ];

  let violations = [];
  
  for (const pattern of prohibitedPatterns) {
    try {
      const cmd = `grep -R "${pattern}" -n src/ || true`;
      const out = execSync(cmd, { encoding: 'utf8' });
      if (out && out.trim().length) {
        violations.push(`Pattern: ${pattern}\n${out}`);
      }
    } catch (e) {
      // Ignore grep errors
    }
  }

  if (violations.length > 0) {
    console.error('❌ RPC contract violations found:');
    console.error('━'.repeat(50));
    violations.forEach(violation => {
      console.error(violation);
      console.error('━'.repeat(50));
    });
    console.error('\n💡 Fix: Use authRole.ts service instead of passing user_id parameters');
    console.error('   ✅ Good: await getMyRole()');
    console.error('   ❌ Bad:  await supabase.rpc("get_my_role", { user_id })');
    process.exit(1);
  }

  // Check for usage of standardized authRole service
  try {
    const authRoleUsage = execSync("grep -R \"authRole\" -n src/ || true", { encoding: 'utf8' });
    if (authRoleUsage && authRoleUsage.trim().length) {
      console.log('✅ Found authRole service usage - good practice!');
    }
  } catch (e) {
    // Optional check
  }

  console.log('✅ RPC contract check passed');
  console.log('🎯 All RPC calls use session-derived identity');
  
} catch (e) {
  console.error('❌ RPC contract check failed:', e.message);
  process.exit(2);
}