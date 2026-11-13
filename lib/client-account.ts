"use client";

let inflight: Promise<Response> | undefined;

/** Share simultaneous reads only. A later read always rechecks the server session. */
export async function fetchAccount(options: RequestInit = {}) {
  options.signal?.throwIfAborted();
  if (!inflight) {
    const request = fetch("/api/auth/me/", { cache: "no-store", signal: AbortSignal.timeout(30000) });
    inflight = request;
    void request.finally(() => { if (inflight === request) inflight = undefined; }).catch(() => undefined);
  }
  const response = await inflight;
  options.signal?.throwIfAborted();
  return response.clone();
}

export function invalidateAccountRead() {
  inflight = undefined;
}
