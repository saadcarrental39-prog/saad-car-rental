import { SITE, waHref } from "./config";
import { clean } from "./booking";

const W = 900;
const INK = "#16181b";
const SUB = "#62666c";
const LINE = "#d9dbde";
const FONT = "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif";

const loadImg = (src) =>
  new Promise((res) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = src;
  });

const rr = (c, x, y, w, h, r) => {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};

const wrap = (c, text, maxW) => {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (c.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : ["-"];
};

const fmtDate = (s) => {
  if (!s) return "-";
  const d = new Date(`${s}T00:00:00`);
  return isNaN(d) ? s : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const refNo = () => {
  const n = new Date();
  const p = (x) => String(x).padStart(2, "0");
  return `SCR-${String(n.getFullYear()).slice(2)}${p(n.getMonth() + 1)}${p(n.getDate())}-${p(n.getHours())}${p(n.getMinutes())}`;
};

export async function makeReceipt(d, v, ref = refNo()) {
  try { await document.fonts?.load(`700 20px Manrope`); await document.fonts?.load(`500 20px Manrope`); } catch { /* fallback font */ }
  const g = (k) => clean(d[k]) || "-";
  const img = await loadImg(v.image);

  const rows = [
    ["CUSTOMER", [["Name", g("name")], ["Phone", g("phone")], ...(clean(d.email) ? [["Email", g("email")]] : [])]],
    ["JOURNEY", [
      ["Pickup", g("pickup")], ["Drop-off", g("drop")],
      ["Date", fmtDate(d.date)], ["Pickup Time", g("time")],
      ...(clean(d.rdate) ? [["Return", `${fmtDate(d.rdate)}${clean(d.rtime) ? " · " + clean(d.rtime) : ""}`]] : []),
      ...(clean(d.trip) ? [["Trip Type", g("trip")]] : []),
      ["Passengers", g("pax")],
    ]],
    ["VEHICLE", [["Model", `${v.name} ${v.trim || ""}`.trim()], ["Colour", v.color || "-"], ["Service", "With Professional Driver"]]],
    ...(clean(d.extra) ? [["NOTES", [["Requirements", g("extra")]]]] : []),
  ];

  // measure height
  const m = document.createElement("canvas").getContext("2d");
  m.font = `600 24px ${FONT}`;
  const valX = 270, valW = W - 70 - valX;
  let bodyH = 0;
  for (const [, items] of rows) {
    bodyH += 64;
    for (const [, val] of items) bodyH += wrap(m, val, valW).length * 34 + 12;
    bodyH += 14;
  }
  const imgH = img ? 330 : 0;
  const H = 210 + imgH + bodyH + 190;

  const S = 2; // retina sharpness
  const cv = document.createElement("canvas");
  cv.width = W * S; cv.height = H * S;
  const c = cv.getContext("2d");
  c.scale(S, S);
  c.textBaseline = "alphabetic";

  c.fillStyle = "#fff"; c.fillRect(0, 0, W, H);

  // header
  c.fillStyle = INK; c.fillRect(0, 0, W, 170);
  c.fillStyle = "#fff"; c.font = `800 34px ${FONT}`; c.textAlign = "left";
  c.fillText(SITE.name, 40, 70);
  c.font = `500 20px ${FONT}`; c.fillStyle = "#c9ccd1";
  c.fillText(SITE.tagline, 40, 104);
  c.font = `700 17px ${FONT}`; c.fillStyle = "#fff";
  c.fillText("BOOKING RECEIPT", 40, 144);
  c.textAlign = "right"; c.font = `600 17px ${FONT}`; c.fillStyle = "#c9ccd1";
  c.fillText(`Ref: ${ref}`, W - 40, 144);
  c.textAlign = "left";

  let y = 200;
  // vehicle image
  if (img) {
    c.fillStyle = "#f4f4f2"; rr(c, 40, y, W - 80, 290, 22); c.fill();
    const iw = W - 80 - 60, ih = 290 - 40;
    const k = Math.min(iw / img.width, ih / img.height);
    const w = img.width * k, h = img.height * k;
    c.drawImage(img, (W - w) / 2, y + (290 - h) / 2, w, h);
    y += 330;
  }

  // vehicle title + badge
  c.fillStyle = INK; c.font = `800 32px ${FONT}`;
  c.fillText(`${v.name} ${v.trim || ""}`.trim(), 40, y + 10);
  y += 30;
  const bt = "WITH PROFESSIONAL DRIVER";
  c.font = `700 15px ${FONT}`;
  const bw = c.measureText(bt).width + 36;
  c.fillStyle = INK; rr(c, 40, y, bw, 34, 17); c.fill();
  c.fillStyle = "#fff"; c.fillText(bt, 58, y + 23);
  y += 34;

  // sections
  for (const [title, items] of rows) {
    y += 40;
    c.fillStyle = SUB; c.font = `700 15px ${FONT}`;
    c.fillText(title.split("").join("\u200A"), 40, y);
    y += 12;
    c.strokeStyle = LINE; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(40, y); c.lineTo(W - 40, y); c.stroke();
    y += 16;
    for (const [label, val] of items) {
      c.font = `600 24px ${FONT}`;
      const ls = wrap(c, val, valW);
      c.fillStyle = SUB; c.font = `500 22px ${FONT}`;
      c.fillText(label, 40, y + 26);
      c.fillStyle = INK; c.font = `600 24px ${FONT}`;
      ls.forEach((t, i) => c.fillText(t, valX, y + 26 + i * 34));
      y += ls.length * 34 + 12;
    }
    y += 14;
  }

  // footer
  y += 20;
  c.strokeStyle = LINE; c.setLineDash([8, 8]);
  c.beginPath(); c.moveTo(40, y); c.lineTo(W - 40, y); c.stroke(); c.setLineDash([]);
  y += 46;
  c.textAlign = "center";
  c.fillStyle = INK; c.font = `700 22px ${FONT}`;
  c.fillText("Thank you for choosing us", W / 2, y);
  y += 34;
  c.fillStyle = SUB; c.font = `500 19px ${FONT}`;
  c.fillText(`${SITE.phoneDisplay}  ·  ${SITE.address.slice(1, 4).join(" ").replace(/,\s*$/, "")}`, W / 2, y);
  y += 30;
  c.font = `500 16px ${FONT}`;
  c.fillText("Booking request – final confirmation will be given by our team.", W / 2, y);

  const blob = await new Promise((r) => cv.toBlob(r, "image/png"));
  return { blob, url: URL.createObjectURL(blob), ref };
}

const fileOf = (blob, ref) => new File([blob], `${ref}-booking-receipt.png`, { type: "image/png" });

export function downloadReceipt(blob, ref) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${ref}-booking-receipt.png`;
  document.body.appendChild(a); a.click(); a.remove();
}

/** Mobile: share sheet with the PNG attached (pick WhatsApp). Desktop: download PNG + open WhatsApp chat. */
export async function sendReceiptWhatsApp(blob, ref) {
  const file = fileOf(blob, ref);
  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ files: [file], title: SITE.name });
      return "shared";
    } catch (e) {
      if (e?.name === "AbortError") return "cancelled";
      if (e?.name === "NotAllowedError") return "failed"; // browser wants a fresh tap -> show preview with Send button
    }
  }
  downloadReceipt(blob, ref);
  const href = waHref();
  if (href) window.open(href, "_blank", "noopener,noreferrer");
  return "downloaded";
}
