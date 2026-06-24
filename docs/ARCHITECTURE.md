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

- `TelephonyProvider`: Exotel, Twilio, Plivo. Select with `TELEPHONY_PROVIDER`.
- `LLMProvider`: OpenRouter.
- `PaymentProvider`: Razorpay by default; Cashfree/PhonePe hooks are reserved for merchant-specific checkout configuration.

## Live Dialing Modes

- Exotel flow mode: dials the customer and routes them to an Exotel flow/app using `EXOTEL_FLOW_URL` or `EXOTEL_APP_ID`.
- Exotel bridge mode: dials an agent/handoff number first, then connects the customer using `EXOTEL_AGENT_NUMBER`.
- Twilio mode: creates an outbound call from `TWILIO_FROM_NUMBER`; if no `TWILIO_TWIML_URL` is set it uses inline TwiML for a smoke call.
- Plivo mode: creates an outbound call using `PLIVO_FROM_NUMBER` and requires `PLIVO_ANSWER_URL` or `PUBLIC_API_BASE_URL`.

## Private Backend Boundary

The backend is not customer-distributed. Customer browsers call authenticated API routes. Source code, secrets, prompt orchestration, and payment verification remain private on the server.
