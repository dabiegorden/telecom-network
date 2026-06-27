# Deploying to Sevalla

This is a monorepo with two parts that deploy as **two separate Sevalla Applications**
from the same Git repository:

| Service  | Root directory | Type            | Why                                            |
| -------- | -------------- | --------------- | ---------------------------------------------- |
| Backend  | `backend`      | Express + Socket.io | Needs a persistent, always-on Node process for real-time messaging |
| Frontend | `frontend`     | Next.js         | Server-rendered React app                      |

> **Why not Vercel?** The backend uses Socket.io, which requires a long-lived
> server connection. Vercel is serverless and closes connections, so sockets
> never stay up. Sevalla runs persistent Node processes — the correct fit.

---

## 1. Deploy the Backend

In Sevalla: **Applications → Create → import this repo.**

- **Application name:** `telecom-backend`
- **Root directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Port:** Sevalla injects `PORT` automatically — the server already reads `process.env.PORT`.

### Backend environment variables

Set these in the Sevalla app's **Environment variables** section (see `backend/.env.example`):

```
NODE_ENV=production
FRONTEND_URL=https://<your-frontend>.sevalla.app
MONGODB_URL=...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=...
RAPIDAPI_KEY=...
```

Do **not** set `PORT` manually — Sevalla provides it.

After it deploys, note the backend URL (e.g. `https://telecom-backend.sevalla.app`).

---

## 2. Deploy the Frontend

Create a **second** Sevalla Application from the same repo.

- **Application name:** `telecom-frontend`
- **Root directory:** `frontend`
- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`

### Frontend environment variables

(see `frontend/.env.example`) — point these at the backend URL from step 1:

```
NEXT_PUBLIC_API_URL=https://telecom-backend.sevalla.app
NEXT_PUBLIC_SOCKET_URL=https://telecom-backend.sevalla.app
```

> `NEXT_PUBLIC_*` vars are baked in at **build time**, so set them before the
> first build. If you change them later, trigger a rebuild.

---

## 3. Wire the two together

1. Set the frontend's `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SOCKET_URL` to the backend URL.
2. Set the backend's `FRONTEND_URL` to the frontend URL (required for CORS + Socket.io).
3. Redeploy both if you changed URLs after the first build.

---

## Local development

From the repo root:

```bash
npm install            # installs both workspaces
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:3000
```

Copy `backend/.env.example` → `backend/.env` and
`frontend/.env.example` → `frontend/.env.local`, then fill in values.
