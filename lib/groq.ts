import "server-only";

import OpenAI from "openai";

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  throw new Error("Missing GROQ_API_KEY environment variable.");
}

const baseURL = process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1";
const chatModel = process.env.GROQ_CHAT_MODEL ?? "llama-3.3-70b-versatile";

const client = new OpenAI({ apiKey: groqApiKey, baseURL });

export async function generateChatCompletion(args: {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}) {
  const response = await client.chat.completions.create({
    model: chatModel,
    temperature: args.temperature ?? 0.3,
    messages: [
      { role: "system", content: args.systemPrompt },
      { role: "user", content: args.userPrompt },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}

export async function resolveClosestSchemeName(args: {
  query: string;
  schemeNames: string[];
}) {
  if (args.schemeNames.length === 0) {
    return null;
  }

  const prompt = `User query: ${args.query}

Available schemes:
${args.schemeNames.map((name, i) => `${i + 1}. ${name}`).join("\n")}

Return strict JSON only in the form:
{"scheme":"<exact scheme name from list or NONE>"}
`;

  const response = await client.chat.completions.create({
    model: chatModel,
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "Map user query to the closest scheme name from the provided list. Do not invent names. Output JSON only.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content?.trim() ?? "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as { scheme?: string };
    const scheme = parsed.scheme?.trim();
    if (!scheme || scheme.toUpperCase() === "NONE") {
      return null;
    }

    const exact = args.schemeNames.find(
      (item) => item.toLowerCase() === scheme.toLowerCase()
    );
    return exact ?? null;
  } catch {
    return null;
  }
}
