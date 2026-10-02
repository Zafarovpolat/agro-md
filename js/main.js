/* ============================================================
   TractorMD — логика витрины
   • статусы: в наличии / в дороге / забронировано / продан
   • счётчик поставки считается от даты прибытия в браузере клиента
   • заявки на бронь сохраняются в localStorage (в WordPress пойдут на e-mail)
   ============================================================ */
(function () {
  const { today, plus, products: BASE, containers, i18n, phone, phoneRaw, whatsapp, email } = window.AGRO;
  const DAY = 86400000;
  const LS = { lang: 'tm-lang', bookings: 'tm-bookings', overrides: 'tm-overrides', lastSeen: 'tm-lastseen' };

  /* ---------------- язык ---------------- */
  let lang = localStorage.getItem(LS.lang) || 'ru';
  const S = (k) => (i18n[k] ? i18n[k][lang] || i18n[k].ru : k);

  function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = S(el.dataset.i18n);
      if (el.hasAttribute('data-i18n-html')) el.innerHTML = v; else el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = S(el.dataset.i18nPh); });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      document.title = S(el.dataset.i18nTitle) + (el.dataset.titleSuffix || '');
    });
    document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
    document.documentElement.lang = lang;
  }

  /* ---------------- даты ---------------- */
  const parse = (iso) => new Date(iso + 'T00:00:00');
  const fmt = (iso) => parse(iso).toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const leftDays = (iso) => Math.round((parse(iso) - today) / DAY);
  function plural(n, one, few, many) {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  }

  /* ---------------- правки «из админки» (демо) ---------------- */
  function withOverrides() {
    let ov = {};
    try { ov = JSON.parse(localStorage.getItem(LS.overrides) || '{}'); } catch (e) { ov = {}; }
    return BASE.map((p) => {
      const o = ov[p.id] || {};
      const np = Object.assign({}, p, o);
      if (o.days !== undefined && o.arrival === undefined) np.arrival = plus(o.days);
      return np;
    });
  }
  const saveOverride = (id, patch) => {
    let ov = {};
    try { ov = JSON.parse(localStorage.getItem(LS.overrides) || '{}'); } catch (e) { ov = {}; }
    ov[id] = Object.assign(ov[id] || {}, patch);
    localStorage.setItem(LS.overrides, JSON.stringify(ov));
  };

  /* ---------------- статусы ---------------- */
  const STATUS = {
    stock:    { key: 'st.stock',    cls: 'b-stock',    pill: '#2E7D32' },
    transit:  { key: 'st.transit',  cls: 'b-transit',  pill: '#D97706' },
    reserved: { key: 'st.reserved', cls: 'b-reserved', pill: '#B58900' },
    sold:     { key: 'st.sold',     cls: 'b-sold',     pill: '#8A8F98' }
  };
  // Кнопка в карточке зависит от статуса — «Купить» превращается в «Забронировать»
  function actionFor(p) {
    if (p.status === 'sold')     return { label: S('card.ask'),    cls: 'btn-ghost', act: 'similar' };
    if (p.status === 'reserved') return { label: S('card.reserved'), cls: 'btn-ghost', act: 'none', disabled: true };
    if (p.status === 'stock')    return { label: S('card.inquiry'), cls: 'btn-primary', act: 'book' };
    return { label: S('card.reserve'), cls: 'btn-accent', act: 'book' };
  }

  /* ---------------- счётчик поставки — «логичная» версия ----------------
     1) пока срок не истёк: «Осталось N дней» + прогресс-бар (путь = срок поставки)
     2) 0–7 дней: «Ожидается со дня на день», зелёный
     3) срок истёк: «Рейс задерживается — точную дату подтверждает менеджер» (без минусов)
     4) прибыл: «В Молдове с <дата>», счётчик убирается
     Считается от даты прибытия и сегодняшнего дня на устройстве клиента. */
  // техника уже в стране: либо склад, либо менеджер проставил фактическую дату прибытия,
  // либо статус «в наличии». Приоритет выше счётчика — иначе «в наличии + забронировано»
  // показывало бы «рейс задерживается».
  function isInCountry(p) {
    return p.container === 'склад' || !!p.arrived || p.status === 'stock';
  }

  function countdownHTML(p) {
    if (p.status === 'sold') return '';
    if (isInCountry(p)) {
      const here = p.arrived || (leftDays(p.arrival) <= 0 ? p.arrival : null);
      const label = here
        ? `${S('cnt.arrived')} ${fmt(here)}`
        : (lang === 'ro' ? 'Disponibil în depozit' : 'В наличии на складе');
      return `<div class="count is-done"><div class="count-top"><b>✅ ${label}</b></div>
        <div class="count-sub">${S('catalog.fromCont')}: ${p.container}</div></div>`;
    }
    const left = leftDays(p.arrival);
    const total = Math.max(1, Math.round((parse(p.arrival) - parse(p.start)) / DAY));
    const passed = Math.min(100, Math.max(3, Math.round(((total - left) / total) * 100)));
    const bar = `<div class="count-bar"><i style="width:${passed}%"></i></div>`;
    const subLine = `<div class="count-sub">${S('cnt.expected')} ${fmt(p.arrival)} · ${S('catalog.fromCont')} ${p.container}</div>`;

    if (left < 0) {
      return `<div class="count is-late"><div class="count-top"><b>⚠ ${S('cnt.late')}</b></div>
        <div class="count-sub">${S('cnt.late.sub')} · ${S('cnt.calc')} ${fmt(p.arrival)}</div></div>`;
    }
    if (left <= 7) {
      return `<div class="count is-soon"><div class="count-top"><b>📦 ${S('cnt.soon')}</b>
        <span>${left} ${plural(left, 'день', 'дня', 'дней')}</span></div>${subLine}${bar}</div>`;
    }
    const head = p.status === 'reserved'
      ? `<b>🔒 ${S('cnt.res.days')} ${left} ${S('cnt.days')}</b>`
      : `<b>🚚 ${S('cnt.left')} ${left} ${S('cnt.days')}</b>`;
    return `<div class="count"><div class="count-top">${head}</div>${subLine}${bar}</div>`;
  }

  /* ---------------- карточка товара ---------------- */
  function imgTag(p, cls) {
    const src = p.images && p.images[0] ? p.images[0] : '';
    const fb = placeholder(p);
    return src
      ? `<img src="${src}" alt="${p.brand} ${p.model}" class="${cls || ''}" loading="lazy"
           onerror="this.onerror=null;this.src='${fb}'">`
      : `<img src="${fb}" alt="${p.brand} ${p.model}" class="${cls || ''}">`;
  }
  function placeholder(p) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#DCE6CD'/><stop offset='1' stop-color='#A9C089'/></linearGradient></defs>
      <rect width='800' height='600' fill='url(#g)'/>
      <g fill='none' stroke='#4C6528' stroke-width='9' stroke-linecap='round'>
        <circle cx='250' cy='430' r='62'/><circle cx='560' cy='420' r='88'/>
        <path d='M250 368V250h96l42 60h84'/><path d='M470 310h86l44 44v30'/><path d='M330 250v-58h74v58'/></g>
      <text x='400' y='556' font-family='Inter,Arial' font-size='34' font-weight='700' fill='#3F4A2C'
        text-anchor='middle'>${p.brand} ${p.model}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function cardHTML(p) {
    const st = STATUS[p.status];
    const a = actionFor(p);
    return `<article class="card ${p.status === 'sold' ? 'is-sold' : ''} fade-up" data-id="${p.id}">
      <div class="card-thumb">
        <a href="product.html?id=${p.slug}">${imgTag(p)}</a>
        <span class="badge ${st.cls}">${S(st.key)}</span>
        <span class="cont-tag">${p.container}</span>
      </div>
      <div class="card-body">
        <div class="card-brand">${p.brand}</div>
        <h3><a href="product.html?id=${p.slug}">${p.brand} ${p.model}</a></h3>
        <div class="card-specs">${S('p.serial')} ${p.serial} · ${p.power} · ${p.hours}</div>
        <div class="card-price">${p.price ? p.price.toLocaleString('ru-RU') + ' €' : S('p.askprice')}
          <small>${p.status === 'stock' ? (lang === 'ro' ? 'în Moldova' : 'в Молдове') : (p.status === 'sold' ? '' : (lang === 'ro' ? 'fără livrare în Moldova' : 'цена без доставки в Молдову'))}</small>
        </div>
        ${countdownHTML(p)}
        ${p.status === 'reserved' ? `<div class="res-note">🔒 ${lang === 'ro' ? 'Rezervat: avans achitat. Urmează data predării.' : 'Забронирован: предоплата внесена. Следующий шаг — дата выдачи.'}</div>` : ''}
        <button class="btn ${a.cls} btn-wide book-btn" data-act="${a.act}" data-id="${p.id}" ${a.disabled ? 'disabled' : ''}>${a.label}</button>
      </div>
    </article>`;
  }

  /* ---------------- каталог на главной ---------------- */
  const cat = { q: '', container: '', status: 'all', free: false, sort: 'arrival' };

  function filtered() {
    let list = withOverrides().filter((p) => {
      if (cat.container && p.container !== cat.container) return false;
      const unavailable = p.status === 'reserved' || p.status === 'sold';
      if (cat.free && unavailable) return false;
      if (cat.status === 'free' && unavailable) return false;
      if (cat.status !== 'all' && cat.status !== 'free' && p.status !== cat.status) return false;
      if (cat.q) {
        const hay = `${p.brand} ${p.model} ${p.serial} ${p.code} ${p.container}`.toLowerCase();
        if (!hay.includes(cat.q.toLowerCase().trim())) return false;
      }
      return true;
    });
    const order = { stock: 0, transit: 1, reserved: 2, sold: 3 };
    if (cat.sort === 'arrival') list.sort((a, b) => order[a.status] - order[b.status] || parse(a.arrival) - parse(b.arrival));
    if (cat.sort === 'priceAsc') list.sort((a, b) => (a.price || 1e9) - (b.price || 1e9));
    if (cat.sort === 'priceDesc') list.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (cat.sort === 'power') list.sort((a, b) => (parseInt(a.power) || 0) - (parseInt(b.power) || 0));
    return list;
  }

  function renderCatalog() {
    const grid = document.getElementById('grid');
    if (!grid) return;
    const list = filtered();
    const all = withOverrides();
    grid.innerHTML = list.map(cardHTML).join('') ||
      `<div class="empty" style="grid-column:1/-1">${S('catalog.nothing')}</div>`;

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('cnt-shown', list.length);
    set('cnt-total', all.length);
    set('chip-all', all.length);
    set('chip-transit', all.filter((p) => p.status === 'transit').length);
    set('chip-stock', all.filter((p) => p.status === 'stock').length);
    set('chip-free', all.filter((p) => p.status !== 'reserved' && p.status !== 'sold').length);

    document.querySelectorAll('#status-chips .chip').forEach((c) => {
      c.classList.toggle('active', c.dataset.status === cat.status && !cat.free);
    });
    const free = document.getElementById('free-only');
    if (free) free.checked = cat.free;
    const contNote = document.getElementById('cont-note');
    if (contNote) {
      contNote.innerHTML = cat.container
        ? `${S('catalog.fromCont')}: <b class="mono">${cat.container}</b>
           <button class="sbtn link" id="cont-reset">${S('catalog.reset')}</button>`
        : '';
      const r = document.getElementById('cont-reset');
      if (r) r.onclick = () => { cat.container = ''; renderCatalog(); };
    }
    observeFade();
  }

  function renderContainers() {
    const box = document.getElementById('containers');
    if (!box) return;
    const all = withOverrides();
    const list = containers
      .map((c) => ({ ...c, items: all.filter((p) => p.container === c.code) }))
      .filter((c) => c.items.length)
      .sort((a, b) => parse(a.arrival) - parse(b.arrival));
    box.innerHTML = list.map((c) => {
      const left = leftDays(c.arrival);
      const start = Math.min.apply(null, c.items.map((p) => parse(p.start).getTime()));
      const total = Math.max(1, Math.round((parse(c.arrival) - start) / DAY));
      const passed = Math.min(100, Math.max(3, Math.round(((total - left) / total) * 100)));
      const free = c.items.filter((p) => p.status !== 'reserved' && p.status !== 'sold').length;
      return `<div class="container-card" data-cont="${c.code}">
        <div class="code">${c.code}</div>
        <div class="cnt">${c.items.length} ${S('containers.units')}</div>
        <div class="arr">${left >= 0
          ? `${S('containers.arrive')} ${fmt(c.arrival)} · ${left} ${plural(left, 'день', 'дня', 'дней')}`
          : `${S('cnt.late')} · ${S('cnt.calc')} ${fmt(c.arrival)}`}</div>
        <div class="arr" style="margin-top:6px;color:var(--accent)">${free} ${lang === 'ro' ? 'libere pentru rezervare' : 'свободны для брони'}</div>
        <div class="bar"><i style="width:${passed}%"></i></div>
        <div class="arr" style="margin-top:10px;opacity:.75">${lang === 'ro' ? c.note_ro : c.note_ru}</div>
      </div>`;
    }).join('');
  }

  function scrollToCatalog() {
    const el = document.getElementById('catalog-anchor');
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderHeroStats() {
    const all = withOverrides();
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('s-positions', all.length);
    set('s-transit', all.filter((p) => p.status === 'transit').length);
    const next = all.filter((p) => p.status === 'transit' && leftDays(p.arrival) >= 0)
      .sort((a, b) => parse(a.arrival) - parse(b.arrival))[0];
    set('s-next', next ? fmt(next.arrival) : '—');
    set('s-updated', new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
    const f = document.getElementById('footer-updated');
    if (f) f.textContent = new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  /* ---------------- страница товара ---------------- */
  function renderProduct() {
    const host = document.getElementById('product');
    if (!host) return;
    const slug = new URLSearchParams(location.search).get('id');
    const all = withOverrides();
    const p = all.find((x) => x.slug === slug) || all[0];
    if (!p) return;
    if (!all.find((x) => x.slug === slug)) {
      host.innerHTML = `<div class="empty">${S('p.notfound')} <a href="index.html#catalog">${S('p.back')}</a></div>`;
      return;
    }
    const st = STATUS[p.status];
    const a = actionFor(p);

    document.title = `${p.brand} ${p.model} — ${p.serial} | TractorMD`;
    const bc = document.getElementById('bc-current');
    if (bc) bc.textContent = `${p.brand} ${p.model}`;

    host.innerHTML = `
      <div class="product-layout">
        <div>
          <div class="gallery-main"><img id="g-main" src="${(p.images || [])[0] || placeholder(p)}" alt="${p.brand} ${p.model}"
            onerror="this.onerror=null;this.src='${placeholder(p)}'"></div>
          <div class="thumbs" id="thumbs">
            ${(p.images || []).map((src, i) => `<div class="thumb ${i === 0 ? 'active' : ''}" data-src="${src}">
              <img src="${src}" alt="" onerror="this.onerror=null;this.src='${placeholder(p)}'"></div>`).join('')}
          </div>
        </div>
        <div>
          <div class="product-title">
            <h1 style="font-size:clamp(24px,3vw,36px);margin:0">${p.brand} ${p.model}</h1>
            <span class="badge ${st.cls}">${S(st.key)}</span>
          </div>
          <div class="product-meta">${S('p.serial')} ${p.serial} · ${S('p.code')} ${p.code} · ${S('p.container')}: ${p.container}</div>
          <div class="price-lg">${p.price ? p.price.toLocaleString('ru-RU') + ' €' : S('p.askprice')}
            <small>${p.status === 'stock' ? (lang === 'ro' ? 'preț final, utilajul e în Moldova' : 'цена конечная, техника в Молдове') : (lang === 'ro' ? 'preț fără livrare în Moldova' : 'цена без доставки в Молдову')}</small>
          </div>
          ${countdownHTML(p)}
          ${p.status === 'reserved' ? `<div class="res-note" style="margin-top:12px">🔒 ${lang === 'ro' ? 'Rezervat de alt client. Lăsați o cerere — vă anunțăm dacă se eliberează.' : 'Забронирован другим клиентом. Оставьте заявку — сообщим, если освободится.'}</div>` : ''}
          <div class="product-actions">
            <button class="btn ${a.cls} book-btn" data-act="${a.act}" data-id="${p.id}" ${a.disabled ? 'disabled' : ''}>${a.label}</button>
            <a class="btn btn-ghost" href="tel:${phoneRaw}">📞 ${S('p.call')} ${phone}</a>
            <a class="btn btn-ghost" target="_blank" rel="noopener"
               href="https://wa.me/${whatsapp}?text=${encodeURIComponent((lang === 'ro' ? 'Bună ziua! Mă interesează ' : 'Здравствуйте! Интересует ') + p.brand + ' ' + p.model + ', ' + (lang === 'ro' ? 'seria ' : 'серия ') + p.serial + ' | TractorMD')}">💬 WhatsApp</a>
            <a class="btn btn-ghost" href="index.html#catalog">← ${S('p.back')}</a>
          </div>
          <h3>${S('p.specs')}</h3>
          <table class="specs-table">
            <tr><th>${S('p.power')}</th><td>${p.power}</td></tr>
            <tr><th>${S('p.hours')}</th><td>${p.hours}</td></tr>
            <tr><th>${S('p.drive')}</th><td>${p.drive}</td></tr>
            <tr><th>${S('p.cab')}</th><td>${p.cab}</td></tr>
            <tr><th>${S('p.serial')}</th><td>${p.serial}</td></tr>
            <tr><th>${S('p.container')}</th><td>${p.container}</td></tr>
          </table>
          ${p.status === 'sold' ? '' : `<div class="discounts">
            <div class="discount">💡 ${S('disc.1')}</div>
            <div class="discount">💡 ${S('disc.2')}</div></div>`}
        </div>
      </div>

      <section class="section">
        <h2>${S('p.description')}</h2>
        <p style="max-width:820px">${lang === 'ro' ? p.desc_ro : p.desc_ru}</p>
        ${p.extras_ru ? `<p class="mono muted">${lang === 'ro' ? p.extras_ro : p.extras_ru}</p>` : ''}
      </section>

      <section class="section" style="padding-top:0">
        <h2>${S('p.similar')}</h2>
        <div class="grid" id="similar"></div>
      </section>`;

    const sim = all.filter((x) => x.id !== p.id && x.status !== 'sold')
      .sort((x, y) => (x.brand === p.brand ? -1 : 0) - (y.brand === p.brand ? -1 : 0) || parse(x.arrival) - parse(y.arrival)).slice(0, 4);
    const simBox = document.getElementById('similar');
    if (simBox) simBox.innerHTML = sim.map(cardHTML).join('');

    const thumbs = document.getElementById('thumbs');
    if (thumbs) thumbs.addEventListener('click', (e) => {
      const t = e.target.closest('.thumb'); if (!t) return;
      document.querySelectorAll('.thumb').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      document.getElementById('g-main').src = t.dataset.src;
    });
    observeFade();
  }

  /* ---------------- бронь ---------------- */
  function openBooking(id) {
    const p = withOverrides().find((x) => x.id === +id);
    const ov = document.getElementById('overlay'); if (!ov || !p) return;
    ov.querySelector('h2').textContent = actionFor(p).label;   // «Забронировать» / «Оставить заявку»
    ov.querySelector('#modal-sub').textContent = `${p.brand} ${p.model} · ${S('p.serial')} ${p.serial}${p.status === 'stock' ? '' : ' · ' + S('cnt.expected') + ' ' + fmt(p.arrival)}`;
    ov.querySelector('#book-form').dataset.id = p.id;
    ov.querySelector('#book-form').style.display = 'grid';
    ov.querySelector('#modal-done').style.display = 'none';
    ov.classList.add('open');
  }
  function saveBooking({ productId, name, phone }) {
    let list = [];
    try { list = JSON.parse(localStorage.getItem(LS.bookings) || '[]'); } catch (e) { list = []; }
    list.unshift({
      id: Date.now(), productId, name, phone,
      date: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'new'
    });
    localStorage.setItem(LS.bookings, JSON.stringify(list));
    // В WordPress-версии здесь будет POST на сервер → письмо менеджеру на e-mail (см. план).
  }

  /* ---------------- админка (демо) ---------------- */
  function renderAdmin() {
    const tbody = document.getElementById('admin-rows');
    if (!tbody) return;
    const all = withOverrides();
    tbody.innerHTML = all.map((p) => {
      const st = STATUS[p.status];
      const left = leftDays(p.arrival);
      return `<tr>
        <td><b>${p.brand} ${p.model}</b><span class="mono muted" style="display:block">${p.serial} · ${p.container}</span></td>
        <td><span class="pill" style="background:${st.pill}">${S(st.key)}</span><br>
            <select class="mini" data-status="${p.id}" style="margin-top:6px">
              ${Object.keys(STATUS).map((k) => `<option value="${k}" ${k === p.status ? 'selected' : ''}>${S(STATUS[k].key)}</option>`).join('')}
            </select></td>
        <td><input type="number" value="${p.days || 0}" data-days="${p.id}" style="width:78px"> <span class="muted">${S('cnt.days')}</span></td>
        <td><input type="date" value="${p.arrival}" data-arrival="${p.id}">
            <span class="muted" style="display:block;font-size:12px">${left >= 0 ? (lang === 'ro' ? 'au rămas ' + left + ' zile' : 'осталось ' + left + ' дн.') : S('cnt.late')}</span></td>
      </tr>`;
    }).join('');
    renderQueue();
  }

  function renderQueue() {
    const box = document.getElementById('queue');
    if (!box) return;
    let list = [];
    try { list = JSON.parse(localStorage.getItem(LS.bookings) || '[]'); } catch (e) { list = []; }
    if (!list.length) { box.innerHTML = `<div class="empty">${lang === 'ro' ? 'Nu sunt cereri. Faceți o rezervare pe site — va apărea aici.' : 'Заявок пока нет. Оформите бронь на витрине — она появится здесь.'}</div>`; return; }
    const all = withOverrides();
    box.innerHTML = list.map((b) => {
      const p = all.find((x) => x.id === b.productId) || { brand: '—', model: '' };
      const isNew = b.status === 'new';
      return `<div class="queue ${isNew ? 'is-new' : ''}">
        <div class="who">${b.name} · <a href="tel:${b.phone}">${b.phone}</a></div>
        <div class="muted mono">${p.brand} ${p.model} · ${b.date}</div>
        <div class="acts">
          ${isNew
            ? `<button class="sbtn ok" data-confirm="${b.id}">✔ ${lang === 'ro' ? 'Confirmă rezervarea' : 'Подтвердить бронь'}</button>
               <button class="sbtn no" data-reject="${b.id}">${lang === 'ro' ? 'Refuz' : 'Отказ'}</button>`
            : `<span class="muted">${b.status === 'confirmed' ? (lang === 'ro' ? 'confirmată — așteaptă avansul' : 'подтверждена, ждёт предоплату') : (lang === 'ro' ? 'refuzată' : 'отказ')}</span>`}
          <button class="sbtn no" data-mail="${b.id}" title="${lang === 'ro' ? 'aici va fi trimiterea pe e-mail' : 'здесь будет отправка письма'}">✉ E-mail</button>
        </div>
      </div>`;
    }).join('');
  }

  /* ---------------- события ---------------- */
  function observeFade() {
    const els = document.querySelectorAll('.fade-up:not(.visible)');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('visible')); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }), { threshold: .08, rootMargin: '0px 0px -30px 0px' });
    els.forEach((e) => io.observe(e));
  }

  function bind() {
    // язык
    document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => {
      lang = b.dataset.lang; localStorage.setItem(LS.lang, lang);
      applyLang(); renderHeroStats(); renderContainers(); renderCatalog(); renderProduct(); renderAdmin();
    }));
    // мобильное меню
    const burger = document.querySelector('.burger'), mnav = document.querySelector('.mobile-nav');
    if (burger && mnav) burger.addEventListener('click', () => mnav.classList.toggle('open'));

    // фильтры
    const q = document.getElementById('q');
    if (q) q.addEventListener('input', () => { cat.q = q.value; renderCatalog(); });
    const chips = document.getElementById('status-chips');
    if (chips) chips.addEventListener('click', (e) => {
      const c = e.target.closest('.chip'); if (!c) return;
      cat.status = c.dataset.status; cat.free = false; renderCatalog();
    });
    const free = document.getElementById('free-only');
    if (free) free.addEventListener('change', () => { cat.free = free.checked; renderCatalog(); });
    const sort = document.getElementById('sort');
    if (sort) sort.addEventListener('change', () => { cat.sort = sort.value; renderCatalog(); });
    const reset = document.getElementById('reset-filters');
    if (reset) reset.addEventListener('click', () => {
      cat.q = ''; cat.container = ''; cat.status = 'all'; cat.free = false;
      if (q) q.value = ''; if (sort) sort.value = 'arrival';
      renderCatalog();
    });

    // контейнеры → фильтр каталога
    const conts = document.getElementById('containers');
    if (conts) conts.addEventListener('click', (e) => {
      const c = e.target.closest('.container-card'); if (!c) return;
      cat.container = c.dataset.cont; cat.status = 'all'; cat.free = false;
      renderCatalog();
      scrollToCatalog();
    });

    // кнопки брони / «смотреть похожие»
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.book-btn'); if (!btn || btn.disabled) return;
      if (btn.dataset.act === 'similar') {
        cat.status = 'all'; cat.free = true; renderCatalog();
        scrollToCatalog();
        return;
      }
      openBooking(btn.dataset.id);
    });

    // модалка
    const ov = document.getElementById('overlay');
    if (ov) {
      ov.addEventListener('click', (e) => { if (e.target.id === 'overlay') ov.classList.remove('open'); });
      const close = ov.querySelector('#modal-close'); if (close) close.onclick = () => ov.classList.remove('open');
      const cancel = ov.querySelector('#modal-cancel'); if (cancel) cancel.onclick = () => ov.classList.remove('open');
      const form = ov.querySelector('#book-form');
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const inp = form.querySelectorAll('input');
        saveBooking({
          productId: +form.dataset.id,
          name: `${inp[0].value} ${inp[1].value}`.trim(),
          phone: inp[2].value
        });
        form.reset();
        form.style.display = 'none';
        ov.querySelector('#modal-done').style.display = 'block';
        renderQueue();
      });
    }

    // заявка из блока «Не нашли нужную модель?»
    const lead = document.getElementById('lead-form');
    if (lead) lead.addEventListener('submit', (e) => {
      e.preventDefault();
      saveBooking({ productId: 0, name: lead.querySelector('[name=name]').value, phone: lead.querySelector('[name=phone]').value });
      const ok = document.getElementById('lead-ok');
      if (ok) {
        ok.style.display = 'block';
        ok.textContent = lang === 'ro'
          ? 'Cererea a fost trimisă! Managerul vă va contacta.'
          : 'Заявка отправлена! Менеджер свяжется с вами.';
      }
      lead.reset();
    });

    // админка: смена статуса, сроков, даты
    document.addEventListener('change', (e) => {
      const t = e.target;
      if (t.dataset.status) { saveOverride(+t.dataset.status, { status: t.value }); renderAdmin(); renderCatalog(); renderHeroStats(); renderContainers(); }
      if (t.dataset.days)   { saveOverride(+t.dataset.days, { days: +t.value || 0 }); renderAdmin(); renderCatalog(); }
      if (t.dataset.arrival){ saveOverride(+t.dataset.arrival, { arrival: t.value, days: leftDays(t.value) }); renderAdmin(); renderCatalog(); }
    });
    document.addEventListener('click', (e) => {
      const c = e.target.closest('[data-confirm]'), r = e.target.closest('[data-reject]');
      let list = [];
      try { list = JSON.parse(localStorage.getItem(LS.bookings) || '[]'); } catch (err) { list = []; }
      if (c) {
        const b = list.find((x) => x.id === +c.dataset.confirm); if (!b) return;
        b.status = 'confirmed';
        saveOverride(b.productId, { status: 'reserved' });
        localStorage.setItem(LS.bookings, JSON.stringify(list));
        renderAdmin(); renderCatalog();
      }
      if (r) {
        const b = list.find((x) => x.id === +r.dataset.reject); if (!b) return;
        b.status = 'rejected'; localStorage.setItem(LS.bookings, JSON.stringify(list));
        const ov2 = {};
        try { Object.assign(ov2, JSON.parse(localStorage.getItem(LS.overrides) || '{}')); } catch (err) {}
        if (ov2[b.productId] && ov2[b.productId].status === 'reserved') delete ov2[b.productId].status;
        localStorage.setItem(LS.overrides, JSON.stringify(ov2));
        renderAdmin(); renderCatalog();
      }
      if (e.target.closest('[data-reset]')) {
        localStorage.removeItem(LS.overrides); localStorage.removeItem(LS.bookings);
        renderAdmin(); renderCatalog(); renderHeroStats(); renderContainers();
      }
    });
  }

  /* ---------------- старт ---------------- */
  function init() {
    applyLang();
    bind();
    renderHeroStats();
    renderContainers();
    renderCatalog();
    renderProduct();
    renderAdmin();
    observeFade();
    // «новое» для броней: подсветка в админке
    const last = localStorage.getItem(LS.lastSeen);
    localStorage.setItem(LS.lastSeen, String(Date.now()));
    if (!last) { /* первый визит */ }
  }
  document.addEventListener('DOMContentLoaded', init);
})();
