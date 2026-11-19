import assert from "node:assert/strict";
import { testLoader } from "./pack-test-utils.mjs";

const { nicknameValue, linkRisk, duplicates, communityLimits } = testLoader()("lib/community-policy.ts");
assert.equal(nicknameValue("  Café-42  "), "Café-42");
for (const value of ["a", "member@example.test", "Admin", "Official support", "xx\u202e", "A".repeat(33)]) {
  assert.equal(nicknameValue(value), null, value);
}
assert.equal(linkRisk("I strongly disagree. See https://example.org/article."), "allowed");
assert.equal(linkRisk("The guide at http://example.org still needs work."), "allowed");
assert.equal(linkRisk("I dislike the exam"), "allowed");
assert.equal(linkRisk("javascript:alert(1)"), "blocked");
assert.equal(linkRisk("data:text/html,test"), "blocked");
assert.equal(linkRisk("https://example.com@other.test/path"), "pending");
assert.equal(linkRisk("Try https://bit.ly/example"), "pending");
assert.equal(linkRisk("Try http://127.0.0.1/docs"), "pending");
assert.equal(linkRisk("https://x.test https://a.test https://b.test https://c.test"), "pending");
assert.equal(duplicates("Hello.", "hello!"), true);
assert.equal(duplicates("I studied the official manual by reviewing one topic every morning before work.", "I studied the official manual by reviewing one topic every morning before work!"), true);
assert.equal(duplicates("I studied the official manual by reviewing one topic every morning before work.", "I studied the official manual by reviewing one topic every morning before class."), true);
assert.equal(duplicates("Thanks for this explanation", "Thanks for sharing the article"), false);
assert.equal(communityLimits.postsPerMinute, 3);
console.log("Community nickname, link triage, duplicate and quota policy passed.");
