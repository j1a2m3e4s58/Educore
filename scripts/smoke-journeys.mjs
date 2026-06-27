import { chromium } from 'playwright';

const baseUrl = process.env.SMOKE_URL || 'http://127.0.0.1:3000/';
const tenantId = 'school_central_crest';

const users = {
  manager: {
    userId: 'user_admin_central',
    tenantId,
    role: 'SchoolAdmin',
    email: 's.jenkins@centralcrest.edu'
  },
  teacher: {
    userId: 'user_teacher_central_1',
    tenantId,
    role: 'Teacher',
    email: 'm.brody@centralcrest.edu'
  },
  parent: {
    userId: 'user_parent_central_1',
    tenantId,
    role: 'Parent',
    email: 'r.vance@gmail.com'
  },
  student: {
    userId: 'user_student_central_1',
    tenantId,
    role: 'Student',
    email: 'j.vance@centralcrest.edu'
  }
};

const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
const sessionFor = user => ({
  ...user,
  issuedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
});

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true }).catch(async () => {
  return chromium.launch({ headless: true });
});

const errors = [];

function listenForErrors(page, label) {
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
      errors.push(`${label} console error: ${msg.text()}`);
    }
  });
  page.on('pageerror', error => errors.push(`${label} page error: ${error.message}`));
}

async function seedJourney(page, user) {
  await page.addInitScript(({ session, tenantId, todayName }) => {
    const now = new Date().toISOString();
    localStorage.setItem('educore_portal_session', JSON.stringify(session));
    localStorage.setItem(`educore_timetable_status_${tenantId}`, 'published');
    localStorage.setItem(`educore_subjects_${tenantId}`, JSON.stringify([
      { id: 'subj_math', tenantId, name: 'Mathematics', code: 'MATH101', createdAt: now },
      { id: 'subj_science', tenantId, name: 'Integrated Science', code: 'SCI101', createdAt: now },
      { id: 'subj_ict', tenantId, name: 'Information & Comm. Technology', code: 'ICT101', createdAt: now },
      { id: 'subj_english', tenantId, name: 'English Language', code: 'ENG101', createdAt: now }
    ]));
    localStorage.setItem(`educore_classes_${tenantId}`, JSON.stringify([
      { id: 'class_b1', tenantId, name: 'Basic 1', classTeacherId: 'tch_mbrody', subjectIds: ['subj_english', 'subj_math'], createdAt: now },
      { id: 'class_jhs1', tenantId, name: 'JHS 1', classTeacherId: 'tch_mbrody', subjectIds: ['subj_math', 'subj_science', 'subj_ict', 'subj_english'], createdAt: now }
    ]));
    localStorage.setItem(`educore_teachers_${tenantId}`, JSON.stringify([
      {
        id: 'tch_mbrody',
        tenantId,
        fullName: 'Marcus Brody',
        staffId: 'TCH-001',
        phone: '+1 (617) 555-2211',
        email: 'm.brody@centralcrest.edu',
        gender: 'Male',
        departmentId: 'dept_science',
        subjectsTaught: ['subj_math', 'subj_science', 'subj_ict'],
        assignedClasses: ['class_b1', 'class_jhs1'],
        primaryAllSubjects: true,
        teachingSchedule: [
          { id: 'smoke_today_math', classId: 'class_jhs1', subjectId: 'subj_math', day: todayName, startTime: '08:00', endTime: '09:00' },
          { id: 'smoke_today_science', classId: 'class_b1', subjectId: 'subj_science', day: todayName, startTime: '10:00', endTime: '11:00' }
        ],
        employmentStatus: 'Active',
        profilePhoto: '',
        createdAt: now
      }
    ]));
  }, { session: sessionFor(user), tenantId, todayName });
}

async function newSeededPage(user, viewport = { width: 1365, height: 768 }, label = user.role) {
  const page = await browser.newPage({ viewport });
  listenForErrors(page, label);
  await seedJourney(page, user);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await dismissOverlays(page);
  await assertHealthy(page, `${label} initial load`);
  return page;
}

async function dismissOverlays(page) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('.fixed.inset-0.z-50').forEach(el => el.remove());
  }).catch(() => {});
  for (const matcher of [/close/i, /skip/i, /not now/i, /got it/i, /show tools/i]) {
    const button = page.getByRole('button', { name: matcher }).first();
    if (await button.count().catch(() => 0)) {
      await button.click({ timeout: 1000 }).catch(() => {});
    }
  }
}

async function assertHealthy(page, label) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(450);
  const bodyText = (await page.locator('body').innerText().catch(() => '')).trim();
  const rootChildren = await page.locator('#root > *').count().catch(() => 0);
  if (bodyText.length < 40 || rootChildren === 0) {
    throw new Error(`${label} rendered blank or almost blank. Text length: ${bodyText.length}, root children: ${rootChildren}`);
  }
  if (await page.getByText('Page recovered safely').count().catch(() => 0)) {
    throw new Error(`${label} hit the error boundary.`);
  }
}

async function expectVisibleText(page, matcher, label) {
  await dismissOverlays(page);
  await page.getByText(matcher).first().waitFor({ state: 'visible', timeout: 6000 });
  await assertHealthy(page, label);
}

async function clickNav(page, tab, label) {
  await dismissOverlays(page);
  const clicked = await page.evaluate(tab => {
    const byId = document.querySelector(`#sidebar-nav-${tab}`);
    if (byId instanceof HTMLElement) {
      byId.click();
      return true;
    }
    const byData = document.querySelector(`[data-tab="${tab}"]`);
    if (byData instanceof HTMLElement) {
      byData.click();
      return true;
    }
    return false;
  }, tab);
  if (!clicked) {
    throw new Error(`${label}: could not find navigation target ${tab}`);
  }
  await page.waitForTimeout(500);
  await dismissOverlays(page);
  await assertHealthy(page, label);
  await assertWorkspaceFocused(page, label);
}

async function assertWorkspaceFocused(page, label) {
  const focusState = await page.evaluate(() => {
    const area = document.querySelector('.app-content');
    const target = document.getElementById('page-live-content');
    if (!(area instanceof HTMLElement) || !(target instanceof HTMLElement)) {
      return { ok: false, reason: 'missing scroll area or workspace target' };
    }
    const areaRect = area.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const distance = Math.abs(targetRect.top - areaRect.top);
    const canScroll = area.scrollHeight > area.clientHeight + 20;
    return {
      ok: !canScroll || distance < 180 || area.scrollTop > 80,
      reason: `distance=${Math.round(distance)}, scrollTop=${Math.round(area.scrollTop)}, canScroll=${canScroll}`
    };
  });
  if (!focusState.ok) {
    throw new Error(`${label}: navigation did not land near the page workspace (${focusState.reason}).`);
  }
}

async function assertSectionFocused(page, sectionId, label) {
  await page.waitForFunction(id => document.getElementById(id), sectionId, { timeout: 6000 });
  await page.waitForTimeout(900);
  const focusState = await page.evaluate(sectionId => {
    const area = document.querySelector('.app-content');
    const target = document.getElementById(sectionId);
    if (!(area instanceof HTMLElement) || !(target instanceof HTMLElement)) {
      return { ok: false, reason: `missing ${sectionId}` };
    }
    const areaRect = area.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const distance = Math.abs(targetRect.top - areaRect.top);
    const highlighted = target.classList.contains('section-jump-highlight');
    const canScroll = area.scrollHeight > area.clientHeight + 20;
    return {
      ok: !canScroll || distance < 220 || highlighted || area.scrollTop > 80,
      reason: `section=${sectionId}, distance=${Math.round(distance)}, scrollTop=${Math.round(area.scrollTop)}, highlighted=${highlighted}`
    };
  }, sectionId);
  if (!focusState.ok) {
    throw new Error(`${label}: navigation did not land near ${sectionId} (${focusState.reason}).`);
  }
}

async function runManagerJourney() {
  const page = await newSeededPage(users.manager, { width: 1365, height: 768 }, 'Manager journey');
  await expectVisibleText(page, /Central Crest Collegiate|School Home/i, 'Manager dashboard');
  await expectVisibleText(page, /ready to sync|saved on this device/i, 'Manager offline sync status');
  await expectVisibleText(page, /Start with these/i, 'Manager role home actions');
  await expectVisibleText(page, /Manager workflow summary/i, 'Manager workflow summary');
  await expectVisibleText(page, /Average score|Work not done today|Export CSV/i, 'Manager workflow controls');
  await clickNav(page, 'school-teachers', 'Manager teachers page');
  await expectVisibleText(page, /Teacher & Class Timetable/i, 'Manager timetable view');
  await assertSectionFocused(page, 'timetable-section', 'Manager timetable section jump');
  await expectVisibleText(page, /Publish Status/i, 'Manager publish status');
  await expectVisibleText(page, /Daily Manager Summary/i, 'Manager workload summary');
  await clickNav(page, 'school-review', 'Manager review page');
  await expectVisibleText(page, /Teacher Performance|Attendance Audit|Faculty Performance/i, 'Manager review tools');
  await page.close();
  console.log('OK Manager journey');
}

async function runTeacherJourney() {
  const page = await newSeededPage(users.teacher, { width: 1365, height: 768 }, 'Teacher journey');
  await expectVisibleText(page, /Today's Teaching Periods/i, 'Teacher timetable');
  await expectVisibleText(page, /Start attendance, lessons, materials, or assignments/i, 'Teacher timetable actions');
  await expectVisibleText(page, /Continue where you stopped/i, 'Teacher continue workflow');
  await clickNav(page, 'teacher-attendance', 'Teacher attendance page');
  await expectVisibleText(page, /Classroom Attendance Ledger|Attendance/i, 'Teacher attendance');
  await assertSectionFocused(page, 'attendance-section', 'Teacher attendance section jump');
  await expectVisibleText(page, /Mark done|Done/i, 'Teacher attendance done button');
  await page.getByRole('button', { name: /Mark done/i }).first().click().catch(() => {});
  await page.getByRole('button', { name: /^Done$/i }).first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
  const auditRecord = await page.evaluate(() => {
    return (localStorage.getItem('educore_activity_logs') || '').includes('Workflow Completed');
  });
  if (!auditRecord) throw new Error('Teacher workflow Done action did not create an audit log.');
  await clickNav(page, 'teacher-lessons', 'Teacher lesson page');
  await expectVisibleText(page, /Daily Lesson Outlines & Logs/i, 'Teacher lesson records');
  await clickNav(page, 'teacher-materials', 'Teacher materials page');
  await expectVisibleText(page, /Curriculum Documents & Teaching Materials/i, 'Teacher materials');
  await assertSectionFocused(page, 'materials-section', 'Teacher materials section jump');
  await clickNav(page, 'teacher-assignments', 'Teacher assignments page');
  await expectVisibleText(page, /Homework & Course Assignments/i, 'Teacher assignments');
  await assertSectionFocused(page, 'assignments-section', 'Teacher assignments section jump');
  await page.close();
  console.log('OK Teacher journey');
}

async function runParentJourney() {
  const page = await newSeededPage(users.parent, { width: 1365, height: 768 }, 'Parent journey');
  await expectVisibleText(page, /Published Class Timetable/i, 'Parent timetable');
  await assertSectionFocused(page, 'timetable-section', 'Parent timetable section');
  await page.getByRole('button', { name: /Assignments & Card Results/i }).click();
  await expectVisibleText(page, /Current Homework Assignments|Assignments & Card Results/i, 'Parent assignments');
  await assertSectionFocused(page, 'assignments-section', 'Parent assignments section jump');
  await page.getByRole('button', { name: /Invoices & Tuition Payments/i }).click();
  await expectVisibleText(page, /Invoices & Tuition Payments|Tuition/i, 'Parent fees');
  await assertSectionFocused(page, 'fees-section', 'Parent fees section jump');
  await page.getByRole('button', { name: /School News & Overview/i }).click();
  await expectVisibleText(page, /Institutional Alerts & Bulletin Board/i, 'Parent messages');
  await page.close();
  console.log('OK Parent journey');
}

async function runStudentJourney() {
  const page = await newSeededPage(users.student, { width: 1365, height: 768 }, 'Student journey');
  await expectVisibleText(page, /Weekly Timetable Matrix/i, 'Student timetable');
  await assertSectionFocused(page, 'timetable-section', 'Student timetable section');
  await page.getByRole('button', { name: /School Assignments/i }).click();
  await expectVisibleText(page, /School Assignments/i, 'Student assignments');
  await assertSectionFocused(page, 'assignments-section', 'Student assignments section jump');
  await page.getByRole('button', { name: /Curriculum Core Materials/i }).click();
  await expectVisibleText(page, /Curriculum Core Materials/i, 'Student materials');
  await assertSectionFocused(page, 'materials-section', 'Student materials section jump');
  await expectVisibleText(page, /AI Revision summaries/i, 'Student AI revision');
  await page.close();
  console.log('OK Student journey');
}

async function runMobileJourney() {
  const manager = await newSeededPage(users.manager, { width: 375, height: 667 }, 'Mobile manager journey');
  await clickNav(manager, 'school-teachers', 'Mobile manager teachers');
  await expectVisibleText(manager, /Teacher & Class Timetable/i, 'Mobile teachers view');
  await manager.close();

  const teacher = await newSeededPage(users.teacher, { width: 375, height: 667 }, 'Mobile teacher journey');
  await expectVisibleText(teacher, /Today's Teaching Periods/i, 'Mobile teacher dashboard');
  await clickNav(teacher, 'teacher-materials', 'Mobile teacher materials');
  await expectVisibleText(teacher, /Curriculum Documents & Teaching Materials/i, 'Mobile materials view');
  await assertSectionFocused(teacher, 'materials-section', 'Mobile teacher materials section jump');
  await teacher.close();

  const parent = await newSeededPage(users.parent, { width: 375, height: 667 }, 'Mobile parent journey');
  await expectVisibleText(parent, /Published Class Timetable|Current Homework Assignments/i, 'Mobile parent view');
  await parent.close();

  const student = await newSeededPage(users.student, { width: 375, height: 667 }, 'Mobile student journey');
  await expectVisibleText(student, /Weekly Timetable Matrix|School Assignments/i, 'Mobile student view');
  await student.close();
  console.log('OK Mobile journeys');
}

try {
  await runManagerJourney();
  await runTeacherJourney();
  await runParentJourney();
  await runStudentJourney();
  await runMobileJourney();
} finally {
  await browser.close();
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Smoke journeys passed');
