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
const operator = postgres(url, { max: 1, ssl: "require" });
const sql = postgres(url, { max: 1, ssl: "require" });
const secondSql = postgres(url, { max: 1, ssl: "require" });
const { communityStore } = testLoader({
  "@/lib/store/pg-store": { getPgSql: () => { throw new Error("Production storage is forbidden in this test."); } },
})("lib/community-store.ts");
const store = communityStore(sql);
const secondStore = communityStore(secondSql);

try {
  await operator`create schema ${operator(schema)}`;
  for (const client of [sql, secondSql]) {
    await client`set search_path to ${client(schema)}`;
    assert.equal((await client`select current_schema() as name`)[0].name, schema);
  }
  await sql`create table users(id text primary key, name text, deleted_at timestamptz)`;
  const migration = await readFile(new URL("../db/migrations/019_community_discussions.sql", import.meta.url), "utf8");
  await sql.begin(async (tx) => {
    await tx.unsafe(migration);
    await tx.unsafe(migration);
  });
  await sql`insert into users values ('a', 'Alice', null), ('b', 'b@example.invalid', null), ('c', 'Chris', null), ('d', 'Dale', null)`;
  const first = { id: randomUUID(), userId: "a", title: "First question", body: "How should I study?", insightId: null, parentId: null };
  const second = { ...first, id: randomUUID(), userId: "b", title: "Second question" };
  const editorial = { ...first, id: randomUUID(), userId: "c", title: null, insightId: "az-manual-navigation" };
  for (const post of [first, second, editorial]) assert.equal((await store.publish(post)).ok, true);
  await sql`update community_posts set created_at = now() - interval '2 minutes' where id = ${first.id}`;
  assert.equal((await store.list(null, null, 0)).posts[0].id, second.id, "Newest wins an engagement tie");
  assert.equal((await store.list(editorial.insightId, "b", 0)).posts[0].id, editorial.id);
  assert.equal((await store.list("different-insight", "b", 0)).posts.length, 0);
  await Promise.all([store.setInsightLike(editorial.insightId, "b", true), secondStore.setInsightLike(editorial.insightId, "b", true)]);
  const insightLikes = await store.insightLikes(editorial.insightId, "b");
  assert.equal(insightLikes.likes, 1);
  assert.equal(insightLikes.liked, true);
  assert.equal((await store.insightLikes(editorial.insightId, null)).liked, false);
  assert.equal((await store.insightLikes("different-insight", "b")).likes, 0);
  assert.deepEqual(await store.insightActivity([editorial.insightId, "different-insight"], "b"), [
    { id: editorial.insightId, likes: 1, liked: true, comments: 1 },
    { id: "different-insight", likes: 0, liked: false, comments: 0 },
  ]);
  await store.setInsightLike(editorial.insightId, "b", false);
  assert.equal((await store.insightLikes(editorial.insightId, "b")).likes, 0);
  await Promise.all([store.setLike(first.id, "b", true), secondStore.setLike(first.id, "b", true)]);
  let feed = await store.list(null, "b", 0);
  assert.equal(feed.posts[0].id, first.id, "Unique like raises engagement");
  assert.equal(feed.posts[0].likes, 1);
  assert.equal(feed.posts[0].liked, true);
  assert.equal(feed.posts[1].author, "Community member");
  assert.doesNotMatch(JSON.stringify(feed), /example\.invalid|user_id|email/);
  assert.equal((await store.list(null, null, 0)).posts[0].liked, false);
  await store.setLike(first.id, "b", false);
  assert.equal((await store.thread(null, first.id, "b")).post.likes, 0);
  const reply = { id: randomUUID(), userId: "d", title: null, body: "Read the official manual.", insightId: null, parentId: first.id };
  const retries = await Promise.all([store.publish(reply), secondStore.publish(reply)]);
  assert.ok(retries.every((value) => value.ok && value.threadId === first.id));
  const nested = { ...reply, id: randomUUID(), userId: "c", parentId: reply.id };
  assert.equal((await store.publish(nested)).ok, true);
  const badReply = { ...reply, id: randomUUID(), parentId: editorial.id };
  assert.equal((await store.publish(badReply)).code, "missing", "Cannot cross an editorial thread");
  assert.equal(await store.thread(editorial.insightId, first.id, "b"), null, "Cannot view a thread in another feed");
  let thread = await store.thread(null, first.id, "d");
  assert.equal(thread.post.replies, 2, "Nested reply included in engagement");
  assert.equal(thread.replies[0].mine, true);
  assert.equal(thread.replies[1].parentId, reply.id);
  assert.equal((await store.list(null, null, 0)).posts[0].id, first.id);
  assert.equal(await store.remove(reply.id, "b"), false, "Cross-user deletion denied");
  assert.equal(await store.remove(reply.id, "d"), true);
  thread = await store.thread(null, first.id, null);
  assert.equal(thread.replies[0].deleted, true);
  assert.equal(thread.replies[0].body, "");
  assert.equal(thread.replies[0].author, null);
  assert.equal(thread.replies[1].parentId, reply.id, "Other members' replies survive reply removal");
  assert.equal(thread.post.replies, 1);
  await store.publish({ ...nested, id: randomUUID() });
  const atLimit = { ...nested, id: randomUUID(), parentId: first.id };
  assert.equal((await store.publish(atLimit)).ok, true);
  assert.equal((await store.publish({ ...atLimit, id: randomUUID() })).code, "rate");
  assert.equal(await store.remove(first.id, "a"), true);
  assert.equal(await store.thread(null, first.id, "a"), null);
  assert.equal((await store.publish({ ...reply, id: randomUUID() })).code, "missing");
  await sql`update users set deleted_at = now() where id = 'b'`;
  assert.equal((await store.list(null, null, 0)).posts.length, 0, "Deleted accounts disappear from public discussions");
  console.log("Real PostgreSQL: additive migration, feed ranking, idempotent likes and publishing, nested replies, scope, visibility, quota and ownership passed.");
} finally {
  await Promise.all([sql.end(), secondSql.end()]);
  await operator`drop schema if exists ${operator(schema)} cascade`;
  await operator.end();
}
