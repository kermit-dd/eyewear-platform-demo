import { tenant } from '../config/tenant.js';

const frameAssets = {
  goldMetal: { kind: 'image', url: '/assets/frames/gold-metal.png', scale: 1.02, offsetX: 0, offsetY: 0, rotation: 0 },
  tortoiseSquare: { kind: 'image', url: '/assets/frames/tortoise-square.png', scale: 1.02, offsetX: 0, offsetY: 0, rotation: 0 },
  clearAcetate: { kind: 'image', url: '/assets/frames/clear-acetate.png', scale: 1.02, offsetX: 0, offsetY: 0, rotation: 0 },
  burgundyCatEye: { kind: 'image', url: '/assets/frames/burgundy-cat-eye.png', scale: 1.02, offsetX: 0, offsetY: 0, rotation: 0 },
};

const definitions = [
  ['round-01', '香槟金细圆框', '圆框', 199, 50, 19, 43, 140, 138, ['小脸', '复古'], 'goldMetal'],
  ['round-02', '透明轻圆框', '圆框', 239, 51, 18, 42, 140, 140, ['通勤', '轻盈'], 'clearAcetate'],
  ['square-01', '琥珀玳瑁方框', '方框', 259, 53, 18, 42, 145, 144, ['中脸', '通勤'], 'tortoiseSquare'],
  ['square-02', '晶透窄方框', '方框', 299, 52, 17, 40, 140, 138, ['小脸', '利落'], 'clearAcetate'],
  ['square-03', '宽版玳瑁方框', '方框', 329, 55, 19, 44, 145, 150, ['大脸', '显瘦'], 'tortoiseSquare'],
  ['cat-eye-01', '酒红猫眼框', '猫眼', 279, 52, 18, 43, 140, 141, ['中脸', '提气'], 'burgundyCatEye'],
  ['cat-eye-02', '轻盈酒红猫眼', '猫眼', 219, 50, 18, 41, 135, 137, ['小脸', '轻熟'], 'burgundyCatEye'],
  ['metal-01', '香槟金金属框', '金属框', 359, 53, 18, 40, 140, 143, ['中脸', '简洁'], 'goldMetal'],
  ['bold-01', '琥珀厚框', '厚框', 189, 54, 19, 43, 145, 147, ['大脸', '复古'], 'tortoiseSquare'],
  ['clear-01', '水晶透明框', '透明框', 319, 51, 18, 42, 140, 140, ['中脸', '清透'], 'clearAcetate'],
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
