import fs from 'node:fs';
import path from 'node:path';

const swPath = path.join(process.cwd(), 'public', 'sw.js');
const buildHash = process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || Date.now().toString(36);
const cacheName = `docvault-app-shell-v2-${buildHash}`;

if (fs.existsSync(swPath)) {
  let content = fs.readFileSync(swPath, 'utf8');
  content = content.replace(/const CACHE_NAME = ['"].*?['"];/, `const CACHE_NAME = '${cacheName}';`);
  fs.writeFileSync(swPath, content, 'utf8');
  console.log(`[generate-sw] Updated public/sw.js CACHE_NAME to: ${cacheName}`);
} else {
  console.error(`[generate-sw] Could not find ${swPath}`);
}
