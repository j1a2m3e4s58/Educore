# EduCore 1.0.0 Test-Ready Release Notes

## Status

This build is ready for structured testing.

## Complete

- Mobile-friendly role-based school portal UI
- Super Admin, Manager, Teacher, Parent, and Student experiences
- Role-aware navigation and page protection
- Backend foundation with hashed passwords, sessions, lockout, reset codes, tenant checks, audit logs, archives, delivery queue, and migration endpoint
- Super Admin backend readiness panel
- Seed test accounts panel
- Safe demo reset command
- CSV import wizard with preview and validation
- Academic year, term, and semester archive flow
- Parent multi-child linking and student/parent privacy filters
- Deployment package generation
- Testing guide and deployment guide

## Must Configure On Real Hosting

- Set `SEED_ADMIN_PASSWORD` before first production start.
- Use HTTPS with reverse proxy settings.
- Configure backup storage.
- Configure delivery provider keys for real SMS, WhatsApp, and email sending.
- For multi-server or high-traffic production, move from file JSON database to PostgreSQL/MySQL using `scripts/production-schema.sql`.

## Final Verification Commands

```bash
npm run build
npm run smoke:pages
npm run smoke:journeys
npm run package:deploy
```

## Test Entry Point

Open:

```text
http://localhost:3000/
```

See `TESTING.md` for the full tester flow.
