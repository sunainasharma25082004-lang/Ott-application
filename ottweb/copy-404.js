import fs from 'fs';
import path from 'path';

const distIndex = path.join(process.cwd(), 'dist', 'index.html');
const dist404 = path.join(process.cwd(), 'dist', '404.html');

if (fs.existsSync(distIndex)) {
  fs.copyFileSync(distIndex, dist404);
  console.log('Copied dist/index.html -> dist/404.html for static host fallback.');
}
