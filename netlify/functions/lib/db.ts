import postgres from "postgres";
import { requireEnv } from "./env";

let sqlClient: ReturnType<typeof postgres> | null = null;

function connectionOptions(databaseUrl: string) {
  const isLocal =
    databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");
  return {
    ssl: isLocal ? (false as const) : ("require" as const),
    max: 1,
  };
}

export function getSql() {
  if (!sqlClient) {
    const databaseUrl = requireEnv("DATABASE_URL");
    sqlClient = postgres(databaseUrl, connectionOptions(databaseUrl));
  }
  return sqlClient;
}
