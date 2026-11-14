export const demoMerchant = {
  tenantId: 'tenant-danyang-demo',
  storeId: 'store-danyang-demo',
  name: '丹阳眼镜样板店',
  subtitle: '源头镜框精选 · 先试戴，再决定',
  themeColor: '#b8643d',
  phone: '400-000-0000',
};

export function renderApp() {
  return `
    <main class="app-shell" data-tenant-id="${demoMerchant.tenantId}">
      <section class="hero-card">
        <p class="eyebrow">${demoMerchant.subtitle}</p>
        <h1>${demoMerchant.name}</h1>
        <p class="hero-copy">从尺寸、风格到上脸效果，先找到适合你的那一副。</p>
        <button class="primary-button" type="button">开始挑选</button>
      </section>
    </main>
  `;
}

export function mountApp(root = document.querySelector('#app')) {
  if (!root) {
    throw new Error('App root element was not found.');
  }
  root.innerHTML = renderApp();
}
