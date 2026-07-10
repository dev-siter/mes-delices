/* =========================================================
   Mes Délices — Sélecteur de tier (Basique / Pro / Max)
   Widget autonome : à inclure sur CHAQUE page HTML avec :
     <script src="tier-switcher.js"></script>          (racine, tier Pro)
     <script src="../tier-switcher.js"></script>        (dans /max et /basique)
   Ne dépend d'aucun CSS existant : tout est scoppé avec le
   préfixe "md-ts-" et injecté en inline pour ne rien casser.
   ========================================================= */
(function () {
  "use strict";

  // ---------- 1. Détection du tier courant + chemins relatifs ----------
  var path = window.location.pathname;
  var inMax = /\/max\//.test(path) || /\/max$/.test(path);
  var inBasique = /\/basique\//.test(path) || /\/basique$/.test(path);
  var prefix = (inMax || inBasique) ? "../" : "";

  var currentTier = inMax ? "max" : (inBasique ? "basique" : "pro");

  var tiers = [
    { id: "basique", label: "Basique", href: prefix + "basique/index.html" },
    { id: "pro", label: "Pro", href: prefix + "index.html" },
    { id: "max", label: "Max", href: prefix + "max/index.html" }
  ];

  // ---------- 2. Styles (injectés, isolés par préfixe) ----------
  var css = ""
    + "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Great+Vibes&display=swap');"
    + ".md-ts-fab{position:fixed;left:18px;bottom:18px;z-index:99999;"
    + "width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;"
    + "background:#2B2224;color:#F3E1E0;display:flex;align-items:center;justify-content:center;"
    + "box-shadow:0 10px 24px -8px rgba(0,0,0,.45);"
    + "transition:transform .25s cubic-bezier(.22,1,.36,1), background .2s;"
    + "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;}"
    + ".md-ts-fab:hover{transform:translateY(-2px) scale(1.04);background:#3A2C2E;}"
    + ".md-ts-fab:active{transform:scale(.96);}"
    + ".md-ts-fab svg{width:22px;height:22px;transition:transform .3s cubic-bezier(.22,1,.36,1);}"
    + ".md-ts-fab.md-ts-open svg{transform:rotate(45deg);}"
    + ".md-ts-badge{position:absolute;top:-4px;right:-4px;background:#C6A15B;color:#2B2224;"
    + "font-size:9px;font-weight:700;border-radius:999px;padding:2px 6px;letter-spacing:.3px;"
    + "text-transform:uppercase;box-shadow:0 0 0 2px #2B2224;}"
    + ".md-ts-bubble{position:fixed;left:18px;bottom:82px;z-index:99999;"
    + "background:#FBF4EE;border-radius:16px;padding:10px;min-width:168px;"
    + "box-shadow:0 18px 40px -12px rgba(0,0,0,.35);"
    + "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;"
    + "opacity:0;transform:translateY(10px) scale(.96);pointer-events:none;"
    + "transition:opacity .2s cubic-bezier(.22,1,.36,1), transform .2s cubic-bezier(.22,1,.36,1);}"
    + ".md-ts-bubble.md-ts-visible{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}"
    + ".md-ts-eyebrow{font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;"
    + "color:#A9506A;padding:4px 10px 6px;}"
    + ".md-ts-link{display:flex;align-items:center;justify-content:space-between;gap:10px;"
    + "padding:9px 10px;border-radius:10px;text-decoration:none;color:#2B2224;"
    + "font-size:14px;font-weight:600;transition:background .15s;}"
    + ".md-ts-link:hover{background:#F3E1E0;}"
    + ".md-ts-link.md-ts-current{background:#7A2E43;color:#fff;cursor:default;}"
    + ".md-ts-link.md-ts-current:hover{background:#7A2E43;}"
    + ".md-ts-check{font-size:12px;}"
    + ".md-ts-overlay{position:fixed;inset:0;z-index:99998;background:transparent;display:none;}"
    + ".md-ts-overlay.md-ts-visible{display:block;}"
    + "@media (prefers-reduced-motion: reduce){.md-ts-fab,.md-ts-fab svg,.md-ts-bubble{transition:none!important;}}"
    + ".md-ts-link.md-ts-current:hover{background:#7A2E43;}"
    + ".md-ts-font-pro{font-family:'Playfair Display',serif;}"
    + ".md-ts-font-max{font-family:'Great Vibes',cursive;font-size:17px;}" 
    + ".md-ts-check{font-size:12px;}";

  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---------- 3. Markup ----------
  var overlay = document.createElement("div");
  overlay.className = "md-ts-overlay";

  var fab = document.createElement("button");
  fab.className = "md-ts-fab";
  fab.type = "button";
  fab.setAttribute("aria-label", "Changer de version du site");
  fab.setAttribute("aria-expanded", "false");
  fab.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>' +
    "</svg>" +
    '<span class="md-ts-badge">' + currentTier + "</span>";

  var bubble = document.createElement("div");
  bubble.className = "md-ts-bubble";
  bubble.setAttribute("role", "menu");

  var eyebrow = document.createElement("div");
  eyebrow.className = "md-ts-eyebrow";
  eyebrow.textContent = "Voir une autre version";
  bubble.appendChild(eyebrow);

  tiers.forEach(function (t) {
    var isCurrent = t.id === currentTier;
    var link = document.createElement(isCurrent ? "span" : "a");
    var fontClass = t.id === "pro" ? " md-ts-font-pro" : (t.id === "max" ? " md-ts-font-max" : "");
    link.className = "md-ts-link" + fontClass + (isCurrent ? " md-ts-current" : "");
    link.setAttribute("role", "menuitem");
    if (!isCurrent) link.href = t.href;
    link.innerHTML = "<span>" + t.label + "</span>" + (isCurrent ? '<span class="md-ts-check">✓</span>' : "");
    bubble.appendChild(link);
  });

  document.body.appendChild(overlay);
  document.body.appendChild(bubble);
  document.body.appendChild(fab);

  // ---------- 4. Comportement ----------
  var open = false;

  function setOpen(next) {
    open = next;
    fab.classList.toggle("md-ts-open", open);
    bubble.classList.toggle("md-ts-visible", open);
    overlay.classList.toggle("md-ts-visible", open);
    fab.setAttribute("aria-expanded", String(open));
  }

  fab.addEventListener("click", function () { setOpen(!open); });
  overlay.addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) setOpen(false);
  });
})();
