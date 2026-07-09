/* commande.js */
function fp(n){return parseFloat(n||0).toLocaleString('fr-FR')+' FCFA';}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isTelValid(tel) {
  return /^(01|05|07)\d{8}$/.test(tel);
}

    document.addEventListener('DOMContentLoaded', () => {
      // Date min = demain
      const dateEl = document.getElementById('cmdDate');
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
      dateEl.min = tomorrow.toISOString().slice(0,10);
      dateEl.value = tomorrow.toISOString().slice(0,10);

      // Infos client (bannière supprimée)
     

      // Montant : toujours recalculé depuis ms_cart (ne pas dépendre de ms_cart_total)
      const cart = JSON.parse(localStorage.getItem('ms_cart') || '[]');
      const montantEl = document.getElementById('montantTotalAffiche');
      const hintEl    = document.getElementById('montantTotalHint');
      const submitBtn = document.getElementById('submitBtn');

      if (cart.length > 0) {
        const subtotal = cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
        const total    = subtotal;
        localStorage.setItem('ms_cart_total', total);
        montantEl.textContent = fp(total);
        hintEl.textContent    = cart.length + ' article(s) depuis votre panier.';
        submitBtn.disabled    = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor  = 'pointer';
      } else {
        montantEl.textContent = '—';
        hintEl.innerHTML = 'Aucun article. <a href="personnaliser.html" style="color:var(--caramel);">Personnalisez d\'abord →</a>';
      }
    });

    function passerCommande() {
      const nom      = document.getElementById('cmdNom').value.trim();
      const prenoms  = document.getElementById('cmdPrenoms').value.trim();
      const email    = document.getElementById('cmdEmail').value.trim();
      const tel      = document.getElementById('cmdTel').value.trim();
      const lieuLivra = document.getElementById('msgArea').value.trim();
      const dateCmd   = document.getElementById('cmdDate').value;

      if (!nom || !prenoms || !email || !tel) { showToast('Veuillez remplir toutes vos informations.'); return; }
      
      if (!isEmailValid(email)) { showToast('Adresse email invalide.'); return; }
      
      if (!isTelValid(tel)) { showToast('Numéro invalide. Il doit commencer par 01, 05 ou 07 et faire 10 chiffres.'); return; }
      
      if (!lieuLivra) { showToast('Veuillez entrer une adresse de livraison.'); return; }

      const cart = JSON.parse(localStorage.getItem('ms_cart') || '[]');
      if (!cart.length) { showToast('Votre panier est vide.'); return; }

      // Recalcul du total depuis le panier (source de vérité)
      const subtotal = cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
      const total    = subtotal;

      const panier = cart.map(item => ({
        NoProd: item.id,
        Qte:    item.qty || 1,
        Taille: item.taille || 'moyenne'
      }));

      const btn = document.getElementById('submitBtn');
      btn.textContent = 'Traitement...';
      btn.disabled = true;

      const result = demoPasserCommande({ panier, mt_total: total, lieuLivra, client: { nom, prenoms, email, tel } });

      if (!result.success) {
        showToast('❌ ' + result.message);
        btn.textContent = 'Envoyer ma commande ✉️';
        btn.disabled = false;
        return;
      }

      // Vider le panier
      localStorage.removeItem('ms_cart');
      localStorage.removeItem('ms_cart_total');
      updateCartCount();

      // Résumé des articles pour la confirmation
      const articlesLabel = cart.map(i => i.name + ' ×' + (i.qty||1)).join(', ');

      // Afficher la confirmation
      
      document.getElementById('confirmNo').textContent      = '#' + result.noCmd;
      document.getElementById('confirmClient').textContent  = prenoms + ' ' + nom;
      document.getElementById('confirmEmail').textContent   = email;
      document.getElementById('confirmTel').textContent     = tel;
      document.getElementById('confirmGateau').textContent  = articlesLabel;
      document.getElementById('confirmPrix').textContent    = fp(total);
      document.getElementById('confirmDate').textContent    = dateCmd;
      document.getElementById('confirmLieu').textContent    = lieuLivra;

      if (result.gateauxGratuits > 0) {
        document.getElementById('confirmGratuitsNb').textContent = result.gateauxGratuits;
        document.getElementById('confirmGratuitsSection').style.display = 'block';
      }

      document.getElementById('orderSection').style.display = 'none';
      document.getElementById('confirmationSection').style.display = 'block';
      document.getElementById('confirmationSection').scrollIntoView({ behavior: 'smooth' });
      // Mettre à jour le badge démo (solde, compteur gâteaux)
      updateDemoCounter();

    }
