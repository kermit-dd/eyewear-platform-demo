import { deriveFaceAnchor, getFrameTransform } from './tryonMath.js';
import { drawFrame, loadFaceLandmarker } from './tryon.js';
import {
  estimateFaceMetrics,
  estimateMillimetersPerPixel,
  rankFramesByFit,
  sanitizePd,
} from './calibrationMath.js';

const DEFAULT_CARD_WIDTH_MM = 85.6;
const DEFAULT_CARD_RATIO = 34;

function renderFrameChip(frame, fitLabel = '等待测量') {
  return `<button class="tryon-chip" type="button" data-calibrated-sku="${frame.skuId}"><img src="${frame.imageUrl}" alt="${frame.name}" /><span>${frame.name}</span><small data-fit-label>${fitLabel}</small></button>`;
}

export function renderCalibratedTryOnPage({ frame, frames }) {
  return `
    <section class="page-section tryon-page calibrated-tryon-page">
      <div class="tryon-header"><button class="text-button" type="button" data-action="back-list">← 返回</button><span class="eyebrow">尺寸校准试戴</span><button class="text-button" type="button" data-action="open-tryon" data-sku-id="${frame.skuId}">直接试戴</button></div>
      <div class="tryon-stage calibrated-stage">
        <video class="tryon-video" playsinline muted></video>
        <canvas class="tryon-canvas"></canvas>
        <div class="reference-card-guide" data-reference-guide hidden><span>参考框</span></div>
        <div class="tryon-status" data-tryon-status>正在准备摄像头…</div>
      </div>
      <div class="calibration-mode-tabs" role="tablist" aria-label="尺寸校准方式">
        <button class="calibration-mode-tab is-active" type="button" data-calibration-mode="pd">输入 PD</button>
        <button class="calibration-mode-tab" type="button" data-calibration-mode="card">标准参考卡片</button>
      </div>
      <div class="calibration-panel" data-calibration-panel="pd">
        <label class="field-label" for="pd-input">双眼瞳距 PD（mm）</label>
        <input class="field-input" id="pd-input" data-pd-input type="number" min="35" max="90" step="0.5" placeholder="例如 63.5" inputmode="decimal" />
        <p class="calibration-help">可从验光单或配镜记录中查看 PD。只在本机用于换算尺寸。</p>
      </div>
      <div class="calibration-panel" data-calibration-panel="card" hidden>
        <div class="calibration-inline-fields"><label class="field-label" for="card-width-input">卡片宽度（mm）</label><input class="field-input" id="card-width-input" data-card-width-input type="number" min="40" max="120" step="0.1" value="${DEFAULT_CARD_WIDTH_MM}" inputmode="decimal" /></div>
        <label class="field-label" for="card-ratio-input">拖动滑块，让画面中的参考框与卡片实际宽度重合</label>
        <input class="calibration-range" id="card-ratio-input" data-card-ratio-input type="range" min="20" max="60" step="0.5" value="${DEFAULT_CARD_RATIO}" />
        <p class="calibration-help">建议使用常见标准尺寸卡片，默认宽度为 85.6 mm。不会上传卡片或人脸照片。</p>
        <p class="calibration-range-value" data-card-ratio-label>参考框占画面宽度 ${DEFAULT_CARD_RATIO}%</p>
      </div>
      <button class="primary-button calibration-start-button" type="button" data-start-calibration>开始测量</button>
      <div class="measurement-summary" data-measurement-summary><span>测量结果</span><strong>等待人脸识别</strong></div>
      <div class="tryon-toolbar"><div class="tryon-current"><span>当前镜框</span><strong data-current-frame>${frame.name}</strong></div><label class="calibration-control">微调大小 <input data-scale type="range" min="0.85" max="1.15" step="0.01" value="1" /></label></div>
      <div class="tryon-picker calibrated-picker">${frames.slice(0, 6).map((item) => renderFrameChip(item, item.skuId === frame.skuId ? '当前镜框' : '等待测量')).join('')}</div>
      <p class="tryon-note">校准结果用于镜框相对尺寸推荐和试戴预览，最终适配以实体佩戴和验光数据为准。</p>
    </section>
  `;
}

function formatMetric(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)} mm` : '—';
}

export function mountCalibratedTryOnPage(container, { frame, frames, onSelectFrame } = {}) {
  const video = container.querySelector('.tryon-video');
  const canvas = container.querySelector('.tryon-canvas');
  const status = container.querySelector('[data-tryon-status]');
  const pdInput = container.querySelector('[data-pd-input]');
  const cardWidthInput = container.querySelector('[data-card-width-input]');
  const cardRatioInput = container.querySelector('[data-card-ratio-input]');
  const cardRatioLabel = container.querySelector('[data-card-ratio-label]');
  const cardGuide = container.querySelector('[data-reference-guide]');
  const summary = container.querySelector('[data-measurement-summary]');
  const scaleInput = container.querySelector('[data-scale]');
  const currentFrameLabel = container.querySelector('[data-current-frame]');
  const picker = container.querySelector('.calibrated-picker');
  const context = canvas.getContext('2d');
  let activeFrame = frame;
  let mode = 'pd';
  let manualScale = 1;
  let stream;
  let tracker;
  let animationId;
  let imageCache = new Map();
  let lastRankedFaceWidth;

  const setStatus = (message, tone = '') => {
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const loadImage = (src) => {
    if (imageCache.has(src)) return imageCache.get(src);
    const image = new Image();
    image.src = src;
    imageCache.set(src, image);
    return image;
  };

  const setSummary = (metrics) => {
    if (!metrics) {
      summary.innerHTML = '<span>测量结果</span><strong>等待人脸识别</strong>';
      return;
    }
    summary.innerHTML = `<span>测量结果</span><strong>眼距 ${formatMetric(metrics.eyeDistanceMm)} · 脸宽 ${formatMetric(metrics.faceWidthMm)} · ${metrics.faceShape}</strong>`;
  };

  const renderRankedFrames = (metrics) => {
    const ranked = metrics ? rankFramesByFit(frames, metrics.faceWidthMm) : frames.map((item) => ({ frame: item, fit: null }));
    const visible = ranked.slice(0, 6);
    if (!visible.some(({ frame: item }) => item.skuId === activeFrame.skuId)) {
      visible[visible.length - 1] = ranked.find(({ frame: item }) => item.skuId === activeFrame.skuId) ?? visible[visible.length - 1];
    }
    picker.innerHTML = visible.map(({ frame: item, fit }) => renderFrameChip(item, fit?.label ?? (item.skuId === activeFrame.skuId ? '当前镜框' : '等待测量'))).join('');
    picker.querySelectorAll('[data-calibrated-sku]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.calibratedSku === activeFrame.skuId);
    });
  };

  const updateModeUi = () => {
    lastRankedFaceWidth = undefined;
    container.querySelectorAll('[data-calibration-mode]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.calibrationMode === mode);
    });
    container.querySelectorAll('[data-calibration-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.calibrationPanel !== mode;
    });
    cardGuide.hidden = mode !== 'card';
    setSummary(null);
    setStatus(mode === 'pd' ? '请输入 PD 后开始测量' : '把参考卡片放在脸旁，调整参考框宽度', 'ready');
  };

  const getScaleForLandmarks = (landmarks) => {
    const left = landmarks[33];
    const right = landmarks[263];
    if (!left || !right) return null;
    const leftPx = { x: left.x * canvas.width, y: left.y * canvas.height };
    const rightPx = { x: right.x * canvas.width, y: right.y * canvas.height };
    const eyeDistancePx = Math.hypot(rightPx.x - leftPx.x, rightPx.y - leftPx.y);
    if (!eyeDistancePx) return null;
    if (mode === 'pd') {
      const pd = sanitizePd(pdInput.value);
      return pd ? pd / eyeDistancePx : null;
    }
    const cardWidthMm = Number(cardWidthInput.value);
    const cardWidthPx = canvas.width * (Number(cardRatioInput.value) / 100);
    return estimateMillimetersPerPixel(cardWidthMm, cardWidthPx);
  };

  const drawCalibratedFrame = (landmarks, millimetersPerPixel) => {
    const left = landmarks[33];
    const right = landmarks[263];
    if (!left || !right || !millimetersPerPixel) return;
    const anchor = deriveFaceAnchor(
      { x: left.x * canvas.width, y: left.y * canvas.height },
      { x: right.x * canvas.width, y: right.y * canvas.height },
      landmarks[1] ? { x: landmarks[1].x * canvas.width, y: landmarks[1].y * canvas.height } : null,
    );
    const baseScale = activeFrame.frameWidth / (anchor.eyeDistance * 2 * millimetersPerPixel);
    const asset = { ...(activeFrame.tryOnAsset ?? {}), scale: baseScale * (activeFrame.tryOnAsset?.scale ?? 1) * manualScale };
    drawFrame(context, loadImage(asset.url), getFrameTransform(anchor, asset));
  };

  const renderLoop = () => {
    if (!video.videoWidth) {
      animationId = requestAnimationFrame(renderLoop);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const landmarks = tracker?.detectForVideo(video, performance.now()).faceLandmarks?.[0];
    if (!landmarks) {
      setStatus('请正对摄像头，保持脸部和参考卡片在画面中', 'waiting');
      animationId = requestAnimationFrame(renderLoop);
      return;
    }
    const millimetersPerPixel = getScaleForLandmarks(landmarks);
    if (!millimetersPerPixel) {
      setStatus(mode === 'pd' ? '请输入有效 PD（35–90 mm）' : '请调整参考框与卡片宽度重合', 'error');
      animationId = requestAnimationFrame(renderLoop);
      return;
    }
    const pixelLandmarks = landmarks.map((point) => ({ x: point.x * canvas.width, y: point.y * canvas.height }));
    const metrics = estimateFaceMetrics(pixelLandmarks, millimetersPerPixel);
    setSummary(metrics);
    if (metrics && Math.abs(metrics.faceWidthMm - (lastRankedFaceWidth ?? Infinity)) >= 0.5) {
      renderRankedFrames(metrics);
      lastRankedFaceWidth = metrics.faceWidthMm;
    }
    drawCalibratedFrame(landmarks, millimetersPerPixel);
    setStatus('已完成尺寸校准，可切换镜框', 'ready');
    animationId = requestAnimationFrame(renderLoop);
  };

  const start = async () => {
    if (!window.isSecureContext) {
      setStatus('微信内试戴需要 HTTPS，请使用 HTTPS 地址打开', 'error');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('当前浏览器不支持摄像头，请使用 HTTPS 手机浏览器打开', 'error');
      return;
    }
    try {
      setStatus('正在请求摄像头权限…');
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      video.srcObject = stream;
      await video.play();
      setStatus('正在加载人脸模型…');
      tracker = await loadFaceLandmarker();
      setStatus('请输入 PD 或选择参考卡片模式', 'ready');
      renderLoop();
    } catch (error) {
      setStatus('摄像头或人脸模型不可用，请检查权限后重试', 'error');
      renderLoop();
    }
  };

  scaleInput.addEventListener('input', () => { manualScale = Number(scaleInput.value) || 1; });
  pdInput.addEventListener('input', () => { setStatus('输入完成后将自动更新尺寸推荐', 'ready'); });
  cardRatioInput.addEventListener('input', () => {
    cardRatioLabel.textContent = `参考框占画面宽度 ${Number(cardRatioInput.value).toFixed(1)}%`;
    cardGuide.style.width = `${Number(cardRatioInput.value)}%`;
  });
  container.querySelector('[data-start-calibration]').addEventListener('click', () => {
    setStatus(mode === 'pd' ? '正在使用 PD 校准…' : '正在使用参考卡片校准…', 'ready');
  });
  container.querySelectorAll('[data-calibration-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      mode = button.dataset.calibrationMode;
      updateModeUi();
    });
  });
  picker.addEventListener('click', (event) => {
    const button = event.target.closest('[data-calibrated-sku]');
    if (!button) return;
    const next = frames.find((item) => item.skuId === button.dataset.calibratedSku);
    if (!next) return;
    activeFrame = next;
    currentFrameLabel.textContent = next.name;
    picker.querySelectorAll('[data-calibrated-sku]').forEach((chip) => chip.classList.toggle('is-active', chip === button));
    onSelectFrame?.(next.skuId);
  });
  updateModeUi();
  start();

  return () => {
    cancelAnimationFrame(animationId);
    stream?.getTracks().forEach((track) => track.stop());
    tracker?.close?.();
    imageCache.clear();
  };
}
