/* ============================================
   PANIER.JS — Rendu des articles du panier
============================================ */

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});

function renderCart() {
  const cart = getCart();
  const listEl   = document.getElementById('cartItemsList');
  const emptyEl  = document.getElementById('cartEmpty');
  const subtotalEl = document.getElementById('subtotal');
  const totalEl    = document.getElementById('total');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (!listEl) return;

  if (cart.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    if (subtotalEl) subtotalEl.textContent = '0 FCFA';
    if (totalEl)    totalEl.textContent    = '0 FCFA';
    if (checkoutBtn) { checkoutBtn.disabled = true; checkoutBtn.style.opacity = '0.5'; }
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.style.opacity = '1'; }

  listEl.innerHTML = cart.map(item => {
    const subtotal = (item.price || 0) * (item.qty || 1);
    const tailleLabel = { petite: 'Petite', moyenne: 'Moyenne', grande: 'Grande' }[item.taille] || item.taille || '';
    return `
      <div class="panier-item" data-key="${item.cartKey}">
        <div class="panier-item-img-wrap">
          <span class="panier-item-emoji">🎂</span>
        </div>
        <div class="panier-item-info">
          <div class="panier-item-name">${item.name}</div>
          <div class="panier-item-sub">Taille : ${tailleLabel} &nbsp;|&nbsp; Prix unitaire : ${fmt(item.price)}</div>
        </div>
        <div class="panier-item-controls">
          <div class="panier-qty">
            <button class="qty-btn" onclick="changeQty('${item.cartKey}', -1)" aria-label="Diminuer">−</button>
            <span class="qty-val">${item.qty || 1}</span>
            <button class="qty-btn" onclick="changeQty('${item.cartKey}', +1)" aria-label="Augmenter">+</button>
          </div>
          <div class="panier-item-price">${fmt(subtotal)}</div>
          <button class="btn-remove-item" onclick="removeItem('${item.cartKey}')" title="Retirer">✕</button>
        </div>
      </div>`;
  }).join('');

  const total = cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
  if (subtotalEl) subtotalEl.textContent = fmt(total);
  if (totalEl)    totalEl.textContent    = fmt(total);
  localStorage.setItem('ms_cart_total', total);
}

function fmt(n) {
  return parseFloat(n || 0).toLocaleString('fr-FR') + ' FCFA';
}

function changeQty(cartKey, delta) {
  const cart = getCart();
  const item = cart.find(i => i.cartKey === cartKey);
  if (!item) return;
  item.qty = (item.qty || 1) + delta;
  if (item.qty <= 0) {
    removeItem(cartKey);
    return;
  }
  saveCart(cart);
  renderCart();
}

function removeItem(cartKey) {
  const cart = getCart().filter(i => i.cartKey !== cartKey);
  saveCart(cart);
  renderCart();
  showToast('Article retiré du panier.');
}
/* panier.js */
function allerCommander() {
      const cart = getCart();
      if (cart.length === 0) return;
      const subtotal = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);
      localStorage.setItem('ms_cart_total', subtotal);
      window.location.href = 'commande.html';
    }

// injectDemoBadge retiré
