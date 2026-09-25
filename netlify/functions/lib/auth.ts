import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { HandlerEvent } from "@netlify/functions";
import { getAdminEmail, getSessionSecret } from "./env";
import { getSql } from "./db";

export type AuthRole = "admin";

export type SessionPayload = {
  email: string;
  role: AuthRole;
};

const COOKIE_NAME = "fnp_session";
const SESSION_TTL = "7d";

function getSecretKey() {
  return new TextEncoder().encode(getSessionSecret());
}

export async function verifyPassword(email: string, password: string): Promise<SessionPayload | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT email, password_hash, role
    FROM admin_users
    WHERE email = ${email.toLowerCase()}
    LIMIT 1
  `;

  const user = rows[0] as { email: string; password_hash: string; role: AuthRole } | undefined;
  if (!user) return null;

  const allowedEmail = getAdminEmail();
  if (user.email !== allowedEmail) return null;

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;

  return { email: user.email, role: user.role };
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecretKey());
}

export async function readSession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const email = typeof payload.email === "string" ? payload.email : "";
    const role = payload.role === "admin" ? "admin" : null;
    if (!email || !role) return null;
    if (email !== getAdminEmail()) return null;
    return { email, role };
  } catch {
    return null;
  }
}

export function parseCookies(event: HandlerEvent): Record<string, string> {
  const header = event.headers.cookie ?? event.headers.Cookie ?? "";
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

export function getSessionFromEvent(event: HandlerEvent) {
  const cookies = parseCookies(event);
  return cookies[COOKIE_NAME] ?? null;
}

export function sessionCookie(token: string, secure: boolean) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${7 * 24 * 60 * 60}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookie(secure: boolean) {
  const parts = [`${COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export async function requireAdmin(event: HandlerEvent): Promise<SessionPayload | null> {
  const token = getSessionFromEvent(event);
  if (!token) return null;
  return readSession(token);
}
