/* ============================================
   DEMO-ENGINE.JS — Mes Délices
   Simule le backend PHP entièrement en localStorage.
   Utilisé par toutes les pages *.html
============================================ */

// ===== DONNÉES DE DEMO =====
const DEMO_PRODUITS = [
  { NoProd:1,  NomProd:'Forêt chocolat',       PrixBase:18500 },
  { NoProd:2,  NomProd:'Fraisier aux Fraises',  PrixBase:21000 },
  { NoProd:3,  NomProd:'Opéra Doré',            PrixBase:24000 },
  { NoProd:4,  NomProd:'Fondant Volcanique',     PrixBase:16500 },
  { NoProd:5,  NomProd:'Tropicana Passion',      PrixBase:22000 },
  { NoProd:6,  NomProd:'Millefeuille Bourbon',   PrixBase:19500 },
  { NoProd:7,  NomProd:'Trianon Praliné',        PrixBase:23500 },
  { NoProd:8,  NomProd:'Tarte acidulée',         PrixBase:15000 },
  { NoProd:9,  NomProd:'Moelleux Baobab',        PrixBase:20000 },
  { NoProd:10, NomProd:'Charlotte Royale',       PrixBase:26000 },
  { NoProd:11, NomProd:'Cupcake',                PrixBase:0     },
];

const DEMO_KEY_USER     = 'demo_user';
const DEMO_KEY_COMMANDES = 'demo_commandes';
const DEMO_KEY_LIGNES    = 'demo_lignes';

// ===== INIT DEMO : crée le client démo si besoin =====
function demoInit() {
  if (!localStorage.getItem(DEMO_KEY_USER)) {
    const user = {
      noClt:        1,
      nomClt:       'Dupont',
      prenomClt:    'Marie',
      telClt:       '0101010101',
      anNaiss:      1990,
      soldeCpt:     500000,
      nbProdAchete: 8,
      nbProdGratuit:0
    };
    localStorage.setItem(DEMO_KEY_USER, JSON.stringify(user));
  }
  // Marquer ms_user comme démo pour que global.js l'ignore sur les pages normales
  const u = getDemoUser();
  localStorage.setItem('ms_user', JSON.stringify({
    noClt: u.noClt, nomClt: u.nomClt, prenomClt: u.prenomClt,
    soldeCpt: u.soldeCpt, _isDemo: true
  }));
  if (!localStorage.getItem(DEMO_KEY_COMMANDES)) {
    localStorage.setItem(DEMO_KEY_COMMANDES, JSON.stringify([]));
  }
  if (!localStorage.getItem(DEMO_KEY_LIGNES)) {
    localStorage.setItem(DEMO_KEY_LIGNES, JSON.stringify([]));
  }
}

// ===== ACCESSEURS =====
function getDemoUser() {
  return JSON.parse(localStorage.getItem(DEMO_KEY_USER));
}
function saveDemoUser(u) {
  localStorage.setItem(DEMO_KEY_USER, JSON.stringify(u));
  // Écrire ms_user avec le flag _isDemo pour que global.js
  // l'ignore sur les pages normales
  localStorage.setItem('ms_user', JSON.stringify({
    noClt:     u.noClt,
    nomClt:    u.nomClt,
    prenomClt: u.prenomClt,
    soldeCpt:  u.soldeCpt,
    _isDemo:   true
  }));
}
function getDemoCommandes() {
  return JSON.parse(localStorage.getItem(DEMO_KEY_COMMANDES) || '[]');
}
function getDemoLignes() {
  return JSON.parse(localStorage.getItem(DEMO_KEY_LIGNES) || '[]');
}

// ===== RESET DEMO =====
function demoReset() {
  localStorage.removeItem(DEMO_KEY_USER);
  localStorage.removeItem(DEMO_KEY_COMMANDES);
  localStorage.removeItem(DEMO_KEY_LIGNES);
  localStorage.removeItem('ms_cart');
  localStorage.removeItem('ms_cart_total');
  localStorage.removeItem('ms_user');
  demoInit();
  return getDemoUser();
}

// ===== PASSER UNE COMMANDE (remplace commande.php?action=passer) =====
function demoPasserCommande({ panier, mt_total, lieuLivra, client }) {
  const user = getDemoUser();

  /*if (user.soldeCpt < mt_total) {
    return { success: false, message: 'Solde insuffisant. Solde actuel : ' + formatDemoPrice(user.soldeCpt) };
  }*/

  const commandes = getDemoCommandes();
  const lignes    = getDemoLignes();

  // Nouveau NoCmd
  const noCmd = commandes.length > 0 ? Math.max(...commandes.map(c => c.NoCmd)) + 1 : 1;
  const today = new Date().toISOString().slice(0, 10);

  // Créer la commande
  commandes.push({
  NoCmd: noCmd,
  DateCmd: today,
  Mt_total: mt_total,
  CmdGratuite: false,
  NomClt: client.nom,
  PrenomClt: client.prenoms,
  EmailClt: client.email,
  TelClt: client.tel,
  LieuLivra: lieuLivra
});

  // Insérer les lignes (avec protection UNIQUE NoCmd+NoProd+Taille)
  let noLigne = lignes.length > 0 ? Math.max(...lignes.map(l => l.NoLigne)) + 1 : 1;
  for (const item of panier) {
    const doublon = lignes.find(l =>
      l.NoCmd === noCmd && l.NoProd === item.NoProd && l.Taille === item.Taille
    );
    if (doublon) {
      doublon.Qte += item.Qte;
    } else {
      lignes.push({ NoLigne: noLigne++, NoCmd: noCmd, NoProd: item.NoProd, Qte: item.Qte, Taille: item.Taille });
    }
  }

  /*Débiter le solde
  user.soldeCpt -= mt_total;*/

  // Fidélité
  const totalQte = panier.reduce((s, i) => s + i.Qte, 0);
  const nouveauNbAchete = user.nbProdAchete + totalQte;
  const quotient = Math.floor(nouveauNbAchete / 10);
  const nouveauxGratuits = quotient - user.nbProdGratuit;

  user.nbProdAchete  = nouveauNbAchete;
  user.nbProdGratuit += nouveauxGratuits;

  // Cupcake gratuit
  if (nouveauxGratuits > 0) {
    const doublon = lignes.find(l =>
      l.NoCmd === noCmd && l.NoProd === 11 && l.Taille === 'moyenne'
    );
    if (doublon) {
      doublon.Qte += nouveauxGratuits;
    } else {
      lignes.push({ NoLigne: noLigne++, NoCmd: noCmd, NoProd: 11, Qte: nouveauxGratuits, Taille: 'moyenne' });
    }
  }

  // Sauvegarder
  localStorage.setItem(DEMO_KEY_COMMANDES, JSON.stringify(commandes));
  localStorage.setItem(DEMO_KEY_LIGNES,    JSON.stringify(lignes));
  saveDemoUser(user);

  return {
    success:         true,
    noCmd:           noCmd,
    gateauxGratuits: nouveauxGratuits,
    message:         nouveauxGratuits > 0
      ? `Commande confirmée ! ${nouveauxGratuits} cupcake(s) gratuit(s) ajouté(s) !`
      : 'Commande confirmée !',
    lieuLivra:       lieuLivra
  };
}

// ===== HISTORIQUE (remplace commande.php?action=historique) =====
function demoHistorique() {
  const commandes = getDemoCommandes();
  const lignes    = getDemoLignes();
  const user      = getDemoUser();

  const result = commandes
    .filter(c => c.NoClt === user.noClt)
    .sort((a, b) => b.NoCmd - a.NoCmd)
    .map(cmd => ({
      NoCmd:       cmd.NoCmd,
      DateCmd:     cmd.DateCmd,
      Mt_total:    cmd.Mt_total,
      CmdGratuite: cmd.CmdGratuite,
      LieuLivra:   cmd.LieuLivra,
      produits:    lignes
        .filter(l => l.NoCmd === cmd.NoCmd)
        .map(l => {
          const prod = DEMO_PRODUITS.find(p => p.NoProd === l.NoProd);
          return {
            NoProd:   l.NoProd,
            NomProd:  prod ? prod.NomProd : '—',
            Qte:      l.Qte,
            Taille:   l.Taille,
            PrixBase: prod ? prod.PrixBase : 0
          };
        })
    }));

  return { success: true, commandes: result };
}

// ===== APPROVISIONNER (remplace client.php?action=approvisionner) =====
function demoApprovisionner(montant) {
  const user = getDemoUser();
  user.soldeCpt += parseFloat(montant);
  saveDemoUser(user);
  return { success: true, nouveauSolde: user.soldeCpt };
}

// ===== UTILITAIRE =====
function formatDemoPrice(n) {
  return parseFloat(n || 0).toLocaleString('fr-FR') + ' FCFA';
}

// ===== NAVBAR DÉMO : corrige le bouton auth après global.js =====
// global.js lit ms_user pour afficher le nom dans .auth-btn.
// Sur les pages démo, ms_user appartient au vrai client PHP (ou est vide).
// On reécrit le bouton avec le nom du client démo après le chargement.
function demoFixNavbar() {
  const u = getDemoUser();
  document.querySelectorAll('.auth-btn').forEach(btn => {
    btn.textContent = '👤 ' + u.prenomClt;
    btn.href = 'compte.html';
  });
}

// Bandeau démo désactivé (version production)
function injectDemoBadge() {
  // No-op: bandeau supprimé pour la version client
  setTimeout(demoFixNavbar, 0);
}

function updateDemoCounter() {
  // No-op: compteur démo supprimé pour la version client
}

function demoResetAndReload() {
  demoReset();
  location.reload();
}

// Auto-init
demoInit();
