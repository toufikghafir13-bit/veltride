(() => {
  const slug = location.pathname.split('/').filter(Boolean).pop()?.replace(/\.html$/, '');
  const product = VELTRIDE_PRODUCTS.find(p => p.slug === slug && p.stockStatus === 'in_stock');
  if (!product) return;
  const target = document.querySelector('.prod-price-box') || document.querySelector('.cta-group') || document.querySelector('.product-info') || document.querySelector('.prod-info');
  if (!target) return;
  document.body.classList.add('vr-product');
  const key = 'veltride_cart_v1';
  const panel = document.createElement('section'); panel.className = 'vr-purchase'; panel.setAttribute('aria-label', `Add ${product.name} to cart`);
  const title = document.createElement('h2'); title.textContent = 'Select your research vial';
  const label = document.createElement('label'); label.textContent = 'Vial size';
  const select = document.createElement('select'); select.setAttribute('aria-label', `${product.name} vial size`);
  product.vialSizes.forEach(size => { const option = document.createElement('option'); option.value = size; option.textContent = size; select.append(option); }); label.append(select);
  const price = document.createElement('p');
  const updatePrice = () => { price.textContent = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(product.prices[select.value]) + ' CAD'; };
  select.addEventListener('change', updatePrice); updatePrice();
  const add = document.createElement('button'); add.type = 'button'; add.textContent = 'Add to cart';
  const status = document.createElement('div'); status.setAttribute('role', 'status');
  const cartLink = document.createElement('a'); cartLink.href = '/cart'; cartLink.textContent = 'View cart →';
  const batchLink = document.createElement('a'); batchLink.href = `/quality?batch=${encodeURIComponent(product.coaBatchRef)}`; batchLink.textContent = `Find batch documentation · ${product.coaBatchRef}`;
  add.addEventListener('click', () => {
    let cart = []; try { const value = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(value)) cart = value; } catch {}
    const size = select.value; const existing = cart.find(item => item.slug === slug && item.size === size);
    if (existing && existing.quantity >= 10) { status.textContent = 'Maximum 10 vials per size. Review your cart.'; return; }
    if (!existing && cart.length >= 20) { status.textContent = 'Your cart has reached its item limit. Review your cart.'; return; }
    if (existing) existing.quantity = (Number.isInteger(existing.quantity) && existing.quantity > 0 ? existing.quantity : 0) + 1;
    else cart.push({ slug, size, quantity: 1 });
    try { localStorage.setItem(key, JSON.stringify(cart)); }
    catch { status.textContent = 'Your browser could not save the cart. Please enable site storage.'; return; }
    status.textContent = `${product.name} · ${size} added to cart.`;
    window.dispatchEvent(new Event('veltride:cart'));
  });
  panel.append(title, label, price, add, status, cartLink, batchLink);
  if (target.matches('.prod-price-box')) {
    const help = target.querySelector('.btn-order');
    if (help) { help.textContent = 'Questions? Chat on WhatsApp'; help.before(panel); } else target.append(panel);
  } else if (target.matches('.cta-group')) {
    const help = target.querySelector('.btn-whatsapp'); if (help) help.textContent = 'Questions? Chat on WhatsApp'; target.before(panel);
  } else target.append(panel);
})();
