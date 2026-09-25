export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  const isProd = process.env.CONTEXT === "production" || process.env.NODE_ENV === "production";
  if (isProd && !secret) {
    throw new Error("SESSION_SECRET must be set in production.");
  }
  return secret ?? "dev-only-change-me";
}

export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? "hellofigandpeach@gmail.com").toLowerCase();
}
