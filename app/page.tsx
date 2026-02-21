<<<<<<< HEAD
﻿"use client";

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
  lastIntent: "analyze" | "recommend" | "notify" | "list_users" | "list_schemes" | "general" | null;
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
        data?.telegramResult && typeof data.telegramResult.attempted === "number"
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
            typeof data.context.schemeTitle === "string" ? data.context.schemeTitle : null,
          recommendedUserIds: Array.isArray(data.context.recommendedUserIds)
            ? data.context.recommendedUserIds.filter(
                (id: unknown): id is string => typeof id === "string"
              )
            : [],
          rankingSnapshot: Array.isArray(data.context.rankingSnapshot)
            ? data.context.rankingSnapshot
                .filter(
                  (row: unknown): row is ChatContext["rankingSnapshot"][number] =>
                    typeof row === "object" &&
                    row !== null &&
                    typeof (row as { userId?: unknown }).userId === "string" &&
                    typeof (row as { finalScore?: unknown }).finalScore === "number" &&
                    typeof (row as { acceptanceProbability?: unknown }).acceptanceProbability ===
                      "number" &&
                    Array.isArray((row as { bundle?: unknown }).bundle)
                )
                .map((row: ChatContext["rankingSnapshot"][number]) => ({
                  userId: row.userId,
                  finalScore: row.finalScore,
                  acceptanceProbability: row.acceptanceProbability,
                  bundle: row.bundle,
                }))
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
      const message = error instanceof Error ? error.message : "Unexpected error";
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${message}` }]);
    } finally {
      setLoading(false);
    }
  }
=======
import Link from "next/link";
import { faqItems } from "@/utils/faq";

const featuredSchemes = [
  {
    title: "Public Provident Fund (PPF)",
    description:
      "A long-term savings option with tax benefits, commonly used for disciplined wealth building.",
    href: "/schemes",
  },
  {
    title: "Atal Pension Yojana (APY)",
    description:
      "Pension-focused scheme for unorganized sector workers to support retirement planning.",
    href: "/schemes",
  },
  {
    title: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    description:
      "Affordable life insurance cover that can support families with basic financial protection.",
    href: "/schemes",
  },
  {
    title: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    description:
      "Low-cost accident insurance cover aimed at widening insurance access in India.",
    href: "/schemes",
  },
];


>>>>>>> 858bcce03bd1bfd9d6f8b2c2ba72a0149a5080f6

  return (
<<<<<<< HEAD
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-blue-50/40 px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="space-orb absolute left-8 top-12 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="space-orb absolute right-6 top-36 h-52 w-52 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="space-orb absolute bottom-10 left-1/3 h-44 w-44 rounded-full bg-blue-700/20 blur-3xl" />
      </div>

      <header className="mb-5 rounded-2xl border border-blue-600/30 bg-blue-500/15 p-5 shadow-[0_20px_60px_rgba(29,78,216,0.25)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-700">Admin Console</p>
        <h1 className="mt-1 text-2xl font-semibold text-blue-800 sm:text-3xl">Scheme Intelligence Chatbot</h1>
        <p className="mt-2 text-sm text-blue-700">Space-blue control surface for scheme lookup, eligibility checks, and notifications.</p>
      </header>

      <section className="mb-4 flex flex-wrap gap-2">
        {starters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setInput(item)}
            className="rounded-full border border-blue-700/30 bg-blue-500/20 px-3 py-1.5 text-xs text-blue-800 transition hover:bg-blue-600/30"
          >
            {item}
          </button>
        ))}
      </section>

      <section className="flex-1 space-y-3 rounded-2xl border border-blue-700/25 bg-blue-500/10 p-4 backdrop-blur-xl">
        {messages.map((m, index) => (
          <article
            key={index}
            className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg ${
              m.role === "user"
                ? "ml-auto border border-blue-700/35 bg-gradient-to-r from-blue-600/70 to-blue-700/70 text-blue-50"
                : "mr-auto border border-blue-700/25 bg-blue-800/80 text-blue-50"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </article>
        ))}
        {loading ? <p className="text-sm text-blue-700">Processing request...</p> : null}
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
=======
    <main className="bg-blue-50/40 text-slate-900">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 ">
        <div className="flex flex-col justify-center">
          <p className="mb-3 inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold tracking-wide text-blue-800">
            India-Focused Financial Planning
          </p>
          <h1 className="text-3xl font-bold leading-tight text-blue-900 sm:text-4xl">
            Save smarter and protect your family with the right schemes.
          </h1>
          <p className="mt-4 text-base text-slate-700 sm:text-lg">
            Explore practical guidance on savings, insurance, and government schemes in
            India. Compare options, set goals, and build a safer financial future.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/schemes"
              className="rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Explore Schemes
            </Link>
            <Link
              href="/goals"
              className="rounded-md border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              Set Financial Goals
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative h-72 w-full max-w-xl overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-100 via-white to-blue-200 shadow-sm sm:h-80">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="rounded-md bg-white/80 px-4 py-2 text-sm font-medium text-blue-800">
                Placeholder image for finance/insurance visual
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-blue-900">Popular Savings & Insurance Schemes</h2>
        <p className="mt-2 text-slate-700">
          Quick overview of commonly discussed Indian schemes you can start learning today.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {featuredSchemes.map((scheme) => (
            <article
              key={scheme.title}
              className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">{scheme.title}</h3>
              <p className="mt-2 text-sm text-slate-700">{scheme.description}</p>
              <Link
                href={scheme.href}
                className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                Learn more
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-blue-900">Continue Your Journey</h2>
        <div className="mt-5 flex flex-col justify-center">
          <Link
            href="/chatbot"
            className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-md font-medium text-blue-900 transition hover:bg-blue-50"
          >
            Ask the Chatbot
          </Link>
          <Link
            href="/goals"
            className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-md font-medium text-blue-900 transition hover:bg-blue-50"
          >
            Build Savings Goals
          </Link>
          <Link
            href="/profile"
            className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-md font-medium text-blue-900 transition hover:bg-blue-50"
          >
            Update Profile
          </Link>
          <Link
            href="/pages/auth/register"
            className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-md font-medium text-blue-900 transition hover:bg-blue-50"
          >
            Create Account
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-blue-900">FAQs: Financial & Insurance Schemes in India</h2>
        <div className="mt-5 space-y-3">
          {faqItems.map((item) => (
            <details key={item.question} className="rounded-lg border border-blue-100 bg-white p-4">
              <summary className="cursor-pointer list-none pr-6 text-md font-semibold text-slate-900">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-700">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
>>>>>>> 858bcce03bd1bfd9d6f8b2c2ba72a0149a5080f6
    </main>
  );
}
