/* =============================================================
   DOLCE MOMENTS — Catálogo
   -------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE EDITAR A MANO.

   Todo el sitio se construye a partir de `DM`. Cuando se conecte
   un panel de administración, este archivo se sustituye por las
   llamadas a la API y el resto del código no cambia.

   -------------------------------------------------------------
   PENDIENTE DE ENTREGAR POR EL CLIENTE (marcado abajo):
   • listas reales de frutas, toppings y salsas
   • productos reales de las categorías distintas a Merengones
   • lista real de ZIP codes de entrega
   • número de WhatsApp / usuario de Instagram
   ============================================================= */

window.DM = (function () {
  'use strict';

  /* -------------------------------------------------------------
     AJUSTES GENERALES
     Editar aquí el teléfono, redes y textos legales.
     ------------------------------------------------------------- */
  var config = {
    brand: 'Dolce Moments',
    name: 'DOLCE MOMENTS',
    slogan: 'Small Details, Big Moments',
    domain: 'dolcemomentsusa.com',
    menuUrl: 'https://dolcemomentsusa.com/menu',

    /* Canales de pedido. Sustituir por los reales. */
    channels: {
      text: {
        id: 'text',
        label: 'TEXT US',
        note: 'Priority for US customers',
        /* sms: número E.164. Dejar vacío hasta tenerlo confirmado. */
        phone: '+15555550100',
        href: 'sms:+15555550100'
      },
      whatsapp: {
        id: 'whatsapp',
        label: 'WHATSAPP',
        note: 'Fastest replies',
        phone: '+15555550100',
        /* Formato internacional sin + ni espacios. */
        href: 'https://wa.me/15555550100'
      },
      instagram: {
        id: 'instagram',
        label: 'INSTAGRAM',
        note: 'DM us in the app',
        /* Formato wa.me para deep-link de DM. */
        href: 'https://ig.me/m/dolcemoments'
      }
    },

    /* Canales desde los que se envía el pedido.
       El cliente pidió que el carrito use únicamente WhatsApp.
       Para volver a ofrecer otros, basta con listarlos aquí:
         ['text', 'whatsapp', 'instagram'] */
    cartChannels: ['whatsapp'],

    /* Muestra una banda de aviso "datos de ejemplo" en la web.
       false en la demo con el cliente, true para revisión interna. */
    showDataNotice: false,

    /* USPS-first: prefijo de los ZIP codes de entrega. */
    delivery: {
      headline: 'Delivery is available in selected ZIP codes.',
      /* >>> SUSTITUIR por la lista real que entregará el cliente <<< */
      zipCodes: ['11215', '11201', '11217', '10001', '10011'],
      note: 'Not sure if we deliver to you? Message us and we will check your ZIP code.',
      freeFrom: 75
    }
  };

  /* -------------------------------------------------------------
     FOTOGRAFÍA
     Las imágenes disponibles son de berryccino.com (torres de fresas
     con chocolate y postres de fresa). Se usan como referencia visual
     provisional: son las que hay. Sustituir por fotos propias de
     Dolce Moments antes de entregar la web al cliente.

     Se asignan por parecido visual con el nombre de la categoría.
     Cambiar aquí y la tarjeta, la cabecera de categoría y el detalle
     se actualizan solos.
     ------------------------------------------------------------- */
  var IMG = {
    cream:     'assets/products/pastel-fresas-mascarpone.webp',
    chocolate: 'assets/products/tower-ocean-song.webp',
    mixed:     'assets/products/tower-strawberry.webp',
    white:     'assets/products/tower-tibet.webp',
    green:     'assets/products/tower-christmas.webp',
    classic:   'assets/products/tower-we-are-engaged.webp',
    elegant:   'assets/products/tower-wedding.webp',
    box:       'assets/products/caja-letras-numeros.webp',
    bouquet:   'assets/products/bouquet-fresas-rosas.webp'
  };

  /* Versión grande para portada y galería de detalle. */
  function hero(src) { return src.replace(/\.webp$/, '-lg.webp'); }

  /* -------------------------------------------------------------
     CATEGORÍAS
     Cada categoría tiene su propia página: category.html?c=<slug>
     El orden es el del brief. No mezclarlas en una sola vista.
     ------------------------------------------------------------- */
  var categories = [
    { slug: 'merengones',        name: 'Merengones',              photo: IMG.cream,     blurb: 'Crisp meringue nests, loaded with fruit, topping and sauce.' },
    { slug: 'strawberries-cream',name: 'Strawberries & Cream',    photo: IMG.cream,     blurb: 'Fresh strawberries, cold cream and a light sweet finish.' },
    { slug: 'chocolate-strawberries', name: 'Chocolate Strawberries', photo: IMG.chocolate, blurb: 'Strawberries dipped in chocolate, one at a time.' },
    { slug: 'crepes',            name: 'Crepes',                  photo: IMG.white,     blurb: 'Thin, warm and folded around exactly what you like.' },
    { slug: 'waffles',           name: 'Waffles',                 photo: IMG.classic,   blurb: 'Golden waffles with crisp edges and a soft centre.' },
    { slug: 'fruit-cups',        name: 'Fruit Cups',              photo: IMG.mixed,     blurb: 'Layers of fruit, cream and crunch in a cup.' },
    { slug: 'parfaits',          name: 'Parfaits',                photo: IMG.elegant,   blurb: 'Spoonable, layered and made to be finished slowly.' },
    { slug: 'drinks',            name: 'Drinks',                  photo: IMG.green,     blurb: 'Cold, blended and made fresh when you order.' },
    { slug: 'gift-boxes',        name: 'Gift Boxes',              photo: IMG.box,       blurb: 'Arranged to be opened. Built for the occasion.' }
  ];

  /* -------------------------------------------------------------
     GRUPOS DE OPCIONES
     type: 'single' -> radio, 'multi' -> casillas
     Sin límite propio: el límite lo define el tamaño elegido
     (size.limits). Así 12 oz pide 2 frutas y 16 oz pide 3, tal
     como pide el brief, sin duplicar el producto.
     ------------------------------------------------------------- */

  /* >>> LISTAS DE EJEMPLO — el cliente entregará las reales.
         Marcar estas listas y sustituirlas antes de publicar. <<< */
  var FRUITS = [
    { id: 'strawberry',   label: 'Strawberry' },
    { id: 'mango',        label: 'Mango' },
    { id: 'kiwi',         label: 'Kiwi' },
    { id: 'blueberry',    label: 'Blueberry' },
    { id: 'banana',       label: 'Banana' },
    { id: 'raspberry',    label: 'Raspberry' },
    { id: 'pineapple',    label: 'Pineapple' }
  ];

  var TOPPINGS = [
    { id: 'lotus',        label: 'Lotus' },
    { id: 'nutella',      label: 'Nutella' },
    { id: 'coconut',      label: 'Coconut Flakes' },
    { id: 'oreo',         label: 'Oreo' },
    { id: 'graham',       label: 'Graham Crumbs' },
    { id: 'marshmallow',  label: 'Marshmallow' }
  ];

  var SAUCES = [
    { id: 'white-chocolate', label: 'White Chocolate' },
    { id: 'dark-chocolate',  label: 'Dark Chocolate' },
    { id: 'strawberry-sauce',label: 'Strawberry Sauce' },
    { id: 'mango-sauce',     label: 'Mango Sauce' },
    { id: 'caramel',         label: 'Salted Caramel' }
  ];

  /* Extras: grupo opcional, se cobra por pieza y puede superar
     el límite del tamaño (fruta extra, topping extra, etc.). */
  var EXTRAS = [
    { id: 'extra-fruit',   label: 'Extra fruit',   price: 1.50 },
    { id: 'extra-topping', label: 'Extra topping', price: 1.50 },
    { id: 'extra-sauce',   label: 'Extra sauce',   price: 1.00 },
    { id: 'scoop-ice-cream', label: 'Scoop of ice cream', price: 3.00 }
  ];

  /* -------------------------------------------------------------
     PRODUCTOS
     El brief confirma Merengón 12 oz y 16 oz. Los demás se añaden
     con el mismo bloque; se marcan como provisional porque aún no
     hay lista real de productos ni de precios del cliente.
     Las opciones (frutas/toppings/salsas) son de ejemplo hasta que
     el cliente entregue sus listas.
     ------------------------------------------------------------- */

  /* Plantilla de límites: cada tamaño define cuántas selections pide. */
  function merengue(id, name, tagline, description, photo, badges, note, sizes, photos) {
    return {
      id: id, category: 'merengones', name: name, tagline: tagline,
      description: description, photo: photo, photos: photos || [photo],
      badges: badges, note: note,
      sizes: sizes,
      groups: [
        { id: 'fruits', label: 'Choose Your Fruits', type: 'multi', placeholder: true,
          helper: 'Fresh, cut the morning of delivery.', choices: FRUITS },
        { id: 'toppings', label: 'Choose Your Toppings', type: 'multi', placeholder: true,
          helper: 'Folded in just before it is boxed.', choices: TOPPINGS },
        { id: 'sauce', label: 'Choose Your Sauce', type: 'multi', placeholder: true,
          helper: 'Drizzled over the top.', choices: SAUCES },
        { id: 'extras', label: 'Extras', type: 'multi', optional: true,
          helper: 'Optional — charged per item.', choices: EXTRAS }
      ]
    };
  }

  /* Categoría simple: un solo grupo, sin fruits/toppings/sauce.
     El brief pide poder quitar un grupo solo de un producto. */
  function simple(id, category, name, tagline, description, photo, badges, price, group, photos) {
    return {
      id: id, category: category, name: name, tagline: tagline,
      description: description, photo: photo, photos: photos || [photo],
      badges: badges, note: '',
      sizes: [{ id: 'std', label: 'Regular', price: price, note: 'Serves 1–2', limits: {} }],
      groups: group ? [group] : []
    };
  }

  var products = [
    /* El Merengón es UN producto con dos tamaños, y cada tamaño pide
       una cantidad distinta. Eso es justo lo que pide el brief:
         12 oz -> exactamente 2 fruits, 1 topping, 1 sauce
         16 oz -> exactamente 3 fruits, 2 toppings, 1 sauce
       Por eso los límites viven en el tamaño y no en el producto. */
    merengue('merengon', 'Merengón', 'Our signature crisp meringue nest.',
      'A baked meringue nest with a crisp shell and a soft centre, filled to order with the fruits, ' +
      'topping and sauce you choose. Pick your size and the page will ask you for exactly the ' +
      'right amount of each. Assembled by hand the day it ships.',
      IMG.cream, ['Signature', 'Made to order'], 'Served cold. Best within 24 hours of delivery.',
      [
        { id: '12oz', label: '12 oz', price: 12.00, note: 'Serves 1–2',
          limits: { fruits: 2, toppings: 1, sauce: 1 } },
        { id: '16oz', label: '16 oz', price: 15.50, note: 'Serves 2–3',
          limits: { fruits: 3, toppings: 2, sauce: 1 } }
      ]),

    merengue('merengon-gold', 'Merengón Gold', 'Finished with edible gold leaf.',
      'The 16 oz nest with three fruits, two toppings and one sauce, finished with edible gold leaf ' +
      'and packed in a rigid gift box.',
      IMG.elegant, ['Premium', 'Gift ready'], 'Served cold. Best within 24 hours of delivery.',
      [{ id: '16oz', label: '16 oz', price: 19.00, note: 'Serves 2–3',
        limits: { fruits: 3, toppings: 2, sauce: 1 } }]),

    simple('choc-strawberries-6', 'chocolate-strawberries', 'Chocolate Strawberries — 6 pc',
      'Six strawberries dipped in Belgian chocolate.',
      'Whole strawberries dipped one at a time in tempered Belgian chocolate, set until firm and ' +
      'packed in a chilled box. Choose the chocolate you want them dipped in.',
      IMG.chocolate, ['Belgian chocolate'], 22.00,
      { id: 'chocolate', label: 'Choose Your Chocolate', type: 'single',
        helper: 'Pick one for the whole box.',
        choices: [{ id: 'dark', label: 'Dark Chocolate' }, { id: 'milk', label: 'Milk Chocolate' },
                  { id: 'white', label: 'White Chocolate' }, { id: 'ruby', label: 'Ruby Chocolate' }] }),

    simple('choc-strawberries-12', 'chocolate-strawberries', 'Chocolate Strawberries — 12 pc',
      'A dozen, for sharing.',
      'Twelve strawberries dipped in tempered Belgian chocolate, arranged in a rigid gift box with ' +
      'a chilled pack.',
      IMG.chocolate, ['Gift ready'], 38.00,
      { id: 'chocolate', label: 'Choose Your Chocolate', type: 'single',
        helper: 'Pick one for the whole box.',
        choices: [{ id: 'dark', label: 'Dark Chocolate' }, { id: 'milk', label: 'Milk Chocolate' },
                  { id: 'white', label: 'White Chocolate' }, { id: 'ruby', label: 'Ruby Chocolate' }] }),

    simple('straw-cream-cup', 'strawberries-cream', 'Strawberries & Cream Cup',
      'The classic, built cold.',
      'Fresh strawberries over cold cream with a light sweet finish. Assembled the day it ships ' +
      'so it never sits.',
      IMG.cream, ['No bake'], 11.00,
      { id: 'toppings', label: 'Choose Your Topping', type: 'single',
        helper: 'Pick one.',
        choices: TOPPINGS.slice(0, 4) }),

    simple('straw-cream-parfait', 'parfaits', 'Strawberry Parfait',
      'Layers you can see.',
      'Spoonable layers of fruit, cream and crunch, finished with the topping you pick.',
      IMG.elegant, ['No bake'], 12.50,
      { id: 'toppings', label: 'Choose Your Topping', type: 'single',
        helper: 'Pick one.',
        choices: TOPPINGS.slice(0, 4) }),

    simple('crepe-sweet', 'crepes', 'Sweet Crepe',
      'Warm, thin, folded around your choice.',
      'A thin crepe cooked to order and folded around fruit and the topping you choose, finished ' +
      'with sauce.',
      IMG.white, ['Made to order'], 13.00,
      { id: 'toppings', label: 'Choose Your Topping', type: 'single',
        helper: 'Pick one.',
        choices: TOPPINGS.slice(0, 4) }),

    simple('waffle-sweet', 'waffles', 'Sweet Waffle',
      'Crisp edges, soft centre.',
      'A golden waffle made to order, loaded with fruit and finished with your choice of topping ' +
      'and sauce.',
      IMG.classic, ['Made to order'], 12.00,
      { id: 'toppings', label: 'Choose Your Topping', type: 'single',
        helper: 'Pick one.',
        choices: TOPPINGS.slice(0, 4) }),

    simple('fruit-cup', 'fruit-cups', 'Fruit Cup',
      'Cold fruit, no bake.',
      'A cup of fresh fruit over cold cream with a light sweet finish. Choose your sauce.',
      IMG.mixed, ['No bake'], 10.00,
      { id: 'sauce', label: 'Choose Your Sauce', type: 'single',
        helper: 'Pick one.',
        choices: SAUCES.slice(0, 4) }),

    simple('drink-fruit', 'drinks', 'Fresh Fruit Drink',
      'Blended when you order.',
      'Fruit blended to order with ice. Choose your fruit and your sauce.',
      IMG.green, ['Blended fresh'], 8.50,
      { id: 'sauce', label: 'Choose Your Sauce', type: 'single',
        helper: 'Pick one.',
        choices: SAUCES.slice(0, 4) }),

    simple('gift-box-classic', 'gift-boxes', 'Gift Box — Classic',
      'Built to be opened.',
      'A rigid box arranged with the pieces you choose, tied and ready to hand over.',
      IMG.box, ['Gift ready'], 45.00,
      { id: 'extras', label: 'Add extras', type: 'multi', optional: true,
        helper: 'Optional — charged per item.', choices: EXTRAS },
      [IMG.box, IMG.bouquet, IMG.cream]),

    simple('gift-box-signature', 'gift-boxes', 'Gift Box — Signature',
      'The full arrangement.',
      'Our signature arrangement in a rigid box: chocolate strawberries, fruit cups and extras of ' +
      'your choice.',
      IMG.bouquet, ['Premium', 'Gift ready'], 78.00,
      { id: 'extras', label: 'Add extras', type: 'multi', optional: true,
        helper: 'Optional — charged per item.', choices: EXTRAS },
      [IMG.box, IMG.bouquet, IMG.cream])
  ];

  /* -------------------------------------------------------------
     Consultas
     ------------------------------------------------------------- */
  function slugify(s) {
    return String(s).toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  return {
    config: config,
    categories: categories,
    products: products,
    hero: hero,

    category: function (slug) {
      for (var i = 0; i < categories.length; i++) if (categories[i].slug === slug) return categories[i];
      return null;
    },
    product: function (id) {
      for (var i = 0; i < products.length; i++) if (products[i].id === id) return products[i];
      return null;
    },
    productsIn: function (catSlug) {
      return products.filter(function (p) { return p.category === catSlug; });
    },
    /* Cuántas categorías tienen ya producto publicado. */
    readyCount: function () {
      return categories.filter(function (c) { return this.productsIn(c.slug).length > 0; }, this).length;
    },
    slugify: slugify
  };
})();
