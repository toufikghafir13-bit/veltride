(() => {
  'use strict';
  const catalogue = typeof VELTRIDE_PRODUCTS !== 'undefined' ? VELTRIDE_PRODUCTS : [];
  const shipping = typeof VELTRIDE_SHIPPING !== 'undefined' ? VELTRIDE_SHIPPING : null;
  const key = 'veltride_cart_v1';
  const money = value => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(value);
  const readCart = () => {
    try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; }
    catch { return []; }
  };
  function updateCartCount() {
    const count = readCart().reduce((sum, item) => sum + (Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 0), 0);
    document.querySelectorAll('[data-cart-count]').forEach(node => { node.textContent = count; });
  }
  updateCartCount();
  window.addEventListener('storage', updateCartCount);
  window.addEventListener('veltride:cart', updateCartCount);
  // Existing catalogue and cart scripts update the same storage key in this tab.
  document.addEventListener('click', () => queueMicrotask(updateCartCount));
  document.addEventListener('change', () => queueMicrotask(updateCartCount));

  const menuButton = document.querySelector('.vr-menu');
  const mobileMenu = document.querySelector('.vr-mobile');
  function closeMenu() { if (mobileMenu) mobileMenu.hidden = true; menuButton?.setAttribute('aria-expanded', 'false'); }
  menuButton?.addEventListener('click', () => {
    mobileMenu.hidden = !mobileMenu.hidden;
    menuButton.setAttribute('aria-expanded', String(!mobileMenu.hidden));
  });
  const current = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  document.querySelectorAll('.vr-links a,.vr-mobile a').forEach(a => {
    if (a.getAttribute('href').replace(/\/$/, '') === current) a.setAttribute('aria-current', 'page');
  });
  if (shipping) {
    const announcement = document.querySelector('[data-shipping-announcement]');
    if (announcement) announcement.textContent = `Canada-wide · Free standard shipping over ${money(shipping.freeShippingThreshold)} CAD →`;
    const homeShipping = document.querySelector('[data-home-shipping]');
    if (homeShipping) homeShipping.textContent = shipping.policy + ' ' + shipping.regions;
  }

  const pages = [
    { name: 'Quality / COA', url: '/quality', detail: 'Batch documentation' },
    { name: 'Shipping information', url: '/shipping', detail: 'Delivery regions and terms' },
    { name: 'Research library', url: '/blog/', detail: 'Research articles' },
    { name: 'Common questions', url: '/faq', detail: 'Catalogue FAQ' },
    { name: 'Contact VELTRIDE', url: '/contact', detail: 'Support and document requests' },
    ...[
      ['AOD-9604', 'aod-9604'], ['CJC-1295 No DAC', 'cjc-1295'], ['Tesamorelin', 'tesamorelin'],
      ['TB-500', 'tb-500'], ['MOTS-C', 'mots-c'], ['Semax', 'semax'], ['KPV', 'kpv'],
      ['Kisspeptin-10', 'kisspeptin-10'], ['PT-141', 'pt-141'], ['Thymosin Alpha-1', 'thymosin-alpha-1']
    ].map(([name, slug]) => ({ name, url: `/${slug}`, detail: 'Research reference · Information on request' }))
  ];
  const form = document.querySelector('.vr-search');
  const searchInput = document.getElementById('vr-search-input');
  const results = document.getElementById('vr-search-results');
  const items = document.querySelector('.vr-search-items');
  const status = document.querySelector('.vr-search-status');
  function closeSearch() { if (results) results.hidden = true; searchInput?.setAttribute('aria-expanded', 'false'); }
  function showSearch() {
    const query = searchInput.value.trim().toLowerCase();
    items.replaceChildren();
    if (!query) { closeSearch(); return; }
    const matches = catalogue.filter(p => `${p.name} ${p.slug} ${p.category} ${p.coaBatchRef}`.toLowerCase().includes(query)).map(p => ({
      name: p.name,
      url: query.startsWith('vt-') ? `/quality?batch=${encodeURIComponent(p.coaBatchRef)}` : `/${p.slug}`,
      detail: `${p.vialSizes.join(' / ')} · ${p.coaBatchRef}`
    }));
    matches.push(...pages.filter(p => `${p.name} ${p.detail}`.toLowerCase().includes(query)));
    for (const match of matches) {
      const link = document.createElement('a'); link.href = match.url;
      const name = document.createElement('span'); name.textContent = match.name;
      const detail = document.createElement('small'); detail.textContent = match.detail;
      link.append(name, detail); items.append(link);
    }
    status.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'}` : 'No matching compounds or pages. Try a compound name or batch reference.';
    results.hidden = false; searchInput.setAttribute('aria-expanded', 'true');
  }
  searchInput?.addEventListener('input', showSearch);
  searchInput?.addEventListener('focus', () => { if (searchInput.value.trim()) showSearch(); });
  form?.addEventListener('submit', event => { event.preventDefault(); showSearch(); items.querySelector('a')?.focus(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeSearch(); closeMenu(); }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.vr-search-wrap')) closeSearch(); });

  const toast = document.createElement('div'); toast.className = 'vr-toast'; toast.setAttribute('role', 'status'); toast.hidden = true; document.body.append(toast);
  let toastTimer;
  function message(text) { toast.textContent = text; toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 3500); }
  function addItem(product, size) {
    const cart = readCart(); const existing = cart.find(item => item.slug === product.slug && item.size === size);
    if (existing && existing.quantity >= 10) { message('Maximum 10 vials per size. Review your cart.'); return; }
    if (!existing && cart.length >= 20) { message('Your cart has reached its item limit. Review your cart.'); return; }
    if (existing) existing.quantity = (Number.isInteger(existing.quantity) && existing.quantity > 0 ? existing.quantity : 0) + 1;
    else cart.push({ slug: product.slug, size, quantity: 1 });
    try { localStorage.setItem(key, JSON.stringify(cart)); }
    catch { message('Your browser could not save the cart. Please enable site storage.'); return; }
    updateCartCount(); message(`${product.name} · ${size} added to cart.`);
  }
  const homeProducts = document.querySelector('[data-home-products]');
  if (homeProducts && catalogue.length) {
    homeProducts.replaceChildren();
    const featured = ['semaglutide', 'tirzepatide', 'retatrutide', 'bpc-157', 'ghk-cu', 'ipamorelin', 'epithalon', 'nad-plus'];
    for (const slug of featured) {
      const p = catalogue.find(product => product.slug === slug); if (!p) continue;
      const card = document.createElement('article'); card.className = 'vr-card';
      const visual = document.createElement('a'); visual.href = `/${p.slug}`;
      const img = document.createElement('img'); img.src = p.imagePath; img.alt = `Illustrative ${p.name} vial`; img.loading = 'lazy'; img.decoding = 'async'; visual.append(img);
      const body = document.createElement('div'); body.className = 'vr-card-body';
      const category = document.createElement('span'); category.className = 'vr-type'; category.textContent = p.category;
      const title = document.createElement('h3'); const titleLink = document.createElement('a'); titleLink.href = visual.href; titleLink.textContent = p.name; title.append(titleLink);
      const batch = document.createElement('a'); batch.className = 'vr-batch'; batch.href = `/quality?batch=${encodeURIComponent(p.coaBatchRef)}`; batch.textContent = `Batch reference · ${p.coaBatchRef}`;
      const label = document.createElement('label'); label.textContent = 'Vial size';
      const select = document.createElement('select'); select.setAttribute('aria-label', `${p.name} vial size`);
      p.vialSizes.forEach(size => { const option = document.createElement('option'); option.value = size; option.textContent = size; select.append(option); }); label.append(select);
      const price = document.createElement('p'); price.className = 'vr-price';
      const updatePrice = () => { price.textContent = `${money(p.prices[select.value])} CAD`; };
      select.addEventListener('change', updatePrice); updatePrice();
      const add = document.createElement('button'); add.type = 'button'; add.textContent = 'Add to cart'; add.addEventListener('click', () => addItem(p, select.value));
      const detail = document.createElement('a'); detail.href = visual.href; detail.className = 'vr-details'; detail.textContent = 'Product details ↗';
      body.append(category, title, batch, label, price, add, detail); card.append(visual, body); homeProducts.append(card);
    }
  }
  const categories = document.querySelector('[data-home-categories]');
  const groups = [['Metabolic research', 'metabolic'], ['Peptide research', 'peptide'], ['Biochemical research', 'biochemical'], ['Other research', 'other']];
  const categoryOf = p => /metabolic/i.test(p.category) ? 'metabolic' : /biochemical|longevity/i.test(p.category) && p.slug === 'nad-plus' ? 'biochemical' : /recovery|regeneration|hormone|cognitive|melanocortin|longevity/i.test(p.category) && p.slug !== 'mk-677' ? 'peptide' : 'other';
  if (categories) groups.forEach(([name, value]) => {
    const a = document.createElement('a'); a.href = `/shop?category=${value}`; a.textContent = name;
    const count = document.createElement('span'); const n = catalogue.filter(p => categoryOf(p) === value).length; count.textContent = `${n} priced ${n === 1 ? 'compound' : 'compounds'} →`; a.append(count); categories.append(a);
  });
  if (document.body.classList.contains('page-shop')) {
    const requested = new URLSearchParams(location.search).get('category');
    if (['metabolic', 'peptide', 'biochemical', 'other'].includes(requested)) document.querySelector(`button[data-filter="${requested}"]`)?.click();
    for (const card of document.querySelectorAll('main.grid .card')) {
      const details = card.querySelector('a.view');
      const p = catalogue.find(p => `/${p.slug}` === details?.getAttribute('href'));
      if (p && card.querySelector('.body')) {
        const a = document.createElement('a'); a.className = 'vr-document-link'; a.href = `/quality?batch=${encodeURIComponent(p.coaBatchRef)}`; a.textContent = `Batch reference · ${p.coaBatchRef}`; card.querySelector('.body').append(a);
      }
    }
  }
  if (current === '/quality') {
    const table = document.querySelector('table');
    if (table) {
      const rows = Array.from(table.querySelectorAll('tr')).filter(row => row.querySelector('td'));
      const label = document.createElement('label'); label.className = 'vr-quality-search'; label.textContent = 'Find a compound or batch reference';
      const input = document.createElement('input'); input.type = 'search'; input.placeholder = 'For example, Retatrutide or VT-RET'; input.setAttribute('aria-label', 'Filter batch documentation'); label.append(input);
      const count = document.createElement('p'); count.className = 'vr-quality-status'; count.setAttribute('role', 'status');
      const request = document.createElement('a'); request.className = 'vr-document-link'; request.textContent = 'Request the original COA document →'; request.href = '/contact';
      table.parentElement.before(label, count, request);
      function filter() {
        const query = input.value.trim().toLowerCase(); let visible = 0;
        rows.forEach(row => { row.hidden = !row.textContent.toLowerCase().includes(query); if (!row.hidden) visible++; });
        count.textContent = `${visible} batch ${visible === 1 ? 'reference' : 'references'}. Original documents are available from VELTRIDE on request.`;
        request.href = query ? `mailto:support@veltride.ca?subject=${encodeURIComponent('COA request: ' + input.value.trim())}` : '/contact';
      }
      input.value = new URLSearchParams(location.search).get('batch') || ''; input.addEventListener('input', filter); filter();
      if (input.value) label.scrollIntoView({ block: 'start' });
    }
  }
})();
