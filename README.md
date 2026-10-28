# Vault

Stores messages and texts exactly as written. Two profiles:

- **Admin**: add, edit in place, reorder (up/down), delete with a confirm step, search, copy, and a round-trip check.
- **User**: read-only list, search, and a Copy button on every message.

React + Vite, plain CSS, Firestore for data (real-time via `onSnapshot`), Firebase Hosting.
No Firebase Authentication. Access is a client-side password gate.

## 1. Set up Firebase & Environment (once)

1. Create a project at <https://console.firebase.google.com>.
2. **Build → Firestore Database → Create database** (production mode, pick a region).
3. **Project settings → General → Your apps → Add app → Web**. Copy the config object.
4. Copy `.env.example` to `.env` and fill in the values (`VITE_FIREBASE_*` and `VITE_*_HASH`).
5. Put your project ID in `.firebaserc` (replace `YOUR_PROJECT_ID`).

## 2. Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. To test on a phone on the same Wi-Fi: `npm run dev -- --host`, then open the printed Network URL.

## 3. Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_PROJECT_ID
npm run build
firebase deploy --only hosting,firestore:rules
```

`npm run deploy` runs the last two steps in one go. The site goes live at `https://YOUR_PROJECT_ID.web.app`.

## Changing the passwords

Passwords live only in `src/config/auth.js`, stored as SHA-256 hex hashes.

1. Generate the hash for the new password:

   ```bash
   npm run hash -- "my-new-password"
   ```

   Other ways to get the same value:

   - PowerShell: `$s=[Text.Encoding]::UTF8.GetBytes('my-new-password'); -join ([Security.Cryptography.SHA256]::Create().ComputeHash($s) | % { $_.ToString('x2') })`
   - macOS/Linux: `printf '%s' 'my-new-password' | shasum -a 256` (use `printf`, not `echo`, which adds a newline and changes the hash)

2. Replace the hash value in `.env` (`VITE_ADMIN_HASH` or `VITE_USER_HASH`).
3. Rebuild and redeploy (`npm run deploy`). People who are already logged in stay logged in until they press Log out.

## Exact-format guarantees

- Content is saved as the raw textarea value. Nothing trims, normalises, collapses whitespace, converts quotes or parses Markdown/HTML.
- The editor turns off spellcheck, autocorrect, autocapitalise and Grammarly, and has no `maxLength` (which would silently cut a long paste). **Tab** inserts a real tab; **Esc** then **Tab** moves focus on.
- Messages render as a JSX text child inside `<pre>` with `white-space: pre-wrap` and a monospace font. No `dangerouslySetInnerHTML`.
- **Copy** writes the stored string with `navigator.clipboard.writeText`, falls back to `execCommand('copy')`, and if both are blocked it selects the text so it can be copied by hand.
- After every save, the app re-reads the document from the server and reports whether the stored copy is byte-identical to what was entered.
- Admin rows have a **Check** button: copy, paste back, and it compares byte for byte, naming the first different character (tab vs spaces, non-breaking space, curly quotes, and so on).

One browser rule to know about: textareas always turn Windows line endings (CRLF) into LF. Everything entered through the app is therefore stored with LF, and a copy → paste round trip comes back identical.

## Security: read this

The password gate keeps casual visitors out of the UI. It is **not** real security:

- The hashes and the Firebase web config ship inside the JavaScript bundle. Short passwords can be brute-forced offline from a SHA-256 hash.
- The logged-in role is a plain value in `localStorage`, so anyone can set it in DevTools.
- Without Firebase Auth, Firestore rules can't tell Admin from User. Anyone with the project config can read and write the `messages` collection directly. `firestore.rules` only enforces the shape of the data.

Fine for a shared lab notebook. Don't store anything sensitive. To harden it without adding a login provider, turn on **Firebase App Check** (reCAPTCHA Enterprise) and enforce it for Firestore, so only requests from your deployed site are accepted. Real per-role write protection would need Firebase Auth or a small backend.

## Project structure

```
src/
  config/auth.js         password hashes (the only place they live)
  lib/firebase.js        Firebase init + placeholder config
  lib/hash.js            SHA-256 (Web Crypto, pure-JS fallback for plain http)
  lib/clipboard.js       exact copy with fallbacks
  lib/verify.js          byte-exact comparison
  hooks/useMessages.js   real-time Firestore subscription
  hooks/useSession.js    role persisted in localStorage
  user/                  read-only view (no write code)
  admin/                 admin view, editor, writes (lazy-loaded chunk)
```
