function applyTheme() {
  const mode = localStorage.getItem('themeMode') || 'original';
  const customColor = localStorage.getItem('customColor');
  const html = document.documentElement;

  // Remove all theme classes
  html.classList.remove('meatworm', 'galaxy');

  // Remove existing theme styles
  const existingThemeStyles = document.querySelectorAll('style[data-theme-style]');
  existingThemeStyles.forEach(style => style.remove());

  // Apply the selected theme
  if (mode === 'meatworm') {
    html.classList.add('meatworm');
    const st = document.createElement('style');
    st.setAttribute('data-theme-style', 'true');
    st.innerHTML = 'body{background-color:#fff!important;color:#000!important}.navbar{background:#fff!important}.navbar a{color:#000!important}a{color:#0033cc!important}';
    document.head.appendChild(st);
    applyContainerOverwrite('#fff', '#000');
    const nav = document.getElementById('nav-title');
    if (nav) nav.textContent = 'Evil Meatworm Games';
    if (!localStorage.getItem('tab')) {
      document.title = 'Evil Meatworm Games';
    }
  } else if (mode === 'custom' && customColor) {
    const c = customColor.replace('#', '');
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const st = document.createElement('style');
    st.setAttribute('data-theme-style', 'true');
    const txt = brightness > 128 ? '#000' : '#fff';
    const lnk = brightness > 128 ? '#0033cc' : '#f1a727';
    st.innerHTML = 'body{background-color:' + customColor + '!important;color:' + txt + '!important}a{color:' + lnk + '!important}';
    document.head.appendChild(st);
    applyContainerOverwrite(customColor, txt);
  } else if (mode === 'galaxy') {
    html.classList.add('galaxy');
    applyContainerOverwrite('rgba(0,0,0,0)', '#e0c3fc');
  }
  // 'original' doesn't need any special styling

  // helper for patching backgrounds on game/app/movie containers that
  // otherwise draw their own color.  We cannot theme content inside
  // cross-domain iframes, but we can at least colour the wrapper.
  function applyContainerOverwrite(bg, color) {
    const css = `
      /* common wrappers and any element with game/movie/tv in id/class */
      #gameframe, .gameDisplay, .game, iframe, canvas,
      .movie, .tv, #game-container, #movie-container, #tv-container,
      [id*="game"], [class*="game"],
      [id*="movie"], [class*="movie"],
      [id*="tv"], [class*="tv"] {
        background: ${bg} !important;
        color: ${color} !important;
      }
    `;
    const st = document.createElement('style');
    st.setAttribute('data-theme-style','true');
    st.innerHTML = css;
    document.head.appendChild(st);

    // inline override for already-present elements
    function inlineApply(el) {
      el.style.setProperty('background', bg, 'important');
      el.style.setProperty('color', color, 'important');
    }
    document.querySelectorAll('#gameframe, .gameDisplay, .game').forEach(inlineApply);

    // watch for future additions
    const observer = new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          const n = node;
          const text = (n.id || '') + ' ' + (n.className || '');
          if (/game|movie|tv/.test(text)) inlineApply(n);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Run theme on page load if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyTheme);
} else {
  applyTheme();
}

// also reapply once the whole window has loaded; some games set styles
// later or dynamically insert containers
window.addEventListener('load', applyTheme);

// some embedded games aggressively repaint or restyle the page after load
// (sometimes with inline !important), so reapply the theme periodically for a
// short duration to ensure the wrapper/ body keep the correct colours.
let reapplies = 0;
const reapplier = setInterval(() => {
  if (reapplies++ > 5) return clearInterval(reapplier);
  applyTheme();
}, 2000);
