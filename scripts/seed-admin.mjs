import bcrypt from "bcryptjs";
import postgres from "postgres";
import { loadEnvFromProjectRoot, postgresOptions } from "./load-env.mjs";

loadEnvFromProjectRoot(import.meta.url);

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.ADMIN_EMAIL ?? "hellofigandpeach@gmail.com";
const password = process.env.ADMIN_PASSWORD;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL in .env");
  process.exit(1);
}

if (!password) {
  console.error("Missing ADMIN_PASSWORD in .env (used to seed the admin login)");
  process.exit(1);
}

const sql = postgres(databaseUrl, postgresOptions(databaseUrl));
const passwordHash = await bcrypt.hash(password, 12);

try {
  await sql`
    INSERT INTO admin_users (email, password_hash, role)
    VALUES (${email.toLowerCase()}, ${passwordHash}, 'admin')
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role
  `;
  console.log(`Admin user ready for ${email.toLowerCase()}`);
} finally {
  await sql.end({ timeout: 5 });
}
