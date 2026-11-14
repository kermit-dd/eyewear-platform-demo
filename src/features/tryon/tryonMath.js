export function deriveFaceAnchor(leftEye, rightEye, nose) {
  if (!leftEye || !rightEye) return { centerX: 0, centerY: 0, eyeDistance: 0, roll: 0 };
  const eyes = [leftEye, rightEye].sort((left, right) => left.x - right.x);
  const [left, right] = eyes;
  const dx = right.x - left.x;
  const dy = right.y - left.y;
  const eyeDistance = Math.hypot(dx, dy);
  const centerX = (left.x + right.x) / 2;
  const centerY = nose && Number.isFinite(nose.y) ? nose.y : (left.y + right.y) / 2;
  if (!eyeDistance) return { centerX, centerY, eyeDistance: 0, roll: 0 };
  return { centerX, centerY, eyeDistance, roll: Math.atan2(dy, dx) };
}

export function getFrameTransform(anchor, asset = {}) {
  const scale = Number.isFinite(asset.scale) ? asset.scale : 1;
  const offsetX = Number.isFinite(asset.offsetX) ? asset.offsetX : 0;
  const offsetY = Number.isFinite(asset.offsetY) ? asset.offsetY : 0;
  const rotation = Number.isFinite(asset.rotation) ? asset.rotation : 0;
  const width = anchor.eyeDistance * 2 * scale;
  return {
    x: anchor.centerX + anchor.eyeDistance * offsetX,
    y: anchor.centerY + anchor.eyeDistance * offsetY,
    width,
    rotation: anchor.roll + rotation,
  };
}
