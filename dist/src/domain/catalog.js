export function listFrames(frames, filter) {
  return frames
    .filter((frame) => frame.tenantId === filter.tenantId)
    .filter((frame) => !filter.style || frame.style === filter.style)
    .filter((frame) => filter.maxPrice === undefined || frame.price <= filter.maxPrice)
    .filter((frame) => filter.minFrameWidth === undefined || frame.frameWidth >= filter.minFrameWidth)
    .filter((frame) => filter.maxFrameWidth === undefined || frame.frameWidth <= filter.maxFrameWidth)
    .sort((left, right) => left.price - right.price);
}
