// Completed editorial reviews by stable ID. See docs/question-bank-review-2026-11-19.md.
const batches: ReadonlyArray<readonly [string, readonly string[]]> = [
  ["2026-11-19T10:43:44Z", ["in-025","in-026","in-027","in-028","in-029","in-030","in-031","in-032","in-033","in-034","in-035","in-036","in-037","in-038"]],
  ["2026-11-19T10:43:57Z", ["ca-009","ca-010","ca-011","ca-012","ca-013","ca-019","ca-043","ca-045","ca-046","ca-047","ca-085","ca-086","ca-095","ca-179","ca-180"]],
  ["2026-11-19T10:44:31Z", ["ca-020","ca-097","ca-157","ca-169","ca-181","ca-184","ca-187"]],
  ["2026-11-19T10:45:04Z", ["tx-001","tx-002","tx-003","tx-011","tx-012","tx-013","tx-014","tx-015","tx-017","tx-018","tx-019","tx-020","tx-021","tx-022","tx-023","tx-024","tx-025","tx-026","tx-027","tx-029","tx-030"]],
  ["2026-11-19T10:45:20Z", ["ny-001","ny-002","ny-003","ny-004","ny-005","ny-006","ny-007","ny-008","ny-009","ny-064"]],
  ["2026-11-19T10:45:23Z", ["ca-059","ca-061","ca-183","ca-185","ca-186"]],
  ["2026-11-19T10:46:03Z", ["in-005","in-006","in-007","in-008","in-017","in-018","in-019","in-020","in-021","in-022","in-023","in-024","in-039","in-046","in-047","in-048","in-049","ny-010","ny-011","ny-012"]],
  ["2026-11-19T10:45:04Z", ["ri-001","ri-002","ri-003","ri-004","ri-005","ri-006","ri-007","ri-008","ri-009","ri-010","ri-011","ri-012","ri-013","ri-014","ri-015","ri-016","ri-017","ri-018","ri-019","ri-020","ri-021"]],
  ["2026-11-19T10:46:47Z", ["ny-013","ny-014","ny-015","ny-016","ny-017","ny-018","ny-020","ny-021","ny-028","ny-029","ny-053"]],
  ["2026-11-19T10:46:47Z", ["in-013","in-014","in-015","in-016","in-042","in-043","in-044","in-045"]],
  ["2026-11-19T10:46:58Z", ["ri-022"]],
  ["2026-11-19T10:48:54Z", ["ri-023", "ri-024", "ri-025", "ri-026", "ri-028", "ri-029", "ri-030", "ri-031", "ri-032", "ri-033", "ri-034", "ri-035", "ri-036", "ri-037", "ri-038", "ri-040"]],
  ["2026-11-19T10:47:21Z", ["ny-022", "ny-023", "ny-025", "ny-031"]],
  ["2026-11-19T10:49:10Z", ["az-175", "az-176", "az-177", "az-178", "az-179", "az-180", "az-203", "az-206", "ca-170", "ny-019", "ny-024", "ny-026", "ny-027", "ny-030", "ny-065", "ri-162", "ri-195", "tx-016"]],
  ["2026-11-19T10:51:35Z", ["ca-060", "ri-027", "tx-028"]],
];

export const questionReviewTimestamps = new Map(batches.flatMap(([timestamp, ids]) =>
  ids.map((id) => [id, timestamp] as const),
));

const reviewDate = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
});

export function questionReviewDate(id: string, previous: string): string {
  const timestamp = questionReviewTimestamps.get(id);
  return timestamp ? reviewDate.format(new Date(timestamp)) : previous;
}
