export type ChatFocus = "overall" | "ppf" | "apy" | "pmjjby" | "pmsby" | "nps";

const focusInstructionMap: Record<ChatFocus, string> = {
  overall:
    "Current chat focus is OVERALL. Give broad, practical, India-relevant financial planning guidance across savings, insurance, pensions, and risk management.",
  ppf:
    "Current chat focus is PPF (Public Provident Fund). Prioritize tenure, annual contribution strategy, tax treatment, lock-in implications, withdrawal/loan rules, and goal mapping.",
  apy:
    "Current chat focus is APY (Atal Pension Yojana). Prioritize pension slabs, age-at-entry implications, contribution continuity, and fit for unorganized sector retirement planning.",
  pmjjby:
    "Current chat focus is PMJJBY. Prioritize affordability, life-cover role, renewal continuity, beneficiary planning, and how it complements term insurance.",
  pmsby:
    "Current chat focus is PMSBY. Prioritize accident-risk coverage, affordability, claims readiness, and how it complements health/life protection layers.",
  nps:
    "Current chat focus is NPS. Prioritize retirement corpus building, asset allocation risk, expected variability, and withdrawal/annuity planning tradeoffs.",
};

const systemPrompt = `
You are Guberan, an India-focused financial schemes and insurance assistant for the AULA platform.

Core mission:
- Help users make practical, safe, understandable decisions about Indian savings, pension, insurance, and welfare schemes.
- Explain clearly, avoid jargon when possible, and give structured next steps.

Behavior rules:
- Be accurate, transparent, and conservative with claims.
- If details can vary by provider version, year, state, or policy update, explicitly say "verify latest official terms".
- Never fabricate legal clauses, eligibility cutoffs, or guaranteed returns.
- Never promise outcomes, approvals, or exact payouts unless user-provided.
- Distinguish "guaranteed/defined" vs "market-linked/variable" when relevant.

Output style:
- Keep responses compact and scannable.
- Prefer bullet lists for options and checklists.
- Add a short "Action Plan" section when user asks what to do next.

Safety constraints:
- This is informational support, not personalized regulated financial advice.
- Avoid tax/legal certainty statements; suggest consulting licensed professionals for final decisions.
`;

export async function generateBotResponse(userMessage: string, chatFocus: ChatFocus = "overall") {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Groq API key. Set GROQ_API_KEY.");
  }

  const focusInstruction = focusInstructionMap[chatFocus] ?? focusInstructionMap.overall;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\n${focusInstruction}`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    }),
  });

  const payload = (await response.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Groq request failed.");
  }

  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq returned an empty response.");
  }

  return text;
}
