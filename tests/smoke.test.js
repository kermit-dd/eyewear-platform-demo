import test from 'node:test';
import assert from 'node:assert/strict';
import { renderApp } from '../src/app.js';
import { frames } from '../src/data/seed.js';
import { renderCalibratedTryOnPage } from '../src/features/tryon/calibratedTryOn.js';

test('renders the demo merchant name', () => {
  const markup = renderApp();
  assert.match(markup, /丹阳眼镜样板店/);
});

test('exposes the merchant theme token in the app shell', () => {
  const markup = renderApp();
  assert.match(markup, /--tenant-theme:#b8643d/);
});

test('renders the reference-card calibration entry points', () => {
  const markup = renderCalibratedTryOnPage({ frame: frames[0], frames });
  assert.match(markup, /输入 PD/);
  assert.match(markup, /标准参考卡片/);
  assert.match(markup, /85\.6/);
});
