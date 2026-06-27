import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'deploy', 'educore-production');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) copyRecursive(path.join(src, entry), path.join(dest, entry));
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

copyRecursive(path.join(root, 'dist'), path.join(outDir, 'dist'));
for (const file of ['server.js', 'package.json', 'package-lock.json', '.env.example', 'DEPLOYMENT.md', 'TESTING.md', 'RELEASE_NOTES.md', 'README.md']) {
  const src = path.join(root, file);
  if (fs.existsSync(src)) copyRecursive(src, path.join(outDir, file));
}
copyRecursive(path.join(root, 'scripts', 'production-schema.sql'), path.join(outDir, 'scripts', 'production-schema.sql'));
copyRecursive(path.join(root, 'scripts', 'browser-migration-export.js'), path.join(outDir, 'scripts', 'browser-migration-export.js'));

fs.mkdirSync(path.join(outDir, 'data'), { recursive: true });
fs.writeFileSync(path.join(outDir, 'data', '.gitkeep'), '');

const manifest = {
  name: 'educore-production',
  createdAt: new Date().toISOString(),
  startCommand: 'npm ci --omit=dev && npm start',
  env: ['PORT', 'NODE_ENV', 'EDUCORE_DATA_DIR', 'SEED_ADMIN_PASSWORD', 'SESSION_TTL_HOURS', 'MAX_FAILED_LOGINS', 'LOCKOUT_MINUTES'],
};
fs.writeFileSync(path.join(outDir, 'deploy-manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`Deployment package ready: ${outDir}`);
