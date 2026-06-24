# Deployment

## Local Setup

```bash
cp .env.example .env
npm install
docker compose up -d postgres redis
npm run db:migrate
npm run db:seed
npm run dev
```

## Production Shape

- API container: private network, HTTPS ingress, no source distribution.
- Web container: public HTTPS, talks to API origin.
- PostgreSQL: managed database with backups.
- Redis: managed queue/cache.
- Secrets: environment manager, not committed files.
- Object storage: S3-compatible bucket for recordings, exports, and transcripts.
- Webhooks: public signed endpoint with provider verification.

## Backend Privacy

To avoid revealing backend code:

- Deploy compiled containers or CI-built artifacts.
- Do not provide repository access to clients.
- Use environment secrets for all provider keys.
- Keep admin routes RBAC-protected.
- Keep database and logs private.
- Expose only documented authenticated APIs.
