export function getPublicUrl(request: Request, path: string) {
  return new URL(path, getPublicOrigin(request));
}

function getPublicOrigin(request: Request) {
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const host = forwardedHost ?? firstHeaderValue(request.headers.get("host"));
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));

  if (host && !isUnroutableHost(host)) {
    const proto = forwardedProto ?? (isLocalHost(host) ? "http" : "https");
    return `${proto}://${host}`;
  }

  const appUrl = normalizeAppUrl(process.env.APP_URL);
  if (appUrl) return appUrl;

  try {
    const url = new URL(request.url);
    if (!isUnroutableHost(url.host)) return url.origin;
  } catch {
    // Fall through to local development default.
  }

  return "http://localhost:3000";
}

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function normalizeAppUrl(value: string | undefined) {
  if (!value) return null;

  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  if (!trimmed) return null;

  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

function isUnroutableHost(host: string) {
  return host === "0.0.0.0" || host.startsWith("0.0.0.0:");
}

function isLocalHost(host: string) {
  return host === "localhost" || host.startsWith("localhost:") || host === "127.0.0.1" || host.startsWith("127.0.0.1:");
}

