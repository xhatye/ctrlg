# GPT-OSS 120B: bounded tutoring

Model: `openai/gpt-oss-120b`, served directly by Groq Chat Completions.
Pricing checked 2026-10-26: https://console.groq.com/docs/model/openai/gpt-oss-120b
Standard on-demand: USD 0.15 per million input tokens, USD 0.60 per million output tokens.

## Limits enforced before every provider call

- Shared per-account envelope: USD 0.36 per Paris calendar month (360,000 micro-dollars).
- At most 20 requests per Paris calendar day and 300 per month.
- Case feedback shares all the above limits, plus its existing 5/day and 60/month limits.
- Existing site-wide USD 20 monthly limit retained. It may pause all tutoring before individual limits are reached.
- Maximum 2,048 generated tokens, including hidden reasoning. UI asks for 1,600.
- No external tools, premium service tier, alternate model fallback or automatic retry.
- Server reserves the conservative maximum cost in the existing atomic Firestore transaction before contacting Groq.
- Reservation uses UTF-8 text bytes as an upper bound on byte-level input tokenization, plus 4,096 tokens for framing, and the entire maximum output allowance. Integer arithmetic rounds up.
- Reservations are never refunded, even for timeouts, bad provider replies or malformed JSON. A failed HTTP response does not prove Groq did not bill the generation.
- Previous monthly usage remains counted. Updating the model never resets spending or learner data.
- Invalid or corrupt counters, missing authentication, expired Pro access and unavailable accounting fail closed.

This is a conservative application-generation limit at the checked prices, not a limit on taxes, hosting, other uses of the same Groq API key, or an external invoice after a provider price change. Recheck provider prices before changing the model or output limits. The number of usable responses can be below 300, especially for long conversations. No claim of 300 guaranteed responses is made.

## User experience and privacy

The authenticated status response shows the remaining daily/monthly request ceiling and remaining envelope percentage. It is private/no-store. Only provider availability metadata is cached publicly. After an unsuccessful request the UI refreshes accounting; it never refunds locally. Ordinary courses, QCM, flashcards and saved corrections do not require generation.

Only the selected conversation and relevant original course extracts are sent to Groq. No account email or payment data is added to the model prompt. Responses are plain rendered text, with server-selected course reference links. Provider credentials remain on the server.

## Verification

Run `npm test` and `npm run build` using the patched Node runtime. Tests include concurrent budget exhaustion, one-micro-dollar overflow, historic accounting preservation, malformed counters, conservative treatment of failed generations and a single bounded provider request in either tutoring mode. Test a real authenticated production question after deployment, confirm the envelope falls and survives reload, and retain the prior production deployment for rollback.
