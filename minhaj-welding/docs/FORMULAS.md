# FORMULAS (all values in feet; inch/12 added; no rounding stored)

| Key | Formula |
|---|---|
| chokat_door | 2×Height + Width + paithaan_count×Width  (default paithaan 2) |
| chokat_bathroom | 2×Height + Width (Anglaran free) |
| chokat_roshandan | 2×Height + 2×Width |
| chokat_window | 2×Height + Width + paithaan×Width + laar_count×(Width×laar_multiplier) + roshandan(Width + laars×Width×mult) |
| gate_area | Width × Height (sq ft) |
| railing_running_ft | Length (running ft); pillars = count × pillar_rate, separate line |
| fiber_sheet | Area = W×H; frame perimeter 2(W+H); internal block frame (block size default 2 ft) shown separately |

## Verified (node tests/acceptance.js)
Door 8.5×3.5 = 27.50 ✅ | Bathroom 6×2.5 = 14.50 ✅ | Gate 12×8 = 96 ✅ | Railing pillar separate ✅ | Fiber area ✅

## ⚠️ OPEN — owner confirmation needed
- **Window 5×5, 2 Laar, Paithaan, Roshandan**: master prompt expects 49.50; current engine gives 45.00. Laar/Roshandan counting rule (physical length, multiplier, Roshandan laars) exact batayein — phir formula version v2 mein set hoga.
- Fiber: frame/pipe/gauge/ply pricing abhi rates se alag line items ke tor par next phase mein aayenge.
- Gate hardware (kabza, handle, lock...) line items next phase.
