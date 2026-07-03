# Talent Hunt - Backend (Server) ✅ FULLY SET UP

MERN backend for the **Talent Hunt** OTT + Talent Discovery Platform.

## Quick Start

```powershell
cd server

# 1. Make sure .env has real MONGO_URI (already has dummy)
# 2. (Optional but recommended) Update Cloudinary + Email keys in .env

# Run the server
npm run dev          # or npm start

# In another terminal - seed the database (after server is running or together)
node seed.js
```

## What is Already Built

### Models
- User (with OTP + JWT refresh)
- Profile (multi-profile like Netflix)
- Movie
- Series + Episode
- Talent (auditions + voting/leaderboard)
- Wishlist
- WatchHistory (for continue watching)

### Auth (Complete)
- Register → sends OTP
- Login (with verification gate)
- Verify OTP + Resend OTP
- JWT access + refresh tokens
- Protected routes middleware

### Core APIs
| Route                    | Methods          | Auth     | Description                          |
|--------------------------|------------------|----------|--------------------------------------|
| /api/auth/*              | POST             | -        | register, login, verify-otp, me      |
| /api/profiles            | GET, POST, PUT, DELETE | ✅     | Multi profiles per user              |
| /api/movies              | GET, POST, PUT, DELETE | Admin    | Movies list + detail                 |
| /api/series              | GET + /:id/seasons | -      | Series + grouped seasons/episodes    |
| /api/talent              | GET, POST        | Partial  | List + submit audition (video upload)|
| /api/talent/leaderboard  | GET              | -        | Top voted talent                     |
| /api/talent/:id/vote     | POST             | ✅       | Upvote / remove vote                 |
| /api/wishlist            | GET, POST, DELETE| ✅       | User's wishlist                      |
| /api/search?q=...        | GET              | -        | Unified search (movies + series + talent) |

### File Uploads
- Talent auditions support `thumbnail` + `auditionVideo` via multipart/form-data
- Uses Cloudinary (configure keys in .env)
- Falls back gracefully if not configured

### Seed Data
Run `node seed.js` → creates:
- Admin user (from .env)
- 4 sample movies (matching your frontend images)
- 1 sample series with episodes
- 3 sample talent entries (for leaderboard)

### Production Hardening (New)
- Strong password rules + express-validator on Auth, Profiles, Talent, Wishlist
- Rate limiting on auth & uploads
- Helmet + hpp security middleware
- Consistent `{ success: true/false, message, data }` responses
- Proper 422 validation errors with field details
- Refresh token endpoint with rotation
- Logging (morgan)

## Important: Update .env First

Open `server/.env` and **at minimum** replace:

```env
MONGO_URI= your real mongodb atlas or local uri

# For video + image uploads in Talent form
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# For OTP emails during signup/login
EMAIL_USER=...
EMAIL_PASS=...          # Gmail App Password
```

Dummy data is already filled so you can start coding routes immediately.

## Connecting from Frontend (React Native / Expo)

```js
const API_BASE = "http://localhost:5000/api";           // iOS Simulator / Web
// const API_BASE = "http://10.0.2.2:5000/api";        // Android Emulator
// const API_BASE = "http://192.168.1.105:5000/api";   // Physical device (your PC IP)

const res = await fetch(`${API_BASE}/movies`);
```

Later you can move this to a `src/services/api.js` or use axios with interceptors for auth token.

## Admin Routes
Some create/update/delete routes require admin. Use the seeded admin or create one with role: "admin".

## Next Things You Can Do
- Connect frontend screens to these APIs (replace hardcoded data)
- Add video streaming player in movie/series screens
- Add "Continue Watching" using WatchHistory model
- Add downloads tracking
- Improve validation (joi/zod)

Everything is wired and ready. Just put real keys in `.env` and run `node seed.js`.

## Production Tips

- Set `NODE_ENV=production`
- Use long random values for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
- Real MongoDB + Cloudinary + Email credentials required
- Rate limiting + Helmet + validation already active

**Bhai, ab login/signup bohot solid ho gaya hai** — strong passwords, proper validation (422 errors with field names), rate limiting, consistent responses, refresh tokens, security headers — sab production level pe.

Agar frontend integrate karna hai to bata, main ek clean `api.js` service bhi bana dunga. 

Pura backend complete + hardened! ✅

