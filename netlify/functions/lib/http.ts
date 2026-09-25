import type { HandlerEvent, HandlerResponse } from "@netlify/functions";

export function json(statusCode: number, body: unknown, extraHeaders?: Record<string, string>): HandlerResponse {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

export function noContent(headers?: Record<string, string>): HandlerResponse {
  return { statusCode: 204, headers: headers ?? {}, body: "" };
}

export function getApiPath(event: HandlerEvent) {
  const raw = event.path.replace(/^\/\.netlify\/functions\/api/, "").replace(/^\/api/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return path.replace(/\/+$/, "") || "/";
}

export function isSecureRequest(event: HandlerEvent) {
  const forwarded = event.headers["x-forwarded-proto"];
  return forwarded === "https" || process.env.CONTEXT === "production";
}

export function readJsonBody<T>(event: HandlerEvent): T | null {
  if (!event.body) return null;
  try {
    return JSON.parse(event.body) as T;
  } catch {
    return null;
  }
}
