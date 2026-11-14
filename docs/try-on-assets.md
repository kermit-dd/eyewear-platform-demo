# 试戴素材规范

每个镜框 SKU 需要同时维护商品数据和试戴素材。

## 必填商品尺寸

- 镜片宽 `lensWidth`
- 鼻梁宽 `bridgeWidth`
- 镜片高 `lensHeight`
- 镜腿长 `templeLength`
- 镜框总宽 `frameWidth`

## 透明商品图素材

- 使用透明背景的正面商品图，保留真实材质、镜片反光和镜腿结构。
- 图片内容需要完整覆盖镜框，画布四周保留少量透明留白。
- 镜框中心对齐画布中心。
- 文件放在 `assets/frames/`。
- 当前 H5 Demo 使用 PNG。渲染时按原图宽高比计算显示高度，避免真实镜框被压扁。

当前样例素材：

- `gold-metal.png`：香槟金细金属框
- `tortoise-square.png`：琥珀玳瑁方框
- `clear-acetate.png`：晶透透明框
- `burgundy-cat-eye.png`：酒红猫眼框

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
