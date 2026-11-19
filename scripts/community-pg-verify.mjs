import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import postgres from "postgres";
import { testLoader } from "./pack-test-utils.mjs";

// Only the isolated schema-only Neon preview previously used for this project.
const url = process.env.COMMUNITY_TEST_DATABASE_URL;
assert.ok(url, "Set COMMUNITY_TEST_DATABASE_URL to the isolated preview Neon endpoint");
assert.equal(new URL(url).hostname, "ep-still-voice-a74guk0q.ap-southeast-2.aws.neon.tech");
const schema = `community_qa_${randomUUID().replaceAll("-", "")}`;
const operator = postgres(url, { max: 1, ssl: "require", onnotice: () => {} });
const sql = postgres(url, { max: 1, ssl: "require" });
const secondSql = postgres(url, { max: 1, ssl: "require" });
const load = testLoader({
  "next/cache": { revalidatePath: () => {} },
  "@/lib/session": { getSession: async () => ({ id: "e" }) },
  "@/lib/community-store": { communityStore: () => store },
  "@/lib/store/pg-store": { getPgSql: () => { throw new Error("Production storage is forbidden in this test."); } },
});
const store = load("lib/community-store.ts").communityStore(sql);
const secondStore = load("lib/community-store.ts").communityStore(secondSql);
const moderator = load("lib/community-moderation.ts").communityModeration(sql);
const migration = (file) => readFile(new URL("../db/migrations/" + file + ".sql", import.meta.url), "utf8");

try {
  await operator`create schema ${operator(schema)}`;
  for (const client of [sql, secondSql]) {
    await client`set search_path to ${client(schema)}`;
    assert.equal((await client`select current_schema() as name`)[0].name, schema);
  }
  await sql.unsafe(await migration("001_init"));
  await sql.unsafe(await migration("003_entitlements"));
  await sql`alter table users add column deleted_at timestamptz`;
  await sql.unsafe(await migration("019_community_discussions"));
  await sql`
    insert into users (id, name, email, password_hash, email_verified, plan)
    values ('a','Alice Example','a@example.invalid','fixture',true,'pro'),
           ('b','Bob Example','b@example.invalid','fixture',true,'free'),
           ('c','Chris Example','c@example.invalid','fixture',true,'free'),
           ('d','Dale Example','d@example.invalid','fixture',true,'free'),
           ('e','Edition Example','e@example.invalid','fixture',true,'free')
  `;
  const legacyId = randomUUID();
  await sql`
    insert into community_posts (id, user_id, title, body, created_at)
    values (${legacyId}, 'a', 'Pre-migration post', 'Legacy author should stay private.', now() - interval '2 days')
  `;
  const latestMigration = await migration("021_community_moderation");
  await sql.begin(tx => tx.unsafe(latestMigration));
  assert.equal((await store.thread(null, legacyId, null)).post.author, "Community member", "Existing real name is never a fallback");
  await sql`
    insert into entitlements (id, user_id, product_code, state, status, starts_at, expires_at, provider, provider_order_id)
    values ('fixture-pro', 'a','az_exam_pro_60d','AZ','active',now(),now() + interval '30 days','mock','fixture-pro')
  `;
  await sql`
    insert into question_stats (user_id, question_id, topic, bank, chapter, right_count)
    values ('a', 'fixture-question', 'identity', 'az', 'identity', 4)
  `;

  const first = { id: randomUUID(), userId: "a", title: "First question", body: "How should I study? I disagree with the suggested plan.", insightId: null, parentId: null };
  const second = { ...first, id: randomUUID(), userId: "b", title: "Second question", body: "How can I check https://example.com/official-guide?" };
  const editorial = { ...first, id: randomUUID(), userId: "c", title: null, body: "The official handbook is helpful.", insightId: "az-manual-navigation" };
  assert.equal((await store.publish(first)).code, "nickname", "Auth account names do not enable posting");
  for (const [user, name] of [["a", "Desert Owl"], ["b", "Study Buddy"], ["c", "Blue Pen"], ["d", "West Reader"], ["e", "Study Editor"]]) await store.setNickname(user, name);
  for (const post of [first, second, editorial]) {
    assert.equal((await store.publish(post)).status, "published", "New accounts and ordinary links publish immediately");
  }
  assert.equal((await store.thread(null, first.id, null)).post.author, "Desert Owl");
  assert.doesNotMatch(JSON.stringify(await store.thread(null, first.id, null)), /Alice Example|example\.invalid|user_id|email/);
  await sql`update community_posts set created_at = now() - interval '2 minutes' where id = ${first.id}`;
  assert.equal((await store.list(null, null, 0)).posts[0].id, second.id, "Newest wins an engagement tie");
  assert.equal((await store.list(editorial.insightId, "b", 0)).posts[0].id, editorial.id);
  assert.equal((await store.list("different-insight", "b", 0)).posts.length, 0);
  assert.equal((await store.publish({ ...first, id: randomUUID(), body: "Try javascript:alert(1)" })).code, "link");

  await Promise.all([store.setInsightLike(editorial.insightId, "b", true), secondStore.setInsightLike(editorial.insightId, "b", true)]);
  assert.deepEqual(await store.insightLikes(editorial.insightId, "b"), { likes: 1, liked: true });
  assert.equal((await store.insightLikes(editorial.insightId, null)).liked, false);
  assert.equal((await store.insightLikes("different-insight", "b")).likes, 0);
  assert.deepEqual([...(await store.insightActivity([editorial.insightId, "different-insight"], "b"))], [
    { id: editorial.insightId, likes: 1, liked: true, comments: 1 },
    { id: "different-insight", likes: 0, liked: false, comments: 0 },
  ]);
  await store.setInsightLike(editorial.insightId, "b", false);
  assert.equal((await store.insightLikes(editorial.insightId, "b")).likes, 0);
  await Promise.all([store.setLike(first.id, "b", true), secondStore.setLike(first.id, "b", true)]);
  const feed = await store.list(null, "b", 0);
  assert.equal(feed.posts[0].id, first.id, "Unique like raises engagement");
  assert.equal(feed.posts[0].likes, 1);
  assert.equal(feed.posts[0].liked, true);
  assert.equal((await store.list(null, null, 0)).posts[0].liked, false);
  await store.setLike(first.id, "b", false);
  assert.equal((await store.thread(null, first.id, "b")).post.likes, 0);

  const reply = { id: randomUUID(), userId: "d", title: null, body: "Read the official manual.", insightId: null, parentId: first.id };
  const retries = await Promise.all([store.publish(reply), secondStore.publish(reply)]);
  assert.ok(retries.every((value) => value.status === "published" && value.threadId === first.id));
  assert.equal((await sql`select count(*)::int as count from community_posts where id = ${reply.id}`)[0].count, 1);
  const nested = { ...reply, id: randomUUID(), userId: "c", parentId: reply.id, body: "Thanks for the study reference." };
  assert.equal((await store.publish(nested)).status, "published");
  const badReply = { ...reply, id: randomUUID(), body: "Can I cross an editorial thread?", parentId: editorial.id };
  assert.equal((await store.publish(badReply)).code, "missing");
  assert.equal(await store.thread(editorial.insightId, first.id, "b"), null, "Cannot view a thread in another feed");
  const thread = await store.thread(null, first.id, "d");
  assert.equal(thread.post.replies, 2, "Nested reply included in engagement");
  assert.equal(thread.replies[0].mine, true);
  assert.equal(thread.replies[1].parentId, reply.id);
  assert.equal((await store.list(null, null, 0)).posts[0].id, first.id);
  assert.equal(await store.remove(reply.id, "b"), false, "Cross-user deletion denied");

  const suspicious = { ...first, id: randomUUID(), userId: "b", title: "Short link", body: "This is the resource https://bit.ly/example." };
  const pendingReply = { ...reply, id: randomUUID(), body: "Try https://user@example.invalid/resource." };
  // These records represent the review queue from before immediate publication.
  await sql`insert into community_posts (id, user_id, title, body, moderation_status)
    values (${suspicious.id}, ${suspicious.userId}, ${suspicious.title}, ${suspicious.body}, 'pending')`;
  await sql`insert into community_posts (id, user_id, parent_id, thread_id, depth, body, moderation_status)
    values (${pendingReply.id}, ${pendingReply.userId}, ${first.id}, ${first.id}, 1, ${pendingReply.body}, 'pending')`;
  assert.equal((await store.publish({
    ...suspicious, id: randomUUID(), title: "Another discussion",
  })).status, "published", "A new ordinary short-link post is independent of the old review queue");
  assert.equal(await store.thread(null, suspicious.id, null), null);
  assert.equal(await store.thread(null, suspicious.id, "b"), null, "Only the private author view returns pending content");
  assert.equal((await store.member("b")).pending[0].id, suspicious.id);
  assert.equal((await store.publish(suspicious)).status, "pending", "A legacy in-flight retry does not publish pending content");
  assert.equal((await store.member("a")).pending.length, 0);
  assert.equal((await store.thread(null, first.id, null)).replies.some((row) => row.id === pendingReply.id), false);
  assert.equal((await moderator.posts("review", 0)).length, 2);
  assert.equal(await store.report(pendingReply.id, "a", "spam", ""), "missing");

  const firstReports = await Promise.all([store.report(first.id, "b", "spam", "Check the first post."), secondStore.report(first.id, "b", "spam", "")]);
  assert.deepEqual(firstReports.sort(), ["duplicate", "reported"]);
  assert.equal(await store.report(reply.id, "a", "harassment", "Check this reply."), "reported");
  assert.equal(await store.report(first.id, "c", "other", "Independent report."), "reported");
  assert.equal((await moderator.reports(0)).length, 3);
  assert.ok(await store.thread(null, first.id, null), "Reports alone must not hide the content");
  assert.doesNotMatch(JSON.stringify(await store.thread(null, first.id, null)), /Independent report|Check this reply|reporter_id/);

  const apply = (action, id, reason, confirm = null) => moderator.apply("moderator", { action, id, reason, confirm });
  assert.equal(await apply("hide", reply.id, "Hide this reply independently."), true);
  assert.equal(await apply("hide", first.id, "Hide the whole thread."), true);
  assert.equal(await store.thread(null, first.id, null), null);
  assert.equal(await store.thread(null, first.id, "a"), null);
  assert.equal(await store.thread(null, reply.id, null), null);
  assert.equal(await store.report(nested.id, "b", "spam", ""), "missing");
  assert.equal(await apply("restore", first.id, "Verified the root."), false, "An explicit confirmation is required");
  assert.equal(await apply("restore", first.id, "Verified the root.", "yes"), true);
  const restored = await store.thread(null, first.id, null);
  assert.equal(restored.post.body, first.body, "Moderator hiding preserves original text");
  assert.equal(restored.replies.some((row) => row.id === reply.id), false, "Root restoration leaves separately hidden replies hidden");
  assert.equal(restored.replies.find((row) => row.id === nested.id)?.parentId, first.id, "Visible nested reply remains accessible");
  assert.equal((await moderator.post(reply.id)).body, reply.body);
  assert.equal(await apply("restore", reply.id, "Verified the reply.", "yes"), true);
  assert.equal((await store.thread(null, first.id, null)).replies[0].id, reply.id);
  assert.equal(await apply("approve", pendingReply.id, "The destination is safe."), true);
  assert.equal((await store.thread(null, first.id, null)).replies.some((row) => row.id === pendingReply.id), true);
  assert.equal(await apply("reject", suspicious.id, "The destination could not be verified."), true);
  assert.equal(await store.thread(null, suspicious.id, null), null);
  assert.equal((await moderator.post(suspicious.id)).body, suspicious.body);
  assert.equal((await store.member("b")).pending.length, 0);

  const reported = (await moderator.reports(0)).find((row) => row.post_id === reply.id);
  assert.equal(await apply("resolve-report", reported.id, "Reviewed the reported reply."), true);
  assert.equal(await apply("resolve-report", reported.id, "Second resolution."), false);
  assert.ok((await moderator.reports(0)).find((row) => row.id === reported.id)?.resolved_at);
  assert.equal(await apply("warn", first.id, "Please keep future remarks focused on the topic."), true);
  assert.equal((await store.member("a")).warnings[0].reason, "Please keep future remarks focused on the topic.");
  assert.equal((await store.member("b")).warnings.length, 0);
  const deletedBanTarget = { ...first, id: randomUUID(), body: "I will add more study ideas later." };
  assert.equal((await store.publish(deletedBanTarget)).status, "published");
  assert.equal(await apply("ban", deletedBanTarget.id, "Repeated violations confirmed."), true);
  assert.equal((await store.member("a")).banned, true);
  assert.equal((await store.publish({ ...first, id: randomUUID(), body: "Post while banned." })).code, "banned");
  assert.equal((await store.publish({ ...reply, id: randomUUID(), userId: "a", body: "Reply while banned." })).code, "banned");
  assert.equal(await store.report(reply.id, "a", "spam", ""), "banned");
  assert.deepEqual((await sql`
    select u.plan, u.email_verified, e.status, q.right_count
    from users u join entitlements e on e.user_id = u.id join question_stats q on q.user_id = u.id where u.id = 'a'
  `)[0], { plan: "pro", email_verified: true, status: "active", right_count: 4 }, "Community restriction never changes account, paid or study data");
  assert.equal(await store.remove(deletedBanTarget.id, "a"), true);
  assert.equal(await apply("hide", deletedBanTarget.id, "Already deleted."), false);
  assert.equal(await apply("unban", deletedBanTarget.id, "Restriction lifted."), true, "An audit target can still lift a ban after author deletion of that post");
  assert.equal((await store.member("a")).banned, false);
  assert.equal((await store.publish({ ...first, id: randomUUID(), body: "Study group starts next week." })).status, "published");

  const { publishDiscussion } = load("app/community-insights/actions.ts");
  // The action's database guard sees only the isolated binding.
  process.env.DATABASE_URL = url;
  function submit(post) {
    const form = new FormData();
    for (const key of ["id", "insightId", "parentId", "title", "body"]) {
      if (post[key] !== null) form.set(key, post[key]);
    }
    return publishDiscussion({ message: "" }, form);
  }
  const makeReply = (body, parentId = first.id) => ({
    id: randomUUID(), userId: "e", title: null, parentId, body, insightId: null,
  });
  const publishBody = async (body, target) => {
    const post = makeReply(body, target);
    const result = await submit(post);
    assert.equal(result.status, "published", result.message);
    return post;
  };

  const thanks = await publishBody("Thank you");
  const duplicate = await submit({ ...thanks, id: randomUUID() });
  assert.equal(duplicate.status, undefined);
  assert.match(duplicate.message, /identical|same|already|twice/i);
  assert.equal((await submit(thanks)).status, "published", "Request-ID retry must succeed");
  assert.equal((await sql`select count(*)::int as count from community_posts
    where user_id = 'e' and parent_id = ${first.id} and body = 'Thank you'`)[0].count, 1);
  await publishBody("Thank you", second.id);
  await sql`update community_posts set created_at = clock_timestamp() - interval '11 seconds'
    where id = ${thanks.id}`;
  await publishBody("Thank you");
  await publishBody("For the application rule, I am comparing subsection 2 with this interpretation.");
  await publishBody("For the application rule, I am comparing subsection 3 with this interpretation.");
  await publishBody("The statute says: a notary shall keep a journal. I read this as requiring a record.");
  await publishBody("The statute says: a notary shall keep a journal. The effective date is worth noting.");
  await publishBody("Reference: https://bit.ly/example");
  await publishBody("Reference: http://192.0.2.10/reference");
  await publishBody("References: https://example.com/a http://example.org/b https://example.net/c https://example.edu/d");
  for (const body of ["Try javascript:alert(1)", "Try data:text/html,hello", "Try https://user:password@example.invalid/resource", "Try http://user@example.invalid/guide"]) {
    const post = makeReply(body);
    assert.equal((await store.publish(post)).code, "link");
    assert.equal((await submit(post)).status, undefined);
  }
  assert.equal((await store.member("e")).pending.length, 0, "No new content enters automatic review");

  const distinctKeys = await Promise.all([
    store.publish(makeReply("Concurrent exact reply")),
    secondStore.publish(makeReply("Concurrent exact reply")),
  ]);
  assert.equal(distinctKeys.filter(result => result.status === "published").length, 1);
  assert.equal(distinctKeys.filter(result => result.code === "duplicate").length, 1);
  assert.equal((await sql`select count(*)::int as count from community_posts
    where user_id = 'e' and body = 'Concurrent exact reply'`)[0].count, 1);

  await sql`update community_posts set created_at = clock_timestamp() - interval '3 minutes' where user_id = 'e'`;
  const ten = await Promise.all(Array.from({ length: 10 }, (_, index) => publishBody("First burst reply " + (index + 1))));
  const withinMinute = (await sql`select extract(epoch from max(created_at) - min(created_at))::float as elapsed
    from community_posts where id = any(${sql.array(ten.map(post => post.id))}::uuid[])`)[0].elapsed;
  assert.ok(withinMinute < 60, "Ten real publications completed within 60 seconds");
  await sql`update community_posts set created_at = clock_timestamp() - interval '2 minutes'
    where id = any(${sql.array(ten.map(post => post.id))}::uuid[])`;
  const rateRoot = { ...makeReply("Rate-boundary post"), parentId: null, title: "Rate-boundary post" };
  assert.equal((await submit(rateRoot)).status, "published");
  const twenty = [rateRoot, ...await Promise.all(Array.from({ length: 19 }, (_, index) =>
    publishBody("Rate-boundary reply " + (index + 1))))];
  // Replay a full recent window regardless of the latency between isolated inserts.
  await sql`update community_posts set created_at = clock_timestamp() - interval '1 second'
    where id = any(${sql.array(twenty.map(post => post.id))}::uuid[])`;
  const inDay = (await sql`select count(*)::int as count from community_posts
    where user_id = 'e' and created_at > clock_timestamp() - interval '24 hours'`)[0].count;
  assert.ok(inDay > 30, "More than 30 real publications within a rolling day");
  const twentyFirst = makeReply("First reply after the current window");
  const throttled = await store.publish(twentyFirst);
  assert.equal(throttled.code, "rate");
  assert.ok(Number.isInteger(throttled.retryAfterSeconds));
  assert.ok(throttled.retryAfterSeconds > 0 && throttled.retryAfterSeconds <= 60);
  const actionThrottle = await submit(twentyFirst);
  assert.equal(actionThrottle.status, undefined);
  assert.match(actionThrottle.message, /\d+ second/i);
  assert.equal((await submit(twenty[0])).status, "published", "Idempotent retry bypasses rate accounting");
  await sql`update community_posts set created_at = clock_timestamp() - interval '61 seconds'
    where id = ${twenty[0].id}`;
  assert.equal((await submit(twentyFirst)).status, "published", "Release one slot and retry the same ID");
  assert.equal((await sql`select count(*)::int as count from community_posts where id = ${twentyFirst.id}`)[0].count, 1);

  const audit = await moderator.history(0);
  assert.equal(audit.length, 10);
  assert.ok(audit.every((entry) => entry.actor_id === "moderator" && entry.reason && entry.created_at));
  const hide = audit.find((entry) => entry.action === "hide" && entry.post_id === first.id);
  assert.equal(hide.target_user_id, "a");
  assert.deepEqual(hide.before_state, { status: "published" });
  assert.deepEqual(hide.after_state, { status: "hidden" });
  await assert.rejects(sql`update community_moderation_log set reason = 'overwrite'`, /append-only/);
  await assert.rejects(sql`delete from community_moderation_log`, /append-only/);
  await assert.rejects(sql`truncate community_moderation_log`, /append-only/);

  assert.equal(await store.remove(reply.id, "d"), true);
  const afterDelete = await store.thread(null, first.id, null);
  const tombstone = afterDelete.replies.find((row) => row.id === reply.id);
  assert.equal(tombstone.deleted, true);
  assert.equal(tombstone.body, "");
  assert.equal(tombstone.author, null);
  assert.equal(afterDelete.replies.find((row) => row.id === nested.id)?.parentId, reply.id);
  assert.equal(await store.remove(first.id, "a"), true);
  assert.equal(await store.thread(null, first.id, "a"), null);
  await sql`update users set deleted_at = now() where id = 'b'`;
  assert.equal(await store.thread(null, second.id, null), null, "Deleted accounts disappear from public discussions");
  console.log("Isolated PostgreSQL: migration, legacy privacy, nicknames, 20/minute and no daily cap, exact target duplicates and safe links, reports, nested visibility, moderation, append-only audit, and unchanged learning/paid records passed.");
} finally {
  await Promise.all([sql.end(), secondSql.end()]);
  await operator`drop schema if exists ${operator(schema)} cascade`;
  await operator.end();
}
