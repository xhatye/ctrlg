import { auth } from "./firebase";
export async function billingRequest(path, body = {}) {
  if (!auth.currentUser) throw new Error("Connectez-vous à votre compte.");
  const token = await auth.currentUser.getIdToken();
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "La vérification a échoué. Réessayez.");
  return data;
}
let checkoutPending = false;
export async function launchCheckout(plan = "subscription") {
  if (!auth.currentUser) {
    sessionStorage.setItem("simdcg-plan", plan);
    window.location.assign("/connexion");
    return;
  }
  if (checkoutPending) return;
  checkoutPending = true;
  try {
    const data = await billingRequest("/api/stripe-checkout", { plan });
    const url = new URL(data.url);
    if (url.origin !== "https://checkout.stripe.com")
      throw new Error("Lien de paiement invalide.");
    window.location.assign(url.href);
  } finally {
    checkoutPending = false;
  }
}
