# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

Talent Hunt — an OTT streaming + talent competition platform. Monorepo with an Expo (React Native) mobile/web frontend and an Express/MongoDB backend in `server/`.

## Commands

### Frontend (Expo SDK 54, React Native 0.81)
```bash
npm install          # install frontend deps
npx expo start       # dev server (press a for Android, i for iOS, w for web)
npx expo start --android   # launch directly on Android emulator
```

### Backend (Express 5 + Mongoose 9)
```bash
cd server
cp .env.example .env       # first time — fill in MONGO_URI, JWT_SECRET
npm install
npm run dev                # starts with --watch on port 5000
node seed.js               # seed database with sample data
```

### Verify connectivity
- Ping (no DB): `http://localhost:5000/api/ping`
- Status (shows DB state): `http://localhost:5000/api/status`
- Android emulator uses `10.0.2.2:5000` instead of `localhost`

### No test suite or linter is configured.

## Architecture

### Frontend
- **Router**: Expo Router (file-based) — `app/` directory is the route tree.
  - `app/(auth)/` — login, signup, OTP verification, onboarding
  - `app/(tabs)/` — main tab bar: home, search, downloads, wishlist, settings
  - `app/(profiles)/` — profile select/create/edit
  - `app/movie/`, `app/series/` — detail, season, episode screens
  - `app/talent/` — talent hunt feature (upload, audition, leaderboard, categories)
- **Auth state**: `src/context/AuthContext.tsx` — React Context providing `useAuth()` hook. JWT stored via `expo-secure-store` (falls back to `localStorage` on web).
- **API client**: `src/lib/api.ts` — custom `fetch` wrapper (not Axios at runtime). Auto-attaches Bearer token, 20s timeout, auto-clears token on 401. Platform-aware base URL (10.0.2.2 for Android emulator, 127.0.0.1 otherwise).
- **Entry point**: `index.ts` re-exports `expo-router/entry`; root layout is `app/_layout.tsx` wrapping everything in `<AuthProvider>`.

### Backend
- **Entry**: `server/server.js` — Express app with helmet, hpp, CORS, morgan, rate limiting.
- **DB**: MongoDB via Mongoose. Connection is non-blocking — server starts even if DB is unreachable.
- **Auth flow**: Register → OTP email verification → login with JWT. Tokens: access (short) + refresh (long, stored on user doc for rotation). In dev, OTP is printed to server console.
- **API routes** (all prefixed `/api`):
  - `/auth` — register, login, verify-otp, resend-otp, refresh, me, logout
  - `/profiles` — CRUD per-user profiles (Netflix-style "Who's Watching")
  - `/movies`, `/series` — content catalog
  - `/talent` — talent hunt submissions (Cloudinary for video uploads)
  - `/wishlist`, `/search`
- **Middleware stack**: `protect` (JWT verify) → route handler. `adminOnly` for admin routes. Request validation via `express-validator` + custom `validate` middleware. Rate limiters per route group.
- **Models**: User, Profile, Movie, Series, Episode, Talent, Wishlist, WatchHistory, LoginLog.
- **File uploads**: Multer + Cloudinary (configured via env vars).

### Key conventions
- Backend responses use `{ success, message, data }` shape via `src/utils/response.js`.
- Frontend mixes `.tsx` and `.jsx` — no strict rule; newer files tend to be TypeScript.
- TypeScript config extends `expo/tsconfig.base` with `strict: true`.
