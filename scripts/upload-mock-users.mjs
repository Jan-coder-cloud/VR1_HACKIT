import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

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

async function main() {
  loadDotEnvLocal();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const sourcePath = path.resolve("mock", "users-eligibility.json");
  if (!fs.existsSync(sourcePath)) {
    throw new Error("mock/users-eligibility.json not found");
  }

  const users = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error("mock/users-eligibility.json must be a non-empty array");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const rows = users.map((u) => ({
    name: String(u.name ?? "").trim(),
    email: String(u.email ?? "").trim(),
    mobile: String(u.mobile ?? "").trim() || null,
    telegram_chat_id: String(u.telegramChatId ?? "").trim() || null,
    annual_income:
      typeof u.annualIncome === "number" && Number.isFinite(u.annualIncome)
        ? u.annualIncome
        : null,
    household_size:
      typeof u.householdSize === "number" && Number.isFinite(u.householdSize)
        ? u.householdSize
        : null,
    location: String(u.location ?? "").trim() || null,
    category: String(u.category ?? "").trim() || null,
    is_vulnerable: Boolean(u.isVulnerable),
    eligibility_tags: Array.isArray(u.eligibilityTags)
      ? u.eligibilityTags.filter((item) => typeof item === "string")
      : [],
    criteria:
      u.criteria && typeof u.criteria === "object" && !Array.isArray(u.criteria)
        ? u.criteria
        : {},
  }));

  const { error } = await supabase.from("beneficiary_users").upsert(rows, {
    onConflict: "email",
  });

  if (error) {
    throw new Error(error.message);
  }

  console.log(`Uploaded ${rows.length} user record(s).`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
