import { services } from "../lib/admin.mjs";
import { createWebhook } from "../lib/webhook.mjs";
export default {
  fetch: createWebhook(services),
};
