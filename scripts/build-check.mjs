import { access } from 'node:fs/promises';

const requiredFiles = [
  'index.html',
  'src/app.js',
  'src/styles.css',
  'src/domain/models.js',
  'src/domain/catalog.js',
  'src/domain/fit.js',
  'src/domain/leads.js',
  'src/config/tenant.js',
  'src/data/seed.js',
  'src/features/storefront/pages.js',
  'src/features/tryon/tryon.js',
  'src/features/tryon/tryonMath.js',
  'src/features/leads/LeadForm.js',
  'src/features/leads/leads.css',
  'assets/frames/gold-metal.png',
  'assets/frames/tortoise-square.png',
  'assets/frames/clear-acetate.png',
  'assets/frames/burgundy-cat-eye.png',
];

for (const file of requiredFiles) {
  await access(new URL(`../${file}`, import.meta.url));
}
console.log(`Build check passed for ${requiredFiles.length} files.`);
