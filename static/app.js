(() => {
  const CART_KEY = 'velunda-cart-v1';
  const FAVORITES_KEY = 'velunda-favorites-v1';
  let products = [];
  const money = (value) => `₺${new Intl.NumberFormat('tr-TR').format(value)}`;
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const cart = () => read(CART_KEY, []);
  const favorites = () => read(FAVORITES_KEY, []);
  const getProduct = (id) => products.find((product) => product.id === id);

  const toast = (message) => {
    const old = document.querySelector('.store-toast');
    if (old) old.remove();
    const node = document.createElement('div');
    node.className = 'store-toast';
    node.textContent = message;
    document.body.appendChild(node);
    requestAnimationFrame(() => node.classList.add('show'));
    setTimeout(() => { node.classList.remove('show'); setTimeout(() => node.remove(), 250); }, 1800);
  };
  const updateBadges = () => {
    const count = cart().reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('[data-cart-count]').forEach((node) => { node.textContent = count; });
    const favs = favorites();
    document.querySelectorAll('[data-product-id]').forEach((card) => {
      const button = card.querySelector('[data-favorite]');
      if (button) { button.textContent = favs.includes(card.dataset.productId) ? '♥' : '♡'; button.classList.toggle('active', favs.includes(card.dataset.productId)); }
    });
  };
  const addToCart = (id, quantity = 1) => {
    const items = cart();
    const existing = items.find((item) => item.id === id);
    if (existing) existing.qty += quantity; else items.push({id, qty: quantity});
    write(CART_KEY, items);
    updateBadges();
    toast(`${getProduct(id)?.name || 'Ürün'} sepete eklendi`);
  };
  const toggleFavorite = (id) => {
    const items = favorites();
    const next = items.includes(id) ? items.filter((item) => item !== id) : [...items, id];
    write(FAVORITES_KEY, next);
    updateBadges();
    toast(next.includes(id) ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı');
    renderFavorites();
  };
  const productCard = (product) => `<article class="product-card" data-product-id="${product.id}"><div class="product-image"><a href="/product/${product.id}"><img src="/static/${product.image}" alt="${product.name}"></a><button class="heart active" data-favorite>♥</button><button class="quick-add" data-add-cart>Sepete ekle</button></div><div class="product-info"><small>${product.brand.toUpperCase()}</small><h3><a href="/product/${product.id}">${product.name}</a></h3><p>${product.description}</p><div><b>${money(product.price)}</b><span>${product.rating} ★</span></div></div></article>`;

  const renderCart = () => {
    const view = document.querySelector('#cart-view');
    if (!view) return;
    const items = cart().map((item) => ({...item, product:getProduct(item.id)})).filter((item) => item.product);
    if (!items.length) { view.innerHTML = '<div class="empty-state"><span>◌</span><h2>Sepetin henüz boş</h2><p>Seçkimizden ürün ekleyerek başlayabilirsin.</p><a class="cta" href="/">Alışverişe başla →</a></div>'; return; }
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    const shipping = subtotal >= 2500 ? 0 : 99;
    view.innerHTML = `<div class="cart-items">${items.map(({product,qty}) => `<article class="cart-item" data-product-id="${product.id}"><img src="/static/${product.image}" alt="${product.name}"><div><small>${product.brand}</small><h3><a href="/product/${product.id}">${product.name}</a></h3><p>${product.description}</p><button data-remove>Ürünü kaldır</button></div><div class="quantity"><button data-minus>−</button><b>${qty}</b><button data-plus>+</button></div><strong>${money(product.price * qty)}</strong></article>`).join('')}</div><aside class="summary-card"><h2>Sipariş özeti</h2><div><span>Ara toplam</span><b>${money(subtotal)}</b></div><div><span>Kargo</span><b>${shipping ? money(shipping) : 'Ücretsiz'}</b></div><div class="summary-total"><span>Toplam</span><b>${money(subtotal + shipping)}</b></div><a class="checkout-button" href="/checkout">Ödemeye geç</a><small>Gerçek ödeme alınmaz; eğitim amaçlı demo akışıdır.</small></aside>`;
  };
  const changeQuantity = (id, delta) => {
    const items = cart(); const item = items.find((entry) => entry.id === id); if (!item) return;
    item.qty += delta; write(CART_KEY, items.filter((entry) => entry.qty > 0)); updateBadges(); renderCart();
  };
  const renderFavorites = () => {
    const view = document.querySelector('#favorites-view'); if (!view) return;
    const items = favorites().map(getProduct).filter(Boolean);
    view.innerHTML = items.length ? items.map(productCard).join('') : '<div class="empty-state"><span>♡</span><h2>Favori listen boş</h2><p>Ürün kartlarındaki kalbe dokunarak liste oluşturabilirsin.</p><a class="cta" href="/">Ürünleri keşfet →</a></div>';
  };
  const renderCheckout = () => {
    const summary = document.querySelector('#checkout-summary'); const hidden = document.querySelector('#checkout-cart'); if (!summary || !hidden) return;
    const items = cart().map((item) => ({...item, product:getProduct(item.id)})).filter((item) => item.product);
    hidden.value = JSON.stringify(items.map(({id,qty}) => ({id,qty})));
    if (!items.length) { summary.innerHTML = '<h2>Sepetin boş</h2><a href="/">Ürünlere dön</a>'; document.querySelector('.checkout-button').disabled = true; return; }
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    const shipping = subtotal >= 2500 ? 0 : 99;
    summary.innerHTML = `<h2>Sipariş özeti</h2>${items.map((item) => `<div><span>${item.product.name} × ${item.qty}</span><b>${money(item.product.price * item.qty)}</b></div>`).join('')}<div><span>Kargo</span><b>${shipping ? money(shipping) : 'Ücretsiz'}</b></div><div class="summary-total"><span>Toplam</span><b>${money(subtotal + shipping)}</b></div>`;
  };

  const setupCatalog = () => {
    const grid = document.querySelector('#catalog-products');
    if (!grid) return;
    const cards = [...grid.querySelectorAll('.product-card')];
    const sort = document.querySelector('#catalog-sort');
    const freeShipping = document.querySelector('#filter-free-shipping');
    const sale = document.querySelector('#filter-sale');
    const count = document.querySelector('[data-result-count]');
    const empty = grid.querySelector('.catalog-empty');
    const apply = () => {
      const visible = cards.filter((card) => {
        const price = Number(card.dataset.price);
        return (!freeShipping?.checked || price >= 2500) && (!sale?.checked || card.dataset.sale === 'true');
      });
      cards.forEach((card) => { card.hidden = !visible.includes(card); });
      const ordered = [...visible].sort((a, b) => {
        if (sort?.value === 'price-asc') return Number(a.dataset.price) - Number(b.dataset.price);
        if (sort?.value === 'rating-desc') return Number(b.dataset.rating) - Number(a.dataset.rating);
        return cards.indexOf(a) - cards.indexOf(b);
      });
      ordered.forEach((card) => grid.insertBefore(card, empty));
      if (count) count.textContent = visible.length;
      if (empty) empty.hidden = visible.length !== 0;
    };
    [sort, freeShipping, sale].forEach((control) => control?.addEventListener('change', apply));
    document.querySelector('[data-clear-filters]')?.addEventListener('click', () => {
      if (freeShipping) freeShipping.checked = false;
      if (sale) sale.checked = false;
      if (sort) sort.value = 'featured';
      apply();
    });
  };

  const setupStore = async () => {
    try { products = await fetch('/api/products').then((response) => response.json()); } catch (_) { products = []; }
    updateBadges(); renderCart(); renderFavorites(); renderCheckout(); setupCatalog();
    document.addEventListener('click', (event) => {
      const card = event.target.closest('[data-product-id]'); const id = card?.dataset.productId;
      if (event.target.closest('[data-add-cart]') && id) addToCart(id);
      if (event.target.closest('[data-favorite]') && id) toggleFavorite(id);
      if (event.target.closest('[data-plus]') && id) changeQuantity(id, 1);
      if (event.target.closest('[data-minus]') && id) changeQuantity(id, -1);
      if (event.target.closest('[data-remove]') && id) { write(CART_KEY, cart().filter((item) => item.id !== id)); updateBadges(); renderCart(); }
      if (event.target.closest('[data-clear-cart]')) write(CART_KEY, []);
    });
  };

  const launcher = document.querySelector('#chat-launcher'); const widget = document.querySelector('#chat-widget'); const close = document.querySelector('#chat-close'); const form = document.querySelector('#chat-form'); const input = document.querySelector('#chat-input'); const messages = document.querySelector('#chat-messages');
  if (launcher && widget && form) {
    const setOpen = (open) => { widget.hidden = !open; launcher.classList.toggle('is-hidden', open); if (open) input.focus(); };
    const addMessage = (text, kind) => { const node=document.createElement('div'); node.className=`chat-message ${kind}-message`; node.textContent=text; messages.appendChild(node); messages.scrollTop=messages.scrollHeight; return node; };
    const send = async (text) => { if(!text.trim())return; addMessage(text,'user'); const typing=addMessage('Yazıyor…','bot'); try{const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})}); const data=await response.json(); typing.textContent=data.answer;}catch(_){typing.textContent='Şu anda yanıt veremiyorum. Lütfen tekrar dene.';} messages.scrollTop=messages.scrollHeight; };
    launcher.addEventListener('click',()=>setOpen(true)); close.addEventListener('click',()=>setOpen(false)); document.querySelectorAll('[data-open-chat]').forEach((button)=>button.addEventListener('click',()=>setOpen(true))); form.addEventListener('submit',(event)=>{event.preventDefault();const text=input.value;input.value='';send(text);}); document.querySelectorAll('.chat-suggestions button').forEach((button)=>button.addEventListener('click',()=>send(button.textContent)));
  }

  const challengeFilters = document.querySelectorAll('[data-challenge-filter]');
  challengeFilters.forEach((button) => button.addEventListener('click', () => {
    challengeFilters.forEach((item) => item.classList.toggle('active', item === button));
    document.querySelectorAll('[data-challenge-area]').forEach((card) => {
      card.hidden = button.dataset.challengeFilter !== 'all' && !card.dataset.challengeArea.includes(button.dataset.challengeFilter);
    });
  }));

  document.querySelectorAll('[data-copy-payload]').forEach((button) => button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(button.dataset.copyPayload); button.textContent = 'Kopyalandı'; }
    catch (_) { button.textContent = 'Seçip kopyala'; }
    setTimeout(() => { button.textContent = 'Kopyala'; }, 1400);
  }));

  const apiOutput = document.querySelector('#api-console-output');
  const apiStatus = document.querySelector('#api-console-status');
  document.querySelectorAll('[data-api-run]').forEach((button) => button.addEventListener('click', async () => {
    const options = { method: button.dataset.method, headers: {} };
    if (button.dataset.body) { options.headers['Content-Type'] = 'application/json'; options.body = button.dataset.body; }
    apiStatus.textContent = `${options.method} ${button.dataset.path}`;
    apiOutput.textContent = 'İstek gönderiliyor…';
    try {
      const response = await fetch(button.dataset.path, options);
      const data = await response.json();
      apiStatus.textContent = `HTTP ${response.status}`;
      apiOutput.textContent = JSON.stringify(data, null, 2);
      document.querySelector('.api-console')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (_) {
      apiStatus.textContent = 'Bağlantı hatası';
      apiOutput.textContent = 'API yanıtı alınamadı.';
    }
  }));
  setupStore();
})();
