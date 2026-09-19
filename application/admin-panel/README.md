# OIO Studio (admin panel)

Separate Next.js 15 App Router app. Phase 4. Not the public storefront.

## Run (local)

```bash
cd application/admin-panel
cp .env.example .env.local
npm install
npm run dev
```

Opens on **http://localhost:3001**. FastAPI must be on **http://localhost:8080**.

API origin: `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`). No JWT secret in this app.

Create a local ADMIN user (backend venv):

```bash
cd application/backend
ADMIN_EMAIL=ops@example.com ADMIN_PASSWORD='choose-locally' PYTHONPATH=. python -m app.db.create_admin
```

CUSTOMER accounts are denied after login.

## Scripts

`npm run typecheck` · `npm run lint` · `npm test` · `npm run build`

## Out of scope

Docker, Kubernetes, Tailscale, Funnel, Jenkins.
