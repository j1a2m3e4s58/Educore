# EduCore Test Guide

Version: `1.0.0-test-ready`

## Start Testing

```bash
npm install
npm run build
npm run dev
```

Open:

```text
http://localhost:3000/
```

## Seed Test Accounts

| Role | School | Email | Password |
| --- | --- | --- | --- |
| Super Admin | Global | `superadmin@educore.ai` | `admin123` |
| Manager | Central Crest Collegiate | `s.jenkins@centralcrest.edu` | `admin123` |
| Teacher | Central Crest Collegiate | `m.brody@centralcrest.edu` | `admin123` |
| Parent | Central Crest Collegiate | `r.vance@gmail.com` | `admin123` |
| Student | Central Crest Collegiate | `j.vance@centralcrest.edu` | `admin123` |

## Core QA Flow

1. Login as Super Admin.
2. Open Settings.
3. Confirm the Ready To Test Checklist is visible.
4. Click Check Backend if the production server is running.
5. Confirm seed test accounts are visible.
6. Login as Manager and check Dashboard, Students, Teachers, Fees, Messages, Calendar, and Access Accounts.
7. Login as Teacher and test attendance, assignments, lesson records, materials, and AI suite.
8. Login as Parent and confirm only linked child data is visible.
9. Login as Student and confirm only linked student data is visible.
10. Use mobile device mode and repeat Manager, Teacher, Parent, and Student journey checks.

## Backend Mode Test

Start production server:

```bash
npm run build
PORT=3100 npm start
```

In browser console:

```js
localStorage.setItem('educore_use_backend_api', '1')
```

Then login with the seed accounts. Super Admin Settings should allow:

- backend health check
- environment check
- backup creation
- browser export migration upload

## Import Test

Open Manager > Import Data.

CSV header:

```csv
fullName,uniqueId,gender,email,phone,mappedIdField,extraField,status
```

Use the preview table. Valid rows can be saved; invalid rows should show clear errors.

## Password And Security Test

- Try 5 wrong passwords to trigger lockout.
- Use Forgot Password to create a reset request.
- Approve/reset from Access Accounts.
- Confirm first-login password policy requires 8 characters, uppercase, number, and special character.

## Final Automated Checks

```bash
npm run build
npm run smoke:pages
npm run smoke:journeys
npm run package:deploy
```
