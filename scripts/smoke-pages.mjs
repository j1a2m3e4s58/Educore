import { chromium } from 'playwright';

const baseUrl = process.env.SMOKE_URL || 'http://127.0.0.1:3000/';
const pages = [
  { name: 'Dashboard', label: 'Dashboard' },
  { name: 'Teachers', label: 'Teachers' },
  { name: 'Students', label: 'Students' },
  { name: 'Classes', label: 'Classes' },
  { name: 'Fees', label: 'Fees' },
  { name: 'Messages', label: 'Messages' },
  { name: 'Calendar', label: 'Calendar' },
  { name: 'Teacher Review', label: 'Teacher Review' }
];

const session = {
  userId: 'user_admin_central',
  tenantId: 'school_central_crest',
  role: 'SchoolAdmin',
  email: 's.jenkins@centralcrest.edu',
  issuedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
};

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true }).catch(async () => {
  return chromium.launch({ headless: true });
});

const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });
const errors = [];

page.on('console', msg => {
  if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
    errors.push(`console error: ${msg.text()}`);
  }
});
page.on('pageerror', error => errors.push(`page error: ${error.message}`));

await page.addInitScript(({ session }) => {
  localStorage.setItem('educore_portal_session', JSON.stringify(session));
}, { session });

async function dismissOverlays() {
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('.fixed.inset-0.z-50').forEach(el => el.remove());
  }).catch(() => {});
  const closeButtons = [
    page.getByRole('button', { name: /close/i }).first(),
    page.getByRole('button', { name: /skip/i }).first(),
    page.getByRole('button', { name: /not now/i }).first(),
    page.getByRole('button', { name: /got it/i }).first(),
    page.getByRole('button', { name: /show tools/i }).first()
  ];
  for (const button of closeButtons) {
    if (await button.count().catch(() => 0)) {
      await button.click({ timeout: 1000 }).catch(() => {});
    }
  }
}

async function assertNotBlank(pageName) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(450);
  const bodyText = (await page.locator('body').innerText().catch(() => '')).trim();
  const rootChildren = await page.locator('#root > *').count().catch(() => 0);
  if (bodyText.length < 40 || rootChildren === 0) {
    throw new Error(`${pageName} rendered blank or almost blank. Text length: ${bodyText.length}, root children: ${rootChildren}`);
  }
  const recoveryPanel = await page.getByText('Page recovered safely').count().catch(() => 0);
  if (recoveryPanel > 0) {
    throw new Error(`${pageName} hit the error boundary.`);
  }
}

await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
await dismissOverlays();
await assertNotBlank('Initial dashboard');

for (const target of pages) {
  await dismissOverlays();
  const locator = page.getByText(target.label, { exact: true }).first();
  await locator.click({ timeout: 5000 }).catch(async () => {
    await page.getByRole('button', { name: target.label }).first().click({ timeout: 5000 });
  });
  await dismissOverlays();
  await assertNotBlank(target.name);
  console.log(`OK ${target.name}`);
}

await browser.close();

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Smoke pages passed');
