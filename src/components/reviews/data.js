import { useEffect, useState } from "react";
import { SITE } from "../../config";
import { REVIEWS } from "../../data/reviews";
// Local sample so you can judge the designs with start-dev.bat. Never included in the live build.
const SAMPLE = [
  { name: "Sample Name One", rating: 5, date: "a month ago", text: "SAMPLE TEXT - yeh sirf design dekhne ke liye hai. Asli reviews src/data/reviews.js se aayenge." },
  { name: "Sample Name Two", rating: 5, date: "2 months ago", text: "SAMPLE TEXT - card ki lambai aur layout check karne ke liye." },
  { name: "Sample Name Three", rating: 4, date: "3 months ago", text: "SAMPLE TEXT - chaar star ka sample, taake line aur filled stars ka farq nazar aaye." },
];
export const list = () => (REVIEWS.length ? REVIEWS : import.meta.env.DEV ? SAMPLE : []);
export const isSample = () => !REVIEWS.length && import.meta.env.DEV;
export const summary = () => ({ rating: SITE.rating, count: SITE.reviewCount });
export const design = () => SITE.reviewDesign || 1;
export const openReviews = (d) => window.dispatchEvent(new CustomEvent("open-reviews", { detail: d || design() }));
export function useEsc(on, fn) { useEffect(() => { if (!on) return; const k = (e) => e.key === "Escape" && fn(); addEventListener("keydown", k); document.body.style.overflow = "hidden"; return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; }; }, [on]); }
