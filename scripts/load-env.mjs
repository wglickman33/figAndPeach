import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export function loadEnvFromProjectRoot(importMetaUrl) {
  const root = resolve(dirname(fileURLToPath(importMetaUrl)), "..");
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return root;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
  return root;
}

export function postgresOptions(databaseUrl) {
  const isLocal =
    databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");
  return {
    ssl: isLocal ? false : "require",
    max: 1,
  };
}
