# Social Feed App — Backend API Reference

## Quick Start (Backend + Frontend)

## Deployed URL
`https://appifylab-feed.onrender.com` <br/>
Note: This is a free instance that will spin down with inactivity, which can delay requests by ~50 seconds while it wakes up.


### Backend (NestJS)
1. `cd backend`
2. `npm install`
3. `npm run db:seed`
4. Create a `.env` file (or export env vars) with at least:
   - `MONGODB_URI=mongodb://127.0.0.1:27017/social-feed`
   - `JWT_SECRET=your-super-secret-string`
   - `FRONTEND_URL=http://localhost:5173`
5. Start the API: `npm run dev` (listens on `http://localhost:3000`)

### Frontend (React + Vite)
1. `cd frontend`
2. `npm install`
3. Create `.env` with `VITE_API_URL=http://localhost:3000`
4. Start the app: `npm run dev` (Vite defaults to `http://localhost:5173`)

> Keep both servers running simultaneously for a fully functional experience.