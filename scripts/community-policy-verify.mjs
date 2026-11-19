import assert from "node:assert/strict";
import { testLoader } from "./pack-test-utils.mjs";

const { nicknameValue, linkRisk, communityLimits } = testLoader()("lib/community-policy.ts");
assert.equal(nicknameValue("  Café-42  "), "Café-42");
for (const value of ["a", "member@example.test", "Admin", "Official support", "xx\u202e", "A".repeat(33)]) {
  assert.equal(nicknameValue(value), null, value);
}

for (const value of [
  "I strongly disagree. See https://example.org/article.",
  "The guide at http://example.org still needs work.",
  "Try https://bit.ly/example",
  "Try http://127.0.0.1/docs",
  "Try https://[::1]/docs",
  "https://x.test https://a.test https://b.test https://c.test",
  "The page mentions data: values in the exam notes.",
  "Suggested reading: data:value and file: examples.",
  "My contact is www.writer@example.org.",
]) assert.equal(linkRisk(value), "allowed", value);

for (const value of [
  "javascript:alert(1)", "javascript: alert(1)", "data:text/html,test", "file:///etc/hosts",
  "https://user:pass@other.test/path", "http://user@other.test/path",
  "See (//user:pass@other.test/path).", "http:user:pass@other.test/path",
  "ftp://user:pass@other.test/path", "sftp://user:pass@other.test/path",
]) assert.equal(linkRisk(value), "blocked", value);

assert.equal(communityLimits.postsPerMinute, 20);
assert.equal(communityLimits.duplicateSeconds, 10);
console.log("Community nickname, link safety and rolling-window policy passed.");
