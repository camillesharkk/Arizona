import assert from "node:assert/strict";
import { testLoader } from "./pack-test-utils.mjs";

const load = testLoader();
const { communityInsights, legacyCommunityInsights } = load("data/community-insights.ts");
const records = load("data/community-external-sources.json");
const { parseExternalSources, mergeExternalSources, publicSourceUrl, sourceKey, sourceDate, sourceLinkLabel } = load("lib/community-source.ts");
const { filterCommunitySources } = load("lib/community-source-filter.ts");

const rows = parseExternalSources(records);
const legacyKeys = new Set(legacyCommunityInsights.map(row => sourceKey(row.platform, row.postUrl)));
for (const row of rows) {
  assert.ok(!legacyKeys.has(sourceKey(row.platform, row.postUrl)));
  assert.equal(communityInsights.some(item => item.id === row.id), row.status === "published");
}
const comment = rows.find(row => row.platform === "Reddit" && row.source.type === "comment");
assert.ok(comment);
const equivalent = comment.postUrl.replace("www.reddit.com", "old.reddit.com") + "?utm_source=example";
assert.equal(sourceKey("Reddit", equivalent), sourceKey("Reddit", comment.postUrl));
assert.throws(() => mergeExternalSources(rows, [{ ...comment, id: "reddit-duplicate", postUrl: equivalent }]), /duplicate/);
assert.throws(() => parseExternalSources([{ ...comment, postUrl: comment.source.parentUrl }]), /Invalid/);
assert.equal(sourceDate({ ...comment.source, publishedAt: "2025-01-01", commentPublishedAt: null }), null);
assert.equal(sourceLinkLabel("Reddit", comment.source), "View comment");
assert.equal(sourceLinkLabel("YouTube", { locator: "parent_only" }), "View video");

const hidden = { ...comment, status: "hidden" };
assert.equal(mergeExternalSources([hidden], [comment])[0].status, "hidden");
assert.deepEqual(mergeExternalSources(rows, rows), mergeExternalSources(rows, []));
const hiddenLoad = testLoader({ "./community-external-sources.json": [hidden] });
const filteredCatalog = hiddenLoad("data/community-insights.ts").communityInsights;
assert.ok(!filteredCatalog.some(item => item.id === hidden.id));

for (const [platform, url] of [
  ["Reddit", "http://www.reddit.com/r/Notary/comments/123/"],
  ["Reddit", "https://username@www.reddit.com/r/Notary/comments/123/"],
  ["Reddit", "https://www.reddit.com.example.test/r/Notary/comments/123/"],
  ["Reddit", "javascript:alert(1)"],
  ["Facebook", "https://www.facebook.com/l.php?u=https://example.test/"],
  ["YouTube", "https://www.youtube.com/redirect?q=https://example.test/"],
]) assert.equal(publicSourceUrl(platform, url), null);

for (const row of legacyCommunityInsights) assert.ok(publicSourceUrl(row.platform, row.postUrl), row.id);
const first = filterCommunitySources(communityInsights, { platform: "Reddit" });
const second = filterCommunitySources(communityInsights, { platform: "Reddit", sourcesPage: "2" });
assert.equal(first.results.length, 12);
assert.equal(second.page, 2);
assert.ok(second.results.every(row => row.platform === "Reddit" && !first.results.some(item => item.id === row.id)));
assert.equal(filterCommunitySources(communityInsights, { sourcesPage: "999" }).page,
  filterCommunitySources(communityInsights, {}).lastPage);
const combined = filterCommunitySources(communityInsights, { platform: "YouTube", state: "CA", topic: "Retakes" });
assert.ok(combined.results.length > 0 && combined.results.every(row => row.platform === "YouTube" && row.state === "CA" && row.topic === "Retakes"));
assert.equal(filterCommunitySources(communityInsights, { platform: "YouTube", state: "HI" }).count, 0);
console.log("Verified source locators, URL safety, legacy deduplication, idempotency, hidden isolation, and filters.");
