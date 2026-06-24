# Architecture

## Runtime Services

- `apps/web`: Next.js dashboard for business owners, sales managers, and super admins.
- `apps/api`: NestJS private API with auth, RBAC, providers, wallet billing, campaigns, calls, payments, exports, and admin controls.
- PostgreSQL: system of record.
- Redis/BullMQ: background jobs for uploads, campaign scheduling, calls, summaries, exports, and reconciliation.

## Call Flow

1. Business owner creates a business profile.
2. Owner uploads consented leads through CSV/XLSX validation.
3. Owner creates a campaign and confirms consent/DND controls.
4. Scheduler checks opt-out list, consent, call window, attempts, and wallet.
5. Telephony adapter starts the call.
6. Voice pipeline handles STT, LLM generation, TTS, transcripts, latency tracking, and barge-in placeholders.
7. LLM adapter classifies outcome, extracts payment intent, and detects callbacks.
8. Payment adapter creates INR/UPI-capable link when customer agrees.
9. Webhook updates payment status and wallet/lead/campaign records.
10. Export endpoint returns Excel-ready campaign results.

## Provider Interfaces

- `TelephonyProvider`: Exotel, Twilio, Plivo, mock.
- `LLMProvider`: demo, OpenRouter, OpenAI realtime, Gemini, local model placeholders.
- `PaymentProvider`: Razorpay, Cashfree, PhonePe, mock UPI.

## Private Backend Boundary

The backend is not customer-distributed. Customer browsers call authenticated API routes. Source code, secrets, prompt orchestration, and payment verification remain private on the server.
