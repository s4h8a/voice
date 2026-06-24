# API Overview

Base URL: `/api`

Auth routes:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/password-reset`

Organization routes:

- `GET /organizations/me`
- `PATCH /organizations/me`
- `DELETE /organizations/me/data`

Business profile routes:

- `GET /business-profiles`
- `POST /business-profiles`
- `PATCH /business-profiles/:id`

Lead routes:

- `POST /leads/upload/preview`
- `POST /leads/upload/import`
- `GET /leads/list`

Campaign routes:

- `GET /campaigns`
- `POST /campaigns`
- `POST /campaigns/:id/leads`
- `POST /campaigns/:id/start`
- `POST /campaigns/:id/pause`
- `POST /campaigns/:id/resume`
- `GET /campaigns/:id/export`

Call routes:

- `GET /calls/list`
- `GET /calls/:id`
- `POST /calls/test-call`

Payment routes:

- `GET /payments`
- `POST /payments/create-link`
- `POST /payments/webhook/:provider`

Wallet routes:

- `GET /wallet`
- `POST /wallet/recharge`
- `POST /wallet/recharge/manual-demo`
- `GET /wallet/transactions`

Admin routes:

- `GET /admin/users`
- `GET /admin/campaigns`
- `GET /admin/audit-logs`
- `GET /admin/provider-configs`
- `POST /admin/provider-configs`
- `GET /admin/pricing`
- `POST /admin/pricing`
- `POST /admin/wallet-credit`

## Test Call Body

```json
{
  "name": "Test Customer",
  "phone": "9876543210",
  "preferredLanguage": "hi-IN",
  "consentConfirmed": true
}
```

## Wallet Recharge Body

```json
{
  "amountPaise": 100000
}
```

This creates a payment link. Wallet credit happens after verified payment webhook.
