import { receiptRows } from "./booking";
import { SITE } from "./config";
// Draws the premium receipt as a PNG (so it can be shared as a picture, nothing to download).
export async function receiptBlob(data, v) {
  try { await document.fonts.ready; } catch { /* ignore */ }
  const W = 900, M = 32, IN = 64, VW = W - 2 * IN, F = "Manrope, system-ui, sans-serif", GOLD = "#E9B949";
  const sc = document.createElement("canvas").getContext("2d");
  const wrap = (ctx, t, w, font) => { ctx.font = font; const out = []; let l = ""; for (const wd of String(t).split(/\s+/)) { const tt = l ? `${l} ${wd}` : wd; if (ctx.measureText(tt).width > w && l) { out.push(l); l = wd; } else l = tt; } out.push(l); return out; };
  const rows = receiptRows(data).map(([k, val]) => [k, wrap(sc, val, VW, `700 26px ${F}`)]);
  const rowsH = rows.reduce((a, [, ls]) => a + 30 + ls.length * 34 + 24, 0);
  const HEAD = 230, CAR = 380, PERF = 50, FOOT = 270, H = M * 2 + HEAD + CAR + PERF + rowsH + 120 + FOOT;
  const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
  const rr = (X, Y, w, h, r) => { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); };
  x.fillStyle = "#e9e4d8"; x.fillRect(0, 0, W, H);
  x.save(); rr(M, M, W - 2 * M, H - 2 * M, 30); x.fillStyle = "#fff"; x.fill(); x.clip();
  // dark header
  x.fillStyle = "#121214"; x.fillRect(M, M, W - 2 * M, HEAD);
  x.fillStyle = GOLD; x.fillRect(M, M + HEAD - 5, W - 2 * M, 5);
  x.textAlign = "center"; x.fillStyle = GOLD; x.font = `800 30px ${F}`; x.fillText(SITE.name, W / 2, M + 72);
  x.fillStyle = "#b9b9c0"; x.font = `600 22px ${F}`; x.fillText("BOOKING RECEIPT", W / 2, M + 112);
  x.fillStyle = "#fff"; x.font = `800 54px ${F}`; x.fillText(data.r, W / 2, M + 176);
  // vehicle
  let y = M + HEAD; const g = x.createLinearGradient(0, y, 0, y + CAR); g.addColorStop(0, "#f6f5f1"); g.addColorStop(1, "#ecebe6"); x.fillStyle = g; x.fillRect(M, y, W - 2 * M, CAR);
  const img = await new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = v.image; });
  if (img) { const s = Math.min(VW / img.width, 250 / img.height); x.shadowColor = "rgba(0,0,0,.25)"; x.shadowBlur = 30; x.shadowOffsetY = 18; x.drawImage(img, (W - img.width * s) / 2, y + 28 + (250 - img.height * s) / 2, img.width * s, img.height * s); x.shadowColor = "transparent"; }
  x.fillStyle = "#16181b"; x.font = `800 36px ${F}`; x.fillText(`${v.name} ${v.trim}`.trim(), W / 2, y + 312); x.fillStyle = "#62666c"; x.font = `600 22px ${F}`; x.fillText(`${v.color}  ·  With professional driver`, W / 2, y + 350);
  // perforation
  y += CAR; x.setLineDash([10, 10]); x.strokeStyle = "#cfcac0"; x.lineWidth = 2; x.beginPath(); x.moveTo(M + 34, y + PERF / 2); x.lineTo(W - M - 34, y + PERF / 2); x.stroke(); x.setLineDash([]);
  x.fillStyle = "#e9e4d8"; [M, W - M].forEach((cx) => { x.beginPath(); x.arc(cx, y + PERF / 2, 22, 0, 7); x.fill(); });
  // details
  y += PERF + 10; x.textAlign = "left";
  rows.forEach(([k, ls]) => { x.fillStyle = "#8a8d93"; x.font = `700 20px ${F}`; x.fillText(k.toUpperCase(), IN, y + 22); y += 30; x.fillStyle = "#16181b"; x.font = `700 26px ${F}`; ls.forEach((l) => { y += 34; x.fillText(l, IN, y); }); y += 24; });
  // status + footer
  y += 6; rr(IN, y, VW, 84, 18); x.fillStyle = "#fff6d6"; x.fill(); x.textAlign = "center"; x.fillStyle = "#6b5200"; x.font = `800 24px ${F}`; x.fillText("REQUEST RECEIVED", W / 2, y + 36); x.font = `600 20px ${F}`; x.fillText("We will confirm your booking on WhatsApp", W / 2, y + 66);
  y += 84 + 56; x.fillStyle = "#16181b"; x.font = `800 24px ${F}`; x.fillText(SITE.name, W / 2, y); x.fillStyle = "#62666c"; x.font = `600 20px ${F}`;
  SITE.address.slice(0, 4).forEach((l, i) => x.fillText(l.replace(/,$/, ""), W / 2, y + 34 + i * 28)); x.fillText(SITE.phoneDisplay, W / 2, y + 34 + 4 * 28 + 6);
  x.fillStyle = "#9a9da3"; x.font = `600 18px ${F}`; x.fillText(`Issued ${new Date(data.i).toLocaleString()}`, W / 2, H - M - 22);
  x.restore();
  return new Promise((ok) => c.toBlob(ok, "image/png"));
}
// Phones: opens the share sheet with the receipt picture (choose WhatsApp). Computers: copies the picture so you can paste it in the chat.
export async function shareReceipt(data, v) {
  const blob = await receiptBlob(data, v), file = new File([blob], `receipt-${data.r}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], text: `Booking receipt ${data.r}` }); return "shared"; } catch (e) { if (e.name === "AbortError") return "cancel"; } }
  try { if (navigator.clipboard?.write && window.ClipboardItem) { await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]); return "copied"; } } catch { /* fall through */ }
  window.open(URL.createObjectURL(blob), "_blank"); return "opened";
}
