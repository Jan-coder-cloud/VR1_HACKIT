import { NextResponse } from "next/server";

import { syncSchemeDocuments } from "@/lib/vector-store";
import {
  RecommenderContext,
  runFinancialRecommender,
} from "@/lib/recommender-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

let lastAutoSyncMs = 0;
const AUTO_SYNC_INTERVAL_MS = 30_000;

type ChatRequest = {
  message?: string;
  topK?: number;
  context?: RecommenderContext | null;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const now = Date.now();
    if (now - lastAutoSyncMs > AUTO_SYNC_INTERVAL_MS) {
      await syncSchemeDocuments({ status: "all", limit: 5000 });
      lastAutoSyncMs = now;
    }

    const result = await runFinancialRecommender({
      message,
      topK: body.topK,
      context: body.context ?? null,
      history: Array.isArray(body.history) ? body.history.slice(-12) : [],
    });

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unexpected recommender error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
