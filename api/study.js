import { firebaseServices, authenticated, fail } from "../lib/admin.mjs";
import { FREE_MODULE } from "../lib/study-content.mjs";
import { readStudy } from "../lib/study-access.mjs";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const url = new URL(req.url, "https://simdcg.com");
    const id = url.searchParams.get("ue"),
      tool = url.searchParams.get("tool") || "summary";
    const deps =
      id === FREE_MODULE
        ? {}
        : { ...firebaseServices(), authenticate: authenticated };
    return res
      .status(200)
      .json(await readStudy(id, tool, req.headers.authorization, deps));
  } catch (error) {
    return fail(res, error);
  }
}
