/**
 * Analytics sink. Events are non-identifying by construction (the client
 * sanitizes to an allowlist); this endpoint simply acknowledges and never
 * persists request bodies, so no PII can accumulate here.
 */
export function POST(): Response {
  return new Response(null, { status: 204 });
}
