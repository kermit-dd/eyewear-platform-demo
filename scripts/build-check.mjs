import { access } from 'node:fs/promises';

const requiredFiles = ['index.html', 'src/app.js', 'src/styles.css'];
for (const file of requiredFiles) {
  await access(new URL(`../${file}`, import.meta.url));
}
console.log(`Build check passed for ${requiredFiles.length} files.`);
