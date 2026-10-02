export const clean = (s) => String(s || "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, 300);
