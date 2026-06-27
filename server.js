/**
 * EduCore production foundation server.
 * Run after `npm run build` with `npm start`.
 *
 * This server uses a file-backed JSON database so the app can deploy without
 * extra native database dependencies. The table layout is intentionally close
 * to SQL tables and can be migrated to PostgreSQL/MySQL later without changing
 * the API shape.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3000);
const SESSION_COOKIE = 'educore_session';
const DATA_DIR = process.env.EDUCORE_DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'educore-db.json');
const BACKUP_DIR = process.env.EDUCORE_BACKUP_DIR || path.join(DATA_DIR, 'backups');
const DATABASE_PROVIDER = process.env.DATABASE_PROVIDER || (process.env.DATABASE_URL ? 'postgres-compatible' : 'file-json');
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_HOURS || 8) * 60 * 60 * 1000;
const LOCKOUT_MINUTES = Number(process.env.LOCKOUT_MINUTES || 15);
const MAX_FAILED_LOGINS = Number(process.env.MAX_FAILED_LOGINS || 5);
const RESET_CODE_TTL_MINUTES = Number(process.env.RESET_CODE_TTL_MINUTES || 20);

if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path} ${res.statusCode} ${Date.now() - started}ms`);
    }
  });
  next();
});

const roleAllowedTabs = {
  SuperAdmin: ['dashboard', 'edu-ecosystem', 'commercial-hub', 'eduos-engine', 'register', 'schools', 'sa-tenants', 'sa-subscriptions', 'sa-audit-security', 'sa-system-ops', 'sa-support-tickets', 'roles', 'settings'],
  SchoolAdmin: ['school-dashboard', 'edu-ecosystem', 'commercial-hub', 'eduos-engine', 'school-review', 'school-teachers', 'school-students', 'school-classes', 'school-subjects', 'school-departments', 'school-fees', 'school-comm', 'school-calendar', 'school-academic-year', 'school-users', 'school-permissions', 'school-import', 'school-log', 'school-settings', 'school-ai-suite'],
  AssistantAdmin: ['school-dashboard', 'school-review', 'school-teachers', 'school-students', 'school-classes', 'school-subjects', 'school-fees', 'school-comm', 'school-calendar', 'school-users', 'school-import', 'school-log'],
  Accountant: ['school-dashboard', 'school-fees', 'school-comm', 'school-calendar', 'school-log'],
  Supervisor: ['school-dashboard', 'school-review', 'school-teachers', 'school-students', 'school-classes', 'school-subjects', 'school-calendar', 'school-log'],
  Teacher: ['teacher-dashboard', 'edu-ecosystem', 'commercial-hub', 'eduos-engine', 'teacher-assignments', 'teacher-attendance', 'teacher-lessons', 'teacher-materials', 'teacher-log', 'teacher-ai-suite'],
  Parent: ['parent-dashboard', 'edu-ecosystem', 'commercial-hub', 'eduos-engine', 'school-calendar'],
  Student: ['student-dashboard', 'edu-ecosystem', 'commercial-hub', 'eduos-engine', 'school-calendar'],
};

function nowIso() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt] = storedHash.split(':');
  const candidate = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(storedHash));
}

function seedDb() {
  const passwordHash = hashPassword(process.env.SEED_ADMIN_PASSWORD || 'admin123');
  const createdAt = nowIso();
  return {
    meta: { version: 1, createdAt, updatedAt: createdAt },
    schools: [
      { id: 'school_central_crest', code: 'EDU-CENTRAL', name: 'Central Crest Collegiate', status: 'Active', createdAt },
      { id: 'school_st_jude', code: 'EDU-STJUDE', name: 'St. Jude International Academy', status: 'Active', createdAt },
      { id: 'school_apex_collegiate', code: 'EDU-APEX', name: 'Apex Collegiate Institute', status: 'Suspended', createdAt },
    ],
    users: [
      { id: 'user_sa_1', tenantId: 'SUPER_ADMIN', name: 'EduCore General Super Admin', email: 'superadmin@educore.ai', role: 'SuperAdmin', status: 'Active', passwordHash, failedLoginCount: 0, createdAt },
      { id: 'user_admin_central', tenantId: 'school_central_crest', name: 'Dr. Sarah Jenkins', email: 's.jenkins@centralcrest.edu', role: 'SchoolAdmin', status: 'Active', passwordHash, failedLoginCount: 0, createdAt },
      { id: 'user_admin_stjude', tenantId: 'school_st_jude', name: 'Principal Arthur Vance', email: 'a.vance@stjude.edu', role: 'SchoolAdmin', status: 'Active', passwordHash, failedLoginCount: 0, createdAt },
      { id: 'user_teacher_central_1', tenantId: 'school_central_crest', name: 'Marcus Brody', email: 'm.brody@centralcrest.edu', role: 'Teacher', status: 'Active', linkedTeacherId: 'tch_001', passwordHash, failedLoginCount: 0, createdAt },
      { id: 'user_student_central_1', tenantId: 'school_central_crest', name: 'Julian Vance', email: 'j.vance@centralcrest.edu', role: 'Student', status: 'Active', linkedStudentId: 'student_central_1', passwordHash, failedLoginCount: 0, createdAt },
      { id: 'user_parent_central_1', tenantId: 'school_central_crest', name: 'Robert Vance', email: 'r.vance@gmail.com', role: 'Parent', status: 'Active', linkedStudentId: 'student_central_1', linkedStudentIds: ['student_central_1'], passwordHash, failedLoginCount: 0, createdAt },
    ],
    students: [
      { id: 'student_central_1', tenantId: 'school_central_crest', fullName: 'Julian Vance', studentId: 'STU-001', classId: 'class_jhs1', parentName: 'Robert Vance', parentEmail: 'r.vance@gmail.com', status: 'Active', createdAt },
    ],
    teachers: [
      { id: 'tch_001', tenantId: 'school_central_crest', fullName: 'Marcus Brody', staffId: 'TCH-001', email: 'm.brody@centralcrest.edu', assignedClasses: ['class_jhs1'], subjectsTaught: ['Mathematics', 'Integrated Science'], timetable: [], createdAt },
    ],
    fees: [],
    materials: [],
    assignments: [],
    audits: [],
    archives: [],
    passwordResets: [],
    sessions: [],
    deliveryQueue: [],
  };
}

function readDb() {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initial = seedDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDb(db) {
  ensureDataDir();
  db.meta = { ...(db.meta || {}), updatedAt: nowIso() };
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function createBackupFile(label = 'manual') {
  ensureDataDir();
  const db = readDb();
  const backupFile = path.join(BACKUP_DIR, `educore-${label}-${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(db, null, 2));
  return { backupFile, bytes: fs.statSync(backupFile).size };
}

function audit(db, event) {
  db.audits.unshift({
    id: id('audit'),
    tenantId: event.tenantId || 'GLOBAL',
    actorId: event.actorId || null,
    actorEmail: event.actorEmail || 'system',
    action: event.action,
    detail: event.detail,
    status: event.status || 'info',
    createdAt: nowIso(),
  });
  db.audits = db.audits.slice(0, 1000);
}

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const index = part.indexOf('=');
    return index === -1 ? [part, ''] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }));
}

function publicUser(user) {
  const { passwordHash, resetCodeHash, ...safe } = user;
  return safe;
}

function findSchool(db, tenantIdOrCode) {
  const value = String(tenantIdOrCode || '').toLowerCase();
  return db.schools.find(school => school.id.toLowerCase() === value || school.code.toLowerCase() === value);
}

function createSession(db, user) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  db.sessions.unshift({ id: id('sess'), tokenHash, userId: user.id, tenantId: user.tenantId, role: user.role, expiresAt, createdAt: nowIso() });
  db.sessions = db.sessions.filter(session => new Date(session.expiresAt).getTime() > Date.now()).slice(0, 500);
  return { token, expiresAt };
}

function getRequestUser(req) {
  const db = readDb();
  const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const cookieToken = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  const token = bearer || cookieToken;
  if (!token) return { db, user: null, session: null };
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const session = db.sessions.find(item => item.tokenHash === tokenHash);
  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) return { db, user: null, session: null };
  const user = db.users.find(candidate => candidate.id === session.userId && candidate.role === session.role && candidate.tenantId === session.tenantId);
  if (!user || user.status !== 'Active') return { db, user: null, session: null };
  return { db, user, session };
}

function requireAuth(req, res, next) {
  const state = getRequestUser(req);
  if (!state.user) return res.status(401).json({ error: 'Not signed in or session expired' });
  req.db = state.db;
  req.user = state.user;
  req.session = state.session;
  next();
}

function requireTenantAccess(req, res, next) {
  if (req.user.role === 'SuperAdmin') return next();
  const tenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;
  if (!tenantId || req.user.tenantId !== tenantId) return res.status(403).json({ error: 'This account cannot access another school.' });
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'This role cannot use this API.' });
    next();
  };
}

function requireTab(tabFromRequest) {
  return (req, res, next) => {
    const tab = typeof tabFromRequest === 'function' ? tabFromRequest(req) : tabFromRequest;
    if (!(roleAllowedTabs[req.user.role] || []).includes(tab)) return res.status(403).json({ error: 'This account cannot access that page or API area.' });
    next();
  };
}

function tableForArea(db, area) {
  const allowed = ['schools', 'users', 'students', 'teachers', 'fees', 'materials', 'assignments', 'audits', 'archives', 'passwordResets', 'deliveryQueue'];
  if (!allowed.includes(area)) return null;
  return db[area];
}

app.get('/api/health', (_req, res) => {
  const db = readDb();
  res.json({ ok: true, mode: DATABASE_PROVIDER, databaseFile: DATABASE_PROVIDER === 'file-json' ? DB_FILE : undefined, tables: Object.keys(db).filter(key => Array.isArray(db[key])), updatedAt: db.meta?.updatedAt });
});

app.get('/api/admin/env-check', requireAuth, requireRole('SuperAdmin'), (req, res) => {
  const checks = [
    { name: 'NODE_ENV', ok: process.env.NODE_ENV === 'production', detail: process.env.NODE_ENV || 'not set' },
    { name: 'SEED_ADMIN_PASSWORD', ok: Boolean(process.env.SEED_ADMIN_PASSWORD && process.env.SEED_ADMIN_PASSWORD !== 'admin123'), detail: process.env.SEED_ADMIN_PASSWORD ? 'custom seed password configured' : 'using development default' },
    { name: 'Data directory writable', ok: fs.existsSync(DATA_DIR), detail: DATA_DIR },
    { name: 'Backup directory writable', ok: fs.existsSync(BACKUP_DIR), detail: BACKUP_DIR },
    { name: 'Database provider', ok: true, detail: DATABASE_PROVIDER },
    { name: 'HTTPS proxy', ok: process.env.NODE_ENV !== 'production' || Boolean(process.env.TRUST_PROXY || process.env.APP_URL?.startsWith('https://')), detail: process.env.TRUST_PROXY || process.env.APP_URL || 'set TRUST_PROXY=1 behind HTTPS proxy' },
    { name: 'Delivery provider', ok: Boolean(process.env.DELIVERY_PROVIDER), detail: process.env.DELIVERY_PROVIDER || 'queue-only mode' },
  ];
  audit(req.db, { tenantId: 'GLOBAL', actorId: req.user.id, actorEmail: req.user.email, action: 'Environment Check', detail: `${checks.filter(check => check.ok).length}/${checks.length} checks passed.`, status: 'info' });
  writeDb(req.db);
  res.json({ ok: checks.every(check => check.ok), checks });
});

app.post('/api/admin/backup', requireAuth, requireRole('SuperAdmin'), (req, res) => {
  const backup = createBackupFile('manual');
  audit(req.db, { tenantId: 'GLOBAL', actorId: req.user.id, actorEmail: req.user.email, action: 'Server Backup Created', detail: backup.backupFile, status: 'success' });
  writeDb(req.db);
  res.json({ ok: true, ...backup });
});

app.post('/api/admin/reset-demo-data', requireAuth, requireRole('SuperAdmin'), (req, res) => {
  const backup = createBackupFile('before-reset');
  const fresh = seedDb();
  audit(fresh, { tenantId: 'GLOBAL', actorId: req.user.id, actorEmail: req.user.email, action: 'Demo Data Reset', detail: `Database reset after backup ${backup.backupFile}.`, status: 'warning' });
  writeDb(fresh);
  res.json({ ok: true, message: `Demo data reset. Backup created first: ${backup.backupFile}` });
});

app.get('/api/admin/delivery-provider', requireAuth, requireRole('SuperAdmin'), (req, res) => {
  res.json({
    provider: process.env.DELIVERY_PROVIDER || 'queue-only',
    configured: Boolean(process.env.DELIVERY_API_KEY || process.env.SENDGRID_API_KEY || process.env.TWILIO_AUTH_TOKEN || process.env.WHATSAPP_TOKEN),
    mode: process.env.DELIVERY_PROVIDER ? 'provider-ready' : 'queued-for-manual-processing',
  });
});

app.post('/api/auth/login', (req, res) => {
  const db = readDb();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const schoolId = req.body?.schoolId;
  const user = db.users.find(candidate => candidate.email.toLowerCase() === email && (!schoolId || candidate.tenantId === schoolId));
  const tenantId = user?.tenantId || schoolId || 'GLOBAL';

  if (!user) {
    audit(db, { tenantId, actorEmail: email, action: 'Login Failed', detail: 'Unknown account.', status: 'error' });
    writeDb(db);
    return res.status(401).json({ error: 'Invalid login details' });
  }

  if (user.loginLockedUntil && new Date(user.loginLockedUntil).getTime() > Date.now()) {
    audit(db, { tenantId: user.tenantId, actorEmail: user.email, action: 'Login Locked', detail: `Account locked until ${user.loginLockedUntil}.`, status: 'warning' });
    writeDb(db);
    return res.status(423).json({ error: `Account temporarily locked until ${user.loginLockedUntil}` });
  }

  const ok = verifyPassword(password, user.passwordHash);
  if (!ok) {
    user.failedLoginCount = (user.failedLoginCount || 0) + 1;
    if (user.failedLoginCount >= MAX_FAILED_LOGINS) {
      user.loginLockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
      audit(db, { tenantId: user.tenantId, actorEmail: user.email, action: 'Account Locked', detail: `${MAX_FAILED_LOGINS} failed login attempts.`, status: 'error' });
    } else {
      audit(db, { tenantId: user.tenantId, actorEmail: user.email, action: 'Login Failed', detail: `Failed attempt ${user.failedLoginCount}/${MAX_FAILED_LOGINS}.`, status: 'error' });
    }
    writeDb(db);
    return res.status(401).json({ error: 'Invalid login details' });
  }

  if (user.status !== 'Active') return res.status(403).json({ error: 'Account is not active' });
  if (user.role !== 'SuperAdmin') {
    const school = db.schools.find(candidate => candidate.id === user.tenantId);
    if (!school || school.status !== 'Active') return res.status(403).json({ error: 'School account is suspended' });
  }

  user.failedLoginCount = 0;
  user.loginLockedUntil = undefined;
  user.lastLogin = nowIso();
  const { token, expiresAt } = createSession(db, user);
  audit(db, { tenantId: user.tenantId, actorId: user.id, actorEmail: user.email, action: 'Login Success', detail: 'Backend session issued.', status: 'success' });
  writeDb(db);
  res.cookie(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', expires: new Date(expiresAt) });
  res.json({ token, expiresAt, user: publicUser(user) });
});

app.get('/api/auth/session', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user), expiresAt: req.session.expiresAt });
});

app.post('/api/auth/logout', (req, res) => {
  const db = readDb();
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE] || String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    db.sessions = db.sessions.filter(session => session.tokenHash !== tokenHash);
    writeDb(db);
  }
  res.clearCookie(SESSION_COOKIE);
  res.json({ ok: true });
});

app.post('/api/auth/request-reset', (req, res) => {
  const db = readDb();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const school = findSchool(db, req.body?.schoolId || req.body?.schoolCode);
  const user = db.users.find(candidate => candidate.email.toLowerCase() === email && (!school || candidate.tenantId === school.id));
  if (!user) return res.json({ ok: true, message: 'If the account exists, a reset request was recorded.' });
  const code = String(crypto.randomInt(100000, 999999));
  db.passwordResets.unshift({ id: id('reset'), tenantId: user.tenantId, userId: user.id, email: user.email, codeHash: hashPassword(code), status: 'Pending', expiresAt: new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000).toISOString(), createdAt: nowIso() });
  audit(db, { tenantId: user.tenantId, actorEmail: user.email, action: 'Password Reset Requested', detail: 'Reset code generated for manager-approved delivery.', status: 'warning' });
  writeDb(db);
  res.json({ ok: true, message: 'Reset request recorded.', demoCode: process.env.NODE_ENV === 'production' ? undefined : code });
});

app.post('/api/auth/confirm-reset', (req, res) => {
  const db = readDb();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.code || '');
  const newPassword = String(req.body?.newPassword || '');
  const reset = db.passwordResets.find(item => item.email.toLowerCase() === email && item.status === 'Pending');
  if (!reset || new Date(reset.expiresAt).getTime() <= Date.now() || !verifyPassword(code, reset.codeHash)) return res.status(400).json({ error: 'Reset code is invalid or expired' });
  if (!/(?=.{8,})(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(newPassword)) return res.status(400).json({ error: 'Password needs 8+ characters, uppercase, number, and special character.' });
  const user = db.users.find(candidate => candidate.id === reset.userId);
  if (!user) return res.status(404).json({ error: 'Account not found' });
  user.passwordHash = hashPassword(newPassword);
  user.failedLoginCount = 0;
  user.loginLockedUntil = undefined;
  reset.status = 'Used';
  reset.usedAt = nowIso();
  audit(db, { tenantId: user.tenantId, actorEmail: user.email, action: 'Password Reset Completed', detail: 'Password changed through backend reset code.', status: 'success' });
  writeDb(db);
  res.json({ ok: true });
});

app.get('/api/authorize/:tab', requireAuth, requireTab(req => req.params.tab), (req, res) => {
  res.json({ ok: true, role: req.user.role, tab: req.params.tab });
});

app.get('/api/schools', requireAuth, requireRole('SuperAdmin'), (req, res) => {
  res.json({ schools: req.db.schools });
});

app.get('/api/schools/:tenantId/:area', requireAuth, requireTenantAccess, (req, res) => {
  const table = tableForArea(req.db, req.params.area);
  if (!table) return res.status(404).json({ error: 'Unknown table area' });
  let rows = table.filter(item => item.tenantId === req.params.tenantId || req.params.area === 'schools');
  if (req.user.role === 'Parent') {
    const childIds = req.user.linkedStudentIds?.length ? req.user.linkedStudentIds : req.user.linkedStudentId ? [req.user.linkedStudentId] : [];
    rows = rows.filter(item => childIds.includes(item.studentId) || childIds.includes(item.id) || childIds.includes(item.linkedStudentId));
  }
  if (req.user.role === 'Student') {
    rows = rows.filter(item => item.studentId === req.user.linkedStudentId || item.id === req.user.linkedStudentId);
  }
  res.json({ rows });
});

app.post('/api/schools/:tenantId/users', requireAuth, requireRole('SuperAdmin', 'SchoolAdmin', 'AssistantAdmin'), requireTenantAccess, (req, res) => {
  const allowed = ['SchoolAdmin', 'AssistantAdmin', 'Supervisor', 'Accountant', 'Teacher', 'Parent', 'Student'];
  const role = req.body?.role;
  if (!allowed.includes(role)) return res.status(400).json({ error: 'Unsupported role' });
  const tempPassword = req.body?.temporaryPassword || `Edu@${crypto.randomInt(100000, 999999)}`;
  const user = {
    id: id('user'),
    tenantId: req.params.tenantId,
    name: String(req.body?.name || '').trim(),
    email: String(req.body?.email || '').trim().toLowerCase(),
    role,
    status: req.body?.status || 'Active',
    linkedTeacherId: req.body?.linkedTeacherId,
    linkedStudentId: req.body?.linkedStudentId,
    linkedStudentIds: req.body?.linkedStudentIds || undefined,
    passwordHash: hashPassword(tempPassword),
    mustChangePassword: true,
    failedLoginCount: 0,
    createdBy: req.user.email,
    createdAt: nowIso(),
  };
  if (!user.name || !user.email) return res.status(400).json({ error: 'Name and email are required' });
  if (req.db.users.some(item => item.tenantId === user.tenantId && item.email === user.email)) return res.status(409).json({ error: 'Email already exists in this school' });
  req.db.users.push(user);
  audit(req.db, { tenantId: user.tenantId, actorId: req.user.id, actorEmail: req.user.email, action: 'User Created', detail: `${role} login created for ${user.email}.`, status: 'success' });
  writeDb(req.db);
  res.status(201).json({ user: publicUser(user), temporaryPassword: tempPassword });
});

app.post('/api/schools/:tenantId/delivery', requireAuth, requireRole('SuperAdmin', 'SchoolAdmin', 'AssistantAdmin'), requireTenantAccess, (req, res) => {
  const provider = process.env.DELIVERY_PROVIDER || 'queue-only';
  const providerConfigured = Boolean(process.env.DELIVERY_API_KEY || process.env.SENDGRID_API_KEY || process.env.TWILIO_AUTH_TOKEN || process.env.WHATSAPP_TOKEN);
  const message = {
    id: id('delivery'),
    tenantId: req.params.tenantId,
    channel: req.body?.channel || 'email',
    to: req.body?.to,
    body: req.body?.body,
    provider,
    status: providerConfigured ? 'ProviderReady' : 'Queued',
    createdBy: req.user.email,
    createdAt: nowIso()
  };
  req.db.deliveryQueue.unshift(message);
  audit(req.db, { tenantId: req.params.tenantId, actorId: req.user.id, actorEmail: req.user.email, action: 'Delivery Queued', detail: `${message.channel} message queued for ${message.to} through ${provider}.`, status: 'success' });
  writeDb(req.db);
  res.status(202).json({ ok: true, message });
});

app.post('/api/schools/:tenantId/archive', requireAuth, requireRole('SuperAdmin', 'SchoolAdmin'), requireTenantAccess, (req, res) => {
  const archive = { id: id('archive'), tenantId: req.params.tenantId, academicYear: req.body?.academicYear || 'Current Year', period: req.body?.period || 'Current Period', snapshot: req.body?.snapshot || {}, createdBy: req.user.email, createdAt: nowIso() };
  req.db.archives.unshift(archive);
  audit(req.db, { tenantId: req.params.tenantId, actorId: req.user.id, actorEmail: req.user.email, action: 'Academic Archive Created', detail: `${archive.academicYear} ${archive.period} archived.`, status: 'success' });
  writeDb(req.db);
  res.status(201).json({ archive });
});

app.post('/api/migration/browser-export', requireAuth, requireRole('SuperAdmin'), (req, res) => {
  const db = req.db;
  const tables = req.body?.tables || {};
  const importable = ['schools', 'users', 'students', 'teachers', 'fees', 'materials', 'assignments', 'audits', 'archives'];
  const stats = {};
  for (const tableName of importable) {
    if (!Array.isArray(tables[tableName])) continue;
    const existing = new Set(db[tableName].map(item => item.id));
    const rows = tables[tableName].filter(item => item?.id && !existing.has(item.id));
    db[tableName].push(...rows);
    stats[tableName] = rows.length;
  }
  audit(db, { tenantId: 'GLOBAL', actorId: req.user.id, actorEmail: req.user.email, action: 'Browser Data Migrated', detail: JSON.stringify(stats), status: 'success' });
  writeDb(db);
  res.json({ ok: true, imported: stats });
});

app.get('/api/audit', requireAuth, (req, res) => {
  const tenantId = req.query.tenantId;
  let rows = req.db.audits;
  if (req.user.role !== 'SuperAdmin') rows = rows.filter(item => item.tenantId === req.user.tenantId);
  if (tenantId && req.user.role === 'SuperAdmin') rows = rows.filter(item => item.tenantId === tenantId);
  res.json({ rows: rows.slice(0, 200) });
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use((error, req, res, _next) => {
  console.error(error);
  if (req.path.startsWith('/api')) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
    return;
  }
  res.status(500).send(process.env.NODE_ENV === 'production' ? 'Server error' : error.stack);
});

app.listen(PORT, () => {
  readDb();
  console.log(`EduCore production server running at http://localhost:${PORT}`);
  console.log(`Database file: ${DB_FILE}`);
});
