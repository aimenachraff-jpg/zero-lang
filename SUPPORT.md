# Support

## Getting Help

### Documentation
- [README.md](README.md) — Project overview, setup, and usage
- [CONTRIBUTING.md](CONTRIBUTING.md) — How to contribute
- [DECISION_LOG.md](DECISION_LOG.md) — Architecture decisions

### Community
- **GitHub Discussions** — Ask questions, share ideas, discuss features
- **GitHub Issues** — Bug reports and feature requests

### Common Issues

**Build fails with "Missing Supabase environment variables"**
- Ensure `.env.local` exists with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Or set them in your hosting platform's environment variables

**Tests fail with "jest-environment-jsdom cannot be found"**
- Run `npm install` to ensure all dev dependencies are installed

**Seed script fails**
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- Run `node scripts/seed.mjs` (not `npm run seed`)

### Contact

For security issues, see [SECURITY.md](SECURITY.md).

For all other questions, open a GitHub Discussion or Issue.