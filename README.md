# A+Manager (a-duong-manager)

Inventory / sales / debt manager for a small Vietnamese shop. Monorepo:

| Folder | What it is | Port |
|---|---|---|
| `app/` | Expo (React Native + Web) app, expo-router | 26262 (web dev) |
| `server/` | Node.js + SQLite API (`node:sqlite`, no native deps) | 26260 |
| `gateway/` | Zero-dep node:http proxy - single address for everything | **26261** |
| `tools/` | Dev orchestrator, seed script, Playwright screenshots, brand renderer | - |
| `docs/` | Understanding / decisions / open questions (source of truth: `requirement/`) | - |

Single dev address: **http://localhost:26261** (`/api/*` -> backend :26260, everything else -> web :26262).

## Prerequisites

- macOS (Apple Silicon) with Homebrew
- Node.js >= 22.5 (for `node:sqlite`): `brew install node`
- For iOS builds only: Xcode (recent version) + Command Line Tools, and an Apple ID
  (free is enough for simulator and on-device testing)

Install JS deps (root has no runtime deps; the app does):

```bash
cd app && npm install
```

## Web app

### Dev (API + web + gateway in one command)

From the repo root:

```bash
npm run dev
```

Open **http://localhost:26261**. Stop with Ctrl-C (kills all three).

Optional: seed sample products/categories (server must be running):

```bash
npm run seed
```

### Production build

```bash
cd app && npx expo export -p web     # outputs static site to app/dist
cd .. && NODE_ENV=production node gateway/server.mjs
# -> http://localhost:26261 serves the built web app + API on one port
```

## iOS app

The native project is generated, not hand-maintained. `app/ios/` is gitignored;
regenerate it any time with prebuild (config lives in `app/app.json`,
bundle id `com.up209d.aplusmanager`).

### 1) Point the app at your API

The web build uses same-origin requests, but native iOS has no origin - set the
API base URL. Create `app/.env` from the example:

```bash
cd app && cp .env.example .env
# edit EXPO_PUBLIC_API_BASE as needed (see comments in .env)
```

- Simulator: `http://localhost:26261` (localhost = your Mac)
- Physical iPhone on the same Wi-Fi: `http://<MAC_LAN_IP>:26261`
  - Find your Mac's IP with: `ipconfig getifaddr en0`
- Phone browser / other devices via tunnel: leave it unset (same-origin through
  a tunnel like `https://xxx.tunnel.aws.ducup.dev`)

### 2) Run on the iOS simulator

```bash
cd app && npx expo run:ios
# picks a booted/available iPhone simulator; or open ios/AManager.xcworkspace
# in Xcode, choose an iPhone simulator destination, hit Run.
```

First build downloads native artifacts (Hermes, React Native core) and runs
CocoaPods - can take several minutes. Make sure `npm run dev` (or at least the
gateway + API on :26261/:26260) is running in another terminal first.

### 3) Run on a physical iPhone (free Apple ID, no App Store)

1. Plug the iPhone into your Mac via USB and "Trust This Computer".
2. In `app/ios`, open `AManager.xcworkspace` in Xcode:
   - Signing & Capabilities -> Team: pick/sign in with your free Apple ID
     (Xcode creates a development certificate automatically).
3. On the iPhone: Settings -> Privacy & Security -> **Developer Mode** -> ON
   (the phone reboots once), then unlock and tap **Trust Developer App** when
   prompted.
4. Build + install, either in Xcode (choose your iPhone as destination, Run) or:

   ```bash
   cd app && npx expo run:ios --device
   ```

5. Make sure the phone is on the same Wi-Fi as your Mac and that
   `EXPO_PUBLIC_API_BASE` points to your Mac's LAN IP (step 1). If the iPhone
   asks about joining the local network, allow it.

Notes for free signing:

- Installs expire after **7 days** - rebuild/reinstall to keep testing
  (unplug + re-sign is not enough; run a fresh build).
- For longer-lived builds / TestFlight you need an Apple Developer account
  ($99/yr) and EAS (`npm i -g eas-cli && eas build --platform ios`).

## Useful commands (repo root)

```bash
npm run dev        # api + web + gateway together
npm run seed       # sample data into the running API
npm run shot       # Playwright screenshot of the web app -> tools/shots/
npm run brand      # render brand/*.svg to app/assets/images
codegraph sync     # refresh the code index (see AGENTS.md)
```

## Data

SQLite file at `server/data/manage.db` (gitignored). Schema is created
automatically on API boot; sample data via `npm run seed`. Delete the file for a
fresh start.
