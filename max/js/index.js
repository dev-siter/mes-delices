/* index.js */
// Génération de particules pétales flottantes
    const container = document.getElementById('heroPetals');
    if (container) {
      for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'petal';
        p.style.cssText = `
          left: ${Math.random()*100}%;
          top: ${Math.random()*100}%;
          --dur: ${7 + Math.random()*8}s;
          --delay: ${Math.random()*6}s;
          opacity: ${0.2 + Math.random()*0.4};
          width: ${4 + Math.random()*8}px;
          height: ${4 + Math.random()*8}px;
          transform: rotate(${Math.random()*360}deg);
        `;
        container.appendChild(p);
      }
    }
