import test from 'node:test';
import assert from 'node:assert/strict';
import { tenant } from '../../src/config/tenant.js';
import { frames } from '../../src/data/seed.js';
import { renderHomePage, renderFrameListPage, renderFrameDetailPage, renderComparePage } from '../../src/features/storefront/pages.js';

test('home page shows merchant and featured frames', () => {
  const html = renderHomePage({ tenant, frames });
  assert.match(html, /丹阳眼镜样板店/);
  assert.match(html, /香槟金细圆框/);
});

test('frame assets resolve from the app base path', () => {
  assert.match(frames[0].imageUrl, /assets\/frames\/gold-metal\.png$/);
  assert.doesNotMatch(frames[0].imageUrl, /^\/assets/);
});

test('frame list shows only the supplied filtered frames', () => {
  const html = renderFrameListPage({ frames: frames.slice(0, 2) });
  assert.match(html, /香槟金细圆框/);
  assert.doesNotMatch(html, /琥珀玳瑁方框/);
});

test('detail page includes frame dimensions and actions', () => {
  const html = renderFrameDetailPage({ frame: frames[0], fit: { label: '尺寸比较合适' } });
  assert.match(html, /镜框总宽/);
  assert.match(html, /开始试戴/);
  assert.match(html, /加入对比/);
});

test('compare page caps the visible list at three frames', () => {
  const html = renderComparePage({ frames });
  assert.equal((html.match(/data-compare-frame/g) ?? []).length, 3);
});
