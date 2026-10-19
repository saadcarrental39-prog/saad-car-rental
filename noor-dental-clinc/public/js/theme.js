/* Theme engine: dark/light + user colours (CSS variables). Loaded in <head> so there is no flash. */
(function () {
  const KEY = 'noor_theme'; const root = document.documentElement;
  const DEF = { mode: 'light', primary: '#2F9BE0', accent: '#53AFF0', bg: '#FFFFFF', radius: 16, fontSize: 15 };
  const get = () => { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { return { ...DEF }; } };
  const mix = (hex, amt) => { // lighten (+) / darken (-)
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = v => Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
    return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join('');
  };
  function apply(t) {
    t = Object.assign({}, DEF, t || get());
    root.dataset.theme = t.mode;
    root.style.setProperty('--primary', t.primary); root.style.setProperty('--primary-light', mix(t.primary, 0.3)); root.style.setProperty('--accent', t.accent);
    root.style.setProperty('--radius', t.radius + 'px'); root.style.setProperty('--fs', t.fontSize + 'px');
    if (t.mode === 'dark') root.style.setProperty('--bg', t.bg); else root.style.removeProperty('--bg');
    const m = document.querySelector('meta[name=theme-color]'); if (m && !window.matchMedia('(display-mode: standalone)').matches) m.content = t.primary;
    const icon = document.getElementById('theme-toggle'); if (icon) icon.textContent = t.mode === 'dark' ? '☀️' : '🌙';
  }
  function save(patch, persist = true) {
    const t = Object.assign(get(), patch); localStorage.setItem(KEY, JSON.stringify(t)); apply(t);
    if (persist && window.API && API.token()) API.put('settings/theme', { value: t }).catch(() => {});
    return t;
  }
  window.Theme = { get, apply, save, DEF, toggle() { return save({ mode: get().mode === 'dark' ? 'light' : 'dark' }); } };
  apply();
})();
