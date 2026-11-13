type IndianaStart = { examId: string; seed: number; questionIds: string[]; questions?: import("@/lib/types").Question[] };
const pending = new Map<string, Promise<IndianaStart>>();
/** Keep the cookie-bearing request alive across Strict Mode effect cancellation. */
export function startIndianaPractice(owner: string, examId?: string): Promise<IndianaStart> {
  const current = pending.get(owner); if (current) return current;
  const request = fetch("/api/indiana/sitting/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start", accountId: owner === "guest" ? undefined : owner, examId: examId || crypto.randomUUID() }) }).then(async response => {
    const body = await response.json(); if (!response.ok) throw new Error(body.error || "Could not start Indiana mock"); return body as IndianaStart;
  }).catch(error => { pending.delete(owner); throw error; });
  pending.set(owner, request); return request;
}
export function clearIndianaStart(owner: string) { pending.delete(owner); }
