import { tenant } from './config/tenant.js';
import { frames } from './data/seed.js';
import { listFrames } from './domain/catalog.js';
import { calculateFit } from './domain/fit.js';
import { renderHomePage, renderFrameListPage, renderFrameDetailPage, renderComparePage } from './features/storefront/pages.js';
import { renderTryOnPage, mountTryOnPage } from './features/tryon/tryon.js';
import { renderLeadPage, mountLeadForm } from './features/leads/LeadForm.js';

export const demoMerchant = tenant;

function renderPlaceholderPage(title, copy, action = 'back-home') {
  return `
    <section class="page-section placeholder-page">
      <button class="text-button back-button" type="button" data-action="${action}">← 返回</button>
      <div class="placeholder-card"><span class="eyebrow">演示流程</span><h1>${title}</h1><p>${copy}</p></div>
    </section>
  `;
}

function renderShell(content) {
  return `
    <div class="app-shell" data-tenant-id="${tenant.tenantId}">
      <header class="app-header"><button class="brand-button" type="button" data-action="back-home"><span class="brand-mark">D</span><span>${tenant.name}</span></button><button class="header-icon" type="button" data-action="open-compare">对比</button></header>
      <main>${content}</main>
      <nav class="bottom-nav" aria-label="主导航"><button type="button" data-action="back-home">首页</button><button type="button" data-action="open-list">挑镜框</button><button type="button" data-action="open-tryon">试戴</button></nav>
    </div>
  `;
}

function renderCurrentPage(state) {
  const visibleFrames = listFrames(frames, { tenantId: tenant.tenantId, style: state.style === '全部' ? undefined : state.style });
  if (state.page === 'home') return renderShell(renderHomePage({ tenant, frames: visibleFrames }));
  if (state.page === 'list') return renderShell(renderFrameListPage({ frames: visibleFrames }));
  if (state.page === 'detail') {
    const frame = frames.find((item) => item.skuId === state.skuId) ?? frames[0];
    return renderShell(renderFrameDetailPage({ frame, fit: calculateFit(frame, 140) }));
  }
  if (state.page === 'compare') return renderShell(renderComparePage({ frames: state.compareIds.map((id) => frames.find((frame) => frame.skuId === id)).filter(Boolean).length ? state.compareIds.map((id) => frames.find((frame) => frame.skuId === id)).filter(Boolean) : visibleFrames }));
  if (state.page === 'tryon') {
    const frame = frames.find((item) => item.skuId === state.skuId) ?? frames[0];
    return renderShell(renderTryOnPage({ frame, frames: visibleFrames }));
  }
  if (state.page === 'lead') {
    const frame = frames.find((item) => item.skuId === state.skuId) ?? frames[0];
    return renderShell(renderLeadPage({ frame }));
  }
  return renderShell(renderHomePage({ tenant, frames: visibleFrames }));
}

export function renderApp() {
  return renderCurrentPage({ page: 'home', style: '全部', compareIds: [] });
}

export function mountApp(root = document.querySelector('#app')) {
  if (!root) throw new Error('App root element was not found.');
  const state = { page: 'home', style: '全部', skuId: null, compareIds: [] };
  let cleanupTryOn;
  const draw = () => {
    cleanupTryOn?.();
    root.innerHTML = renderCurrentPage(state);
    if (state.page === 'tryon') {
      const frame = frames.find((item) => item.skuId === state.skuId) ?? frames[0];
      cleanupTryOn = mountTryOnPage(root.querySelector('.tryon-page'), {
        frame,
        frames,
        onSelectFrame: (skuId) => { state.skuId = skuId; },
      });
    }
    if (state.page === 'lead') {
      const frame = frames.find((item) => item.skuId === state.skuId) ?? frames[0];
      mountLeadForm(root.querySelector('.lead-page'), { frame });
    }
  };
  root.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    const skuId = target.dataset.skuId;
    if (action === 'back-home') state.page = 'home';
    if (action === 'open-list' || action === 'back-list') state.page = 'list';
    if (action === 'open-detail') { state.page = 'detail'; state.skuId = skuId; }
    if (action === 'open-compare') state.page = 'compare';
    if (action === 'open-tryon') { state.page = 'tryon'; state.skuId = skuId ?? state.skuId; }
    if (action === 'open-lead') { state.page = 'lead'; state.skuId = skuId ?? state.skuId; }
    if (action === 'back-detail') state.page = 'detail';
    if (action === 'filter-style') { state.style = target.dataset.style; state.page = 'list'; }
    if (action === 'add-compare' && skuId && !state.compareIds.includes(skuId)) state.compareIds = [...state.compareIds, skuId].slice(-3);
    draw();
  });
  draw();
}
