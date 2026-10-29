(() => {
  const root = document.querySelector('[data-mobile-lab]');
  if (!root) return;
  const me = root.dataset.user;
  const view = document.getElementById('app-view');
  const title = document.getElementById('app-title');
  const log = document.getElementById('net-log');
  const editor = document.getElementById('net-editor');
  const methodInput = document.getElementById('net-method');
  const pathInput = document.getElementById('net-path');
  const bodyInput = document.getElementById('net-body');
  const output = document.getElementById('net-response');
  const entries = [];
  const chat = [{from: 'bot', text: 'Merhaba! Ürün, sipariş ve iade konularında yardımcı olabilirim.'}];
  const money = (value) => `₺${new Intl.NumberFormat('tr-TR').format(value)}`;

  // Tüm metinler textContent ile basılır; araç kendi başına yeni bir XSS yüzeyi açmaz.
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const select = (entry) => {
    methodInput.value = entry.method;
    pathInput.value = entry.path;
    bodyInput.value = entry.body || '';
    output.textContent = `HTTP ${entry.status}\n${JSON.stringify(entry.data, null, 2)}`;
    [...log.children].forEach((item, index) => item.classList.toggle('selected', entries[index] === entry));
  };

  // Uygulamanın attığı her istek bu fonksiyondan geçer ve ağ paneline yazılır.
  const api = async (method, path, body) => {
    const options = {method, headers: {}};
    if (body !== undefined && body !== '') {
      options.headers['Content-Type'] = 'application/json';
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    let status = 0;
    let data = {error: 'network_error'};
    try {
      const response = await fetch(path, options);
      status = response.status;
      data = await response.json().catch(() => ({error: 'json_olmayan_yanit'}));
    } catch (_) { /* sunucu kapalıysa status 0 kalır */ }
    const entry = {method, path, body: options.body, status, data};
    entries.push(entry);
    const item = el('li');
    item.append(el('span', 'net-method', method), el('span', 'net-path', path), el('span', `net-status ${status && status < 400 ? 'ok' : 'err'}`, String(status)));
    item.addEventListener('click', () => select(entry));
    log.append(item);
    log.scrollTop = log.scrollHeight;
    select(entry);
    return {status, data};
  };

  const loginPrompt = (text) => {
    const box = el('div', 'app-empty');
    const link = el('a', 'app-button', 'Giriş yap');
    link.href = '/login?next=/mobile';
    box.append(el('p', '', text), link);
    view.replaceChildren(box);
  };

  const failure = (data) => view.replaceChildren(el('div', 'app-empty', `İşlem başarısız: ${data?.error || 'bilinmeyen hata'}`));

  const screens = {
    async discover() {
      const {status, data} = await api('GET', '/api/products');
      if (status !== 200) return failure(data);
      const list = el('div', 'app-products');
      data.forEach((product) => {
        const card = el('article', 'app-product');
        const image = el('img');
        image.src = `/static/${product.image}`;
        image.alt = product.name;
        card.append(image, el('small', '', product.brand), el('b', '', product.name), el('span', '', money(product.price)));
        list.append(card);
      });
      view.replaceChildren(list);
    },

    async orders() {
      if (!me) return loginPrompt('Siparişlerini görmek için giriş yapmalısın.');
      const {status, data} = await api('GET', '/api/orders');
      if (status !== 200) return failure(data);
      const list = el('div', 'app-list');
      list.append(el('h2', '', 'Siparişlerim'));
      data.forEach((order) => {
        const row = el('button', 'app-row');
        row.append(el('small', '', `#VL-2026-00${order.id}`), el('b', '', order.title), el('span', 'app-pill', order.status));
        row.addEventListener('click', () => orderDetail(order.id));
        list.append(row);
      });
      view.replaceChildren(list);
    },

    assistant() {
      const wrap = el('div', 'app-chat');
      const messages = el('div', 'app-messages');
      const render = () => {
        messages.replaceChildren(...chat.map((m) => el('p', `app-bubble ${m.from}`, m.text)));
        messages.scrollTop = messages.scrollHeight;
      };
      const form = el('form', 'app-compose');
      const input = el('input');
      input.placeholder = 'Mesaj yaz...';
      input.setAttribute('aria-label', 'Mesaj');
      form.append(input, el('button', '', '→'));
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const message = input.value.trim();
        if (!message) return;
        input.value = '';
        chat.push({from: 'user', text: message});
        render();
        const {data} = await api('POST', '/api/chat', {message});
        chat.push({from: 'bot', text: data.answer || 'Şu an yanıt veremiyorum.'});
        render();
      });
      wrap.append(messages, form);
      view.replaceChildren(wrap);
      render();
    },

    async profile() {
      if (!me) return loginPrompt('Profilini görmek için giriş yapmalısın.');
      const {status, data} = await api('GET', `/api/users/${me}`);
      if (status !== 200) return failure(data);
      const box = el('div', 'app-list');
      const avatar = el('div', 'app-avatar', (data.name || '?')[0]);
      const role = el('p', 'app-role', `Hesap türü: ${data.role === 'admin' ? 'Yönetici' : 'Müşteri'}`);
      const form = el('form', 'app-form');
      const name = el('input');
      name.value = data.name || '';
      name.setAttribute('aria-label', 'Ad soyad');
      const phone = el('input');
      phone.placeholder = 'Telefon';
      phone.setAttribute('aria-label', 'Telefon');
      form.append(name, phone, el('button', 'app-button', 'Kaydet'));
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const result = await api('PATCH', '/api/profile', {name: name.value, phone: phone.value});
        if (result.status === 200) role.textContent = `Hesap türü: ${result.data.role === 'admin' ? 'Yönetici' : 'Müşteri'}`;
      });
      box.append(avatar, el('h2', '', data.name), role, form);
      view.replaceChildren(box);
    },
  };

  const orderDetail = async (id) => {
    const {status, data} = await api('GET', `/api/orders/${id}`);
    if (status !== 200) return failure(data);
    const box = el('div', 'app-list');
    const back = el('button', 'app-back', '← Siparişlerim');
    back.addEventListener('click', () => screens.orders());
    box.append(back, el('small', '', `#VL-2026-00${data.id}`), el('h2', '', data.title), el('span', 'app-pill', data.status), el('p', '', data.body), el('b', '', data.price));
    view.replaceChildren(box);
  };

  const names = {discover: 'Keşfet', orders: 'Siparişler', assistant: 'Asistan', profile: 'Profil'};
  document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-tab]').forEach((other) => other.classList.toggle('active', other === button));
    title.textContent = names[button.dataset.tab];
    screens[button.dataset.tab]();
  }));

  editor.addEventListener('submit', (event) => {
    event.preventDefault();
    const method = methodInput.value;
    // fetch GET isteğine gövde eklenmesine izin vermez; GET'te gövde yok sayılır.
    api(method, pathInput.value.trim(), method === 'GET' ? undefined : bodyInput.value.trim());
  });
  document.getElementById('net-clear').addEventListener('click', () => {
    entries.length = 0;
    log.replaceChildren();
    output.textContent = 'Kayıt temizlendi.';
  });

  screens.discover();
})();
