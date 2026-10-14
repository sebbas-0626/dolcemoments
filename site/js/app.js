/* =============================================================
   DOLCE MOMENTS — App
   Render del sitio, customizador con límites de selección y
   resumen de pedido para enviar por SMS / WhatsApp / Instagram.
   Sin pagos. Sin checkout.
   ============================================================= */
(function () {
  'use strict';

  var D = window.DM;
  var CFG = D.config;

  /* ---------------- helpers ---------------- */
  function el(sel, root) { return (root || document).querySelector(sel); }
  function els(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return '$' + (Math.round(n * 100) / 100).toFixed(2); }
  function qs(key) { return new URLSearchParams(location.search).get(key); }

  var ICON = {
    arrow: '<svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    bag: '<svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
    cup: '<svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h13l-1.2 10H5.2L4 9z"/><path d="M17 11h2a2 2 0 0 1 0 4h-2"/><path d="M7 9c0-2 1.6-2 1.6-4M11 9c0-2 1.6-2 1.6-4"/></svg>',
    sms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 1.9a8.1 8.1 0 1 1-4.2 15l-.4-.2-2.6.7.7-2.5-.2-.4A8.1 8.1 0 0 1 12 3.9zm-3.3 4c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.5.6 3 .6.5 0 1.6-.7 1.8-1.3.2-.7.2-1.2.1-1.3l-.6-.3s-1.4-.7-1.6-.8c-.2 0-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5.3-.5v-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
    cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="6.5" width="19" height="13" rx="2.5"/><circle cx="12" cy="13" r="3.6"/><path d="M8.5 6.5 9.8 4h4.4l1.3 2.5"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 7h11v9h-11z"/><path d="M13.5 10h4l3 3v3h-7z"/><circle cx="6.5" cy="18" r="1.7"/><circle cx="17" cy="18" r="1.7"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L3.5 20.5l1.4-5.9A8 8 0 1 1 21 12z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  /* ---------------- chrome común ---------------- */
  function renderChrome() {
    if (CFG.showDataNotice) {
      document.body.insertAdjacentHTML('afterbegin',
        '<div class="notice">Preview build — fruit, topping, sauce and ZIP lists are placeholders pending the client’s real lists.</div>');
    }

    var path = location.pathname.split('/').pop() || 'index.html';
    var nav = [
      { href: 'index.html',    label: 'Home',         key: 'index' },
      { href: 'menu.html',     label: 'Menu',         key: 'menu' },
      { href: 'category.html?c=merengones', label: 'Categories', key: 'category' },
      { href: 'delivery.html', label: 'Delivery Area', key: 'delivery' },
      { href: 'order.html',    label: 'Contact',      key: 'order' }
    ];

    var head = el('[data-chrome="header"]');
    if (head) {
      head.className = 'hdr';
      head.innerHTML =
        '<div class="wrap hdr__in">' +
        '<a class="brand" href="index.html">' +
        '<span class="brand__mark" aria-hidden="true">DM</span>' +
        '<span class="brand__name">' + esc(CFG.name) + '</span>' +
        '</a>' +
        '<nav class="nav" aria-label="Main">' +
        nav.map(function (n) {
          return '<a class="nav__a" href="' + n.href + '"' +
            (path === n.href || (n.key === 'category' && path === 'category.html') ? ' aria-current="page"' : '') +
            '>' + n.label + '</a>';
        }).join('') +
        '</nav>' +
        '<div class="row" style="gap:6px">' +
        '<button class="cart-btn" type="button" aria-label="Your order is empty">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 13H5L6 7z"/><path d="M9.5 7a2.5 2.5 0 0 1 5 0"/></svg>' +
        '<span class="cart-btn__n">0</span>' +
        '</button>' +
        '<a class="btn btn--primary hdr__cta" href="menu.html">Order Now</a>' +
        '<button class="burger" type="button" aria-expanded="false" aria-controls="msheet" aria-label="Open menu"><span></span></button>' +
        '</div>' +
        '</div>' +
        '<div class="msheet" id="msheet">' +
        nav.map(function (n) {
          return '<a class="msheet__a" href="' + n.href + '">' + n.label + '</a>';
        }).join('') +
        '<div class="msheet__foot">' +
        '<a class="btn btn--rose btn--block" href="' + CFG.channels.whatsapp.href + '" target="_blank" rel="noopener">WhatsApp Us</a>' +
        '<a class="btn btn--quiet btn--block" href="menu.html">View Menu</a>' +
        '</div>' +
        '</div>';
    }

    var foot = el('[data-chrome="footer"]');
    if (foot) {
      foot.className = 'ftr';
      foot.innerHTML =
        '<div class="wrap">' +
        '<div class="ftr__grid">' +
        '<div>' +
        '<div class="ftr__brand"><span class="brand__mark" aria-hidden="true">DM</span><span>' + esc(CFG.name) + '</span></div>' +
        '<p class="ftr__slogan">' + esc(CFG.slogan) + '</p>' +
        '<p style="font-size:14px;max-width:38ch">' +
        'Freshly assembled sweets, made to order and delivered in the USA. ' +
        'We do not publish a pickup address — delivery only, to selected ZIP codes.' +
        '</p>' +
        '<div class="ftr__social">' +
        '<a href="' + CFG.channels.whatsapp.href + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + ICON.wa + '</a>' +
        '<a href="' + CFG.channels.instagram.href + '" target="_blank" rel="noopener" aria-label="Instagram">' + ICON.ig + '</a>' +
        '</div>' +
        '</div>' +
        '<div><h3>Explore</h3><div class="ftr__list">' +
        '<a href="menu.html">Menu</a>' +
        '<a href="category.html?c=merengones">Merengones</a>' +
        '<a href="category.html?c=gift-boxes">Gift Boxes</a>' +
        '<a href="delivery.html">Delivery Area</a>' +
        '<a href="order.html">Contact &amp; Order</a>' +
        '</div></div>' +
        '<div><h3>Order</h3><div class="ftr__list">' +
        '<a href="' + CFG.channels.text.href + '">Text us</a>' +
        '<a href="' + CFG.channels.whatsapp.href + '" target="_blank" rel="noopener">WhatsApp</a>' +
        '<a href="' + CFG.channels.instagram.href + '" target="_blank" rel="noopener">Instagram</a>' +
        '</div>' +
        '<p class="tiny" style="margin-top:18px;color:#a8959c">No payment is taken on this site. ' +
        'We confirm your order and payment directly.</p>' +
        '</div>' +
        '</div>' +
        '<div class="ftr__bot">' +
        '<span>© ' + new Date().getFullYear() + ' ' + esc(CFG.name) + '</span>' +
        '<span>' + esc(CFG.domain) + '</span>' +
        '</div>' +
        '</div>';
    }

    // menú móvil
    var burger = el('.burger'), sheet = el('.msheet');
    if (burger && sheet) {
      burger.addEventListener('click', function () {
        var open = sheet.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
      });
      sheet.addEventListener('click', function (e) {
        if (e.target.closest('a')) {
          sheet.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && sheet.classList.contains('is-open')) {
          sheet.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
          burger.focus();
        }
      });
    }
  }

  /* ---------------- HOME ---------------- */
  function renderHome() {
    var host = el('[data-home]');
    if (!host) return;
    var ready = D.readyCount();
    var total = D.categories.length;
    /* Hero: la foto del producto estrella, no una imagen genérica. */
    var star = D.products[0];
    var heroPhoto = star && star.photo ? D.hero(star.photo) : '';
    var heroName = star ? star.name : '';

    host.innerHTML =
      '<section class="hero"><div class="wrap"><div class="hero__grid">' +
      '<div>' +
      '<span class="eyebrow">Made fresh to order · Delivered in the USA</span>' +
      '<h1 class="h-hero balance">' + esc(CFG.slogan) + '</h1>' +
      '<p class="lede">Merengones, strawberries and everything in between — built by hand ' +
      'the day it ships, then delivered to your door. Choose your fruits, your topping ' +
      'and your sauce, and we take care of the rest.</p>' +
      '<div class="hero__actions">' +
      '<a class="btn btn--primary btn--lg" href="menu.html">View Menu' + ICON.arrow + '</a>' +
      '<a class="btn btn--ghost btn--lg" href="order.html">Order Now</a>' +
      '</div>' +
      '<p class="tiny" style="margin-top:20px">' + ready + ' of ' + total + ' categories are open for ordering.</p>' +
      '</div>' +
      '<div class="frame">' +
      '<div class="frame__badge">Signature</div>' +
      '<img src="' + esc(heroPhoto) + '" alt="' + esc(heroName) + '">' +
      '</div>' +
      '</div></div></section>' +

      '<section class="sec sec--blush"><div class="wrap">' +
      '<div class="sec__head center">' +
      '<span class="eyebrow">Our Menu</span>' +
      '<h2 class="h-1">Nine rooms, each one of its own</h2>' +
      '<p class="lede mt-s">We keep every category separate so nothing gets mixed up. ' +
      'Pick a room, then build exactly what you want inside it.</p>' +
      '</div>' +
      '<div class="cats" data-cats></div>' +
      '<div class="center mt-l"><a class="btn btn--primary btn--lg" href="menu.html">See the full menu' + ICON.arrow + '</a></div>' +
      '</div></section>' +

      '<section class="sec"><div class="wrap">' +
      '<div class="zipbox">' +
      '<div>' +
      '<span class="eyebrow">How it works</span>' +
      '<h2 class="h-1 mt-s">Three steps, no checkout</h2>' +
      '<p class="lede mt-s">You build the order here. We confirm, you pay when we talk, ' +
      'and we deliver. No card is ever entered on this site.</p>' +
      '</div>' +
      '<div class="stack" style="gap:16px">' +
      [['1', 'Build it', 'Open a product and choose your size, fruits, toppings and sauce. The page tells you exactly how many to pick.'],
       ['2', 'Send it', 'ORDER NOW writes the whole order for you. Send it by text, WhatsApp or Instagram DM.'],
       ['3', 'We confirm', 'We reply with availability, total and payment. Then it ships the same day.']
      ].map(function (r) {
        return '<div style="display:flex;gap:14px;align-items:flex-start">' +
          '<span style="font-family:var(--serif);font-size:1.4rem;color:var(--rose);line-height:1;min-width:22px">' + r[0] + '</span>' +
          '<div><strong style="display:block">' + r[1] + '</strong>' +
          '<span class="small">' + r[2] + '</span></div></div>';
      }).join('') +
      '</div>' +
      '</div>' +
      '</div></section>' +

      '<section class="sec sec--blush sec--tight"><div class="wrap center">' +
      '<h2 class="h-1">Ready when you are</h2>' +
      '<p class="lede mt-s" style="max-width:44ch;margin-inline:auto">' + esc(CFG.delivery.headline) + '</p>' +
      '<div class="row mt-m" style="justify-content:center">' +
      '<a class="btn btn--primary btn--lg" href="menu.html">View Menu</a>' +
      '<a class="btn btn--rose btn--lg" href="' + CFG.channels.whatsapp.href + '" target="_blank" rel="noopener">Order on WhatsApp</a>' +
      '</div></div></section>';

    paintCategories(el('[data-cats]'), 6);
  }

  /* ---------------- MENÚ / CATEGORÍAS ---------------- */
  function catCard(c, opts) {
    opts = opts || {};
    var n = D.productsIn(c.slug).length;
    var badge = n
      ? '<span class="ptag ptag--dark">' + n + (n === 1 ? ' product' : ' products') + '</span>'
      : '<span class="ptag">Coming soon</span>';

    return '<a class="cat' + (opts.tall ? ' cat--tall' : '') + '" href="category.html?c=' + c.slug + '">' +
      (c.photo ? '<img class="cat__img" src="' + esc(c.photo) + '" alt="' + esc(c.name) + '" loading="lazy">' : '') +
      '<div class="cat__body">' +
      '<div class="row" style="justify-content:space-between;align-items:flex-start;gap:10px">' +
      '<span class="cat__k">Category</span>' + badge +
      '</div>' +
      '<h3 class="cat__n">' + esc(c.name) + '</h3>' +
      '<p class="cat__b">' + esc(c.blurb) + '</p>' +
      '<span class="cat__go">' + (n ? 'Build your order' : 'See details') + '</span>' +
      '</div></a>';
  }

  function paintCategories(host, limit) {
    if (!host) return;
    var list = limit ? D.categories.slice(0, limit) : D.categories;
    host.innerHTML = list.map(function (c) { return catCard(c); }).join('');
  }

  function renderMenu() {
    var host = el('[data-menu]');
    if (!host) return;
    host.innerHTML =
      '<section class="sec sec--tight"><div class="wrap">' +
      '<div class="sec__head">' +
      '<span class="eyebrow">Our Menu</span>' +
      '<h1 class="h-1">Choose your category</h1>' +
      '<p class="lede mt-s">Every category has its own room and its own products. ' +
      'Nothing is mixed together.</p>' +
      '</div>' +
      '<div class="cats" data-cats></div>' +
      '</div></section>' +
      '<section class="sec sec--blush sec--tight"><div class="wrap center">' +
      '<h2 class="h-2">Need something specific?</h2>' +
      '<p class="lede mt-s" style="max-width:46ch;margin-inline:auto">Tell us what you are after and we will tell you ' +
      'whether we can build it.</p>' +
      '<div class="row mt-m" style="justify-content:center">' +
      '<a class="btn btn--rose" href="' + CFG.channels.whatsapp.href + '" target="_blank" rel="noopener">Ask on WhatsApp</a>' +
      '<a class="btn btn--quiet" href="order.html">Contact</a>' +
      '</div></div></section>';
    paintCategories(el('[data-cats]'));
  }

  function renderCategory() {
    var host = el('[data-category]');
    if (!host) return;
    var slug = qs('c') || 'merengones';
    var cat = D.category(slug);

    if (!cat) {
      host.innerHTML = '<section class="sec"><div class="wrap"><div class="empty">' +
        '<h1 class="empty__t">Category not found</h1>' +
        '<p class="empty__b">That category does not exist. Head back to the menu.</p>' +
        '<a class="btn btn--primary" href="menu.html">Back to Menu</a>' +
        '</div></div></section>';
      document.title = 'Category not found · Dolce Moments';
      return;
    }

    document.title = cat.name + ' · Dolce Moments';
    var items = D.productsIn(cat.slug);

    host.innerHTML =
      '<div class="wrap"><nav class="crumb" aria-label="Breadcrumb">' +
      '<a href="index.html">Home</a><span aria-hidden="true">/</span>' +
      '<a href="menu.html">Menu</a><span aria-hidden="true">/</span>' +
      '<span>' + esc(cat.name) + '</span>' +
      '</nav></div>' +

      '<section class="sec sec--tight"><div class="wrap">' +
      '<div class="zipbox" style="align-items:center">' +
      '<div>' +
      '<span class="eyebrow">Category</span>' +
      '<h1 class="h-1">' + esc(cat.name) + '</h1>' +
      '<p class="lede mt-s">' + esc(cat.blurb) + '</p>' +
      '<div class="row mt-m">' +
      '<a class="btn btn--primary" href="menu.html">Back to Menu</a>' +
      '<a class="btn btn--quiet" href="order.html">Ask a question</a>' +
      '</div>' +
      '</div>' +
      (cat.photo ? '<div class="frame" style="aspect-ratio:4/3"><img src="' + esc(cat.photo) + '" alt="' + esc(cat.name) + '"></div>' : '') +
      '</div>' +

      '<div class="mt-l">' +
      (items.length
        ? productGrid(items)
        : '<div class="empty">' +
          '<h2 class="empty__t">Nothing here just yet</h2>' +
          '<p class="empty__b">We are still finalising this category. It will be up here as soon as ' +
          'the products are ready — message us and we will tell you what is available this week.</p>' +
          '<a class="btn btn--rose" href="' + CFG.channels.whatsapp.href + '" target="_blank" rel="noopener">Ask on WhatsApp</a> ' +
          '<a class="btn btn--quiet" href="menu.html">Back to Menu</a>' +
          '</div>') +
      '</div>' +
      '</div></section>';

    // favoritos: sólo interacción local, sin red
    els('[data-fav]').forEach(function (b) {
      b.addEventListener('click', function () {
        b.classList.toggle('is-on');
        b.setAttribute('aria-pressed', b.classList.contains('is-on') ? 'true' : 'false');
      });
    });
    wireAdds(host);
  }

  function stars(n) {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.6 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5 6.1 20.6l1.2-6.5-4.8-4.6 6.6-.9z"/></svg>';
  }
  var STAR5 = [1, 2, 3, 4, 5].map(stars).join('');

  function productCard(p) {
    var min = Math.min.apply(null, p.sizes.map(function (s) { return s.price; }));
    var href = 'product.html?id=' + p.id;
    return '<article class="pcard">' +
      '<a class="pcard__cover" href="' + href + '" aria-label="' + esc(p.name) + '"></a>' +

      '<div class="pcard__media">' +
      (p.photo
        ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy">'
        : '<div class="frame__empty">' + ICON.cam + '</div>') +
      '<div class="pcard__tags">' +
      (p.badges || []).slice(0, 2).map(function (b, i) {
        return '<span class="ptag' + (i === 0 ? ' ptag--dark' : ' ptag--rose') + '">' + esc(b) + '</span>';
      }).join('') +
      '</div>' +
      '<button class="pcard__fav" type="button" aria-label="Save ' + esc(p.name) + '" data-fav>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/></svg>' +
      '</button>' +
      '</div>' +

      '<div class="pcard__body">' +
      '<div class="pcard__rate">' + STAR5 + '<b>5.0</b> <span>(' + (p.rating || '48') + ')</span></div>' +
      '<h3 class="pcard__n">' + esc(p.name) + '</h3>' +
      '<p class="pcard__d">' + esc(p.tagline) + '</p>' +
      '<div class="pcard__price"><span class="pcard__from">From</span><span class="pcard__p">' + money(min) + '</span></div>' +
      '</div>' +

      '<div class="pcard__foot">' +
      '<a class="btn btn--quiet" href="' + href + '">Options</a>' +
      '<button class="btn btn--primary" type="button" data-add="' + p.id + '">Add</button>' +
      '</div>' +
      '</article>';
  }

  /* Botón "Add" directo: mete el producto con su precio base, sin opciones.
     El cliente puede añadirlo y seguir construyendo en el detalle. */
  function wireAdds(root) {
    els('[data-add]', root || document).forEach(function (b) {
      b.addEventListener('click', function () {
        var p = D.product(b.getAttribute('data-add'));
        if (!p || !window.DMCart) return;
        var s = p.sizes[0];
        var opts = p.groups.map(function (g) {
          return g.label.replace(/^Choose Your /, '') + ': to choose';
        });
        window.DMCart.add({
          name: p.name,
          size: s.label,
          options: opts,
          unit: s.price,
          qty: 1,
          img: p.photo
        });
      });
    });
  }

  function productGrid(list) {
    return '<div class="plist">' + list.map(productCard).join('') + '</div>';
  }

  /* ---------------- PRODUCTO / CUSTOMIZADOR ---------------- */
  var S = { product: null, size: null, qty: 1, pick: {}, date: '', zip: '', notes: '' };

  function size() {
    for (var i = 0; i < S.product.sizes.length; i++) if (S.product.sizes[i].id === S.size) return S.product.sizes[i];
    return null;
  }
  function limitFor(groupId) {
    var sz = size();
    if (!sz || !sz.limits) return null;
    var v = sz.limits[groupId];
    return typeof v === 'number' ? v : null;
  }
  function chosen(groupId) { return S.pick[groupId] || []; }
  function groupTotal() {
    var tot = 0;
    S.product.groups.forEach(function (g) {
      chosen(g.id).forEach(function (id) {
        var c = g.choices.filter(function (x) { return x.id === id; })[0];
        if (c && c.price) tot += c.price;
      });
    });
    return tot;
  }
  function orderTotal() {
    var sz = size();
    return ((sz ? sz.price : 0) + groupTotal()) * (S.qty || 1);
  }

  /* Un grupo está completo cuando cumple exactamente su límite.
     Los grupos opcionales sin límite (Extras) nunca bloquean. */
  function groupState(g) {
    var lim = limitFor(g.id);
    var n = chosen(g.id).length;
    if (lim == null) return { state: 'free', n: n, lim: null, text: g.optional ? 'Optional' : '' };
    return {
      state: n === lim ? 'ok' : n > lim ? 'bad' : 'todo',
      n: n, lim: lim,
      text: n === lim ? n + ' of ' + lim + ' · done' : n + ' of ' + lim + ' required'
    };
  }

  /* Galería: foto del producto en grande + la de su categoría. */
  function galleryFor(p) {
    /* photos[] es la galería real del producto. Si no existe, se usa
       photo + la imagen de su categoría para que nunca quede vacía. */
    var src = (p.photos && p.photos.length) ? p.photos : [p.photo];
    var cat = D.category(p.category);
    if (cat && cat.photo) src = src.concat([cat.photo]);
    var out = [];
    src.forEach(function (x) {
      if (!x) return;
      var f = D.hero(x);
      if (out.indexOf(f) < 0) out.push(f);
    });
    return out;
  }

  /* Tira de fotos al final de la ficha.
     Primero la del producto y las de su categoría; si no llegan, se
     completa con el resto del catálogo. Cada foto lleva su propio pie,
     así que nunca se presenta como un ángulo del producto si no lo es. */
  function lookShots(p) {
    var shots = [];
    function push(src, cap, tag) {
      if (!src) return;
      var full = D.hero(src);
      if (shots.some(function (s) { return s.full === full; })) return;
      shots.push({ full: full, cap: cap, tag: tag });
    }
    /* 1 · el producto y sus hermanos de categoría */
    push(p.photo, p.name, 'this');
    D.productsIn(p.category).forEach(function (x) {
      if (x.id !== p.id) push(x.photo, x.name, 'same');
    });
    /* 2 · resto del catálogo hasta llenar la tira */
    D.products.forEach(function (x) {
      if (shots.length >= 4) return;   // una fila exacta de 4
      push(x.photo, x.name, 'more');
    });
    return shots;
  }

  function renderProduct() {
    var host = el('[data-product]');
    if (!host) return;
    var id = qs('id') || 'merengon-12';
    var p = D.product(id);

    if (!p) {
      host.innerHTML = '<section class="sec"><div class="wrap"><div class="empty">' +
        '<h1 class="empty__t">Product not found</h1>' +
        '<p class="empty__b">That product does not exist. Head back to the menu.</p>' +
        '<a class="btn btn--primary" href="menu.html">Back to Menu</a>' +
        '</div></div></section>';
      document.title = 'Product not found · Dolce Moments';
      return;
    }

    var cat = D.category(p.category) || { name: '', slug: '' };
    S.product = p;
    S.size = p.sizes[0].id;
    S.qty = 1;
    S.pick = {};
    p.groups.forEach(function (g) { S.pick[g.id] = []; });
    document.title = p.name + ' · Dolce Moments';

    var imgs = galleryFor(p);
    var related = D.productsIn(cat.slug).filter(function (x) { return x.id !== p.id; }).slice(0, 4);

    host.innerHTML =
      '<div class="wrap"><nav class="crumb" aria-label="Breadcrumb">' +
      '<a href="index.html">Home</a><span aria-hidden="true">/</span>' +
      '<a href="menu.html">Menu</a><span aria-hidden="true">/</span>' +
      '<a href="category.html?c=' + cat.slug + '">' + esc(cat.name) + '</a>' +
      '<span aria-hidden="true">/</span><span>' + esc(p.name) + '</span>' +
      '</nav></div>' +

      '<section class="sec sec--tight"><div class="wrap"><div class="cust">' +

      /* ---------- galería (columna fija) ---------- */
      '<div class="gal-col">' +
      '<div class="gallery">' +
      '<div class="gal__main" data-galmain>' +
      '<div class="gal__badges">' + (p.badges || []).map(function (b) {
        return '<span class="ptag ptag--dark">' + esc(b) + '</span>';
      }).join('') + '</div>' +
      imgs.map(function (src, i) {
        return '<img src="' + esc(src) + '" alt="' + esc(p.name) + (i ? ' — alt view' : '') + '"' +
          (i ? ' style="display:none"' : '') + ' data-gal="' + i + '">';
      }).join('') +
      '</div>' +
      (imgs.length > 1
        ? '<div class="gal__thumbs">' + imgs.map(function (src, i) {
            return '<button class="gal__thumb' + (i === 0 ? ' is-on' : '') + '" type="button" data-thumb="' + i + '" ' +
              'aria-label="View ' + (i + 1) + '">' +
              '<img src="' + esc(src) + '" alt=""></button>';
          }).join('') + '</div>'
        : '') +
      '</div>' +
      '</div>' +

      /* ---------- ficha + opciones ---------- */
      '<div class="pdcol">' +
      '<div class="info">' +
      '<div class="info__rate">' + STAR5 + '<b>5.0</b> <a href="#tabs">(' + (p.rating || '48') + ' reviews)</a></div>' +
      '<h1 class="pdptitle">' + esc(p.name) + '</h1>' +
      '<div class="info__price" id="pdpPrice"><b>' + money(Math.min.apply(null, p.sizes.map(function (s) { return s.price; }))) + '</b>' +
      '<span id="pdpPriceNote">starting price</span></div>' +
      '<p class="pdplede">' + esc(p.description) + '</p>' +
      (p.note ? '<p class="tiny mt-s">' + esc(p.note) + '</p>' : '') +
      '</div>' +
      '<div class="info__hr"></div>' +
      '<div data-groups class="pdgroups"></div>' +
      '<div class="info__hr"></div>' +
      '<div class="orderdetail" data-detail></div>' +
      '<div class="info__hr"></div>' +
      '<div class="trust">' +
      '<div class="trust__i">' + ICON.truck + '<span><b>Same-day dispatch</b><span>Assembled the day it ships.</span></span></div>' +
      '<div class="trust__i">' + ICON.pin + '<span><b>Selected ZIP codes</b><span>We will confirm your area.</span></span></div>' +
      '<div class="trust__i">' + ICON.chat + '<span><b>No card needed</b><span>We confirm and you pay us directly.</span></span></div>' +
      '</div>' +
      '</div>' +

      '</div></div></section>' +

      /* ---------- pestañas ---------- */
      '<section class="tabs" id="tabs"><div class="wrap">' +
      '<div class="tabs__nav" role="tablist">' +
      '<button class="tabs__b" role="tab" aria-selected="true" data-tab="0">Description</button>' +
      '<button class="tabs__b" role="tab" aria-selected="false" data-tab="1">How to order</button>' +
      '<button class="tabs__b" role="tab" aria-selected="false" data-tab="2">Delivery</button>' +
      '</div>' +
      '<div class="tabs__p" data-pane="0">' +
      '<h3>About this ' + esc(p.name) + '</h3>' +
      '<p>' + esc(p.description) + '</p>' +
      (p.note ? '<p>' + esc(p.note) + '</p>' : '') +
      '<h3 class="mt-m">What you choose</h3><ul>' +
      p.groups.map(function (g) {
        return '<li>' + esc(g.label) + ' — ' + g.choices.length + ' options available.</li>';
      }).join('') +
      '</ul></div>' +
      '<div class="tabs__p" data-pane="1" hidden>' +
      '<h3>Four steps, no checkout</h3><ul>' +
      '<li>Choose your size.</li>' +
      '<li>Pick exactly what the page asks for in each group.</li>' +
      '<li>Press ORDER NOW. We write the whole order for you.</li>' +
      '<li>Send it by text, WhatsApp or Instagram. We reply with the total and confirm payment with you directly.</li>' +
      '</ul></div>' +
      '<div class="tabs__p" data-pane="2" hidden>' +
      '<h3>Delivery</h3>' +
      '<p>' + esc(CFG.delivery.headline) + ' ' + esc(CFG.delivery.note) + '</p>' +
      '<p>Free delivery on orders over ' + money(CFG.delivery.freeFrom) + '. ' +
      'We do not publish an address and there is no pickup point for now.</p>' +
      '<p><a class="btn btn--quiet" href="delivery.html">Check your ZIP code</a></p></div>' +
      '</div></section>' +

      /* ---------- más fotos ---------- */
      (function () {
        var shots = lookShots(p);
        if (shots.length < 2) return '';
        return '<section class="sec sec--tight"><div class="wrap">' +
          '<div class="sec__head"><span class="eyebrow">A closer look</span>' +
          '<h2 class="h-2">More of this</h2></div>' +
          '<div class="shots">' +
          shots.map(function (sh) {
            return '<figure class="shot">' +
              '<img src="' + esc(sh.full) + '" alt="' + esc(sh.cap) + '" loading="lazy">' +
              (sh.tag === 'more' ? '<span class="shot__tag">More like this</span>' : '') +
              '<figcaption>' + esc(sh.cap) + '</figcaption>' +
              '</figure>';
          }).join('') +
          '</div></div></section>';
      })() +

      /* ---------- relacionados ---------- */
      (related.length
        ? '<section class="sec sec--tight related"><div class="wrap">' +
          '<div class="sec__head"><span class="eyebrow">More from ' + esc(cat.name) + '</span>' +
          '<h2 class="h-2">You might also like</h2></div>' +
          productGrid(related) +
          '</div></section>'
        : '') +

            '<div class="floatbar" data-floatbar><div class="floatbar__inner">' +
      '<div class="floatbar__left">' +
      '<div class="floatbar__k" data-fbstate>Your order</div>' +
      '<div class="floatbar__v" data-floattotal></div>' +
      '</div>' +
      '<div class="floatbar__qty">' +
      '<span class="floatbar__qtl">Qty</span>' +
      '<div class="step">' +
      '<button type="button" data-q="-1" aria-label="One less"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg></button>' +
      '<span id="pdpQty2">1</span>' +
      '<button type="button" data-q="1" aria-label="One more"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>' +
      '</div></div>' +
      '<div class="floatbar__acts">' +
      '<button class="btn btn--rose" type="button" data-addtocart>Add to Order</button>' +
      '<button class="btn btn--quiet" type="button" data-review>Send order</button>' +
      '</div>' +
      '</div></div>' +

      /* ---------- modal ---------- */
      '<div class="sheet" data-sheet hidden>' +
      '<div class="sheet__bg" data-sheet-close></div>' +
      '<div class="sheet__box" role="dialog" aria-modal="true" aria-labelledby="sheetH">' +
      '<button class="sheet__x" type="button" data-sheet-close aria-label="Close">' + ICON.x + '</button>' +
      '<h2 class="sheet__h" id="sheetH">Send your order</h2>' +
      '<p class="small">Check the summary, add when and where, then pick how you want to send it. ' +
      'We will confirm availability and payment with you — nothing is charged on this page.</p>' +
      '<label class="field"><span class="field__l">Preferred delivery date &amp; time</span>' +
      '<input type="text" data-f="date" placeholder="e.g. Saturday, 2–4 pm"><span class="field__err">Tell us when you would like it.</span></label>' +
      '<label class="field"><span class="field__l">Delivery ZIP code</span>' +
      '<input type="text" data-f="zip" inputmode="numeric" maxlength="5" placeholder="e.g. 11215"><span class="field__err">A 5-digit ZIP code is required.</span></label>' +
      '<label class="field"><span class="field__l">Special instructions <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></span>' +
      '<textarea data-f="notes" placeholder="Allergies, a message on the box, anything else"></textarea></label>' +
      '<pre class="preview" data-preview></pre>' +
      '<div class="channels" data-channels></div>' +
      '<p class="tiny mt-s">Opening WhatsApp or Instagram copies this summary into the message for you.</p>' +
      '</div></div>';

    paintGroups();
    paintSummary();
    wireProduct();
  }

  function paintGroups() {
    var host = el('[data-groups]');
    if (!host) return;
    var p = S.product;

    /* "2 fruits · 1 topping · 1 sauce" — plural correcto, sin repetir la etiqueta */
    var GROUP_NOUN = { fruits: 'fruit', toppings: 'topping', sauce: 'sauce', chocolate: 'chocolate' };
    function limitsText(l) {
      return Object.keys(l).map(function (k) {
        var n = l[k], noun = GROUP_NOUN[k] || k;
        return n + ' ' + noun + (n === 1 ? '' : 's');
      }).join(' · ');
    }

    var html = '<div class="group" data-group="__size"><div class="group__head">' +
      '<h2 class="group__t"><span class="group__n">1</span>Size</h2></div><div class="sizes">' +
      p.sizes.map(function (s) {
        var lim = s.limits || {};
        var rule = limitsText(lim);
        return '<label class="opt sizeopt">' +
          '<input type="radio" name="size" value="' + s.id + '"' + (s.id === S.size ? ' checked' : '') + '>' +
          '<span class="opt__box"></span>' +
          '<span class="opt__t">' + esc(s.label) +
          '<span class="opt__s">' + esc(s.note) + '</span></span>' +
          '<span class="opt__p">' + money(s.price) + '</span>' +
          (rule ? '<span class="sizeopt__rule">' + esc(rule) + '</span>' : '') +
          '</label>';
      }).join('') + '</div></div>';

    p.groups.forEach(function (g, i) {
      var st = groupState(g);
      var multi = g.type === 'multi';
      /* toppings y sauce van en media columna para acortar la página */
      var wide = (i === 0) || g.choices.length > 6 || st.lim == null;
      /* una opción de 4 columnas necesita el ancho completo del grupo */
      var cols = !wide ? 'opts--2'
              : multi && g.choices.length > 6 ? 'opts--multi'
              : 'opts--2';

      /* Indicador de límite dentro de la cabecera del grupo:
         puntos + texto, para que se lea sin buscar la etiqueta. */
      var meter = '';
      if (st.lim != null) {
        var dots = '';
        for (var k = 0; k < st.lim; k++) {
          dots += '<i class="pip' + (k < st.n ? ' is-on' : '') + '"></i>';
        }
        meter = '<span class="meter is-' + st.state + '">' + dots +
                '<span class="meter__t">' + st.n + ' / ' + st.lim + '</span></span>';
      } else if (g.optional) {
        meter = '<span class="meter is-free"><span class="meter__t">Optional</span></span>';
      }

      html +=
        '<div class="group' + (wide ? '' : ' group--half') + '" data-group="' + g.id + '">' +
        '<div class="group__head">' +
        '<h2 class="group__t"><span class="group__n">' + (i + 2) + '</span>' + esc(g.label) + '</h2>' +
        meter +
        '</div>' +
        (g.helper ? '<p class="group__h">' + esc(g.helper) + '</p>' : '') +
        '<div class="opts ' + cols + '" data-opts="' + g.id + '">' +
        g.choices.map(function (c, ci) {
          /* Reaplicar el estado: paintGroups() reconstruye el DOM y los
             inputs perderían su "checked" si no se marcara aquí. */
          var on = chosen(g.id).indexOf(c.id) >= 0;
          return '<label class="opt' + (multi ? ' opt--multi' : '') + '">' +
            '<input type="' + (multi ? 'checkbox' : 'radio') + '" name="g_' + g.id + '" value="' + c.id + '" data-g="' + g.id + '"' +
            (on ? ' checked' : '') + '>' +
            '<span class="opt__box"></span>' +
            '<span class="opt__t">' + esc(c.label) + '</span>' +
            (c.price ? '<span class="opt__p">+' + money(c.price) + '</span>' : '') +
            '</label>';
        }).join('') +
        '</div></div>';
    });

    host.innerHTML = html;
  }

  /* Grupos con el límite sin cumplir. */
  function missingGroups() {
    var out = [];
    S.product.groups.forEach(function (g) {
      var st = groupState(g);
      if (st.lim != null && st.n !== st.lim) out.push(g);
    });
    return out;
  }

  /* Lleva la vista al primer grupo pendiente y lo resalta. */
  function focusGroup(g) {
    var el = document.querySelector('[data-group="' + g.id + '"]');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('is-flagged');
    var first = el.querySelector('.opt');
    setTimeout(function () { el.classList.remove('is-flagged'); }, 1600);
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 450);
  }

  function paintSummary() {
    /* No hay caja fija: el total y las acciones viven en la barra
       inferior. Aquí no se puede salir antes de tiempo. */
    var host = el('[data-sum]');
    var sz = size();
    var missing = [];
    S.product.groups.forEach(function (g) {
      var st = groupState(g);
      if (st.lim != null && st.n !== st.lim) missing.push(g);
    });

    /* No hay caja en la columna: el total y las acciones viven en la
       barra fija inferior, siempre visible. El desglose itemizado queda
       al final de las opciones. */
if (host) host.innerHTML = '';

    /* desglose itemizado, al final de las opciones */
    var detail = el('[data-detail]');
    if (detail) {
      var rows = '<dt>Size</dt><dd>' + esc(sz.label) + (S.qty > 1 ? ' × ' + S.qty : '') + '</dd>';
      S.product.groups.forEach(function (g) {
        var sel = chosen(g.id).map(function (id) {
          var c = g.choices.filter(function (x) { return x.id === id; })[0];
          return c ? c.label : id;
        });
        rows += '<dt>' + esc(g.label.replace(/^Choose Your /, '')) + '</dt>' +
          '<dd>' + (sel.length ? esc(sel.join(' + ')) : '<span class="sum__empty">not chosen yet</span>') + '</dd>';
      });
      detail.innerHTML =
        '<h2 class="group__t" style="margin-bottom:4px">Your order so far</h2>' +
        '<p class="tiny" style="margin-bottom:14px">Everything you have picked so far.</p>' +
        '<dl class="sum__l">' + rows + '</dl>';
    }

    var fv = el('[data-floattotal]');
    if (fv) fv.textContent = money(orderTotal());
    var fs = el('[data-fbstate]');
    if (fs) {
      fs.innerHTML = missing.length
        ? 'Pick ' + missing.map(function (g) {
            return '<button type="button" data-goto="' + g.id + '">' +
              esc(g.label.replace(/^Choose Your /, '')) + '</button>';
          }).join('<span class="fbsep">·</span>')
        : '<span class="fbok">Ready to add</span>';
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-floatbar] [data-review]'), function (b) {
      b.disabled = missing.length > 0;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-floatbar] [data-addtocart]'), function (b) {
      b.classList.toggle('is-waiting', missing.length > 0);
      b.textContent = missing.length
        ? 'Add to Order — ' + missing.length + ' to go'
        : 'Add to Order';
    });
    var fbEl = el('[data-floatbar]');
    if (fbEl) fbEl.classList.add('is-up');
    document.body.classList.add('has-floatbar');

    var pb = el('#pdpPrice b');
    if (pb) pb.textContent = money(orderTotal());
    var pn = el('#pdpPriceNote');
    if (pn) pn.textContent = missing.length ? 'base price, plus your choices' : 'includes your choices';

    var hint = el('[data-hint]');
    if (hint) {
      if (missing.length) {
        hint.textContent = 'Still needed: ' + missing.map(function (g) {
          return g.label.replace(/^Choose Your /, '').toLowerCase();
        }).join(', ') + '.';
        hint.className = 'sum__hint is-todo';
      } else {
        hint.textContent = 'Everything is selected. Ready to add.';
        hint.className = 'sum__hint is-ok';
      }
    }
  }

  /* ---------------- resumen de texto ---------------- */
  function orderText() {
    var sz = size();
    var L = [];
    L.push(CFG.name.toUpperCase() + ' — ORDER REQUEST');
    L.push('');
    L.push(S.product.name + ' ' + sz.label + (S.qty > 1 ? '  ×' + S.qty : ''));
    S.product.groups.forEach(function (g) {
      var sel = chosen(g.id).map(function (id) {
        var c = g.choices.filter(function (x) { return x.id === id; })[0];
        return c ? c.label : id;
      });
      if (g.optional && !sel.length) return;
      L.push(g.label.replace(/^Choose Your /, '') + ': ' + (sel.length ? sel.join(' + ') : '—'));
    });
    L.push('');
    L.push('Total: ' + money(orderTotal() * S.qty));
    L.push('Preferred delivery date/time: ' + (S.date || '—'));
    L.push('ZIP Code: ' + (S.zip || '—'));
    if (S.notes) L.push('Notes: ' + S.notes);
    return L.join('\n');
  }

  function paintSheet() {
    var pv = el('[data-preview]');
    if (pv) pv.textContent = orderText();
    var ch = el('[data-channels]');
    if (!ch) return;
    var enc = encodeURIComponent(orderText());
    ch.innerHTML = ['text', 'whatsapp', 'instagram'].map(function (k) {
      var c = CFG.channels[k];
      var href = k === 'text' ? c.href + '?body=' + enc
               : k === 'whatsapp' ? c.href + '?text=' + enc
               : c.href;
      var icon = k === 'text' ? ICON.sms : k === 'whatsapp' ? ICON.wa : ICON.ig;
      return '<a class="ch" href="' + esc(href) + '" target="_blank" rel="noopener" data-ch="' + k + '">' +
        icon + '<span class="ch__l">' + esc(c.label) + '</span>' +
        '<span class="ch__n">' + esc(c.note) + '</span></a>';
    }).join('');
  }

  function openSheet() {
    var sh = el('[data-sheet]');
    if (!sh) return;
    sh.hidden = false;
    requestAnimationFrame(function () { sh.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    paintSheet();
    var f = el('[data-f="date"]');
    if (f) setTimeout(function () { f.focus(); }, 120);
  }
  function closeSheet() {
    var sh = el('[data-sheet]');
    if (!sh) return;
    sh.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { sh.hidden = true; }, 340);
  }

  function wireProduct() {
    // cantidad
    els('[data-q]').forEach(function (b) {
      b.addEventListener('click', function () {
        S.qty = Math.max(1, Math.min(30, S.qty + parseInt(b.getAttribute('data-q'), 10)));
        Array.prototype.forEach.call(document.querySelectorAll('#pdpQty, #pdpQty2'), function (q) { q.textContent = S.qty; });
        paintSummary();
        var sh2 = el('[data-sheet]');
        if (sh2 && !sh2.hidden) paintSheet();
      });
    });

    // add to order — por delegación: paintSummary() recrea el botón,
    // así que un listener directo se perdería en cada repintado.
    function addToOrder() {
      if (!window.DMCart) return;
      var sz = size();
      var opts = [];
      S.product.groups.forEach(function (g) {
        var sel = chosen(g.id).map(function (id) {
          var c = g.choices.filter(function (x) { return x.id === id; })[0];
          return c ? c.label : id;
        });
        if (!sel.length) return;
        opts.push(g.label.replace(/^Choose Your /, '') + ': ' + sel.join(' + '));
      });
      window.DMCart.add({
        name: S.product.name,
        size: sz.label,
        options: opts,
        unit: sz.price + groupTotal(),   // precio por unidad; qty multiplica
        qty: S.qty,
        img: S.product.photo
      });
      window.DMCart.open();
    }

    // galería
    els('[data-thumb]').forEach(function (t) {
      t.addEventListener('click', function () {
        var i = t.getAttribute('data-thumb');
        els('[data-gal]').forEach(function (img) {
          img.style.display = img.getAttribute('data-gal') === i ? '' : 'none';
        });
        els('[data-thumb]').forEach(function (o) { o.classList.toggle('is-on', o === t); });
      });
    });

    // pestañas
    els('[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = b.getAttribute('data-tab');
        els('[data-tab]').forEach(function (o) { o.setAttribute('aria-selected', o === b ? 'true' : 'false'); });
        els('[data-pane]').forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== i; });
      });
    });

    // cambio de tamaño y opciones: los listeners los pone bindOptions()
    bindOptions();
    paintSummary();

    document.addEventListener('click', function (e) {
      var goto = e.target.closest('[data-goto]');
      if (goto) {
        var g = S.product.groups.filter(function (x) { return x.id === goto.getAttribute('data-goto'); })[0];
        if (g) focusGroup(g);
        return;
      }
      if (e.target.closest('[data-addtocart]')) {
        var miss = missingGroups();
        if (miss.length) { focusGroup(miss[0]); return; }
        addToOrder();
        return;
      }
      if (e.target.closest('[data-review]')) openSheet();
      if (e.target.closest('[data-sheet-close]')) closeSheet();
      if (e.target.closest('.sheet__x')) closeSheet();
    });
    document.addEventListener('keydown', function (e) {
      var sh = el('[data-sheet]');
      if (e.key === 'Escape' && sh && !sh.hidden) closeSheet();
    });

    els('[data-f]').forEach(function (f) {
      f.addEventListener('input', function () {
        S[f.getAttribute('data-f')] = f.value;
        if (f.getAttribute('data-f') === 'zip') {
          f.value = f.value.replace(/[^0-9]/g, '');
          S.zip = f.value;
        }
        var bad = el('[data-sheet]');
        if (bad) paintSheet();
        f.closest('.field').classList.remove('is-bad');
      });
      f.addEventListener('blur', validateField);
    });
    els('[data-ch]').forEach(function (a) {
      a.addEventListener('click', function () {
        validateField();
        if (!isValid()) return;
      });
    });
  }

  /* Enlaza tamaño y grupos. Se vuelve a llamar después de cada repintado
     porque paintGroups() reconstruye los inputs y perderían sus listeners. */
  function bindOptions() {
    // tamaño -> reajusta límites, limpia lo que ya no cabe
    els('input[name="size"]').forEach(function (r) {
      r.addEventListener('change', function () {
        if (S.size === r.value) return;
        S.size = r.value;
        S.product.groups.forEach(function (g) {
          var lim = limitFor(g.id);
          if (lim != null && chosen(g.id).length > lim) S.pick[g.id] = chosen(g.id).slice(0, lim);
        });
        paintGroups();
        bindOptions();
        paintSummary();
        var sh = el('[data-sheet]');
        if (sh && !sh.hidden) paintSheet();
      });
    });

    els('[data-g]').forEach(function (i) {
      i.addEventListener('change', function () {
        var gid = i.getAttribute('data-g');
        var g = S.product.groups.filter(function (x) { return x.id === gid; })[0];
        var lim = limitFor(gid);

        if (g.type === 'multi') {
          var arr = els('[data-g="' + gid + '"]:checked').map(function (x) { return x.value; });
          if (lim != null && arr.length > lim) {
            // llegó al límite -> rechaza el sobrante y conserva el resto
            i.checked = false;
            var lbl = i.closest('.opt');
            if (lbl && lbl.animate) {
              lbl.animate(
                [{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' },
                 { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }],
                { duration: 220, easing: 'ease-out' }
              );
            }
            setTimeout(function () { paintGroups(); bindOptions(); }, 420);
            return;
          }
          S.pick[gid] = arr;
        } else {
          S.pick[gid] = [i.value];
        }
        paintGroups();
        bindOptions();
        paintSummary();
        var sh = el('[data-sheet]');
        if (sh && !sh.hidden) paintSheet();
      });
    });
  }

  function validateField() {
    var d = el('[data-f="date"]'), z = el('[data-f="zip"]');
    var ok = true;
    if (d) {
      var bad = !S.date.trim();
      d.closest('.field').classList.toggle('is-bad', bad);
      if (bad) ok = false;
    }
    if (z) {
      var badz = !/^\d{5}$/.test(S.zip);
      z.closest('.field').classList.toggle('is-bad', badz);
      if (badz) ok = false;
    }
    return ok;
  }
  function isValid() { return validateField(); }

  /* ---------------- DELIVERY AREA ---------------- */
  function renderDelivery() {
    var host = el('[data-delivery]');
    if (!host) return;
    document.title = 'Delivery Area · Dolce Moments';

    host.innerHTML =
      '<div class="wrap"><nav class="crumb" aria-label="Breadcrumb">' +
      '<a href="index.html">Home</a><span aria-hidden="true">/</span><span>Delivery Area</span>' +
      '</nav></div>' +

      '<section class="sec sec--tight"><div class="wrap">' +
      '<div class="sec__head">' +
      '<span class="eyebrow">Delivery Area</span>' +
      '<h1 class="h-1">' + esc(CFG.delivery.headline) + '</h1>' +
      '<p class="lede mt-s">' + esc(CFG.delivery.note) + '</p>' +
      '</div>' +

      '<div class="zipbox">' +
      '<div class="sum">' +
      '<h2 class="sum__t">Check your ZIP code</h2>' +
      '<p class="small">Type your 5-digit ZIP and we will tell you right away.</p>' +
      '<div class="ziprow mt-m">' +
      '<input type="text" inputmode="numeric" maxlength="5" placeholder="11215" data-zip aria-label="ZIP code">' +
      '<button class="btn btn--primary" type="button" data-zipgo>Check</button>' +
      '</div>' +
      '<div data-zipres></div>' +
      '<p class="tiny mt-m">Free delivery on orders over ' + money(CFG.delivery.freeFrom) + '.</p>' +
      '</div>' +

      '<div>' +
      '<h2 class="h-2">Currently delivering to</h2>' +
      '<div class="chips mt-m">' + CFG.delivery.zipCodes.map(function (z) {
        return '<button class="chip" type="button" data-z="' + z + '">' + esc(z) + '</button>';
      }).join('') + '</div>' +
      '<p class="tiny mt-m">The list is kept in <code>js/data.js</code> — add or remove a ZIP there ' +
      'and this page updates on its own.</p>' +
      '<div class="mt-l">' +
      '<h3 class="h-3">We do not publish an address</h3>' +
      '<p class="small mt-s">Dolce Moments is delivery-only for now. There is no pickup point and ' +
      'no residential address is shown on this site.</p>' +
      '</div>' +
      '</div>' +
      '</div></div></section>' +

      '<section class="sec sec--blush sec--tight"><div class="wrap center">' +
      '<h2 class="h-2">Outside these ZIPs?</h2>' +
      '<p class="lede mt-s" style="max-width:44ch;margin-inline:auto">Message us anyway. If we are ' +
      'opening a new area that week, we will tell you.</p>' +
      '<a class="btn btn--rose mt-m" href="' + CFG.channels.whatsapp.href + '" target="_blank" rel="noopener">Ask on WhatsApp</a>' +
      '</div></section>';

    var inp = el('[data-zip]'), res = el('[data-zipres]');
    function check() {
      var v = (inp.value || '').replace(/[^0-9]/g, '');
      inp.value = v;
      if (v.length !== 5) { res.innerHTML = ''; return; }
      var ok = CFG.delivery.zipCodes.indexOf(v) >= 0;
      res.innerHTML = ok
        ? '<div class="zipres zipres--ok">Good news — we deliver to <strong>' + esc(v) + '</strong>. Add it to your order and we will confirm the slot.</div>'
        : '<div class="zipres zipres--no">We do not deliver to <strong>' + esc(v) + '</strong> yet. Message us and we will check.</div>';
    }
    el('[data-zipgo]').addEventListener('click', check);
    inp.addEventListener('input', check);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    els('[data-z]').forEach(function (c) {
      c.addEventListener('click', function () { inp.value = c.getAttribute('data-z'); check(); inp.focus(); });
    });
  }

  /* ---------------- CONTACT / ORDER ---------------- */
  function renderOrder() {
    var host = el('[data-order]');
    if (!host) return;
    document.title = 'Contact & Order · Dolce Moments';
    var enc = encodeURIComponent('Hi ' + CFG.name + '! I would like to place an order.');

    host.innerHTML =
      '<div class="wrap"><nav class="crumb" aria-label="Breadcrumb">' +
      '<a href="index.html">Home</a><span aria-hidden="true">/</span><span>Contact &amp; Order</span>' +
      '</nav></div>' +

      '<section class="sec sec--tight"><div class="wrap">' +
      '<div class="sec__head">' +
      '<span class="eyebrow">Contact &amp; Order</span>' +
      '<h1 class="h-1">How would you like to order?</h1>' +
      '<p class="lede mt-s">Choose the channel you prefer. If you already built an order, use ' +
      'ORDER NOW on the product page and it will be written out for you.</p>' +
      '</div>' +

      '<div class="channels" style="grid-template-columns:1fr">' +
      '<a class="ch" href="menu.html" style="flex-direction:row;text-align:left;justify-content:flex-start;gap:16px;padding:22px">' +
      ICON.bag + '<span><span class="ch__l" style="display:block">View Menu</span>' +
      '<span class="ch__n">Build your order step by step</span></span></a>' +
      '</div>' +

      '<div class="channels mt-l">' +
      '<a class="ch" href="' + CFG.channels.text.href + '?body=' + enc + '">' + ICON.sms +
      '<span class="ch__l">Text US</span><span class="ch__n">' + esc(CFG.channels.text.note) + '</span></a>' +
      '<a class="ch" href="' + CFG.channels.whatsapp.href + '?text=' + enc + '" target="_blank" rel="noopener">' + ICON.wa +
      '<span class="ch__l">WhatsApp</span><span class="ch__n">' + esc(CFG.channels.whatsapp.note) + '</span></a>' +
      '<a class="ch" href="' + CFG.channels.instagram.href + '" target="_blank" rel="noopener">' + ICON.ig +
      '<span class="ch__l">Instagram</span><span class="ch__n">' + esc(CFG.channels.instagram.note) + '</span></a>' +
      '</div>' +

      '<div class="sum mt-l" style="max-width:640px">' +
      '<h2 class="sum__t">No payment on this site</h2>' +
      '<p class="small">We do not take card payments or PayPal here. Once you send your order we reply ' +
      'with availability and the total, and you pay us directly. If we ever add online payment, ' +
      'this structure leaves room for it.</p>' +
      '<div class="mt-m"><a class="btn btn--quiet" href="delivery.html">' + ICON.pin + 'See delivery area</a></div>' +
      '</div>' +
      '</div></section>';
  }

  /* ---------------- arranque ---------------- */
  function boot() {
    renderChrome();
    var page = document.body.getAttribute('data-page');
    if (page === 'home') renderHome();
    else if (page === 'menu') renderMenu();
    else if (page === 'category') renderCategory();
    else if (page === 'product') renderProduct();
    else if (page === 'delivery') renderDelivery();
    else if (page === 'order') renderOrder();

    // enlace cubriente de las tarjetas de producto
    var st = document.createElement('style');
    st.textContent = '.pcard{position:relative}.bc-cover{position:absolute;inset:0;z-index:2}' +
                     '.pcard .btn{position:relative;z-index:3}';
    document.head.appendChild(st);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
