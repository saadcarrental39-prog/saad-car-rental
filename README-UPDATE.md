# Website Update System (D:\saad)

Aapko terminal commands yaad rakhne ki zaroorat nahi. Sirf file double-click karein.

## Files kya karti hain

| File | Kaam |
|---|---|
| **update.bat** | Build chalata hai, `git add`, `git commit` (message mein date/time khud), `git push`. Phir Cloudflare 2-3 minute mein website live kar deta hai. |
| **update-with-message.bat** | Pehle aap se commit message poochta hai, phir wahi sab karta hai. |
| **start-dev.bat** | Apne computer par test: `npm run dev` + browser mein http://localhost:5173 khud khulta hai. |
| **check-status.bat** | Branch, aakhri 5 commits, git status. Uncommitted changes ho to peela warning. |
| `_update-core.bat` | Dono update files ka common engine. **Isay delete ya rename mat karein.** |

Sab files `D:\saad` mein, `package.json` ke saath rakhein.

## Roz ka tareeqa

1. Code change karein (khud ya Claude se).
2. (Optional) `start-dev.bat` se pehle local par dekh lein.
3. `update.bat` double-click.
4. Green **SUCCESS** aaye to 2-3 minute baad website live. Window tab band hogi jab aap koi key dabayenge.

Rang: neela = chal raha hai, hara = kamyab, peela = warning / kuch karne ko nahi, laal = error.

## Update.bat ke steps

1. Node.js, npm, Git aur repo check
2. `node_modules` na ho to `npm install` (sirf pehli baar)
3. `npm run build` (fail ho to wahin ruk jata hai, kuch push nahi hota)
4. `git add -A`
5. Changes hain to `git commit`, nahi hain to saaf message (purane unpushed commits ho to woh push ho jate hain)
6. `git push`
7. Success message

## Troubleshooting

| Error | Wajah / Hal |
|---|---|
| Node.js install nahi hai | https://nodejs.org se LTS install karein, computer restart, dobara chalayein. |
| Git install nahi hai | https://git-scm.com/download/win se install karein. |
| BUILD FAIL | Upar wali lines mein file ka naam + line number hota hai. Woh error copy karke Claude ko dein. Build fail ho to GitHub par kuch nahi jata, live site safe rehti hai. |
| Git ko naam/email nahi pata | Ek baar: `git config --global user.name YourName` aur `git config --global user.email you@example.com` |
| PUSH FAIL: authentication | Git Credential Manager ki login window aaye to GitHub account se sign in karein. Phir dobara update.bat. |
| PUSH FAIL: rejected / non-fast-forward | GitHub par naye changes hain. Command Prompt mein `cd /d D:\saad` phir `git pull --rebase`, phir update.bat. |
| dubious ownership | `git config --global --add safe.directory D:/saad` |
| index.lock error | Koi aur Git window/VS Code band karein, ya `.git\index.lock` file delete karein. |
| "Yeh folder Git repository nahi hai" | Aap galat folder mein hain, ya `.git` folder nahi hai. Asli repo wale `D:\saad` mein files rakhein. |
| start-dev: port 5173 masroof | Purani dev window band karein. |
| Push ho gaya lekin site nahi badli | Cloudflare dashboard > Pages > Deployments mein build error dekhein. Browser mein Ctrl+F5 karein. |
| `.bat` khulte hi band ho jati hai | Folder mein se `_update-core.bat` gayab hai. Zip se wapas rakhein. |

## Zaroori baatein

- `.gitignore` na ho to `update.bat` khud bana deta hai (node_modules, dist, .env GitHub par nahi jate). Pehle se hai to chhedta nahi.
- Secret keys (Google API key) kabhi GitHub par nahi jatin, woh sirf Cloudflare dashboard mein hoti hain. Dekhein `README-REVIEWS.md`.
