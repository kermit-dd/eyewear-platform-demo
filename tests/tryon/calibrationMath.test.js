import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePd,
  estimateMillimetersPerPixel,
  estimateFaceMetrics,
  rankFramesByFit,
} from '../../src/features/tryon/calibrationMath.js';

test('accepts a realistic PD and rejects unsafe values', () => {
  assert.equal(sanitizePd('63.5'), 63.5);
  assert.equal(sanitizePd(''), null);
  assert.equal(sanitizePd('120'), null);
});

test('converts a reference card width into millimeters per pixel', () => {
  assert.ok(Math.abs(estimateMillimetersPerPixel(85.6, 320) - 0.2675) < 1e-9);
  assert.equal(estimateMillimetersPerPixel(0, 320), null);
  assert.equal(estimateMillimetersPerPixel(85.6, 0), null);
});

test('derives eye distance, face width, height and shape from landmarks', () => {
  const landmarks = [];
  landmarks[33] = { x: 100, y: 120 };
  landmarks[263] = { x: 220, y: 120 };
  landmarks[234] = { x: 50, y: 180 };
  landmarks[454] = { x: 270, y: 180 };
  landmarks[10] = { x: 160, y: 40 };
  landmarks[152] = { x: 160, y: 280 };
  const result = estimateFaceMetrics(landmarks, 0.5);
  assert.deepEqual(result, {
    eyeDistanceMm: 60,
    faceWidthMm: 110,
    faceHeightMm: 120,
    faceShape: '椭圆脸',
  });
});

test('returns no metrics when required landmarks are missing', () => {
  assert.equal(estimateFaceMetrics([], 0.5), null);
});

test('ranks frames by their fit score for the measured face width', () => {
  const frames = [
    { skuId: 'wide', frameWidth: 160 },
    { skuId: 'match', frameWidth: 140 },
    { skuId: 'tight', frameWidth: 120 },
  ];
  const result = rankFramesByFit(frames, 140);
  assert.equal(result[0].frame.skuId, 'match');
  assert.equal(result.at(-1).frame.skuId, 'tight');
  assert.equal(result[0].fit.level, 'recommended');
});
