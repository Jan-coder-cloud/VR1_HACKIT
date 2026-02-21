import { NextResponse } from "next/server";

import { upsertDocument, upsertSchemeAndDocument } from "@/lib/vector-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      content?: string;
      metadata?: Record<string, unknown>;
      scheme?: {
        id?: string;
        name?: string;
        category?: "Insurance" | "Savings" | "Investment" | "Pension" | "Welfare";
        type?: "Life" | "Health" | "Investment" | "Pension" | "Critical" | "General";
        provider?: string;
        premium?: string;
        coverage?: string;
        summary?: string;
        benefits?: string[];
        keyNotes?: string[];
        minAge?: number;
        maxAge?: number;
        eligibility?: Record<string, unknown>;
        eligibilityText?: string;
        recRate?: number;
        totalRecommended?: number;
        totalAccepted?: number;
        tag?: string;
        status?: "active" | "draft" | "review" | "archived";
      };
    };

    if (body.scheme?.id && body.scheme?.name && body.scheme?.category) {
      const result = await upsertSchemeAndDocument({
        id: body.scheme.id,
        name: body.scheme.name,
        category: body.scheme.category,
        type: body.scheme.type,
        provider: body.scheme.provider ?? null,
        premium: body.scheme.premium ?? null,
        coverage: body.scheme.coverage ?? null,
        summary: body.scheme.summary ?? null,
        benefits: body.scheme.benefits ?? [],
        keyNotes: body.scheme.keyNotes ?? [],
        minAge: body.scheme.minAge ?? null,
        maxAge: body.scheme.maxAge ?? null,
        eligibility: body.scheme.eligibility ?? {},
        eligibilityText: body.scheme.eligibilityText ?? null,
        recRate: body.scheme.recRate ?? null,
        totalRecommended: body.scheme.totalRecommended ?? null,
        totalAccepted: body.scheme.totalAccepted ?? null,
        tag: body.scheme.tag ?? null,
        status: body.scheme.status ?? "draft",
      });

      return NextResponse.json({
        success: true,
        schemeId: result.schemeId,
        chunksStored: result.chunksStored,
      });
    }

    const title = body.title?.trim();
    const content = body.content?.trim();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Missing title or content" },
        { status: 400 }
      );
    }

    const result = await upsertDocument({
      title,
      content,
      metadata: body.metadata ?? {},
    });

    return NextResponse.json({
      success: true,
      chunksStored: result.chunksStored,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected vector upsert error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
