export type ListStatus = "loading" | "ready" | "error";

/** Empty copy is only for a finished request. A slow or failed request is not an empty list. */
export function listPhase(status: ListStatus, count: number): "loading" | "error" | "empty" | "list" {
  if (status === "loading" && count === 0) return "loading";
  if (status === "error" && count === 0) return "error";
  if (count === 0) return "empty";
  return "list";
}
