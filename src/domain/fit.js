const UNKNOWN = { level: 'unknown', label: '暂无法判断', score: 0 };

export function calculateFit(frame, faceWidth) {
  const frameWidth = Number(frame?.frameWidth);
  const normalizedFaceWidth = Number(faceWidth);
  if (!Number.isFinite(frameWidth) || frameWidth <= 0 || !Number.isFinite(normalizedFaceWidth) || normalizedFaceWidth <= 0) {
    return { ...UNKNOWN };
  }

  const difference = frameWidth - normalizedFaceWidth;
  const score = Math.max(0, Math.min(1, 1 - Math.abs(difference) / 50));
  if (difference >= 12) return { level: 'wide', label: '镜框可能偏宽', score };
  if (difference <= -12) return { level: 'tight', label: '镜框可能偏紧', score };
  return { level: 'recommended', label: '尺寸比较合适', score };
}
