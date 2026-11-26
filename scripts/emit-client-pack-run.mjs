import { writeFileSync } from "fs";
import { fullStateSummary } from "../data/full-state-summary.ts";
import { freeStateContent } from "../data/free-state-content.ts";
import { fullStateSources } from "../data/full-state-sources.ts";
import { prepPacks } from "../lib/prep-pack.ts";
import { eligibleExamPool } from "../lib/quiz.ts";

const ready = Object.fromEntries(Object.entries(fullStateSummary).map(([code, row]) => [code, Boolean(row?.ready)]));
const readyBody = `import type { FreeStateCode } from "../lib/free-state-catalog.ts";

/** Ready flags only. Question ids stay in full-state-summary, which client code must not import. */
export const fullStateReady: Partial<Record<FreeStateCode, boolean>> = ${JSON.stringify(ready, null, 2)};
`;
writeFileSync(new URL("../data/full-state-ready.ts", import.meta.url), readyBody);

const packs = {};
for (const [code, pack] of Object.entries(prepPacks)) {
  const { freeQuestionIds: _ids, ...counts } = pack.counts();
  packs[code] = {
    code: pack.code,
    name: pack.name,
    slug: pack.slug,
    available: pack.available,
    paths: pack.paths,
    topics: pack.topics,
    counts,
    fullCount: pack.fullCount,
    fullCountFree: pack.fullCountFor ? pack.fullCountFor(false) : pack.fullCount,
    fullCountPro: pack.fullCountFor ? pack.fullCountFor(true) : pack.fullCount,
    fullMinutes: pack.fullMinutes,
    fullTitle: pack.fullTitle,
    fullDetail: pack.fullDetail,
    anonKey: pack.anonKey,
    fullReady: pack.fullReady,
    quickReady: pack.quickReady,
    purchaseEnabled: pack.purchaseEnabled !== false,
    handbookUrl: pack.handbookUrl || null,
    officialNext: pack.officialNext,
    practiceNotice: pack.practiceNotice || null,
    freeLaunch: Boolean(pack.freeLaunch),
  };
}
writeFileSync(new URL("../data/client-pack.json", import.meta.url), JSON.stringify(packs));
const freeSources = Object.fromEntries(Object.values(freeStateContent)
  .flatMap(content => content.sources.filter(source => !fullStateSources[source.id]).map(source => [source.id, {
    source_id: source.id, source_type: "SOS", title: source.title, reference: source.reference,
    url: source.url, last_verified_at: source.checkedAt, last_checked_at: source.checkedAt,
  }])));
const sourceIndex = `import type { Source } from "../lib/types.ts";

/** Generated source metadata without the authored practice bank. */
export const freeStateSources: Record<string, Source> = ${JSON.stringify(freeSources, null, 2)};
`;
writeFileSync(new URL("../data/free-state-sources.ts", import.meta.url), sourceIndex);
const pool = eligibleExamPool();
const freeTopics = [...new Set(pool.filter((question) => question.is_free).map((question) => question.topic))];
writeFileSync(new URL("../data/az-public.json", import.meta.url), JSON.stringify({ published: pool.length, freeTopics }));
console.log("packs", Object.keys(packs).length, "az", pool.length);
