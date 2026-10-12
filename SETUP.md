# Cost Estimator — Firebase + Cloudflare Pages setup

## 1. Create the Firebase project
1. Go to https://console.firebase.google.com → **Add project** → name it (e.g. `bharat-industries-estimator`) → create.
2. In the project, click the **`</>`** (Web) icon to register a web app. Nickname it (e.g. `cost-estimator-web`). You do **not** need Firebase Hosting — you're using Cloudflare Pages.
3. Copy the `firebaseConfig` object shown after registering the app.

## 2. Enable Authentication
1. **Build → Authentication → Get started**.
2. **Sign-in method** tab → enable **Email/Password**.
3. **Users** tab → **Add user** → create one login (email + password) per team member. There is no public sign-up page by design — only people you add here can sign in.

## 3. Create Firestore
1. **Build → Firestore Database → Create database**.
2. Choose **Production mode**.
3. Pick a region close to Gujarat — `asia-south1` (Mumbai) is the usual choice.
4. Once created, go to the **Rules** tab, paste the contents of `firestore.rules` (included alongside this file), and click **Publish**.

## 5. Push to GitHub
1. Create a repo (e.g. `bharat-industries-cost-estimator`) at https://github.com/new — Public or Private both work.
2. On the repo's page, click **Add file → Upload files**, then drag in all six files: `index.html`, `vessel-agitator.html`, `theme.css`, `firebase-init.js`, `firestore.rules`, `SETUP.md`. They must all sit at the same top level of the repo (not inside a subfolder) since the pages reference each other by relative path like `./firebase-init.js`.
3. Commit directly to `main`.

## 6. Connect the repo to Cloudflare Pages
1. Cloudflare dashboard → **Workers & Pages → Create application**.
2. Select the **Pages** tab specifically (not Workers) → **Import an existing Git repository**.
3. Authorize Cloudflare's GitHub app the first time you do this, then pick your new repo.
4. In build settings: **Framework preset → None**, leave **Build command** empty, set **Build output directory** to `/` (this is a plain static site, nothing to build).
5. **Save and Deploy**.
6. Confirm the resulting URL is `<your-project-name>.pages.dev` — that confirms it's a genuine Pages project this time, not a Worker.

From here on, every time you push a change to the repo's `main` branch, Cloudflare rebuilds and redeploys automatically — no manual re-upload needed.

No environment variables or secrets are needed — the Firebase web config is meant to be public; access is enforced by Firestore rules and Firebase Auth, not by hiding the config.

## File structure
```
/index.html            → login + dashboard (3 calculator cards, recent estimates)
/vessel-agitator.html  → Vessel + Agitator calculator
/theme.css             → shared visual design system (used by every page)
/firebase-init.js      → Firebase config + auth/db exports (edit config here only)
/firestore.rules       → paste into Firebase console, not deployed as a file
```

## Updating Firestore rules later
Whenever `firestore.rules` in this drop differs from what you've already published (e.g. this update adds a `counters` collection for auto quotation numbers), copy the new contents into Firebase console → Build → Firestore Database → Rules tab → Publish. Nothing else needs touching for a rules-only change.

## What's next (later phases, not in this drop)
- Offer/Quotation generator page, plus a Cloudflare Worker for sequential offer numbering and/or server-rendered PDFs
- Heat Exchanger calculator (`heat-exchanger.html`) — reuses `theme.css` and `firebase-init.js` as-is
- Others calculator (`others.html`)
