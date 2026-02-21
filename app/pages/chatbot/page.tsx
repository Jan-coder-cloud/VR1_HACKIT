"use client";

import { FormEvent, useMemo, useState } from "react";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

const schemeOptions = [
  { value: "overall", label: "Overall Financial Assistant" },
  { value: "ppf", label: "PPF (Public Provident Fund)" },
  { value: "apy", label: "Atal Pension Yojana (APY)" },
  { value: "pmjjby", label: "PMJJBY (Life Insurance)" },
  { value: "pmsby", label: "PMSBY (Accident Insurance)" },
  { value: "nps", label: "NPS (National Pension System)" },
];

const starterPrompts = [
  "Compare PPF and NPS for long-term retirement",
  "Best low-cost insurance schemes for families",
  "How to start a monthly savings plan in India",
  "Can I use APY and NPS together?",
];

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    text: "Hi, I am Guberan. I can help with Indian savings and insurance schemes. Choose a chat focus and ask your question.",
  },
];

const scopeReplyMap: Record<string, string> = {
  overall:
    "For an overall plan, start with emergency savings, basic health cover, and then goal-based investments like PPF, NPS, or SIPs.",
  ppf: "PPF is useful for long-term tax-efficient savings with a 15-year horizon and sovereign backing.",
  apy: "APY gives a pension-oriented structure for retirement planning, especially useful for unorganized sector workers.",
  pmjjby:
    "PMJJBY can provide affordable life cover. It is commonly used as a base layer, with term insurance added for larger family needs.",
  pmsby:
    "PMSBY provides low-cost accidental cover and can complement broader life and health insurance planning.",
  nps: "NPS supports retirement corpus building with market-linked returns and pension-focused withdrawal rules.",
};

export default function ChatbotPage() {
  const [chatFocus, setChatFocus] = useState("overall");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");

  const focusLabel = useMemo(
    () => schemeOptions.find((option) => option.value === chatFocus)?.label ?? "Overall Financial Assistant",
    [chatFocus],
  );

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };
    const assistantMessage: ChatMessage = {
      id: Date.now() + 1,
      role: "assistant",
      text: `[${focusLabel}] ${scopeReplyMap[chatFocus]}`,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
  };

  const handleStarterPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] pt-16 text-slate-900">
      <div className="mx-auto flex h-[calc(100dvh-4rem)] w-full overflow-hidden bg-white sm:max-w-7xl sm:border-x sm:border-slate-200">
        <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-[#f9fbff] xl:flex xl:flex-col">
          <div className="border-b border-slate-200 px-4 py-4">
            <p className="text-lg font-bold text-blue-900">Guberan</p>
            <p className="text-xs text-slate-500">India savings and insurance assistant</p>
          </div>
          <div className="border-b border-slate-200 p-4">
            <button className="w-full rounded-md border border-blue-200 bg-white px-4 py-2 text-left text-sm font-semibold text-blue-900 transition hover:bg-blue-50">
              + New chat
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {["Retirement plan options", "Insurance cover strategy", "Savings for child education"].map((title) => (
              <button
                key={title}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-900"
              >
                {title}
              </button>
            ))}
          </div>
          <div className="border-t border-slate-200 p-4">
            <label htmlFor="chat-focus-sidebar" className="mb-2 block text-xs font-medium text-slate-600">
              Chat focus
            </label>
            <select
              id="chat-focus-sidebar"
              value={chatFocus}
              onChange={(event) => setChatFocus(event.target.value)}
              className="w-full rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900 outline-none ring-blue-300 focus:ring-2"
            >
              {schemeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="border-t border-slate-200 p-4 text-xs text-slate-500">
            Guberan can make mistakes. Verify details from official scheme sources.
          </div>
        </aside>

        <section className="flex flex-1 flex-col">
          <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-900 xl:text-base">Guberan</h1>
                <p className="text-xs text-slate-500 xl:hidden">India savings and insurance assistant</p>
              </div>
              <div className="flex items-center gap-2 xl:hidden">
                <label htmlFor="chat-focus-mobile" className="text-xs font-medium text-slate-600">
                  Focus
                </label>
                <select
                  id="chat-focus-mobile"
                  value={chatFocus}
                  onChange={(event) => setChatFocus(event.target.value)}
                  className="max-w-[220px] rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 outline-none ring-blue-300 focus:ring-2 sm:text-sm"
                >
                  {schemeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
            {messages.length === 1 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-800 sm:text-3xl">
                  How can I help with your finances today?
                </h2>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleStarterPrompt(prompt)}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`w-fit max-w-[88%] rounded-xl px-4 py-3 sm:max-w-[78%] ${
                    message.role === "assistant"
                      ? "mr-auto border border-slate-200 bg-[#f8fbff] text-slate-800"
                      : "ml-auto bg-blue-700 text-white"
                  }`}
                >
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80">
                    {message.role === "assistant" ? "Guberan" : "You"}
                  </p>
                  <p className="text-sm leading-6">{message.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
            <form onSubmit={handleSend} className="mx-auto max-w-3xl">
              <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={`Message Guberan about ${focusLabel.toLowerCase()}...`}
                  className="max-h-32 min-h-11 flex-1 resize-none border-none px-2 py-2 text-sm text-slate-900 outline-none sm:px-3"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 sm:px-4"
                >
                  Send
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-slate-500">
                Guberan is an informational assistant, not financial advice.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
