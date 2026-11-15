import { deriveFaceAnchor, getFrameDimensions, getFrameTransform } from './tryonMath.js';

const MEDIAPIPE_MODULE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/+esm';
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

export function renderTryOnPage({ frame, frames }) {
  return `
    <section class="page-section tryon-page">
      <div class="tryon-header"><button class="text-button" type="button" data-action="back-list">← 返回</button><div class="tryon-header__copy"><span class="eyebrow">03 / 试戴实验室</span><h1>实时试戴</h1></div><button class="text-button" type="button" data-action="open-calibrated" data-sku-id="${frame.skuId}">按尺寸试戴 ↗</button></div>
      <div class="tryon-stage">
        <div class="tryon-stage__hud"><span class="live-badge"><i></i> LIVE</span><span>FACE TRACKING / ON</span></div>
        <div class="tryon-stage__crosshair" aria-hidden="true"></div>
        <video class="tryon-video" playsinline muted></video>
        <canvas class="tryon-canvas"></canvas>
        <div class="tryon-status" data-tryon-status>正在准备摄像头…</div>
      </div>
      <div class="tryon-toolbar">
        <div class="tryon-current"><span>当前镜框</span><strong data-current-frame>${frame.name}</strong></div>
        <label class="calibration-control">镜框大小 <input data-scale type="range" min="0.75" max="1.3" step="0.01" value="${frame.tryOnAsset?.scale ?? 1}" /></label>
      </div>
      <div class="frame-measurement"><div><span>镜框总宽</span><strong>${frame.frameWidth} mm</strong></div><div><span>鼻梁宽</span><strong>${frame.bridgeWidth} mm</strong></div><div><span>适合</span><strong>${frame.fitTags[0]}</strong></div></div>
      <div class="tryon-picker">${frames.slice(0, 6).map((item) => `<button class="tryon-chip ${item.skuId === frame.skuId ? 'is-active' : ''}" type="button" data-tryon-sku="${item.skuId}"><img src="${item.imageUrl}" alt="${item.name}" /><span>${item.name}</span></button>`).join('')}</div>
      <p class="tryon-note"><span>实验室提示</span> 试戴用于判断外观和相对比例，尺寸提示以商品详情为准。</p>
    </section>
  `;
}

export async function loadFaceLandmarker() {
  const vision = await import(MEDIAPIPE_MODULE);
  const fileset = await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm');
  return vision.FaceLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'GPU' },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFaceBlendshapes: false,
  });
}

export function drawFrame(ctx, image, transform) {
  if (!image.complete || !image.naturalWidth || !transform.width) return;
  const { height } = getFrameDimensions(image.naturalWidth, image.naturalHeight, transform.width);
  ctx.save();
  ctx.translate(transform.x, transform.y);
  ctx.rotate(transform.rotation);
  ctx.drawImage(image, -transform.width / 2, -height / 2, transform.width, height);
  ctx.restore();
}

export function mountTryOnPage(container, { frame, frames, onSelectFrame } = {}) {
  const video = container.querySelector('.tryon-video');
  const canvas = container.querySelector('.tryon-canvas');
  const status = container.querySelector('[data-tryon-status]');
  const scaleInput = container.querySelector('[data-scale]');
  const currentFrameLabel = container.querySelector('[data-current-frame]');
  const context = canvas.getContext('2d');
  let activeFrame = frame;
  let stream;
  let tracker;
  let animationId;
  let manualScale = Number(scaleInput.value) || 1;
  const imageCache = new Map();

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

  const drawFrameForResult = (landmarks) => {
    const left = landmarks[33];
    const right = landmarks[263];
    const nose = landmarks[1];
    if (!left || !right) return;
    const anchor = deriveFaceAnchor(
      { x: left.x * canvas.width, y: left.y * canvas.height },
      { x: right.x * canvas.width, y: right.y * canvas.height },
      nose ? { x: nose.x * canvas.width, y: nose.y * canvas.height } : null,
    );
    const asset = { ...(activeFrame.tryOnAsset ?? {}), scale: (activeFrame.tryOnAsset?.scale ?? 1) * manualScale };
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
    if (tracker) {
      const result = tracker.detectForVideo(video, performance.now());
      const landmarks = result.faceLandmarks?.[0];
      if (landmarks) {
        setStatus('已识别人脸，可调整镜框大小', 'ready');
        drawFrameForResult(landmarks);
      } else {
        setStatus('请正对摄像头，保持脸部在画面中', 'waiting');
      }
    }
    animationId = requestAnimationFrame(renderLoop);
  };

  const start = async () => {
    if (!window.isSecureContext) {
      setStatus('微信内试戴需要 HTTPS，请使用 HTTPS 地址打开', 'error');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('当前浏览器不支持摄像头，仍可查看镜框校准', 'error');
      return;
    }
    try {
      setStatus('正在请求摄像头权限…');
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      video.srcObject = stream;
      await video.play();
      setStatus('正在加载人脸模型…');
      tracker = await loadFaceLandmarker();
      setStatus('请正对摄像头', 'ready');
      renderLoop();
    } catch (error) {
      setStatus('摄像头或人脸模型不可用，可以继续使用手动校准', 'error');
      renderLoop();
    }
  };

  scaleInput.addEventListener('input', () => { manualScale = Number(scaleInput.value); });
  container.querySelectorAll('[data-tryon-sku]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = frames.find((item) => item.skuId === button.dataset.tryonSku);
      if (!next) return;
      activeFrame = next;
      currentFrameLabel.textContent = next.name;
      container.querySelectorAll('[data-tryon-sku]').forEach((chip) => chip.classList.toggle('is-active', chip === button));
      if (onSelectFrame) onSelectFrame(next.skuId);
    });
  });
  start();

  return () => {
    cancelAnimationFrame(animationId);
    stream?.getTracks().forEach((track) => track.stop());
    tracker?.close?.();
  };
}
