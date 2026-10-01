import { SITE } from "./config";
export const clean = (s) => String(s || "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, 300);
export function buildMessage(d, v) {
  const g = (k) => clean(d[k]) || "-";
  return [`*${SITE.name}*`, "*NEW BOOKING REQUEST*", "", "*Customer Details*", `Name: ${g("name")}`, `Phone: ${g("phone")}`, `WhatsApp: ${g("whatsapp")}`, `Email: ${g("email")}`, "",
    "*Journey Details*", `Pickup: ${g("pickup")}`, `Drop-off: ${g("drop")}`, `Date: ${g("date")}`, `Pickup Time: ${g("time")}`, `Return Date: ${g("rdate")}`, `Return Time: ${g("rtime")}`, `Trip Type: ${g("trip")}`, "",
    "*Vehicle*", `Category: ${v.category}`, `Model: ${v.name} ${v.trim}`.trim(), `Colour: ${v.color}`, "Service: With Professional Driver", `Passengers: ${g("pax")}`, "", `Additional Requirements: ${g("extra")}`].join("\n");
}
