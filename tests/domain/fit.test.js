import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFit } from '../../src/domain/fit.js';

const frame = {
  frameWidth: 140,
  lensWidth: 52,
  bridgeWidth: 18,
  lensHeight: 42,
  templeLength: 140,
};

test('returns recommended for a close face-width match', () => {
  const result = calculateFit(frame, 139);
  assert.equal(result.level, 'recommended');
  assert.equal(Number.isFinite(result.score), true);
});

test('returns tight or wide for a meaningful mismatch', () => {
  assert.equal(calculateFit(frame, 125).level, 'wide');
  assert.equal(calculateFit(frame, 158).level, 'tight');
});

test('returns unknown for missing or invalid dimensions', () => {
  assert.equal(calculateFit({ frameWidth: 0 }, 140).level, 'unknown');
  assert.equal(calculateFit(frame, null).level, 'unknown');
  assert.equal(calculateFit(frame, Number.NaN).level, 'unknown');
});
