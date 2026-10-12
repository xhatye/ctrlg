import { doc, runTransaction } from "firebase/firestore";
import { db } from "./firebase";
export async function ensureProfile(user, name) {
  const ref = doc(db, "users", user.uid);
  await runTransaction(db, async (tx) => {
    const saved = await tx.get(ref);
    if (!saved.exists())
      tx.set(ref, {
        name:
          name || user.displayName || user.email?.split("@")[0] || "Étudiant",
        email: user.email?.trim().toLowerCase() || "",
        isPro: false,
        interviewsUsed: 0,
        streak: { count: 0, lastDate: "" },
        history: [],
        mastery: {},
        createdAt: new Date().toISOString(),
      });
    else if (name && saved.data().name !== name) tx.update(ref, { name });
  });
  return ref;
}
