# Talent Hunt OTT - How to Run (Frontend + Backend)

## 1. Backend (MERN)

```powershell
cd server

# IMPORTANT: Edit .env and put a REAL MongoDB connection string
# You can use MongoDB Atlas (free tier) or local MongoDB

# Then start backend
npm run dev
```

The server now starts even if MongoDB is not reachable (shows warning). Health check at http://localhost:5000

After starting backend, run seed for data:
```powershell
node seed.js
```

## 2. Frontend (Expo)

```powershell
# From project root
npm install   # already done some deps

# Start Expo
npm start
# or
npx expo start
```

**Platform specific API URL** (already handled in src/lib/api.ts):
- iOS Simulator / Web → localhost:5000
- Android Emulator → 10.0.2.2:5000
- Real phone → Use your computer's local IP (change in src/lib/api.ts if needed)

## 3. First Time Flow (Production Ready Auth)

1. Open the app → goes to login screen (has Sign In / Register tabs)
2. Register with name + email + strong password (8+ chars, upper, lower, number, special)
3. After register, OTP input appears in the same screen.
   - In development (no real email configured), check the **backend terminal** — it prints the OTP.
4. Enter the 6-digit OTP → account verified + logged in → token saved securely.
5. Goes to ChooseProfile (tries to load real profiles from backend, falls back to demo).

## 4. What is now working end-to-end

- Real registration + strong validation from backend
- Real login
- Real OTP verification flow
- JWT stored securely with expo-secure-store
- API calls include Authorization header automatically
- Backend has rate limiting, helmet, validation errors (422), consistent responses

## 5. If things don't work

- Backend not connecting? Update MONGO_URI in server/.env with real DB.
- Can't reach backend from Android? Make sure using 10.0.2.2 or your LAN IP.
- OTP not received? In dev the backend console logs the OTP when you register.

## Production Notes

- Use real Cloudinary keys for talent video uploads.
- Use real SMTP for OTP emails.
- For physical devices, update the base URL in src/lib/api.ts
- Add token refresh logic in the api client when 401 happens (future improvement).

Enjoy the now-functional Talent Hunt app!
