# Cloudflare Tunnel Guide (Phase 1 draft) / Cloudflare Tunnel Setup

Backend PC par chalta hai (port 3001). Tunnel usay internet par safe tareeqay se expose karta hai.

1. Domain kharidein aur Cloudflare (free) mein add karein; nameservers Cloudflare wale set karein.
2. PC par `cloudflared` install karein (Windows installer: developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads).
3. `cloudflared tunnel login`
4. `cloudflared tunnel create minhaj-welding`
5. `config.yml` (see config.example.yml) banayein.
6. `cloudflared tunnel route dns minhaj-welding api.minhajwelding.com`
7. `cloudflared service install` (PC start hote hi tunnel chale).
8. Backend `.env` mein `CORS_ORIGINS` mein apna frontend domain daalein.
9. Frontend: Cloudflare Pages par `frontend` deploy karein, env `VITE_API_URL=https://api.minhajwelding.com/api`.

Note: PC band = system band. PC ko on rakhna zaroori hai.
