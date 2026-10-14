# Dolce Moments — Web

Vitrina digital + menú interactivo + canal de pedidos para **Dolce Moments**.
Todo el texto que ve el cliente está en **inglés**. Sin pagos dentro de la página:
el pedido se arma, se revisa y se manda por Text US / WhatsApp / Instagram.

## Estructura

```
site/
  index.html            HOME      — portada, slogan, VIEW MENU / ORDER NOW
  menu.html             MENU      — las 9 categorías, cada una separada
  category.html?c=<slug>           página propia de cada categoría
  product.html?id=<id>             ficha + personalizador
  delivery.html         DELIVERY AREA — ZIP codes
  order.html            CONTACT / ORDER

  css/site.css          sistema visual completo
  js/data.js            ⭐ EL CATÁLOGO — único archivo que se edita a mano
  js/app.js             render + personalizador con límites
  js/cart.js            carrito (order builder, sin pagos)

  assets/products/      fotos optimizadas (.webp, 2 tamaños)
  assets/qr-menu.svg    QR → https://dolcemomentsusa.com/menu

design/DESIGN.md        sistema de diseño anterior (tokens berryccino)
reference/legacy-berryccino/    prototipos previos, fuera del proyecto
reference/original-photos/      PNG originales sin optimizar
```

## Cómo se edita el contenido

Todo vive en **`site/js/data.js`**. No hay build ni servidor: se abre el HTML y ya.

- `config` → marca, slogan, dominio, canales (teléfono, WhatsApp, Instagram),
  lista de ZIP codes de entrega, texts legales
- `categories` → las 9 categorías, su nombre, foto y descripción
- `products` → cada producto con su foto, precio, **tamaños** y **grupos de opciones**
- `FRUITS` / `TOPPINGS` / `SAUCES` / `EXTRAS` → las listas de opciones

### Límites por tamaño

Los límites de selección viven en el **tamaño**, no en el producto. Así un solo
producto puede pedir cantidades distintas según el tamaño, sin duplicarlo:

```js
sizes: [
  { id: '12oz', label: '12 oz', price: 12.00,
    limits: { fruits: 2, toppings: 1, sauce: 1 } },   // exactamente 2 / 1 / 1
  { id: '16oz', label: '16 oz', price: 15.50,
    limits: { fruits: 3, toppings: 2, sauce: 1 } }    // exactamente 3 / 2 / 1
]
```

Un grupo con `optional: true` y sin `limits` (Extras) nunca bloquea el pedido.

### Quitar un grupo de un solo producto

Basta con no incluirlo en su array `groups`. Un producto sin frutas ni salsas
simplemente no tiene esos grupos.

## Cuando se conecte un panel de administración

`js/data.js` se sustituye por llamadas a la API. El resto del código no cambia:
`app.js` y `cart.js` solo leen `window.DM`.

## Stack

HTML + CSS + JavaScript sin framework. Sin build, sin `npm install`, sin servidor.
Tipografías: **Fraunces** (titulares) y **Nunito Sans** (texto), desde Google Fonts.

## Pendiente de entregar el cliente

1. **Listas reales** de frutas, toppings, salsas y extras — ahora son de ejemplo
2. **Productos reales** — el brief solo confirma Merengón 12 oz y 16 oz; el resto
   es provisional
3. **ZIP codes reales** de entrega (ahora: 11215, 11201, 11217, 10001, 10011)
4. **Teléfono y usuario de Instagram** reales (ahora `+1 555 555 0100`)
5. **Fotos propias** — las actuales son de berryccino.com y muestran torres de
   fresas con chocolate, no merengones
