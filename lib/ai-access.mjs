export function hasPro(profile, now = Date.now()) {
  return (
    !!profile?.isPro &&
    (!profile.proExpiresAt || Date.parse(profile.proExpiresAt) > now)
  );
}
export function validateChat(body) {
  if (
    !Array.isArray(body?.messages) ||
    !body.messages.length ||
    body.messages.length > 40
  )
    throw Object.assign(new Error("Conversation invalide."), { status: 400 });
  const system = typeof body.system === "string" ? body.system : "";
  const messages = body.messages.map((m) => {
    if (
      !["user", "assistant"].includes(m.role) ||
      typeof m.content !== "string" ||
      m.content.length > 15000
    )
      throw Object.assign(new Error("Message invalide ou trop long."), {
        status: 400,
      });
    return { role: m.role, content: m.content };
  });
  if (
    system.length + messages.reduce((n, m) => n + m.content.length, 0) >
    50000
  )
    throw Object.assign(
      new Error("Conversation trop longue. Ouvrez une nouvelle discussion."),
      { status: 400 },
    );
  return {
    messages: system
      ? [{ role: "system", content: system }, ...messages]
      : messages,
    max_tokens: Math.max(128, Math.min(4096, Number(body.max_tokens) || 1200)),
  };
}
