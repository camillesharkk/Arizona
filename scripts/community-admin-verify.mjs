import assert from "node:assert/strict";
import { testLoader } from "./pack-test-utils.mjs";

let session = null;
const mutations = [];
let reads = 0;
const contentId = "dce1c0f0-6b65-43d1-839c-713b5816e361";
const load = testLoader({
  "@/lib/session": { getSession: async () => session },
  "@/lib/community-moderation": { communityModeration: () => ({
    posts: async () => { reads++; return []; },
    apply: async (actorId, input) => {
      mutations.push({ actorId, input });
      return true;
    },
  }) },
  "next/cache": { revalidatePath: () => {} },
  "next/navigation": { redirect: (href) => { throw new Error(href); } },
  "../operations/report.module.css": {},
  "./moderation-form": { ModerationForm: () => null },
});
const { moderateCommunity } = load("app/admin/community/actions.ts");
const { default: CommunityAdmin } = load("app/admin/community/page.tsx");
const view = () => CommunityAdmin({ searchParams: Promise.resolve({ view: "content" }) });
function textOf(node) {
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (typeof node === "string") return node;
  return node?.props ? textOf(node.props.children) : "";
}
const priorAllowlist = process.env.OPERATIONS_ADMIN_EMAILS;
process.env.OPERATIONS_ADMIN_EMAILS = "moderator@example.invalid";
const data = (action, reason = "Confirmed violation", confirmed = false) => {
  const form = new FormData();
  form.set("action", action);
  form.set("id", contentId);
  form.set("reason", reason);
  if (confirmed) form.set("confirm", "yes");
  return form;
};
try {
  await assert.rejects(view, /\/login\/\?next=%2Fadmin%2Fcommunity%2F/);
  assert.equal((await moderateCommunity(null, data("hide"))).ok, false);
  session = { id: "member", email: "member@example.invalid" };
  assert.equal((await moderateCommunity(null, data("ban"))).ok, false);
  assert.equal(mutations.length, 0);
  assert.match(textOf(await view()), /无权查看社区管理/);
  assert.equal(reads, 0);
  session = { id: "moderator", email: "moderator@example.invalid" };
  assert.match(textOf(await view()), /社区管理/);
  assert.equal(reads, 1);
  assert.equal((await moderateCommunity(null, data("restore"))).ok, false);
  assert.equal((await moderateCommunity(null, data("warn", ""))).ok, false);
  assert.equal((await moderateCommunity(null, data("delete-log"))).ok, false);
  assert.equal(mutations.length, 0);
  const form = data("restore", "  Mistake verified  ", true);
  form.set("actorId", "injected");
  assert.equal((await moderateCommunity(null, form)).ok, true);
  assert.equal(mutations[0].actorId, "moderator");
  assert.equal(mutations[0].input.reason, "Mistake verified");
  assert.equal(mutations[0].input.id, contentId);
  console.log("Community admin page and actions: guest and member denied, restore confirmation required, audit deletion rejected, session actor used.");
} finally {
  if (priorAllowlist === undefined) delete process.env.OPERATIONS_ADMIN_EMAILS;
  else process.env.OPERATIONS_ADMIN_EMAILS = priorAllowlist;
}
