import "server-only";

import { createEmbedding, chunkText } from "@/lib/embeddings";
import { supabase } from "@/lib/supabase";

export type RetrievedDocument = {
  id: string;
  content: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
};

export type SchemeUpsertPayload = {
  id: string;
  name: string;
  category: "Insurance" | "Savings" | "Investment" | "Pension" | "Welfare";
  type?: "Life" | "Health" | "Investment" | "Pension" | "Critical" | "General";
  provider?: string | null;
  premium?: string | null;
  coverage?: string | null;
  summary?: string | null;
  benefits?: string[];
  keyNotes?: string[];
  minAge?: number | null;
  maxAge?: number | null;
  eligibility?: Record<string, unknown> | null;
  eligibilityText?: string | null;
  recRate?: number | null;
  totalRecommended?: number | null;
  totalAccepted?: number | null;
  tag?: string | null;
  status?: "active" | "draft" | "review" | "archived";
};

export type BeneficiaryUser = {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  telegram_chat_id: string | null;
  eligibility_tags: string[];
  annual_income: number | null;
  household_size: number | null;
  location: string | null;
  category: string | null;
  is_vulnerable: boolean;
  criteria: Record<string, unknown> | null;
};

export async function upsertDocument(args: {
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}) {
  const chunks = chunkText(args.content);

  if (chunks.length === 0) {
    throw new Error("No content to index.");
  }

  const rows: {
    content: string;
    embedding: number[];
    metadata: Record<string, unknown>;
  }[] = [];

  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    const embedding = await createEmbedding(chunk);
    rows.push({
      content: chunk,
      embedding,
      metadata: {
        title: args.title,
        chunk_index: i,
        ...(args.metadata ?? {}),
      },
    });
  }

  const { error } = await supabase.from("documents").insert(rows);

  if (error) {
    throw new Error(error.message);
  }

  return { chunksStored: rows.length };
}

function buildSchemeDocumentText(scheme: SchemeUpsertPayload) {
  return [
    `Scheme: ${scheme.name}`,
    scheme.summary ? `Summary: ${scheme.summary}` : "",
    scheme.provider ? `Provider: ${scheme.provider}` : "",
    scheme.coverage ? `Coverage: ${scheme.coverage}` : "",
    scheme.premium ? `Premium: ${scheme.premium}` : "",
    scheme.eligibilityText ? `Eligibility: ${scheme.eligibilityText}` : "",
    Array.isArray(scheme.benefits) && scheme.benefits.length > 0
      ? `Benefits: ${scheme.benefits.join("; ")}`
      : "",
    Array.isArray(scheme.keyNotes) && scheme.keyNotes.length > 0
      ? `Notes: ${scheme.keyNotes.join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function upsertSchemeAndDocument(scheme: SchemeUpsertPayload) {
  const schemeId = scheme.id.trim();
  const schemeName = scheme.name.trim();

  if (!schemeId || !schemeName) {
    throw new Error("Scheme id and name are required.");
  }

  const schemeRow = {
    id: schemeId,
    name: schemeName,
    category: scheme.category,
    type: scheme.type ?? null,
    provider: scheme.provider ?? null,
    premium: scheme.premium ?? null,
    coverage: scheme.coverage ?? null,
    summary: scheme.summary ?? null,
    benefits: scheme.benefits ?? [],
    key_notes: scheme.keyNotes ?? [],
    min_age: scheme.minAge ?? null,
    max_age: scheme.maxAge ?? null,
    eligibility: scheme.eligibility ?? {},
    eligibility_text: scheme.eligibilityText ?? null,
    rec_rate: scheme.recRate ?? null,
    total_recommended: scheme.totalRecommended ?? null,
    total_accepted: scheme.totalAccepted ?? null,
    tag: scheme.tag ?? null,
    status: scheme.status ?? "draft",
    updated_at: new Date().toISOString(),
  };

  const { error: schemeError } = await supabase
    .from("schemes")
    .upsert(schemeRow, { onConflict: "id" });

  if (schemeError) {
    throw new Error(`Failed to upsert scheme: ${schemeError.message}`);
  }

  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .contains("metadata", { scheme_id: schemeId });

  if (deleteError) {
    throw new Error(`Failed to replace scheme vectors: ${deleteError.message}`);
  }

  const documentText = buildSchemeDocumentText(scheme);
  const result = await upsertDocument({
    title: schemeName,
    content: documentText,
      metadata: {
        scheme_id: schemeId,
        title: schemeName,
        eligibility_tags: Array.isArray(scheme.eligibility?.allowedLivelihood)
          ? scheme.eligibility?.allowedLivelihood
          : [],
        source: "scheme-upsert",
        status: scheme.status ?? "draft",
        scheme_updated_at: schemeRow.updated_at,
      },
    });

  return {
    schemeId,
    chunksStored: result.chunksStored,
  };
}

function extractEligibilityTagsFromSchemeEligibility(eligibility: Record<string, unknown> | null) {
  if (!eligibility) return [] as string[];

  const allowed = eligibility.allowedLivelihood;
  if (Array.isArray(allowed)) {
    return allowed.filter((item): item is string => typeof item === "string");
  }

  return [];
}

function buildSchemeDocumentTextFromRecord(scheme: SchemeRecord) {
  return [
    `Scheme: ${scheme.name}`,
    scheme.summary ? `Summary: ${scheme.summary}` : "",
    scheme.provider ? `Provider: ${scheme.provider}` : "",
    scheme.coverage ? `Coverage: ${scheme.coverage}` : "",
    scheme.premium ? `Premium: ${scheme.premium}` : "",
    scheme.eligibility_text ? `Eligibility: ${scheme.eligibility_text}` : "",
    Array.isArray(scheme.benefits) && scheme.benefits.length > 0
      ? `Benefits: ${scheme.benefits.join("; ")}`
      : "",
    Array.isArray(scheme.key_notes) && scheme.key_notes.length > 0
      ? `Notes: ${scheme.key_notes.join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function reindexSchemeDocument(args: {
  scheme: SchemeRecord;
  source: "scheme-backfill" | "scheme-sync";
}) {
  const { scheme, source } = args;
  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .contains("metadata", { scheme_id: scheme.id });

  if (deleteError) {
    throw new Error(`Failed to clear vectors for scheme ${scheme.id}: ${deleteError.message}`);
  }

  const content = buildSchemeDocumentTextFromRecord(scheme);
  const eligibilityTags = extractEligibilityTagsFromSchemeEligibility(
    (scheme.eligibility ?? null) as Record<string, unknown> | null
  );

  const result = await upsertDocument({
    title: scheme.name,
    content,
    metadata: {
      scheme_id: scheme.id,
      title: scheme.name,
      eligibility_tags: eligibilityTags,
      source,
      status: scheme.status,
      scheme_updated_at: scheme.updated_at,
    },
  });

  return result.chunksStored;
}

export async function backfillSchemeDocuments(args?: {
  limit?: number;
  status?: SchemeRecord["status"] | "all";
}) {
  const limit = Math.min(Math.max(args?.limit ?? 500, 1), 5000);
  const status = args?.status ?? "all";

  let query = supabase
    .from("schemes")
    .select(
      "id,name,category,type,provider,premium,coverage,summary,benefits,key_notes,min_age,max_age,eligibility,eligibility_text,rec_rate,total_recommended,total_accepted,tag,status,created_at,updated_at"
    )
    .order("name", { ascending: true })
    .limit(limit);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load schemes for backfill: ${error.message}`);
  }

  const schemes = (data ?? []) as SchemeRecord[];
  let processed = 0;
  let chunksStored = 0;

  for (const scheme of schemes) {
    const stored = await reindexSchemeDocument({
      scheme,
      source: "scheme-backfill",
    });
    processed += 1;
    chunksStored += stored;
  }

  return {
    processed,
    chunksStored,
  };
}

export async function syncSchemeDocuments(args?: {
  limit?: number;
  status?: SchemeRecord["status"] | "all";
}) {
  const limit = Math.min(Math.max(args?.limit ?? 500, 1), 5000);
  const status = args?.status ?? "all";
  const allSchemes = await listSchemesDetailed(limit);
  const schemes =
    status === "all" ? allSchemes : allSchemes.filter((scheme) => scheme.status === status);

  let checked = 0;
  let reindexed = 0;
  let skipped = 0;
  let chunksStored = 0;

  for (const scheme of schemes) {
    checked += 1;
    const { data, error } = await supabase
      .from("documents")
      .select("metadata")
      .contains("metadata", { scheme_id: scheme.id })
      .limit(1);

    if (error) {
      throw new Error(`Failed to inspect vectors for scheme ${scheme.id}: ${error.message}`);
    }

    const row = data?.[0] as { metadata?: Record<string, unknown> } | undefined;
    const metadata = (row?.metadata ?? {}) as Record<string, unknown>;
    const indexedAt = typeof metadata.scheme_updated_at === "string" ? metadata.scheme_updated_at : null;
    const needsReindex = !row || indexedAt !== scheme.updated_at;

    if (!needsReindex) {
      skipped += 1;
      continue;
    }

    const stored = await reindexSchemeDocument({
      scheme,
      source: "scheme-sync",
    });
    reindexed += 1;
    chunksStored += stored;
  }

  return {
    checked,
    reindexed,
    skipped,
    chunksStored,
  };
}

export async function retrieveRelevantDocuments(query: string, matchCount = 5) {
  const embedding = await createEmbedding(query);

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_count: matchCount,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RetrievedDocument[];
}

export async function listSchemes(limit = 100) {
  const { data, error } = await supabase
    .from("schemes")
    .select("id,name,category,status")
    .order("name", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export type SchemeRecord = {
  id: string;
  name: string;
  category: "Insurance" | "Savings" | "Investment" | "Pension" | "Welfare";
  type: "Life" | "Health" | "Investment" | "Pension" | "Critical" | "General" | null;
  provider: string | null;
  premium: string | null;
  coverage: string | null;
  summary: string | null;
  benefits: string[] | null;
  key_notes: string[] | null;
  min_age: number | null;
  max_age: number | null;
  eligibility: Record<string, unknown> | null;
  eligibility_text: string | null;
  rec_rate: number | null;
  total_recommended: number | null;
  total_accepted: number | null;
  tag: string | null;
  status: "active" | "draft" | "review" | "archived";
  created_at: string;
  updated_at: string;
};

export async function listSchemesDetailed(limit = 200) {
  const { data, error } = await supabase
    .from("schemes")
    .select(
      "id,name,category,type,provider,premium,coverage,summary,benefits,key_notes,min_age,max_age,eligibility,eligibility_text,rec_rate,total_recommended,total_accepted,tag,status,created_at,updated_at"
    )
    .order("name", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SchemeRecord[];
}

export type RecommendationLogRecord = {
  id: number;
  name: string;
  schemes: string;
  score: number;
  outcome: "accepted" | "rejected" | "pending";
  time: string;
};

export async function listRecommendationLogs(limit = 500) {
  const { data, error } = await supabase
    .from("recommendation_logs")
    .select("id,name,schemes,score,outcome,time")
    .order("id", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RecommendationLogRecord[];
}

export async function listBeneficiaryUsers(limit = 100) {
  const { data, error } = await supabase
    .from("beneficiary_users")
    .select("id,name,email,mobile,telegram_chat_id")
    .order("name", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listBeneficiaryUsersDetailed(limit = 500) {
  const { data, error } = await supabase
    .from("beneficiary_users")
    .select(
      "id,name,email,mobile,telegram_chat_id,eligibility_tags,annual_income,household_size,location,category,is_vulnerable,criteria"
    )
    .order("name", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as BeneficiaryUser[];
}

export function pickBestScheme(matches: RetrievedDocument[]) {
  const top = matches[0];

  if (!top) {
    return null;
  }

  const metadata = (top.metadata ?? {}) as Record<string, unknown>;
  const title =
    typeof metadata.title === "string" && metadata.title.trim()
      ? metadata.title.trim()
      : "Untitled";
  const rawTags = metadata.eligibility_tags;
  const eligibilityTags = Array.isArray(rawTags)
    ? rawTags.filter((tag): tag is string => typeof tag === "string")
    : [];

  return {
    title,
    eligibilityTags,
  };
}

export async function getEligibleUsers(eligibilityTags: string[]) {
  if (eligibilityTags.length === 0) {
    return [] as BeneficiaryUser[];
  }

  const { data, error } = await supabase
    .from("beneficiary_users")
    .select(
      "id,name,email,mobile,telegram_chat_id,eligibility_tags,annual_income,household_size,location,category,is_vulnerable,criteria"
    )
    .overlaps("eligibility_tags", eligibilityTags);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as BeneficiaryUser[];
}

export async function getUsersByIds(userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds.filter((id) => id.trim().length > 0)));

  if (uniqueIds.length === 0) {
    return [] as BeneficiaryUser[];
  }

  const { data, error } = await supabase
    .from("beneficiary_users")
    .select(
      "id,name,email,mobile,telegram_chat_id,eligibility_tags,annual_income,household_size,location,category,is_vulnerable,criteria"
    )
    .in("id", uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as BeneficiaryUser[];
}

export function rankProminentUsers(args: {
  users: BeneficiaryUser[];
  schemeTags: string[];
  adminMessage: string;
  limit?: number;
}) {
  const limit = args.limit ?? 5;
  const lowerMessage = args.adminMessage.toLowerCase();
  const targetVulnerableFamilies =
    lowerMessage.includes("vulnerable families") ||
    lowerMessage.includes("vulnerable family") ||
    (args.schemeTags.includes("low-income") && args.schemeTags.includes("family"));

  const scored = args.users.map((user) => {
    const userTags = user.eligibility_tags ?? [];
    const tagMatches = args.schemeTags.filter((tag) => userTags.includes(tag)).length;
    const income = user.annual_income ?? Number.POSITIVE_INFINITY;
    const incomeScore =
      Number.isFinite(income) && income > 0 ? Math.max(0, 300000 - income) / 300000 : 0;
    const vulnerabilityScore = user.is_vulnerable ? 1 : 0;
    const familyScore = userTags.includes("family") ? 1 : 0;

    const score = targetVulnerableFamilies
      ? tagMatches * 2 + vulnerabilityScore * 2 + familyScore + incomeScore
      : tagMatches * 2 + vulnerabilityScore + incomeScore * 0.5;

    return {
      ...user,
      score,
      tagMatches,
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const ai = a.annual_income ?? Number.POSITIVE_INFINITY;
    const bi = b.annual_income ?? Number.POSITIVE_INFINITY;
    return ai - bi;
  });

  return scored.slice(0, limit);
}

export async function queueNotifications(args: {
  schemeTitle: string;
  users: BeneficiaryUser[];
  message: string;
  channels?: Array<"email" | "sms" | "telegram">;
  status?: string;
}) {
  const channels = args.channels ?? ["email", "telegram"];
  const status = args.status ?? "queued";

  const rows: {
    user_id: string;
    scheme_title: string;
    channel: "email" | "sms" | "telegram";
    target: string;
    message: string;
    status: string;
  }[] = [];

  for (const user of args.users) {
    if (channels.includes("email")) {
      rows.push({
        user_id: user.id,
        scheme_title: args.schemeTitle,
        channel: "email",
        target: user.email,
        message: args.message,
        status,
      });
    }

    if (channels.includes("sms") && user.mobile) {
      rows.push({
        user_id: user.id,
        scheme_title: args.schemeTitle,
        channel: "sms",
        target: user.mobile,
        message: args.message,
        status,
      });
    }

    if (channels.includes("telegram") && user.telegram_chat_id) {
      rows.push({
        user_id: user.id,
        scheme_title: args.schemeTitle,
        channel: "telegram",
        target: user.telegram_chat_id,
        message: args.message,
        status,
      });
    }
  }

  if (rows.length === 0) {
    return { queued: 0 };
  }

  const { error } = await supabase.from("notifications").insert(rows);

  if (error) {
    throw new Error(error.message);
  }

  return { queued: rows.length };
}

