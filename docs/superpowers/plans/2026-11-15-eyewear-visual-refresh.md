# 眼镜 H5 科技文艺视觉改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将现有眼镜 H5 Demo 改成雾蓝科技与米白纸张结合的移动端视觉系统，提升选镜和试戴功能的识别度。

**Architecture:** 保留现有页面渲染和业务逻辑，只调整全局 token、页面层级和试戴信息展示。用少量标记类补充首页首屏和试戴状态信息，避免重写路由与摄像头模块。

**Tech Stack:** 原生 ES modules、现有 CSS、Node 内置测试、静态 GitHub Pages 和 Sites 发布流程。

**Spec:** `docs/superpowers/specs/2026-11-15-eyewear-visual-refresh-design.md`

## Global Constraints

- 雾蓝科技 + 米白纸张视觉系统。
- 保持零依赖和移动端优先。
- 不改变商品、尺寸校准、验光、留资和摄像头计算逻辑。
- 保持 GitHub Pages 子路径资源可用。

## Review Focus

- 首页首屏在小屏上不会被大标题和按钮挤出视口。
- 商品图片仍然保持透明素材的原始宽高比。
- 试戴舞台的深色主题不会覆盖状态文本的可读性。
- 旧的 `primary-button`、筛选和底部导航动作仍然可点击。
- 新增的文案和类名在静态构建目录中同步存在。

### Task 1: 新视觉 token 和页面标记

**Files:**
- Modify: `src/styles.css`
- Modify: `src/features/storefront/storefront.css`
- Modify: `src/features/tryon/tryon.css`
- Modify: `src/features/storefront/pages.js`
- Modify: `src/features/tryon/tryon.js`
- Modify: `src/features/tryon/calibratedTryOn.js`
- Test: `tests/smoke.test.js`

- [ ] **Step 1: 写失败测试**，断言首页包含品牌网格区与“先量尺寸，再试戴”文案，试戴页包含 `LIVE` 状态标记和尺寸信息容器。
- [ ] **Step 2: 运行 `node --test tests/smoke.test.js`，确认新标记尚不存在。**
- [ ] **Step 3: 更新 CSS token、按钮、卡片、筛选、详情和试戴样式，加入响应式细节和深色试戴舞台。**
- [ ] **Step 4: 更新页面模板，加入品牌引导、镜框尺寸标签、试戴状态标记和信息容器。**
- [ ] **Step 5: 运行聚焦测试、`npm test` 和 `npm run build`。**

### Task 2: 静态构建与公开发布

**Files:**
- Modify: `README.md`
- Modify: `docs/mobile-wechat-demo.md`
- Modify: `docs/demo-checklist.md`
- Regenerate: `dist/`

- [ ] **Step 1: 更新文档中的视觉说明和新入口描述。**
- [ ] **Step 2: 运行 `npm run prepare:site`、`npm test`、`npm run build`。**
- [ ] **Step 3: 提交并推送 GitHub，检查 GitHub Pages 新版本。**
- [ ] **Step 4: 发布 HTTPS Demo，并检查两个公开入口的模块和图片响应。**
- [ ] **Step 5: 按 Hub 约定更新 `STATUS.md` 与 `INDEX.md` 并推送。**

