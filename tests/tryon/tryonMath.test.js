import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveFaceAnchor, getFrameTransform } from '../../src/features/tryon/tryonMath.js';

test('derives a stable anchor from the eye line instead of the nose tip', () => {
  const anchor = deriveFaceAnchor({ x: 40, y: 50 }, { x: 80, y: 60 }, { x: 60, y: 70 });
  assert.equal(anchor.centerX, 60);
  assert.equal(anchor.centerY, 55);
  assert.equal(anchor.eyeDistance, 41.23105625617661);
  assert.equal(anchor.roll > 0, true);
});

test('normalizes reversed eye order', () => {
  const anchor = deriveFaceAnchor({ x: 80, y: 60 }, { x: 40, y: 50 }, { x: 60, y: 70 });
  assert.equal(anchor.centerX, 60);
  assert.equal(anchor.eyeDistance, 41.23105625617661);
  assert.equal(anchor.roll > 0, true);
});

test('returns a safe default for zero eye distance', () => {
  const anchor = deriveFaceAnchor({ x: 10, y: 10 }, { x: 10, y: 10 }, null);
  assert.deepEqual(anchor, { centerX: 10, centerY: 10, eyeDistance: 0, roll: 0 });
});

test('uses eye midpoint when nose is unavailable', () => {
  const anchor = deriveFaceAnchor({ x: 20, y: 30 }, { x: 60, y: 30 }, null);
  assert.equal(anchor.centerY, 30);
});

test('maps anchor and asset calibration to a frame transform', () => {
  const transform = getFrameTransform({ centerX: 100, centerY: 80, eyeDistance: 40, roll: 0.2 }, { scale: 1.1, offsetX: 0.1, offsetY: -0.2, rotation: 0.05 });
  assert.equal(transform.width, 88);
  assert.equal(transform.x, 104);
  assert.equal(transform.y, 72);
  assert.equal(transform.rotation, 0.25);
});
