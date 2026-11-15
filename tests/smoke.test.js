import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderApp } from '../src/app.js';
import { frames } from '../src/data/seed.js';
import { renderCalibratedTryOnPage } from '../src/features/tryon/calibratedTryOn.js';
import { renderHomePage } from '../src/features/storefront/pages.js';
import { renderTryOnPage } from '../src/features/tryon/tryon.js';

test('renders the demo merchant name', () => {
  const markup = renderApp();
  assert.match(markup, /丹阳眼镜样板店/);
});

test('exposes the merchant theme token in the app shell', () => {
  const markup = renderApp();
  assert.match(markup, /--tenant-theme:#b87855/);
});

test('renders the reference-card calibration entry points', () => {
  const markup = renderCalibratedTryOnPage({ frame: frames[0], frames });
  assert.match(markup, /输入 PD/);
  assert.match(markup, /标准参考卡片/);
  assert.match(markup, /85\.6/);
});

test('renders the editorial technology home hierarchy', () => {
  const markup = renderHomePage({ tenant: { name: '丹阳眼镜样板店', subtitle: '源头镜框精选 · 先试戴，再决定' }, frames });
  assert.match(markup, /先量尺寸，/);
  assert.match(markup, /再试戴。/);
  assert.match(markup, /home-metric-grid/);
});

test('renders live try-on instrumentation labels', () => {
  const markup = renderTryOnPage({ frame: frames[0], frames });
  assert.match(markup, /LIVE/);
  assert.match(markup, /frame-measurement/);
});

test('cache-busts the refreshed visual assets', () => {
  const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(index, /styles\.css\?v=visual-refresh/);
  assert.match(index, /app\.js\?v=visual-refresh/);
});
