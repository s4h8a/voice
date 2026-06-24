# AI Sales Calling Agent

Production-oriented SaaS starter for consent-based AI sales calling for Indian businesses.

The platform supports business profiles, lead upload/validation, campaign management, simulated AI calls, transcripts, outcome classification, UPI-style payment links, INR wallet billing, Excel export, admin pricing, audit logs, provider abstraction, and private backend deployment.

## Business Rules

- Currency: INR, stored internally as paise.
- Default client price: Rs 1 per minute (`100` paise).
- First completed call: free for each organization.
- Recharge: client creates an INR/UPI-capable payment link. Wallet is credited after verified payment webhook.
- Backend code: private server-side code only. Customers access the web app and API, not source code.
- Compliance: consented leads only, opt-out enforced, DND-safe architecture, AI/call-recording disclosure controls, audit logs.

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, Recharts, lucide-react
- Backend: NestJS, TypeScript, Prisma, PostgreSQL, Redis/BullMQ
- Providers: mock demo adapters plus Exotel/Twilio/Plivo, OpenRouter/OpenAI/Gemini/local model placeholders, Razorpay/Cashfree/PhonePe placeholders
- Deployment: Docker Compose

## Quick Start

One-line local install from this folder:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1
```

One-line GitHub private clone after you publish the private repo and authenticate Git on the machine:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "$repo='https://github.com/YOUR_ORG/ai-sales-calling-agent.git'; $dir=\"$env:USERPROFILE\ai-sales-calling-agent\"; if(!(Get-Command git -ErrorAction SilentlyContinue)){winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements}; if(!(Test-Path $dir)){git clone $repo $dir}; Set-Location $dir; .\install.ps1"
```

What the installer does:

- installs Node.js LTS, Git, and Docker Desktop if missing
- creates `.env` from `.env.example`
- installs npm packages
- starts PostgreSQL and Redis with Docker Compose
- runs Prisma generate/migrate/seed
- starts the API and web app

Manual setup:

```bash
cp .env.example .env
npm install
docker compose up -d postgres redis
npm run db:migrate
npm run db:seed
npm run dev
```

Web: `http://localhost:3000`
API: `http://localhost:4000/api`

Demo users:

- owner@example.com / Demo@123456
- admin@example.com / Demo@123456

## OpenRouter Test Model

Set this in `.env` to test with OpenRouter:

```bash
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=your-key
OPENROUTER_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free
```

If no key is present, the backend falls back to demo deterministic responses.

## Private Backend Deployment

Do not ship this repository to customers. Deploy the API as a private service behind HTTPS and keep these private:

- provider credentials
- OpenRouter/API keys
- prompt and call orchestration code
- payment webhook verification code
- billing and margin logic
- database and audit logs

Customers should only receive:

- hosted web login
- authenticated dashboard
- test-call UI
- Excel templates and exports
- public terms/privacy/compliance docs

## Voice Data

The repo includes a manifest and downloader for legal STT datasets:

```bash
pip install datasets soundfile huggingface_hub
python scripts/download_voice_datasets.py --dataset google/fleurs --subset hi_in --split train --max-rows 1000
```

For full local training runs, set `--max-rows 0` only after checking license/terms and available disk.

## Important Compliance Position

The voice can sound natural, but the product must not deceive users. Keep AI assistant disclosure and recording disclosure enabled where required, honor opt-outs immediately, and do not use this platform for spam calling.
