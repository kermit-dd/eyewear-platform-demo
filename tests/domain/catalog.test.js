import test from 'node:test';
import assert from 'node:assert/strict';
import { listFrames } from '../../src/domain/catalog.js';

const frames = [
  { skuId: 'a', tenantId: 'tenant-a', style: '圆框', price: 199, frameWidth: 138 },
  { skuId: 'b', tenantId: 'tenant-a', style: '方框', price: 299, frameWidth: 145 },
  { skuId: 'c', tenantId: 'tenant-b', style: '圆框', price: 99, frameWidth: 130 },
];

test('filters frames by tenant, style, price and width', () => {
  const result = listFrames(frames, {
    tenantId: 'tenant-a',
    style: '圆框',
    maxPrice: 250,
    minFrameWidth: 135,
    maxFrameWidth: 140,
  });
  assert.deepEqual(result.map((frame) => frame.skuId), ['a']);
});

test('returns an empty list for an unknown tenant', () => {
  assert.deepEqual(listFrames(frames, { tenantId: 'tenant-missing' }), []);
});
