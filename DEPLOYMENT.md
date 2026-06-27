# EduCore Production Deployment

## What This Package Includes

- React frontend build in `dist/`
- Express backend in `server.js`
- File-backed database at `data/educore-db.json`
- Hashed passwords using PBKDF2
- HTTP-only cookie sessions plus bearer token support
- Server-side role and tenant checks
- Login lockout after repeated failed attempts
- Password reset code API
- Academic archive API
- Delivery queue API for email/SMS/WhatsApp providers
- Browser-data migration endpoint
- Super Admin UI controls for migration, environment checks, and backups
- SQL schema target in `scripts/production-schema.sql`

## Environment Variables

Copy `.env.example` to `.env` on the server and set:

```bash
PORT=3000
NODE_ENV=production
EDUCORE_DATA_DIR=./data
EDUCORE_BACKUP_DIR=./data/backups
DATABASE_PROVIDER=file-json
SEED_ADMIN_PASSWORD=ChangeMe@12345
SESSION_TTL_HOURS=8
MAX_FAILED_LOGINS=5
LOCKOUT_MINUTES=15
RESET_CODE_TTL_MINUTES=20
TRUST_PROXY=1
DELIVERY_PROVIDER=queue-only
```

## Install And Start

```bash
npm ci --omit=dev
npm start
```

The first start creates `data/educore-db.json` with seed schools and accounts.

## Seed Accounts

Default password comes from `SEED_ADMIN_PASSWORD`. If it is not set, development uses `admin123`.

- Super Admin: `superadmin@educore.ai`
- Central Crest Manager: `s.jenkins@centralcrest.edu`
- St. Jude Manager: `a.vance@stjude.edu`

Set `SEED_ADMIN_PASSWORD` before first start on a real server.

## Build A Deploy Folder

```bash
npm run package:deploy
```

Output:

```text
deploy/educore-production
```

Upload that folder to your host, run `npm ci --omit=dev`, then `npm start`.

## Browser Data Migration

### Option A: Super Admin UI

1. Enable backend login in the browser console:

```js
localStorage.setItem('educore_use_backend_api', '1')
```

2. Login as Super Admin.
3. Open Settings.
4. Use **Production backend control** to upload the exported JSON.

### Option B: API

1. Open the old browser-based portal.
2. Open browser DevTools Console.
3. Paste the contents of `scripts/browser-migration-export.js`.
4. A JSON export file downloads.
5. Sign into the backend as Super Admin.
6. POST the export JSON to:

```http
POST /api/migration/browser-export
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

Send the file body exactly as downloaded.

## PostgreSQL/MySQL Upgrade

The included file database is production-capable for a single server. For a full relational database:

1. Create a database.
2. Run `scripts/production-schema.sql`.
3. Export `data/educore-db.json`.
4. Import each array into the matching SQL table.
5. Set:

```bash
DATABASE_PROVIDER=postgres-compatible
DATABASE_URL=postgres://user:password@host:5432/educore
```

The current server reports the provider and keeps the same API shape. Replace the internal `readDb/writeDb` adapter with SQL queries when moving to a managed database.

## Message Provider Integration

Set one of these provider groups:

```bash
DELIVERY_PROVIDER=sendgrid
SENDGRID_API_KEY=...
```

```bash
DELIVERY_PROVIDER=twilio
TWILIO_AUTH_TOKEN=...
```

```bash
DELIVERY_PROVIDER=whatsapp-cloud
WHATSAPP_TOKEN=...
```

Messages are accepted at `POST /api/schools/:tenantId/delivery`. Without provider keys, they stay in the delivery queue for manual processing.

## Backups And Hardening

Super Admin APIs:

```http
GET /api/admin/env-check
POST /api/admin/backup
GET /api/admin/delivery-provider
```

Backups are written to `EDUCORE_BACKUP_DIR`.

Behind a reverse proxy, use HTTPS and set:

```bash
TRUST_PROXY=1
APP_URL=https://your-domain.example
NODE_ENV=production
```

## Important Production Note

The included database is a durable file database for simple deployment. For high traffic or multi-server hosting, migrate the same table names to PostgreSQL or MySQL and keep the API middleware in `server.js` as the enforcement layer.
