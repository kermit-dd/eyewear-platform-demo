function formatPrice(price) {
  return `¥${Number(price).toFixed(0)}`;
}

function renderFrameCard(frame) {
  return `
    <article class="frame-card" data-frame-id="${frame.skuId}">
      <button class="frame-card__visual" type="button" data-action="open-detail" data-sku-id="${frame.skuId}">
        <img src="${frame.imageUrl}" alt="${frame.name}" loading="lazy" />
      </button>
      <div class="frame-card__body">
        <div class="frame-card__topline"><span>${frame.style}</span><strong>${formatPrice(frame.price)}</strong></div>
        <h3>${frame.name}</h3>
        <p>镜框总宽 ${frame.frameWidth} mm · ${frame.fitTags.join(' · ')}</p>
      </div>
    </article>
  `;
}

export function renderHomePage({ tenant, frames }) {
  return `
    <section class="page-section home-page">
      <div class="home-intro">
        <p class="eyebrow">${tenant.subtitle}</p>
        <h1>${tenant.name}</h1>
        <p>先看尺寸，再看上脸效果，找到戴起来舒服的那一副。</p>
        <div class="home-actions">
          <button class="primary-button" type="button" data-action="open-list">开始挑选</button>
          <button class="text-button" type="button" data-action="open-tryon">直接试戴</button>
          <button class="text-button" type="button" data-action="open-calibrated">按尺寸试戴</button>
        </div>
      </div>
      <div class="section-heading"><div><span class="eyebrow">本店精选</span><h2>适合今天的镜框</h2></div><button class="text-button" type="button" data-action="open-list">查看全部</button></div>
      <div class="frame-grid">${frames.slice(0, 4).map(renderFrameCard).join('')}</div>
    </section>
  `;
}

export function renderFrameListPage({ frames }) {
  const styles = ['全部', ...new Set(frames.map((frame) => frame.style))];
  return `
    <section class="page-section">
      <div class="section-heading"><div><span class="eyebrow">挑选镜框</span><h1>先按尺寸和风格筛一轮</h1></div><button class="text-button" type="button" data-action="open-compare">对比</button></div>
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
