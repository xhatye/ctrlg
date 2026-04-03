export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { messages, system } = await req.json();

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing GROQ_API_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Build messages array for Groq (OpenAI-compatible format)
  const groqMessages = [];

  if (system) {
    groqMessages.push({ role: "system", content: system });
  }

  if (messages && messages.length > 0) {
    for (const m of messages) {
      groqMessages.push({
        role: m.role === "assistant" ? "assistant" : "user",
        content: typeof m.content === "string"
          ? m.content
          : m.content?.map(c => c.text || "").join("") || "",
      });
    }
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1024,
        temperature: 0.7,
        messages: groqMessages,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || "Groq error" }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const text = data.choices?.[0]?.message?.content || "";

    // Return in Anthropic-compatible format so frontend doesn't need changes
    return new Response(
      JSON.stringify({
        content: [{ type: "text", text }],
        role: "assistant",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
