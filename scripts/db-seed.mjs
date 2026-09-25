import postgres from "postgres";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFromProjectRoot, postgresOptions } from "./load-env.mjs";

const root = loadEnvFromProjectRoot(import.meta.url);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL in .env");
  process.exit(1);
}

const seedSql = readFileSync(resolve(root, "db/seed.sql"), "utf8");
const sql = postgres(databaseUrl, postgresOptions(databaseUrl));

try {
  for (const statement of seedSql.split(";").map((part) => part.trim()).filter(Boolean)) {
    await sql.unsafe(statement);
  }
  console.log("Seed data applied (categories + customization groups).");
} finally {
  await sql.end({ timeout: 5 });
}
