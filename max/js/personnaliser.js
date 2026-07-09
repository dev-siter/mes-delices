/* ============================================
   PERSONNALISER JS
============================================ */

// ===== FILTER BUTTONS =====
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.gateau-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    cards.forEach(card => {
      if (cat === 'all' || card.dataset.cat === cat) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ===== MISE À JOUR PRIX QUAND TAILLE CHANGE =====
document.querySelectorAll('.taille-radio').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const card = e.target.closest('.gateau-card');
    const base = parseInt(card.dataset.price, 10);
    const coeffs = { petite: 2/3, moyenne: 1, grande: 4/3 };
    const coeff = coeffs[e.target.value] || 1;
    const prix = Math.round(base * coeff);

    const priceEl = card.querySelector('.gateau-price strong');
    if (priceEl) {
      priceEl.textContent = prix.toLocaleString('fr-FR') + ' FCFA';
    }

    card.dataset.currentprice = prix;
  });
});
