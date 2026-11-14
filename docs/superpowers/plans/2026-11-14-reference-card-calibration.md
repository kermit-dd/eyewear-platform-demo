# 标准参考卡片校准试戴 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为现有单商户 H5 Demo 增加第二种试戴模式，支持输入 PD 或使用标准参考卡片完成相对尺寸校准，并依据测量结果推荐镜框。

**Architecture:** 保留现有实时摄像头直接试戴流程，新增独立的校准试戴页面和纯函数测量模块。校准页复用 MediaPipe 人脸关键点和现有镜框图片叠加逻辑，参考卡片采用本地标准宽度与画面内手动对齐，数据不上传。

**Tech Stack:** 原生 ES modules、Node 内置测试、MediaPipe Tasks Vision CDN、现有零依赖静态 H5 构建脚本。

**Spec:** `docs/superpowers/specs/2026-11-14-eyewear-demo-design.md`

## Global Constraints

- 所有处理在设备本地完成，不上传人脸照片或卡片照片。
- 继续保持零运行时依赖和 GitHub Pages 子路径可用。
- 参考卡片默认宽度为 85.6 mm，文案称为“标准参考卡片”，不要求用户提供银行卡。
- 尺寸结果用于相对推荐和试戴校准，不承诺验光或实体佩戴的绝对精度。

## Review Focus

- PD 为空、非数字或超出合理范围时，页面保持可用并给出校验提示。
- 参考卡片对齐值在最小和最大范围时，换算结果稳定且不会产生负数或无穷值。
- 人脸关键点缺失时，实时画面继续显示并提示用户调整姿势。
- 校准后切换镜框时，推荐结果和叠加素材使用同一套 frame 元数据。
- GitHub Pages 子路径加载新模块和已有图片时不能回退到根路径。

### Task 1: 校准测量纯函数

**Files:**
- Create: `src/features/tryon/calibrationMath.js`
- Test: `tests/tryon/calibrationMath.test.js`

**Interfaces:**
- `sanitizePd(value) -> number | null`
- `estimateMillimetersPerPixel(referenceWidthMm, referenceWidthPx) -> number`
- `estimateFaceMetrics(landmarks, millimetersPerPixel) -> { eyeDistanceMm, faceWidthMm, faceHeightMm, faceShape } | null`
- `rankFramesByFit(frames, faceWidthMm) -> Array<{ frame, fit }>`

- [ ] **Step 1: Write failing tests** covering valid/invalid PD, card scale conversion, missing landmarks, face-shape classification, and fit ranking.
- [ ] **Step 2: Run `node --test tests/tryon/calibrationMath.test.js` and verify the new imports fail.**
- [ ] **Step 3: Implement the four pure functions with bounded numeric guards and the existing `calculateFit` helper.**
- [ ] **Step 4: Run the focused test and then `npm test`.**

### Task 2: 校准试戴页面和摄像头流程

**Files:**
- Create: `src/features/tryon/calibratedTryOn.js`
- Modify: `src/features/tryon/tryon.js`
- Modify: `src/features/tryon/tryon.css`
- Modify: `src/app.js`

**Interfaces:**
- `renderCalibratedTryOnPage({ frame, frames }) -> string`
- `mountCalibratedTryOnPage(container, { frame, frames, onSelectFrame }) -> cleanup function`
- `loadFaceLandmarker()` and `drawFrame()` become reusable exports from `tryon.js`.

- [ ] **Step 1: Add a route-level test expectation for the new `calibrated` page and the two calibration mode controls.**
- [ ] **Step 2: Run the focused route test and verify it fails because the route and renderer do not exist.**
- [ ] **Step 3: Add the renderer with PD mode, standard reference-card mode, local-processing copy, camera stage, card alignment slider, measured metrics, and ranked frame picker.**
- [ ] **Step 4: Add the mount logic that reads MediaPipe landmarks, derives millimeter scale from PD or `85.6 mm / aligned card pixels`, updates fit recommendations, and overlays the selected image asset.**
- [ ] **Step 5: Export the shared loader/drawing helpers from `tryon.js`, add the `calibrated` route and navigation action in `app.js`, and add responsive styles.**
- [ ] **Step 6: Run `npm test` and `npm run build`.**

### Task 3: 文档、静态构建和发布验证

**Files:**
- Modify: `README.md`
- Modify: `docs/mobile-wechat-demo.md`
- Modify: `docs/demo-checklist.md`

- [ ] **Step 1: Document the two try-on modes, the 85.6 mm reference-card setup, and the local-only privacy behavior.**
- [ ] **Step 2: Run `npm run prepare:site`, `npm test`, and `npm run build`.**
- [ ] **Step 3: Commit the feature, push `main`, and verify the GitHub Pages workflow and public URL.**
- [ ] **Step 4: Pull hub status, update `STATUS.md` and regenerate `INDEX.md`, then commit and push with `HUB_OWNER=Codex`.**

