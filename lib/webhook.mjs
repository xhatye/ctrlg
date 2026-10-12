import { processEvent } from "./billing.mjs";
export function createWebhook(getServices) {
  return async (request) => {
    if (request.method !== "POST")
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "POST" },
      });
    let deps, event;
    try {
      deps = getServices();
      if (!process.env.STRIPE_WEBHOOK_SECRET)
        throw new Error("Missing webhook configuration");
    } catch {
      return Response.json({ error: "Webhook unavailable" }, { status: 503 });
    }
    try {
      event = deps.stripe.webhooks.constructEvent(
        Buffer.from(await request.arrayBuffer()),
        request.headers.get("stripe-signature"),
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }
    try {
      return Response.json({
        received: true,
        ...(await processEvent(deps, event)),
      });
    } catch (error) {
      console.error(
        "SIMDCG webhook processing failed",
        event.id,
        error.code || "processing_error",
      );
      return Response.json(
        { error: "Processing failed; retry required" },
        { status: 500 },
      );
    }
  };
}
