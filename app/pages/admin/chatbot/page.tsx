"use client";

import { FormEvent, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatContext = {
  schemeTitle: string | null;
  recommendedUserIds: string[];
  rankingSnapshot: Array<{
    userId: string;
    finalScore: number;
    acceptanceProbability: number;
    bundle: string[];
  }>;
  lastIntent:
    | "analyze"
    | "recommend"
    | "notify"
    | "list_users"
    | "list_schemes"
    | "general"
    | null;
};

const starters = [
  "List available schemes",
  "Ayushman Bharat PM-JAY",
  "List users who can avail it",
  "Send message to them indicating they can avail it",
];

export default function HomePage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext>({
    schemeTitle: null,
    recommendedUserIds: [],
    rankingSnapshot: [],
    lastIntent: null,
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Admin chatbot online. Ask about schemes, eligible users, or send notifications.",
    },
  ]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const nextHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: chatContext,
          history: nextHistory.slice(-12),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      const note =
        data?.telegramResult &&
        typeof data.telegramResult.attempted === "number"
          ? `\n\nTelegram: attempted ${data.telegramResult.attempted}, delivered ${data.telegramResult.sent}.`
          : "";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `${String(data.answer ?? "")}${note}`,
        },
      ]);

      if (data?.context && typeof data.context === "object") {
        setChatContext({
          schemeTitle:
            typeof data.context.schemeTitle === "string"
              ? data.context.schemeTitle
              : null,
          recommendedUserIds: Array.isArray(
            data.context.recommendedUserIds
          )
            ? data.context.recommendedUserIds.filter(
                (id: unknown): id is string => typeof id === "string"
              )
            : [],
          rankingSnapshot: Array.isArray(data.context.rankingSnapshot)
            ? data.context.rankingSnapshot
                .filter(
                  (
                    row: unknown
                  ): row is ChatContext["rankingSnapshot"][number] =>
                    typeof row === "object" &&
                    row !== null &&
                    typeof (row as { userId?: unknown }).userId ===
                      "string" &&
                    typeof (row as { finalScore?: unknown })
                      .finalScore === "number" &&
                    typeof (row as {
                      acceptanceProbability?: unknown;
                    }).acceptanceProbability === "number" &&
                    Array.isArray((row as { bundle?: unknown }).bundle)
                )
                .map(
                  (
                    row: ChatContext["rankingSnapshot"][number]
                  ) => ({
                    userId: row.userId,
                    finalScore: row.finalScore,
                    acceptanceProbability:
                      row.acceptanceProbability,
                    bundle: row.bundle,
                  })
                )
            : [],
          lastIntent:
            data.context.lastIntent === "analyze" ||
            data.context.lastIntent === "recommend" ||
            data.context.lastIntent === "notify" ||
            data.context.lastIntent === "list_users" ||
            data.context.lastIntent === "list_schemes" ||
            data.context.lastIntent === "general"
              ? data.context.lastIntent
              : null,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-blue-50/40 px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="space-orb absolute left-8 top-12 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="space-orb absolute right-6 top-36 h-52 w-52 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="space-orb absolute bottom-10 left-1/3 h-44 w-44 rounded-full bg-blue-700/20 blur-3xl" />
      </div>

      <header className="mb-5 rounded-2xl border border-black-50/40 bg-blue-50/15 p-5 shadow-[0_20px_60px_rgba(29,78,216,0.25)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-700">
          Admin Console
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-blue-800 sm:text-3xl">
          Scheme Intelligence Chatbot
        </h1>
        <p className="mt-2 text-sm text-blue-700">
          Space-blue control surface for scheme lookup, eligibility checks,
          and notifications.
        </p>
      </header>

      <section className="mb-4 flex flex-wrap gap-2">
        {starters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setInput(item)}
            className="rounded-full border border-white-700/30 bg-blue-500/20 px-3 py-1.5 text-xs text-slate-800 transition hover:bg-blue-600/30"
          >
            {item}
          </button>
        ))}
      </section>

      <section className="flex-1 space-y-3 rounded-2xl border  bg-blue-50/10 p-4 backdrop-blur-xl">
        {messages.map((m, index) => (
          <article
            key={index}
            className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg ${
              m.role === "user"
                ? "ml-auto border border-blue-700/35 bg-gradient-to-r from-blue-600/70 to-blue-700/70 text-blue-50"
                : "mr-auto border border-blue-700/25 bg-white text-slate-90"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </article>
        ))}
        {loading ? (
          <p className="text-sm text-blue-700">
            Processing request...
          </p>
        ) : null}
      </section>

      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about schemes, eligibility, or send notifications..."
          className="flex-1 rounded-xl border border-blue-700/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-800 placeholder:text-blue-700/60 outline-none ring-blue-600/40 focus:ring-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-5 py-3 text-sm font-semibold text-blue-50 disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </main>
  );
}