import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { pipeline } from "@xenova/transformers";

function loadDotEnvLocal() {
  const envPath = path.resolve(".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found");
  }

  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function chunkText(text, chunkSize = 1000, overlap = 200) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const chunks = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    const chunk = normalized.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end === normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

async function createEmbedding(extractor, input) {
  const output = await extractor(input, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

function toSchemeId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

async function main() {
  loadDotEnvLocal();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const sourcePath = path.resolve("mock", "schemes.json");
  if (!fs.existsSync(sourcePath)) {
    throw new Error("mock/schemes.json not found");
  }

  const schemes = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  if (!Array.isArray(schemes) || schemes.length === 0) {
    throw new Error("mock/schemes.json must be a non-empty array");
  }

  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let totalRows = 0;

  for (const scheme of schemes) {
    const title = String(scheme.title ?? "Untitled").trim();
    const content = String(scheme.content ?? "").trim();
    const eligibilityTags = Array.isArray(scheme.eligibilityTags)
      ? scheme.eligibilityTags.filter((item) => typeof item === "string")
      : [];
    if (!content) continue;
    const schemeId = toSchemeId(title);

    const { error: upsertSchemeError } = await supabase.from("schemes").upsert(
      {
        id: schemeId,
        name: title,
        category: "Welfare",
        type: "General",
        summary: content,
        eligibility: {
          allowedLivelihood: eligibilityTags,
        },
        eligibility_text: `Eligible groups: ${eligibilityTags.join(", ")}`,
        status: "active",
      },
      { onConflict: "id" }
    );

    if (upsertSchemeError) {
      throw new Error(`Scheme upsert failed for ${title}: ${upsertSchemeError.message}`);
    }

    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .contains("metadata", { scheme_id: schemeId });

    if (deleteError) {
      throw new Error(`Old vector cleanup failed for ${title}: ${deleteError.message}`);
    }

    const chunks = chunkText(content);
    const rows = [];

    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i];
      const embedding = await createEmbedding(extractor, chunk);
      rows.push({
        content: chunk,
        embedding,
        metadata: {
          scheme_id: schemeId,
          title,
          chunk_index: i,
          eligibility_tags: eligibilityTags,
          source: "mock-seed",
        },
      });
    }

    if (rows.length > 0) {
      const { error } = await supabase.from("documents").insert(rows);
      if (error) {
        throw new Error(`Insert failed for ${title}: ${error.message}`);
      }
      totalRows += rows.length;
      console.log(`Uploaded ${rows.length} chunk(s) for: ${title}`);
    }
  }

  console.log(`Done. Total chunks uploaded: ${totalRows}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
