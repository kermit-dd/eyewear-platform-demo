# 试戴素材规范

每个镜框 SKU 需要同时维护商品数据和试戴素材。

## 必填商品尺寸

- 镜片宽 `lensWidth`
- 鼻梁宽 `bridgeWidth`
- 镜片高 `lensHeight`
- 镜腿长 `templeLength`
- 镜框总宽 `frameWidth`

## SVG 素材

- 透明背景，正面视角。
- 画布比例建议接近 300 × 110。
- 镜框中心对齐画布中心。
- 使用单色或少量颜色，方便快速替换。
- 文件放在 `assets/frames/`。

## GLB 素材

后续接入 GLB 时，在 SKU 上配置：

```js
tryOnAsset: {
  kind: 'glb',
  url: '/assets/frames/example.glb',
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
}
```

`scale`、`offsetX`、`offsetY` 和 `rotation` 会影响镜框与眼睛关键点的相对位置。每个镜框上线前至少用正脸、轻微左右转头两种姿态检查。
