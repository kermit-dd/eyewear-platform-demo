import { access } from 'node:fs/promises';

const requiredFiles = [
  'index.html',
  'src/app.js',
  'src/styles.css',
  'src/domain/models.js',
  'src/domain/catalog.js',
  'src/domain/fit.js',
  'src/config/tenant.js',
  'src/data/seed.js',
];

for (const file of requiredFiles) {
  await access(new URL(`../${file}`, import.meta.url));
}
console.log(`Build check passed for ${requiredFiles.length} files.`);
