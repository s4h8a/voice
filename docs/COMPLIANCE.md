# Compliance Notes

This product is designed for consent-based sales calls only.

Required controls:

- Import only leads with explicit consent.
- Reject rows with missing consent.
- Maintain organization-level opt-out list.
- Stop calling immediately when a customer opts out.
- Keep DND-safe mode enabled.
- Disclose AI/automated assistant where legally required.
- Disclose call recording where legally required.
- Keep audit logs for lead import, campaigns, wallet, provider config, admin changes, and opt-outs.
- Do not pressure customers aggressively.
- Do not build auto-dial spam behavior.

India-specific operational notes:

- Store wallet values in INR paise.
- Use Razorpay, Cashfree, or PhonePe for UPI/card/netbanking payment links.
- Keep call windows in `Asia/Kolkata`.
- Keep language preferences per lead/campaign.
- Add local legal review before production calling at scale.

Voice UX:

- Natural female voices are allowed when legally licensed.
- Do not pretend the caller is human if disclosure is required.
- Keep human handoff available.
