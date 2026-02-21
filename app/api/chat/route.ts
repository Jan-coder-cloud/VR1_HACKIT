import { NextResponse } from "next/server";

import {
  RecommenderContext,
  runFinancialRecommender,
} from "@/lib/recommender-engine";

export const runtime = "nodejs";

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
