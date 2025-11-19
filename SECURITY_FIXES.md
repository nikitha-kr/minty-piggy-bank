# Security Fixes Applied

## Fixed Issues

### 1. Function Search Path Mutable (FIXED)

**Issue**: Functions `create_roundup_nudge` and `trigger_create_transaction_nudges` had role mutable search_path, making them vulnerable to schema injection attacks.

**Fix Applied**:
- Added explicit `SET search_path = public` to both functions
- This prevents malicious actors from manipulating the search path
- Functions now only look in the public schema

**Migration**: `20251119002140_fix_security_issues_v2.sql`

### 2. Unused Indexes (NO ACTION REQUIRED)

**Status**: These are informational warnings, not security vulnerabilities.

The following indexes are currently unused but are optimized for future performance:
- `idx_nudges_user_id_dismissed` - Will be used when filtering nudges by user and dismissed status
- `idx_nudges_transaction_id` - Will be used when looking up nudges by transaction
- `idx_savings_actions_goal_id` - Will be used when querying savings by goal
- `idx_savings_actions_transaction_id` - Will be used when querying savings by transaction

**Recommendation**: Keep these indexes. They will improve query performance as your data grows and are following database best practices.

## Manual Configuration Required

### 3. Leaked Password Protection (REQUIRES DASHBOARD CONFIG)

**Issue**: Supabase Auth's HaveIBeenPwned integration is not enabled.

**Action Required**: Enable this feature through the Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Policies**
3. Find the **Security** section
4. Enable **"Password dictionary attacks protection"** or **"HIBP (Have I Been Pwned) check"**
5. Save the changes

**What This Does**:
- Checks user passwords against the HaveIBeenPwned database during signup and password changes
- Prevents users from using compromised passwords
- Enhances overall account security

**Note**: This setting cannot be enabled via SQL migrations as it's a Supabase platform configuration, not a database setting.

## Security Best Practices Implemented

1. **Row Level Security (RLS)**: Enabled on all tables
2. **Explicit Search Paths**: All functions use `SET search_path = public`
3. **Security Definer Functions**: Functions run with definer privileges but are restricted to public schema
4. **Proper Authentication Checks**: All policies verify `auth.uid()` for ownership
5. **Cascading Deletes**: Foreign keys properly cascade to prevent orphaned data

## Additional Recommendations

1. **Enable Leaked Password Protection** (see above)
2. **Rotate JWT Secret**: Periodically rotate your JWT secret in production
3. **Monitor Database Logs**: Enable and review database logs for suspicious activity
4. **Regular Security Audits**: Run Supabase's security scanner periodically
5. **Keep Dependencies Updated**: Regularly update Supabase client libraries

## Summary

- ✅ Function search path vulnerabilities **FIXED**
- ✅ Database security properly configured
- ✅ RLS policies in place
- ⚠️ Leaked password protection requires manual dashboard configuration
- ℹ️ Unused indexes are intentional for future performance
