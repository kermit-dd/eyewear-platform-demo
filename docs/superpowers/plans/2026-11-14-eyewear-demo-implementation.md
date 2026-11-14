# 眼镜选购与 AR 试戴 Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个单商户、可本地运行的眼镜选购与 AR 试戴 Demo，验证尺寸筛选、试戴、对比和购买意向闭环。

**Architecture:** 本轮以 Vite + React 的 H5 Demo 作为可运行主线，优先验证摄像头和人脸试戴效果。领域模型、租户字段和页面信息架构按微信小程序映射设计，后续可把同一套领域数据和试戴核心接入原生小程序壳。试戴模块使用 MediaPipe Face Landmarker 和 Three.js，模型加载失败时保留透明镜框校准模式，保证没有模型素材时仍可演示主流程。

**Tech Stack:** TypeScript、React、Vite、Vitest、Three.js、`@mediapipe/tasks-vision`、CSS Modules 或普通 CSS。

**Spec:** `docs/superpowers/specs/2026-11-14-eyewear-demo-design.md`

## Global Constraints

- 目录必须位于 `~/projects/eyewear-platform-demo`。
- 首版只支持一个演示商户和 8 至 12 个演示 SKU。
- 商品数据必须包含 `tenantId`、镜片宽度、鼻梁宽度、镜片高度、镜腿长度和镜框总宽。
- 试戴默认在设备本地处理，不上传人脸图像。
- 首版不接微信支付、退款、物流和完整商户后台。
- 尺寸输出使用“推荐”“可能偏紧”“可能偏宽”等相对提示。
- 每个完成的任务都要有对应的测试或构建检查。

## Implementation Amendments

- 当前执行环境无法稳定安装 npm registry 依赖，因此本轮主线改为零依赖 ES module 和 Python 静态服务器，测试使用 Node.js 内置 `node --test`。
- 原计划中的 React/TypeScript 文件名在实现中对应为原生 JavaScript 模块，页面通过 HTML 字符串和 DOM 挂载函数实现。
- 配镜表单增加验光单文件名、散光开关、右眼和左眼球镜 S、瞳距 PD、柱镜 C、轴位 A。Demo 只保存本地元数据，不上传文件内容。

## Review Focus

- 摄像头权限被拒绝时，用户仍能看到可理解的操作提示和静态校准模式。对应测试放在试戴模块任务。
- 镜框缺少 GLB 或模型加载失败时，商品详情和试戴页面不能崩溃。对应测试放在试戴模块任务。
- 商品尺寸为空、为零或大于合理范围时，筛选和适配结果不能产生 NaN。对应测试放在领域模型任务。
- 用户刷新页面后，已填写的购买意向草稿仍然可恢复。对应测试放在购买意向任务。
- 不同租户数据混入同一列表时，当前商户只能看到自己的商品。对应测试放在租户和目录任务。

## 文件结构

- `package.json`：脚本、依赖和项目元数据。
- `vite.config.ts`：Vite 与 Vitest 配置。
- `src/domain/models.ts`：Tenant、Product、FrameSku、TryOnAsset、Lead 等领域类型。
- `src/data/seed.ts`：单商户、8 至 12 个 SKU 和演示素材配置。
- `src/domain/catalog.ts`：租户过滤、商品筛选和镜框排序。
- `src/domain/fit.ts`：尺寸适配结果和相对提示计算。
- `src/features/storefront/`：首页、商品列表、商品详情和对比页。
- `src/features/tryon/`：摄像头状态、Face Landmarker 初始化、镜框锚点计算和渲染。
- `src/features/leads/`：购买意向表单、验光单上传、本地草稿和提交记录。
- `src/config/tenant.ts`：默认商户配置和主题色。
- `src/app/App.tsx`：页面状态和路由入口。
- `src/styles.css`：移动端优先的视觉样式。
- `tests/`：Vitest 单元测试。
- `public/assets/`：演示镜框图片、透明叠加素材和可选 GLB 文件。
- `README.md`：启动方式、模型素材说明和验收步骤。

### Task 1: 创建可运行的 React/Vite 工程

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/styles.css`
- Create: `tests/smoke.test.ts`

**Interfaces:**
- Produces `npm run dev`、`npm run build`、`npm run test` 三个脚本。
- `src/main.tsx` 挂载 `App`。
- `App` 接收无参数并返回 React 元素。

- [ ] **Step 1: Write the failing smoke test**

在 `tests/smoke.test.ts` 中验证 `App` 可以被导入，并且渲染后包含商户名称占位文本。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- --run tests/smoke.test.ts`
Expected: FAIL because the project files and `App` do not exist.

- [ ] **Step 3: Implement the Vite/React scaffold**

使用 TypeScript 和 React 创建工程入口，暂时在 `App` 中显示“丹阳眼镜样板店”和一个空的首页区域。配置 Vitest 的 jsdom 环境。

- [ ] **Step 4: Run checks**

Run: `npm install && npm run test -- --run tests/smoke.test.ts && npm run build`
Expected: PASS and Vite produces `dist/`.

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json vite.config.ts index.html src tests
 git commit -m "chore: scaffold eyewear demo"
```

### Task 2: 建立租户、商品和尺寸适配领域模型

**Files:**
- Create: `src/domain/models.ts`
- Create: `src/data/seed.ts`
- Create: `src/config/tenant.ts`
- Create: `src/domain/catalog.ts`
- Create: `src/domain/fit.ts`
- Create: `tests/domain/catalog.test.ts`
- Create: `tests/domain/fit.test.ts`

**Interfaces:**
- `type TenantConfig = { tenantId: string; storeId: string; name: string; subtitle: string; themeColor: string; phone: string }`。
- `type FrameSku = { skuId: string; tenantId: string; productId: string; name: string; style: string; price: number; lensWidth: number; bridgeWidth: number; lensHeight: number; templeLength: number; frameWidth: number; fitTags: string[]; imageUrl: string; tryOnAsset?: TryOnAsset }`。
- `type TryOnAsset = { kind: 'svg' | 'glb'; url: string; scale: number; offsetX: number; offsetY: number; rotation: number }`。
- `type CatalogFilter = { tenantId: string; style?: string; maxPrice?: number; minFrameWidth?: number; maxFrameWidth?: number }`。
- `function listFrames(frames: FrameSku[], filter: CatalogFilter): FrameSku[]`。
- `type FitResult = { level: 'recommended' | 'tight' | 'wide' | 'unknown'; label: string; score: number }`。
- `function calculateFit(frame: FrameSku, faceWidth: number | null): FitResult`。

- [ ] **Step 1: Write failing domain tests**

覆盖租户隔离、风格和价格筛选、尺寸范围筛选、缺失尺寸返回 `unknown`、以及正常尺寸返回三种相对适配结果。

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- --run tests/domain/catalog.test.ts tests/domain/fit.test.ts`
Expected: FAIL because the domain functions do not exist.

- [ ] **Step 3: Implement models, seed data, catalog filtering and fit calculation**

准备 1 个商户和 8 至 12 个款式差异明显的 SKU。适配计算使用相对脸宽区间，所有异常数值都返回 `unknown`，禁止产生 NaN 或 Infinity。

- [ ] **Step 4: Run tests**

Run: `npm run test -- --run tests/domain/catalog.test.ts tests/domain/fit.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain src/data src/config tests/domain
git commit -m "feat: add tenant catalog and frame fit domain"
```

### Task 3: 实现消费者选镜流程

**Files:**
- Create: `src/features/storefront/HomePage.tsx`
- Create: `src/features/storefront/FrameListPage.tsx`
- Create: `src/features/storefront/FrameDetailPage.tsx`
- Create: `src/features/storefront/ComparePage.tsx`
- Create: `src/features/storefront/storefront.css`
- Modify: `src/app/App.tsx`
- Modify: `src/styles.css`
- Create: `tests/storefront/navigation.test.tsx`

**Interfaces:**
- `HomePage` props `{ tenant: TenantConfig; frames: FrameSku[]; onOpenFrame: (skuId: string) => void; onOpenTryOn: (skuId?: string) => void }`。
- `FrameListPage` props `{ frames: FrameSku[]; onOpenFrame: (skuId: string) => void; onCompare: (skuIds: string[]) => void }`。
- `FrameDetailPage` props `{ frame: FrameSku; onTryOn: () => void; onAddCompare: () => void; onLead: () => void }`。
- `ComparePage` props `{ frames: FrameSku[]; onTryOn: (skuId: string) => void }`。

- [ ] **Step 1: Write failing component tests**

验证首页能打开商品列表，商品列表筛选后只显示当前商户商品，商品详情显示镜框总宽和尺寸明细，对比页最多展示 3 个镜框。

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- --run tests/storefront/navigation.test.tsx`
Expected: FAIL because page components do not exist.

- [ ] **Step 3: Implement the four storefront pages and app state**

使用移动端优先布局。页面状态由 `App` 管理，暂时使用轻量路径状态，不引入路由库。所有商品卡片都显示风格、价格、镜框总宽和适配提示。

- [ ] **Step 4: Run tests and build**

Run: `npm run test -- --run tests/storefront/navigation.test.tsx && npm run build`
Expected: PASS and build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app src/features/storefront src/styles.css tests/storefront
git commit -m "feat: add single-merchant storefront flow"
```

### Task 4: 实现摄像头和 AR 试戴模块

**Files:**
- Create: `src/features/tryon/tryonMath.ts`
- Create: `src/features/tryon/tryonMath.test.ts`
- Create: `src/features/tryon/TryOnPage.tsx`
- Create: `src/features/tryon/tryon.css`
- Modify: `src/app/App.tsx`
- Create: `public/assets/frames/round.svg`
- Create: `public/assets/frames/square.svg`
- Create: `public/assets/frames/cat-eye.svg`

**Interfaces:**
- `type FaceAnchor = { centerX: number; centerY: number; eyeDistance: number; roll: number }`。
- `function deriveFaceAnchor(leftEye: Point, rightEye: Point, nose: Point): FaceAnchor`。
- `function getFrameTransform(anchor: FaceAnchor, asset: TryOnAsset): { x: number; y: number; width: number; rotation: number }`。
- `type TryOnStatus = 'idle' | 'requesting' | 'ready' | 'denied' | 'unsupported' | 'error'`。
- `TryOnPage` props `{ frame: FrameSku; onBack: () => void; onLead: () => void; onSelectFrame: (skuId: string) => void }`。

- [ ] **Step 1: Write failing math tests**

覆盖左右眼交换、零距离、缺失鼻点、正常旋转角度和镜框缩放结果。验证异常输入返回稳定的默认变换。

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- --run src/features/tryon/tryonMath.test.ts`
Expected: FAIL because the anchor functions do not exist.

- [ ] **Step 3: Implement anchor math and camera state machine**

接入 `@mediapipe/tasks-vision` 的 Face Landmarker。视频帧在浏览器内处理，使用 2D SVG 镜框作为默认素材，GLB 加载作为可选能力。摄像头拒绝、模型加载失败和浏览器不支持时，显示状态提示并保留手动校准模式。

- [ ] **Step 4: Run tests and production build**

Run: `npm run test -- --run src/features/tryon/tryonMath.test.ts && npm run build`
Expected: PASS and build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/features/tryon src/app/App.tsx public/assets/frames package.json package-lock.json
git commit -m "feat: add local camera try-on prototype"
```

### Task 5: 实现购买意向和本地草稿

**Files:**
- Create: `src/domain/leads.ts`
- Create: `src/features/leads/LeadForm.tsx`
- Create: `src/features/leads/leads.css`
- Modify: `src/features/storefront/FrameDetailPage.tsx`
- Modify: `src/features/tryon/TryOnPage.tsx`
- Modify: `src/app/App.tsx`
- Create: `tests/leads/leads.test.ts`

**Interfaces:**
- `type PrescriptionEye = { sphere: string; pd: string; cylinder: string; axis: string }`。
- `type Prescription = { hasAstigmatism: boolean; reportFileName?: string; right: PrescriptionEye; left: PrescriptionEye }`。
- `type Lead = { leadId: string; tenantId: string; skuId: string; name: string; phone: string; note: string; prescription: Prescription; createdAt: string }`。
- `function saveLeadDraft(draft: Partial<Lead>): void`。
- `function loadLeadDraft(): Partial<Lead> | null`。
- `function submitLead(lead: Lead): Lead`。

- [ ] **Step 1: Write failing lead tests**

验证手机号为空时不能提交、刷新后草稿可恢复、成功提交后保存一条带 `tenantId`、`skuId` 和左右眼验光参数的记录，上传验光单时保存文件名。

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- --run tests/leads/leads.test.ts`
Expected: FAIL because the lead functions and form do not exist.

- [ ] **Step 3: Implement local lead persistence and form**

使用 `localStorage` 保存草稿和本地提交记录。表单支持姓名、手机号、备注、验光单文件选择，以及右眼和左眼的球镜 S、瞳距 PD、柱镜 C、轴位 A。散光开关为“有”时显示柱镜和轴位字段，默认带入当前镜框。

- [ ] **Step 4: Run tests and build**

Run: `npm run test -- --run tests/leads/leads.test.ts && npm run build`
Expected: PASS and build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/domain/leads.ts src/features/leads src/features/storefront src/features/tryon src/app/App.tsx tests/leads
git commit -m "feat: add purchase intent form"
```

### Task 6: 完成商户主题和移动端视觉样式

**Files:**
- Modify: `src/config/tenant.ts`
- Modify: `src/styles.css`
- Modify: `src/features/storefront/storefront.css`
- Modify: `src/features/tryon/tryon.css`
- Modify: `src/features/leads/leads.css`
- Create: `public/assets/merchant-cover.svg`

**Interfaces:**
- `tenant` 配置中的主题色、品牌名、电话和副标题在首页、商品详情、试戴和留资页统一生效。

- [ ] **Step 1: Add visual regression smoke assertions**

验证默认主题色被渲染到首页主按钮和试戴页操作按钮，移动端宽度下页面没有横向溢出。

- [ ] **Step 2: Run test to verify the assertion fails**

Run: `npm run test -- --run tests/smoke.test.ts`
Expected: FAIL until theme tokens and responsive layout are wired.

- [ ] **Step 3: Implement the visual system**

使用暖灰背景、深色文字和一个强调色，建立商品卡片、尺寸标签、按钮、状态提示和试戴控制条的统一样式。避免引入额外 UI 框架。

- [ ] **Step 4: Run checks**

Run: `npm run test -- --run && npm run build`
Expected: PASS and build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/config src/styles.css src/features public/assets/merchant-cover.svg tests/smoke.test.ts
git commit -m "style: polish mobile eyewear demo"
```

### Task 7: 文档、素材说明和最终验收

**Files:**
- Create: `README.md`
- Create: `docs/try-on-assets.md`
- Create: `docs/demo-checklist.md`
- Modify: `.gitignore`

**Interfaces:**
- README 必须说明启动命令、浏览器摄像头权限要求、演示数据位置和模型素材替换方式。
- 验收清单必须覆盖商品筛选、尺寸详情、试戴、截图、对比和购买意向。

- [ ] **Step 1: Write the manual acceptance checklist**

列出 Chrome 或 Edge 下的本地验证步骤，并明确摄像头拒绝时的预期状态。

- [ ] **Step 2: Run the complete verification**

Run: `npm run test -- --run && npm run build`
Expected: all tests pass and `dist/` is generated.

- [ ] **Step 3: Run the local demo**

Run: `npm run dev -- --host 127.0.0.1`
Expected: browser can open the home page, catalog, detail, try-on, compare and lead form paths.

- [ ] **Step 4: Commit**

```bash
git add README.md docs .gitignore
git commit -m "docs: add eyewear demo runbook"
```

- [ ] **Step 5: Final review**

确认没有真实商户手机号、微信 AppID、支付密钥或用户人脸图像进入仓库。确认所有商品数据都带 `tenantId`。
