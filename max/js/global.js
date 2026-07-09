/* ============================================
   GLOBAL JS — Mes Délices
============================================ */

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});
/*document.addEventListener('DOMcontentloaded',()=>{
  let logo = document.querySelector("logo-icon");
  logo.innerHTML='<svg style="width:38px;height:38px;" viewBox="0 0 38 38" fill="none"><circle cx="19" cy="19" r="18" fill="#FFF0F3" stroke="#D4547A" stroke-width="1.5"/><path d="M10 24 Q19 12 28 24" stroke="#D4547A" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="19" cy="25" rx="9" ry="4" fill="#D4547A" opacity="0.25"/><circle cx="14" cy="21" r="1.5" fill="#D4547A"/><circle cx="19" cy="18" r="1.5" fill="#9B2F52"/><circle cx="24" cy="21" r="1.5" fill="#D4547A"/></svg>';})*/

// ===== BURGER MENU =====
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    burger.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
  }); 
}

// ===== CART =====
function getCart() {
  return JSON.parse(localStorage.getItem('ms_cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('ms_cart', JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + (i.qty || 1), 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = total);
}

// ===== TAILLE → COEFFICIENT DE PRIX =====
const TAILLE_COEFF = { petite: 2/3, moyenne: 1, grande: 4/3 };
const TAILLE_LABELS = { petite: 'Petite (−1/3)', moyenne: 'Moyenne (prix de base)', grande: 'Grande (+1/3)' };

// ===== ADD TO CART (called from personnaliser.html) =====
function addToCart(id, name, price, btn) {
  const card = btn.closest('.gateau-card');

  // Récupérer la taille sélectionnée (radio buttons)
  const tailleRadio = card.querySelector('.taille-radio:checked');
  const taille = tailleRadio ? tailleRadio.value : 'moyenne';
  const coeff = TAILLE_COEFF[taille] || 1;
  const prixFinal = Math.round(price * coeff);

  const ingredients = []; // ingredients fixes, pas de selection

  const cart = getCart();
  // Clé unique = id + taille (on peut avoir le même gâteau en deux tailles)
  const cartKey = `${id}_${taille}`;
  const existing = cart.find(i => i.cartKey === cartKey);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
    existing.ingredients = ingredients;
  } else {
    cart.push({ id, cartKey, name, price: prixFinal, prixBase: price, taille, qty: 1, ingredients });
  }
  saveCart(cart);

  // Mettre a jour ms_cart_total immediatement apres chaque ajout
  // pour que commande.html l'ait meme si on n'est pas passe par panier.html
  const cartMaj = getCart();
  const subtotal = cartMaj.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  localStorage.setItem('ms_cart_total', subtotal);

  showToast(`🎂 ${name} (${taille}) ajouté au panier !`);

  // Button feedback
  const orig = btn.textContent;
  btn.textContent = '✓ Ajouté !';
  btn.style.background = '#28a745';
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
  }, 1800);
}

// ===== TOAST =====
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ===== INIT =====
updateCartCount();
initUserSession();

// ===== SESSION UTILISATEUR =====
function initUserSession() {
  const raw = localStorage.getItem('ms_user');
  const authBtns = document.querySelectorAll('.auth-btn');
  if (!authBtns.length) return;

  if (raw) {
    try {
      const user = JSON.parse(raw);
      // Ignorer le client démo sur les pages normales
      if (user._isDemo) {
        authBtns.forEach(btn => {
          btn.textContent = 'Connexion';
          btn.href = 'auth.html';
        });
        return;
      }
      const name = user.prenomClt || user.prenom || user.name || 'Mon compte';
      authBtns.forEach(btn => {
        btn.textContent = '👤 ' + name;
        btn.href = 'auth.html';
      });
    } catch(e) {}
  } else {
    authBtns.forEach(btn => {
      btn.textContent = 'Connexion';
      btn.href = 'auth.html';
    });
  }
}

// ===== DECONNEXION =====
function logout() {
  localStorage.removeItem('ms_user');
  localStorage.removeItem('ms_cart');
  window.location.href = 'auth.html';
}

// ===== ANIMATE ON SCROLL =====
const animEls = document.querySelectorAll('.cake-card, .feature-item, .review-mini, .chef-card, .review-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

animEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
