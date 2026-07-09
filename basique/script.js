// ---------- Données produits (démo) ----------
const PRODUCTS = [
  { id: 1, name: "Forêt Chocolat", desc: "Génoise chocolat intense, copeaux et cœur gourmand", price: 9000, img: "images/1 Foret chocolat.jpg" },
  { id: 2, name: "Fraisier aux Fraises", desc: "Crème légère et fraises fraîches sur biscuit moelleux", price: 8500, img: "images/2 Fraisier aux Fraises.jpg" },
  { id: 3, name: "Trianon Praliné", desc: "Craquant praliné, mousse chocolat et biscuit noisette", price: 9500,
  img: "images/TrianonPraline.jpg" },
  { id: 4, name: "Tarte Acidulée", desc: "Pâte sablée et garniture aux fruits acidulés de saison", price: 5500, img: "images/8 Tarte acidulee.jpg" },
  { id: 5, name: "Moelleux Baobab", desc: "Gâteau moelleux à la saveur unique du fruit de baobab", price: 4000, img: "images/9 Moelleux Baobab.jpg" },
  { id: 6, name: "Charlotte Royale", desc: "Biscuits cuillère, mousse onctueuse et finition dorée", price: 12000, img: "images/10 Charlotte Royale.jpg" },
];

let cart = []; // [{id, qty}]

// ---------- Utilitaires ----------
function formatPrice(n) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}
function getProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}
function showToast(msg) {
  const toast = document.getElementById('orderToast');
  toast.textContent = msg;
  toast.style.display = 'block';
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// ---------- Rendu produits ----------
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="product-card">
      <img class="product-image" src="${p.img}" alt="${p.name}" loading="lazy"/>
      <div class="product-name">${p.name}</div>
      <div class="product-desc">${p.desc}</div>
      <div class="product-price">${formatPrice(p.price)}</div>
      <div class="product-actions">
        <div class="qty-control">
          <button type="button" onclick="changeQty(${p.id}, -1)">-</button>
          <input type="text" id="qty-${p.id}" value="1" readonly/>
          <button type="button" onclick="changeQty(${p.id}, 1)">+</button>
        </div>
        <button class="add-btn" onclick="addToCart(${p.id})">Ajouter</button>
      </div>
    </div>
  `).join('');
}

function changeQty(id, delta) {
  const input = document.getElementById('qty-' + id);
  let val = parseInt(input.value, 10) + delta;
  if (val < 1) val = 1;
  if (val > 20) val = 20;
  input.value = val;
}

function addToCart(id) {
  const qtyInput = document.getElementById('qty-' + id);
  const qty = parseInt(qtyInput.value, 10) || 1;
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, qty });
  }
  qtyInput.value = 1;
  renderCart();
  updateCartCount();
  showToast(getProduct(id).name + ' ajouté au panier.');
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  renderCart();
  updateCartCount();
}

// ---------- Rendu panier ----------
function renderCart() {
  const list = document.getElementById('cartList');
  const empty = document.getElementById('cartEmpty');
  const totalRow = document.getElementById('cartTotalRow');
  const validateBtn = document.getElementById('validateCartBtn');

  if (cart.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    totalRow.style.display = 'none';
    validateBtn.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  totalRow.style.display = 'flex';
  validateBtn.style.display = 'block';

  let total = 0;
  list.innerHTML = cart.map(item => {
    const p = getProduct(item.id);
    const sub = p.price * item.qty;
    total += sub;
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name} × ${item.qty}</div>
          <div class="cart-item-sub">${formatPrice(sub)}</div>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})" aria-label="Retirer">✕</button>
      </div>
    `;
  }).join('');

  document.getElementById('cartTotal').textContent = formatPrice(total);
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = count;
}

// ---------- Navigation (scroll auto) ----------
document.getElementById('cartBtn').addEventListener('click', () => {
  document.getElementById('panier').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('validateCartBtn').addEventListener('click', () => {
  const commandeSection = document.getElementById('commande');
  commandeSection.style.display = 'block';
  commandeSection.scrollIntoView({ behavior: 'smooth' });
});

// ---------- Validation formulaire commande ----------
function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isTelValid(tel) {
  return /^(01|05|07)\d{8}$/.test(tel);
}

document.getElementById('orderForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nom = document.getElementById('cmdNom').value.trim();
  const prenoms = document.getElementById('cmdPrenoms').value.trim();
  const email = document.getElementById('cmdEmail').value.trim();
  const tel = document.getElementById('cmdTel').value.trim();
  const adresse = document.getElementById('cmdAdresse').value.trim();

  if (!nom || !prenoms || !email || !tel || !adresse) {
    showToast('Veuillez remplir toutes vos informations.');
    return;
  }
  if (!isEmailValid(email)) {
    showToast('Adresse email invalide.');
    return;
  }
  if (!isTelValid(tel)) {
    showToast('Numéro invalide. Il doit commencer par 01, 05 ou 07 et faire 10 chiffres.');
    return;
  }
  if (cart.length === 0) {
    showToast('Votre panier est vide.');
    return;
  }

  // Démo : pas de backend, on simule la confirmation
  document.getElementById('confirmClient').textContent = prenoms + ' ' + nom;
  document.getElementById('confirmTel').textContent = tel;

  document.getElementById('orderForm').style.display = 'none';
  document.getElementById('orderConfirm').style.display = 'block';

  // Le panier se vide après validation
  cart = [];
  renderCart();
  updateCartCount();
});

// ---------- Init ----------
renderProducts();
renderCart();
updateCartCount();
