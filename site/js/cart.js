/* =============================================================
   DOLCE MOMENTS — Carrito (order builder)
   -------------------------------------------------------------
   Recolecta los pedidos armados y los entrega a un canal de
   contacto. NO hay checkout: sin tarjeta, sin PayPal, sin cobro.
   El resumen combined se genera para enviar por texto, WhatsApp
   o Instagram. La estructura deja sitio para pagos más adelante.
   ============================================================= */
(function () {
  'use strict';

  var D = window.DM;
  var CFG = D.config;
  var KEY = 'dm_cart_v1';

  var items = [];
  var sheet = null;      // modal de envío, se crea al abrir
  var meta = { date: '', zip: '', notes: '' };

  /* ---------------- helpers ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return '$' + (Math.round(n * 100) / 100).toFixed(2); }
  function slugify(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  }
  var SVG = {
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 13H5L6 7z"/><path d="M9.5 7a2.5 2.5 0 0 1 5 0"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 7V5h4v2M6 7l1 13h10l1-13"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9.5 18 20 6.5"/></svg>',
    sms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 1.9a8.1 8.1 0 1 1-4.2 15l-.4-.2-2.6.7.7-2.5-.2-.4A8.1 8.1 0 0 1 12 3.9zm-3.3 4c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.5.6 3 .6.5 0 1.6-.7 1.8-1.3.2-.7.2-1.2.1-1.3l-.6-.3s-1.4-.7-1.6-.8c-.2 0-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5.3-.5v-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>'
  };

  /* ---------------- estado ---------------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var p = raw ? JSON.parse(raw) : null;
      if (!Array.isArray(p)) return [];
      return p.filter(function (i) {
        return i && typeof i.id === 'string' && typeof i.name === 'string' &&
               isFinite(i.unit) && i.unit > 0 && i.qty > 0;
      });
    } catch (e) { return []; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }

  function count() { return items.reduce(function (n, i) { return n + i.qty; }, 0); }
  function total() { return items.reduce(function (n, i) { return n + i.unit * i.qty; }, 0); }

  function add(entry) {
    /* La línea se identifica por producto + tamaño + combinación exacta
       de opciones. Elegir mango+lotus y mango+oreo son dos líneas. */
    var id = entry.id || slugify(entry.name + '|' + entry.size + '|' + entry.options.join('+'));
    var found = null;
    for (var i = 0; i < items.length; i++) if (items[i].id === id) found = items[i];
    if (found) {
      found.qty = Math.min(30, found.qty + (entry.qty || 1));
    } else {
      items.push({
        id: id,
        name: entry.name,
        size: entry.size || '',
        options: entry.options || [],
        unit: Number(entry.unit) || 0,
        qty: Math.max(1, Math.min(30, entry.qty || 1)),
        img: entry.img || ''
      });
    }
    save();
    render();
    toast(found ? 'Quantity updated' : entry.name + ' added');
    return !found;
  }
  function bump(id, d) {
    var it = find(id);
    if (!it) return;
    var n = it.qty + d;
    if (n < 1) return remove(id);
    it.qty = Math.min(30, n);
    save(); render();
  }
  function find(id) { return items.filter(function (i) { return i.id === id; })[0]; }
  function remove(id) {
    items = items.filter(function (i) { return i.id !== id; });
    save(); render();
  }
  function clear() { items = []; save(); render(); }

  /* ---------------- resumen ---------------- */
  function orderText() {
    var L = [];
    L.push(CFG.name.toUpperCase() + ' — ORDER REQUEST');
    L.push('');
    items.forEach(function (it, i) {
      L.push((i + 1) + '. ' + it.name + (it.size ? ' — ' + it.size : ''));
      it.options.forEach(function (o) { L.push('   ' + o); });
      L.push('   Qty: ' + it.qty + ' × ' + money(it.unit) + ' = ' + money(it.unit * it.qty));
    });
    L.push('');
    L.push('TOTAL: ' + money(total()));
    L.push('Preferred delivery date/time: ' + (meta.date || '—'));
    L.push('ZIP Code: ' + (meta.zip || '—'));
    if (meta.notes) L.push('Notes: ' + meta.notes);
    L.push('');
    L.push('Sent from ' + CFG.domain);
    return L.join('\n');
  }

  /* ---------------- UI ---------------- */
  function render() {
    var host = document.getElementById('dmCart');
    if (!host) return;

    var n = count();
    Array.prototype.forEach.call(document.querySelectorAll('.cart-btn__n'), function (b) {
      b.textContent = n > 99 ? '99+' : String(n);
      b.classList.toggle('is-on', n > 0);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.cart-btn'), function (b) {
      b.setAttribute('aria-label', n ? 'Your order, ' + n + ' item' + (n === 1 ? '' : 's') : 'Your order is empty');
    });

    var list = document.getElementById('dmCartList');
    var foot = document.getElementById('dmCartFoot');
    var nc = document.getElementById('dmCartN');

    if (nc) nc.textContent = n === 1 ? '1 item' : n + ' items';

    if (!n) {
      list.className = 'cart-empty';
      list.innerHTML =
        '<div class="cart-empty__i">' + SVG.bag + '</div>' +
        '<h3>Your order is empty</h3>' +
        '<p>Open a product and build it exactly how you want it.</p>' +
        '<a class="btn btn--primary" href="menu.html" data-cart-close>Browse the menu</a>';
      foot.style.display = 'none';
      return;
    }

    list.className = 'drawer__list';
    list.innerHTML = items.map(function (it) {
      return '<div class="ci">' +
        (it.img ? '<img class="ci__img" src="' + esc(it.img) + '" alt="' + esc(it.name) + '">' : '<div class="ci__img"></div>') +
        '<div>' +
        '<p class="ci__n">' + esc(it.name) + (it.size ? ' · ' + esc(it.size) : '') + '</p>' +
        (it.options.length ? '<p class="ci__v">' + it.options.map(esc).join('<br>') + '</p>' : '') +
        '<div class="ci__row">' +
        '<div class="step">' +
        '<button type="button" data-dec="' + esc(it.id) + '" aria-label="One less"' + (it.qty <= 1 ? '' : '') + '>' + SVG.minus + '</button>' +
        '<span>' + it.qty + '</span>' +
        '<button type="button" data-inc="' + esc(it.id) + '" aria-label="One more"' + (it.qty >= 30 ? ' disabled' : '') + '>' + SVG.plus + '</button>' +
        '</div>' +
        '<span class="ci__p">' + money(it.unit * it.qty) + '</span>' +
        '<button class="ci__rm" type="button" data-del="' + esc(it.id) + '" aria-label="Remove ' + esc(it.name) + '">' + SVG.trash + '</button>' +
        '</div></div></div>';
    }).join('');

    foot.style.display = '';
    foot.innerHTML =
      '<div class="drawer__sum"><span>Total</span><b>' + money(total()) + '</b></div>' +
      '<button class="btn btn--rose btn--block btn--lg" type="button" data-send>' + SVG.bag + 'Send my order</button>' +
      '<a class="btn btn--quiet btn--block" href="menu.html" data-cart-close>Keep browsing</a>' +
      '<p class="drawer__note">No payment is taken here. We reply with the total and confirm with you directly.</p>';
  }

  var toastT = null;
  function toast(msg) {
    var t = document.getElementById('dmToast');
    if (!t) return;
    document.getElementById('dmToastMsg').textContent = msg;
    t.classList.add('is-up');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('is-up'); }, 2600);
  }

  /* ---------------- panel ---------------- */
  function open() {
    var d = document.getElementById('dmCart');
    if (!d) return;
    render();
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    setTimeout(function () {
      var f = d.querySelector('.drawer__x');
      if (f) f.focus();
    }, 90);
  }
  function close() {
    var d = document.getElementById('dmCart');
    if (!d) return;
    d.classList.remove('is-open');
    d.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  /* ---------------- envío ---------------- */
  function buildSheet() {
    var w = document.createElement('div');
    w.className = 'sheet';
    w.id = 'dmCartSheet';
    w.hidden = true;
    w.innerHTML =
      '<div class="sheet__bg" data-sh-close></div>' +
      '<div class="sheet__box" role="dialog" aria-modal="true" aria-labelledby="dmShH">' +
      '<button class="sheet__x" type="button" data-sh-close aria-label="Close">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<h2 class="sheet__h" id="dmShH">Send your order</h2>' +
      '<p class="small">Add when and where, then send it to us on WhatsApp. We will confirm ' +
      'availability, the total and payment with you — nothing is charged on this page.</p>' +
      '<label class="field"><span class="field__l">Preferred delivery date &amp; time</span>' +
      '<input type="text" data-m="date" placeholder="e.g. Saturday, 2–4 pm"><span class="field__err">Tell us when you would like it.</span></label>' +
      '<label class="field"><span class="field__l">Delivery ZIP code</span>' +
      '<input type="text" data-m="zip" inputmode="numeric" maxlength="5" placeholder="e.g. 11215"><span class="field__err">A 5-digit ZIP code is required.</span></label>' +
      '<label class="field"><span class="field__l">Special instructions <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></span>' +
      '<textarea data-m="notes" placeholder="Allergies, a message on the box, anything else"></textarea></label>' +
      '<pre class="preview" data-preview></pre>' +
      '<div class="channels" data-chs></div>' +
      '<p class="tiny mt-s center">Your order is already written out above — WhatsApp opens with it filled in.</p>' +
      '</div>';
    document.body.appendChild(w);
    return w;
  }

  function paintSheet() {
    if (!sheet) return;
    var list = CFG.cartChannels || ['whatsapp'];
    var enc = encodeURIComponent(orderText());

    sheet.querySelector('[data-preview]').textContent = orderText();
    sheet.querySelector('[data-chs]').className =
      'channels' + (list.length === 1 ? ' channels--single' : '');
    sheet.querySelector('[data-chs]').innerHTML = list.map(function (k) {
      var c = CFG.channels[k];
      if (!c) return '';
      var href = k === 'text' ? c.href + '?body=' + enc
               : k === 'whatsapp' ? c.href + '?text=' + enc
               : c.href;
      var ic = k === 'text' ? SVG.sms : k === 'whatsapp' ? SVG.wa : SVG.ig;
      return '<a class="ch' + (list.length === 1 ? ' ch--wide' : '') + '" href="' + esc(href) +
        '" target="_blank" rel="noopener" data-ch="' + k + '">' +
        ic + '<span class="ch__l">' + esc(c.label) + '</span>' +
        '<span class="ch__n">' + esc(c.note) + '</span></a>';
    }).join('');
  }

  function openSheet() {
    if (!sheet) sheet = buildSheet();
    sheet.hidden = false;
    requestAnimationFrame(function () { sheet.classList.add('is-open'); });
    document.body.classList.add('no-scroll');
    /* el toast flotante queda debajo del modal en móvil */
    var t = document.getElementById('dmToast');
    if (t) t.classList.remove('is-up');
    clearTimeout(toastT);
    paintSheet();
  }
  function closeSheet() {
    if (!sheet || sheet.hidden) return;
    sheet.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    setTimeout(function () { sheet.hidden = true; }, 340);
  }

  function valid() {
    var d = sheet.querySelector('[data-m="date"]');
    var z = sheet.querySelector('[data-m="zip"]');
    var b1 = !meta.date.trim();
    var b2 = !/^\d{5}$/.test(meta.zip);
    d.closest('.field').classList.toggle('is-bad', b1);
    z.closest('.field').classList.toggle('is-bad', b2);
    return !b1 && !b2;
  }

  /* ---------------- montaje ---------------- */
  function mount() {
    var w = document.createElement('div');
    w.className = 'drawer';
    w.id = 'dmCart';
    w.setAttribute('aria-hidden', 'true');
    w.innerHTML =
      '<div class="drawer__bg" data-cart-close></div>' +
      '<aside class="drawer__box" role="dialog" aria-modal="true" aria-label="Your order">' +
      '<div class="drawer__head"><div>' +
      '<div class="drawer__t">Your Order</div>' +
      '<div class="drawer__n" id="dmCartN">0 items</div>' +
      '</div>' +
      '<button class="drawer__x" type="button" data-cart-close aria-label="Close">' + SVG.x + '</button>' +
      '</div>' +
      '<div id="dmCartList" class="drawer__list"></div>' +
      '<div class="drawer__foot" id="dmCartFoot"></div>' +
      '</aside>';
    document.body.appendChild(w);

    var t = document.createElement('div');
    t.className = 'toast-dm';
    t.id = 'dmToast';
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    t.innerHTML = SVG.check + '<span id="dmToastMsg"></span>';
    document.body.appendChild(t);

    document.addEventListener('click', function (e) {
      var el = e.target;
      if (!el || !el.closest) return;

      if (el.closest('.cart-btn')) { open(); return; }
      if (el.closest('[data-cart-close]')) { close(); return; }

      var inc = el.closest('[data-inc]');
      if (inc) { bump(inc.getAttribute('data-inc'), 1); return; }
      var dec = el.closest('[data-dec]');
      if (dec) { bump(dec.getAttribute('data-dec'), -1); return; }
      var del = el.closest('[data-del]');
      if (del) { remove(del.getAttribute('data-del')); return; }
      if (el.closest('[data-send]')) { close(); openSheet(); return; }

      if (el.closest('[data-sh-close]')) { closeSheet(); return; }
      var ch = el.closest('[data-ch]');
      if (ch) {
        if (!valid()) { e.preventDefault(); return; }
        toast('Order ready to send');
      }
    });

    document.addEventListener('input', function (e) {
      var f = e.target;
      if (!f || !f.closest || !f.closest('.sheet')) return;
      if (!f.hasAttribute || !f.hasAttribute('data-m')) return;
      if (f.getAttribute('data-m') === 'zip') f.value = f.value.replace(/[^0-9]/g, '');
      meta[f.getAttribute('data-m')] = f.value;
      paintSheet();
      f.closest('.field').classList.remove('is-bad');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (sheet && !sheet.hidden) closeSheet();
      else close();
    });

    items = load();
    render();
  }

  /* API que consume app.js */
  window.DMCart = {
    add: add,
    bump: bump,
    remove: remove,
    clear: clear,
    count: count,
    total: total,
    open: open,
    close: close,
    isEmpty: function () { return !items.length; },
    summary: orderText
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
