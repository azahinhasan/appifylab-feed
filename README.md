# Social Feed App : Backend API Reference

## Tech Stack
- Nest.js
- React.js
- MongoDB
- JWT

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

### Future Improvements
- Redis caching : cache feed and post queries to reduce DB load at scale.
- UI responsive: make UI more responsive and mobile-friendly.
- Worker queues : offload image processing to background jobs.
- Cloud storage : move uploads to S3 or similar with MIME validation, virus scanning, and CDN-served signed URLs.
- Observability : structured logging (Pino) + distributed tracing (OpenTelemetry) for fast debugging.
- Auth hardening : refresh tokens, rotating JWT keys, CSRF token and optional MFA.
- Resilience : health checks, graceful shutdown, and retry logic for Mongo/Redis failures.
- Real-time feed : WebSocket or SSE so new posts appear without a page refresh.
- Full-text search : for any type of searching via MongoDB Atlas Search or Elasticsearch.