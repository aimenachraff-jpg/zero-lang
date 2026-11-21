# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅        |

## Reporting a Vulnerability

If you discover a security vulnerability in ZERO-LANG, please report it responsibly.

**Do NOT open a public GitHub Issue for security vulnerabilities.**

Instead, please:

1. Open a [GitHub Security Advisory](https://github.com/aimenachraff-jpg/zero-lang/security/advisories/new) (preferred)
2. Or email the maintainers directly

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### What to expect

- Acknowledgment within 48 hours
- Status update within 7 days
- Fix timeline depends on severity

## Security Considerations

### Secrets

- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser or committed to the repository
- `NEXT_PUBLIC_*` variables are public by design (used in browser)
- Never commit `.env.local` or any file containing real credentials

### Row-Level Security

All user data tables use Supabase RLS policies. Users can only read and write their own data. Published curriculum is publicly readable.

### Dependencies

We regularly review dependencies for known vulnerabilities. Run `npm audit` to check for issues.