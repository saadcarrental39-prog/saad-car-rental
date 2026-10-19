/* WhatsApp click-to-chat (wa.me), templates, logging, bulk one-by-one, email via mailto: */
const WA = {
  normalize(p) { let d = String(p || '').replace(/\D/g, ''); if (d.startsWith('00')) d = d.slice(2); if (d.startsWith('0')) d = '92' + d.slice(1); return d; },
  fill(t, v) { return String(t || '').replace(/\{(\w+)\}/g, (_, k) => (v[k] ?? '')); },
  vars(p, extra) { const c = (App.settings.clinic || {}); return Object.assign({ name: p ? p.full_name || p.patient_name || '' : '', clinic: c.name, doctor: c.doctor, phone: c.phone, date: '', time: '', amount: '' }, extra || {}); },
  async send(phone, message, patientId) {
    if (!navigator.onLine) return UI.toast('You are offline — WhatsApp needs internet to send.', { type: 'err' });
    const num = WA.normalize(phone); if (!num) return UI.toast('No phone/WhatsApp number', { type: 'err' });
    API.post('whatsapp_log', { patient_id: patientId || null, phone: num, message, status: 'Opened' }).catch(() => {});
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  },
  /* share text (reports) - lets the user pick any contact */
  share(text) { if (!navigator.onLine) return UI.toast('You are offline — WhatsApp needs internet', { type: 'err' }); window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener'); },
  mail(to, subject, body) { if (!navigator.onLine) return UI.toast('You are offline — email needs internet', { type: 'err' }); location.href = `mailto:${to || ''}?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(body || '')}`; },
  /* editable compose dialog. opts: {patient, phone, key, vars, message, title} */
  compose(opts) {
    const T = App.settings.templates || {}; const keys = Object.keys(T);
    const p = opts.patient; const phone = opts.phone || (p && (p.whatsapp || p.phone || p.patient_whatsapp || p.patient_phone)) || '';
    const first = opts.key && T[opts.key] ? opts.key : 'custom';
    const initial = opts.message != null ? opts.message : WA.fill(T[first] || '', WA.vars(p, opts.vars));
    const m = UI.modal({
      title: ic('whatsappicon', 18) + ' WhatsApp — ' + ((p && (p.full_name || p.patient_name)) || phone), size: 'small',
      body: `<label class="f">Template<select id="wa-t">${keys.map(k => `<option ${k === first ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
      <label class="f">Phone<input id="wa-p" value="${esc(phone)}"></label>
      <label class="f">Message (editable)<textarea id="wa-m" rows="6">${esc(initial)}</textarea></label>`,
      buttons: [{ label: 'Email', cls: 'sec', net: 1, onClick: () => WA.mail(p && p.email, 'Message from ' + (App.settings.clinic || {}).name, $('#wa-m').value) },
        { label: ic('whatsappicon', 15) + ' Send', cls: 'ok', net: 1, onClick: () => { WA.send($('#wa-p').value, $('#wa-m').value, p && (p.id || p.patient_id)); if (opts.onSent) opts.onSent(); m.close(); }, keep: true }]
    });
    $('#wa-t').onchange = e => { $('#wa-m').value = WA.fill(T[e.target.value], WA.vars(p, opts.vars)); };
  },
  /* bulk: list [{patient,phone,message}] -> opens one by one */
  bulk(list, title) {
    let i = 0; const m = UI.modal({ title: title || 'Bulk WhatsApp — one by one', size: 'wide',
      body: `<p class="muted mb">Each click opens one chat with the message ready. Sent numbers are logged.</p><div class="tbl-wrap"><table><tbody>${list.map((x, n) => `<tr id="bk${n}"><td>${esc(x.name)}</td><td>${esc(x.phone)}</td><td class="muted">${esc(x.message).slice(0, 80)}…</td><td><button class="btn sm" data-net data-i="${n}">${ic('whatsappicon', 15)} Open</button></td></tr>`).join('')}</tbody></table></div>`,
      buttons: [{ label: 'Close', cls: 'sec' }] });
    m.el.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const x = list[b.dataset.i]; WA.send(x.phone, x.message, x.patient_id); b.textContent = '✔ Sent'; b.disabled = true; });
  }
};
