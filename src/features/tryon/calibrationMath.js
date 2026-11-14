import { calculateFit } from '../../domain/fit.js';

const MIN_PD = 35;
const MAX_PD = 90;

function distance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function sanitizePd(value) {
  const pd = Number(value);
  return Number.isFinite(pd) && pd >= MIN_PD && pd <= MAX_PD ? pd : null;
}

export function estimateMillimetersPerPixel(referenceWidthMm, referenceWidthPx) {
  const widthMm = Number(referenceWidthMm);
  const widthPx = Number(referenceWidthPx);
  if (!Number.isFinite(widthMm) || widthMm <= 0 || !Number.isFinite(widthPx) || widthPx <= 0) return null;
  return widthMm / widthPx;
}

export function estimateFaceMetrics(landmarks, millimetersPerPixel) {
  const scale = Number(millimetersPerPixel);
  const required = [33, 263, 234, 454, 10, 152];
  if (!Array.isArray(landmarks) || !Number.isFinite(scale) || scale <= 0 || required.some((index) => !landmarks[index])) return null;
  const eyeDistanceMm = distance(landmarks[33], landmarks[263]) * scale;
  const faceWidthMm = distance(landmarks[234], landmarks[454]) * scale;
  const faceHeightMm = distance(landmarks[10], landmarks[152]) * scale;
  if (!eyeDistanceMm || !faceWidthMm || !faceHeightMm) return null;
  const ratio = faceWidthMm / faceHeightMm;
  const faceShape = ratio >= 0.98 ? '偏圆脸' : ratio <= 0.78 ? '偏长脸' : '椭圆脸';
  return { eyeDistanceMm, faceWidthMm, faceHeightMm, faceShape };
}

export function rankFramesByFit(frames, faceWidthMm) {
  return [...frames]
    .map((frame, index) => ({ frame, fit: calculateFit(frame, faceWidthMm), index }))
    .sort((left, right) => right.fit.score - left.fit.score || left.index - right.index);
}
