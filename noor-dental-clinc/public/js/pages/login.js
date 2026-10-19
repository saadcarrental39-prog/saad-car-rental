/* Login: live clock, time-based greeting, fireworks, welcome */
(function () {
  const $ = s => document.querySelector(s);
  function greeting(d) {
    const h = d.getHours() + d.getMinutes() / 60;
    if (h >= 8 && h < 11) return 'Good Morning ☀️ — Clinic Open';
    if (h >= 11 && h < 14) return 'Good Afternoon 🌤️ — Clinic Open';
    if (h >= 14 && h < 18) return 'Good Evening 🌆 — Clinic Open';
    return 'Clinic Closed 🌙 — See you tomorrow';
  }
  function tick() {
    const d = new Date();
    $('#clock').textContent = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    $('#dateEn').textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    $('#greet').textContent = greeting(d);
  }
  tick(); setInterval(tick, 1000);
  const v = $('#bgvideo'); v.addEventListener('error', () => { v.style.display = 'none'; }, true); const src = v.querySelector('source'); src.addEventListener('error', () => { v.style.display = 'none'; });
  v.play && v.play().catch(() => {});

  /* if a valid session already exists, go straight in */
  if (API.token()) API.get('auth/me').then(() => { location.replace('/dashboard.html'); }).catch(() => {});

  function fireworks(ms) {
    const c = $('#fireworks'); const x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight; const P = []; const t0 = performance.now();
    const colors = ['#3B82F6', '#06B6D4', '#F59E0B', '#FFFFFF', '#10B981', '#EC4899'];
    function burst() { const cx = Math.random() * c.width * .8 + c.width * .1, cy = Math.random() * c.height * .5 + c.height * .1, col = colors[Math.random() * colors.length | 0];
      for (let i = 0; i < 70; i++) { const a = Math.random() * Math.PI * 2, s = Math.random() * 5 + 1.5; P.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, col, r: Math.random() * 2 + 1 }); } }
    let last = 0;
    (function frame(t) {
      const el = t - t0; x.globalCompositeOperation = 'source-over'; x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, 0, c.width, c.height); x.globalCompositeOperation = 'lighter';
      if (el < ms - 500 && t - last > 260) { burst(); last = t; }
      P.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .05; p.vx *= .985; p.life -= .014; x.globalAlpha = Math.max(p.life, 0); x.fillStyle = p.col; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); });
      x.globalAlpha = 1; for (let i = P.length - 1; i >= 0; i--) if (P[i].life <= 0) P.splice(i, 1);
      if (el < ms) requestAnimationFrame(frame); else x.clearRect(0, 0, c.width, c.height);
    })(t0);
  }
  $('#lf').addEventListener('submit', async e => {
    e.preventDefault(); $('#err').textContent = '';
    try {
      const r = await API.req('POST', 'auth/login', { username: $('#u').value.trim(), password: $('#p').value, remember: $('#rem').checked });
      API.setSession(r.token, r.user);
      if (r.default_password) localStorage.setItem('noor_default_pw', '1'); else localStorage.removeItem('noor_default_pw');
      try { const s = await API.get('settings'); localStorage.setItem('noor_settings', JSON.stringify(s)); if (s.theme) localStorage.setItem('noor_theme', JSON.stringify(s.theme)); } catch {}
      const d = new Date(); const doc = (r.user.full_name || 'Doctor');
      $('#wt').textContent = 'Welcome ' + doc; $('#wg').textContent = greeting(d); $('#card').style.display = 'none'; $('#welcome').classList.add('show');
      fireworks(2000); setTimeout(() => { location.href = '/dashboard.html'; }, 2200);
    } catch (er) { $('#err').textContent = er.message; }
  });
})();
