import { tenant } from '../config/tenant.js';

const frameAssets = {
  round: { kind: 'svg', url: '/assets/frames/round.svg', scale: 1, offsetX: 0, offsetY: 0, rotation: 0 },
  square: { kind: 'svg', url: '/assets/frames/square.svg', scale: 1, offsetX: 0, offsetY: 0, rotation: 0 },
  catEye: { kind: 'svg', url: '/assets/frames/cat-eye.svg', scale: 1, offsetX: 0, offsetY: 0, rotation: 0 },
};

const definitions = [
  ['round-01', '复古圆框', '圆框', 199, 50, 19, 43, 140, 138, ['小脸', '复古'], 'round'],
  ['round-02', '轻钛圆框', '圆框', 239, 51, 18, 42, 140, 140, ['通勤', '轻盈'], 'round'],
  ['square-01', '经典方框', '方框', 259, 53, 18, 42, 145, 144, ['中脸', '通勤'], 'square'],
  ['square-02', '窄版方框', '方框', 299, 52, 17, 40, 140, 138, ['小脸', '利落'], 'square'],
  ['square-03', '宽版方框', '方框', 329, 55, 19, 44, 145, 150, ['大脸', '显瘦'], 'square'],
  ['cat-eye-01', '柔和猫眼', '猫眼', 279, 52, 18, 43, 140, 141, ['中脸', '提气'], 'catEye'],
  ['cat-eye-02', '细边猫眼', '猫眼', 219, 50, 18, 41, 135, 137, ['小脸', '轻熟'], 'catEye'],
  ['metal-01', '金属半框', '半框', 359, 53, 18, 40, 140, 143, ['中脸', '简洁'], 'square'],
  ['bold-01', '厚框黑曜', '厚框', 189, 54, 19, 43, 145, 147, ['大脸', '复古'], 'square'],
  ['clear-01', '透明细框', '透明框', 319, 51, 18, 42, 140, 140, ['中脸', '清透'], 'round'],
];

export const frames = definitions.map(([skuId, name, style, price, lensWidth, bridgeWidth, lensHeight, templeLength, frameWidth, fitTags, assetKey]) => ({
  skuId,
  tenantId: tenant.tenantId,
  productId: `product-${skuId}`,
  name,
  style,
  price,
  lensWidth,
  bridgeWidth,
  lensHeight,
  templeLength,
  frameWidth,
  fitTags,
  imageUrl: frameAssets[assetKey].url,
  tryOnAsset: frameAssets[assetKey],
}));
