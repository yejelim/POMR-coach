const HEALTH_TOKEN_HEADER = "x-health-token";

type HeaderCarrier = { headers: { get(name: string): string | null } };

// Detailed health output is exposed only when BOTH HEALTH_DEBUG=true AND the
// request presents a HEALTH_DEBUG_TOKEN matching the configured secret. This way
// an accidentally-left-on debug flag alone leaks nothing about the backend.
export function canExposeHealthDetails(request: HeaderCarrier): boolean {
  if (process.env.HEALTH_DEBUG !== "true") return false;
  const expected = process.env.HEALTH_DEBUG_TOKEN;
  if (!expected) return false;
  const provided = request.headers.get(HEALTH_TOKEN_HEADER);
  return provided !== null && constantTimeEquals(provided, expected);
}

export function publicHealthError(message: string, exposeDetails: boolean) {
  return exposeDetails ? message : "Health check failed.";
}

function constantTimeEquals(a: string, b: string) {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i += 1) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}
