function formatPrice(price) {
  return `¥${Number(price).toFixed(0)}`;
}

function renderFrameCard(frame) {
  return `
    <article class="frame-card" data-frame-id="${frame.skuId}">
      <button class="frame-card__visual" type="button" data-action="open-detail" data-sku-id="${frame.skuId}">
        <span class="frame-card__index">${frame.skuId.replace(/[^0-9]/g, '').padStart(2, '0')} / ${frame.style}</span>
        <img src="${frame.imageUrl}" alt="${frame.name}" loading="lazy" />
        <span class="frame-card__width">${frame.frameWidth} mm</span>
      </button>
      <div class="frame-card__body">
        <div class="frame-card__topline"><span>${frame.style}</span><strong>${formatPrice(frame.price)}</strong></div>
        <h3>${frame.name}</h3>
        <p>${frame.fitTags.join(' · ')} · ${frame.lensWidth}-${frame.bridgeWidth}-${frame.templeLength}</p>
      </div>
    </article>
  `;
}

export function renderHomePage({ tenant, frames }) {
  return `
    <section class="page-section home-page">
      <div class="home-intro">
        <div class="home-intro__topline"><p class="eyebrow">${tenant.subtitle}</p><span class="signal-label"><i></i> FIT LAB / 01</span></div>
        <div class="home-intro__grid">
          <div>
            <h1><span>先量尺寸，</span><em>再试戴。</em></h1>
            <p>把镜框总宽、脸型和上脸效果放在同一个决策里，找到真正适合你的那一副。</p>
          </div>
          <div class="home-calibration-card"><span class="home-calibration-card__grid"></span><span class="eyebrow">${tenant.name}</span><strong>138—145<small>mm</small></strong><span>样板店精选适配区间</span></div>
        </div>
        <div class="home-actions">
          <button class="primary-button" type="button" data-action="open-list">开始挑选</button>
          <button class="text-button" type="button" data-action="open-tryon">直接试戴</button>
          <button class="text-button" type="button" data-action="open-calibrated">按尺寸试戴</button>
        </div>
        <div class="home-metric-grid"><div><strong>10</strong><span>演示镜框</span></div><div><strong>4</strong><span>真实材质</span></div><div><strong>2</strong><span>试戴模式</span></div></div>
      </div>
      <div class="section-heading"><div><span class="eyebrow">01 / 精选镜框</span><h2>从尺寸开始挑</h2></div><button class="text-button" type="button" data-action="open-list">查看全部 <span aria-hidden="true">↗</span></button></div>
      <div class="frame-grid">${frames.slice(0, 4).map(renderFrameCard).join('')}</div>
    </section>
  `;
}

export function renderFrameListPage({ frames }) {
  const styles = ['全部', ...new Set(frames.map((frame) => frame.style))];
  return `
    <section class="page-section">
      <div class="section-heading"><div><span class="eyebrow">02 / 挑选镜框</span><h1>先按尺寸和风格筛一轮</h1></div><button class="text-button" type="button" data-action="open-compare">横向对比 <span aria-hidden="true">↗</span></button></div>
      <div class="filter-row">${styles.map((style, index) => `<button class="filter-chip ${index === 0 ? 'is-active' : ''}" type="button" data-action="filter-style" data-style="${style}">${style}</button>`).join('')}</div>
      <div class="frame-grid">${frames.length ? frames.map(renderFrameCard).join('') : '<p class="empty-state">没有找到符合条件的镜框。</p>'}</div>
    </section>
  `;
}

export function renderFrameDetailPage({ frame, fit }) {
  return `
    <section class="page-section detail-page">
      <button class="text-button back-button" type="button" data-action="back-list">← 返回镜框列表</button>
      <div class="detail-layout">
        <div class="detail-visual"><img src="${frame.imageUrl}" alt="${frame.name}" /></div>
        <div class="detail-copy">
          <p class="eyebrow">${frame.style} · ${frame.fitTags.join(' · ')}</p>
          <h1>${frame.name}</h1>
          <p class="detail-price">¥${frame.price}</p>
          <div class="fit-callout"><span>尺寸建议</span><strong>${fit?.label ?? '先打开试戴判断'}</strong></div>
          <div class="measurement-grid">
            <div><span>镜片宽</span><strong>${frame.lensWidth} mm</strong></div>
            <div><span>鼻梁宽</span><strong>${frame.bridgeWidth} mm</strong></div>
            <div><span>镜片高</span><strong>${frame.lensHeight} mm</strong></div>
            <div><span>镜腿长</span><strong>${frame.templeLength} mm</strong></div>
            <div><span>镜框总宽</span><strong>${frame.frameWidth} mm</strong></div>
          </div>
          <div class="detail-actions">
            <button class="primary-button" type="button" data-action="open-tryon" data-sku-id="${frame.skuId}">开始试戴</button>
            <button class="secondary-button" type="button" data-action="add-compare" data-sku-id="${frame.skuId}">加入对比</button>
            <button class="text-button" type="button" data-action="open-lead" data-sku-id="${frame.skuId}">咨询这副</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderComparePage({ frames }) {
  return `
    <section class="page-section compare-page">
      <button class="text-button back-button" type="button" data-action="back-list">← 返回镜框列表</button>
      <div class="section-heading"><div><span class="eyebrow">横向比较</span><h1>把尺寸放在一起看</h1></div></div>
      <div class="compare-grid">${frames.slice(0, 3).map((frame) => `
        <article class="compare-card" data-compare-frame="${frame.skuId}">
          <img src="${frame.imageUrl}" alt="${frame.name}" />
          <h3>${frame.name}</h3>
          <p>${frame.style} · ¥${frame.price}</p>
          <dl><div><dt>镜框总宽</dt><dd>${frame.frameWidth} mm</dd></div><div><dt>鼻梁宽</dt><dd>${frame.bridgeWidth} mm</dd></div><div><dt>镜腿长</dt><dd>${frame.templeLength} mm</dd></div></dl>
          <button class="secondary-button" type="button" data-action="open-detail" data-sku-id="${frame.skuId}">查看详情</button>
        </article>
      `).join('')}</div>
    </section>
  `;
}
