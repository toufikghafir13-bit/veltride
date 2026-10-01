(() => {
  const STORAGE_KEY = 'veltride_cart_v1';
  const products = new Map(VELTRIDE_PRODUCTS.map(product => [product.slug, product]));
  const money = amount => new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(amount);
  const cartLink = document.createElement('a');
  cartLink.href = '/cart';
  cartLink.className = 'cart-link';
  document.querySelector('header nav')?.append(cartLink);

  function readCart(){
    try { const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); return Array.isArray(value)?value:[]; }
    catch { return []; }
  }
  function updateCount(){
    const count=readCart().reduce((sum,item)=>sum+(Number.isInteger(item.quantity)?item.quantity:0),0);
    cartLink.textContent=`Cart (${Math.max(0,count)})`;
  }

  for(const original of document.querySelectorAll('.grid > .card')){
    const href=original.getAttribute('href');
    const slug=href?.replace(/^\//,'');
    const product=products.get(slug);
    if(!product || product.stockStatus!=='in_stock')continue;
    const card=document.createElement('div');card.className=original.className;
    while(original.firstChild)card.append(original.firstChild);
    original.replaceWith(card);
    const body=card.querySelector('.body');
    const view=body?.querySelector('.view');
    if(!body || !view)continue;
    view.remove();
    const price=document.createElement('p'); price.className='cart-price';
    const label=document.createElement('label'); label.className='size-label'; label.textContent='Vial size';
    const select=document.createElement('select'); select.setAttribute('aria-label',product.name+' vial size');
    for(const size of product.vialSizes){const option=document.createElement('option');option.value=size;option.textContent=size;select.append(option);}
    label.append(select);
    const button=document.createElement('button');button.type='button';button.className='add-cart';button.textContent='Add to cart';
    const details=document.createElement('a');details.href=href;details.className='view';details.textContent='View details →';
    function updatePrice(){price.textContent=money(product.prices[select.value])+' CAD';}
    select.addEventListener('change',updatePrice);updatePrice();
    button.addEventListener('click',()=>{
      const size=select.value;const cart=readCart();const item=cart.find(entry=>entry.slug===slug && entry.size===size);
      if(item){item.quantity=Math.min(10,(Number.isInteger(item.quantity)?item.quantity:0)+1);}
      else if(cart.length<20)cart.push({slug,size,quantity:1});
      else {button.textContent='Cart is full — view cart';return;}
      localStorage.setItem(STORAGE_KEY,JSON.stringify(cart));updateCount();
      button.textContent='Added ✓';setTimeout(()=>{button.textContent='Add to cart';},1600);
    });
    body.append(price,label,button,details);
  }
  updateCount();
  window.addEventListener('storage',updateCount);
})();

