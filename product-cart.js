(() => {
  const slug = location.pathname.split('/').filter(Boolean).pop()?.replace(/\.html$/,'');
  const product = VELTRIDE_PRODUCTS.find(entry => entry.slug === slug && entry.stockStatus === 'in_stock');
  if (!product) return;
  const cartKey = 'veltride_cart_v1';
  const header = document.querySelector('.header-wrap');
  const headerCart = document.createElement('a');
  headerCart.href = '/cart';
  headerCart.setAttribute('aria-label', 'View cart');
  headerCart.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:8px 13px;border-radius:8px;background:#0b6664;color:#fff;font:700 13px Inter,Arial,sans-serif;text-decoration:none;white-space:nowrap';
  if (header) header.append(headerCart);
  function cartCount(){
    try { const cart=JSON.parse(localStorage.getItem(cartKey)||'[]'); return Array.isArray(cart)?cart.reduce((sum,item)=>sum+(Number.isInteger(item.quantity)?item.quantity:0),0):0; }
    catch { return 0; }
  }
  function updateHeaderCart(){headerCart.textContent='Cart ('+cartCount()+')';}
  updateHeaderCart();
  window.addEventListener('storage',updateHeaderCart);
  const target = document.querySelector('.prod-price-box') || document.querySelector('.cta-group') ||
    document.querySelector('.product-info') || document.querySelector('.prod-info');
  if (!target) return;

  const oldVariantTitle = document.querySelector('.quantity-box-title');
  if (oldVariantTitle && /dosage/i.test(oldVariantTitle.textContent)) oldVariantTitle.textContent='Select vial size';
  const panel = document.createElement('section');
  panel.setAttribute('aria-label','Add '+product.name+' to cart');
  panel.style.cssText = 'background:#fff;border:1px solid #dfe8e6;border-radius:12px;padding:20px;margin:18px 0;max-width:620px';
  const title = document.createElement('h2'); title.textContent='Add to cart'; title.style.cssText='font-size:20px;margin:0 0 12px;color:#172323';
  const label = document.createElement('label'); label.textContent='Vial size'; label.style.cssText='display:block;font-size:13px;font-weight:600;color:#172323';
  const select = document.createElement('select'); select.setAttribute('aria-label',product.name+' vial size'); select.style.cssText='display:block;width:100%;padding:10px;margin:7px 0 12px;border:1px solid #dfe8e6;border-radius:6px;background:#fff';
  for (const size of product.vialSizes){const option=document.createElement('option');option.value=size;option.textContent=size;select.append(option);}
  label.append(select);
  const price = document.createElement('p'); price.style.cssText='font-size:19px;font-weight:700;margin:0 0 12px;color:#0b6664';
  const format = amount => new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(amount);
  const variantRadios = Array.from(document.querySelectorAll('input[type="radio"]')).filter(radio => product.vialSizes.includes(radio.value));
  const selectedRadio = variantRadios.find(radio => radio.checked);
  if (selectedRadio) select.value = selectedRadio.value;
  const updatePrice = () => {price.textContent=format(product.prices[select.value])+' CAD';};
  select.addEventListener('change',()=>{
    updatePrice();
    const radio=variantRadios.find(entry=>entry.value===select.value);
    if(radio && !radio.checked) radio.click();
  });
  variantRadios.forEach(radio=>radio.addEventListener('change',()=>{if(radio.checked){select.value=radio.value;updatePrice();}}));
  updatePrice();
  const button=document.createElement('button');button.type='button';button.textContent='Add to cart';button.style.cssText='background:#0b6664;color:#fff;border:0;border-radius:6px;padding:12px 18px;font:inherit;font-weight:700;cursor:pointer;width:100%';
  const link=document.createElement('a');link.href='/cart';link.textContent='View cart';link.style.cssText='display:block;margin-top:12px;color:#0b6664;font-weight:600';
  button.addEventListener('click',()=>{
    let cart=[];try{const parsed=JSON.parse(localStorage.getItem(cartKey)||'[]');if(Array.isArray(parsed))cart=parsed;}catch{}
    const size=select.value;const existing=cart.find(item=>item.slug===slug&&item.size===size);
    if(existing)existing.quantity=Math.min(10,(Number.isInteger(existing.quantity)?existing.quantity:0)+1);
    else if(cart.length<20)cart.push({slug,size,quantity:1});
    else {button.textContent='Cart is full — view cart';return;}
    localStorage.setItem(cartKey,JSON.stringify(cart));button.textContent='Added to cart ✓';updateHeaderCart();
  });
  panel.append(title,label,price,button,link);
  if(target.matches('.prod-price-box')){
    const help=target.querySelector('.btn-order');
    if(help){help.textContent='Questions? Chat on WhatsApp';help.before(panel);}else target.append(panel);
  }
  else if(target.matches('.cta-group')){
    const help=target.querySelector('.btn-whatsapp');if(help)help.textContent='Questions? Chat on WhatsApp';
    target.before(panel);
  }
  else if(target.matches('.product-info, .prod-info'))target.prepend(panel);
  else target.after(panel);
})();

