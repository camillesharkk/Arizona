import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import postgres from "postgres";
import { testLoader } from "./pack-test-utils.mjs";

const uri = new URL(process.env.COMMUNITY_TEST_DATABASE_URL);
assert.equal(uri.hostname, "ep-still-voice-a74guk0q.ap-southeast-2.aws.neon.tech", "Use the isolated preview endpoint");
const schema = "manual_pro_qa_" + randomUUID().replaceAll("-", "");
const operator = postgres(uri.href, { max: 1, ssl: "require", onnotice: () => {} });
const scoped = new URL(uri.href);
scoped.searchParams.set("options", "-c search_path=" + schema);
const sql = postgres(scoped.href, { max: 2, ssl: "require", onnotice: () => {} });
const load = testLoader({ postgres: () => sql });
let created = false;
try {
  await operator`create schema ${operator(schema)}`;
  created = true;
  assert.equal((await sql`select current_schema() as name`)[0].name, schema);
  await sql`create table schema_migrations (id text primary key, applied_at timestamptz default now())`;
  for (const file of (await readdir("db/migrations")).filter(name => name.endsWith(".sql")).sort()) {
    const source = await readFile("db/migrations/" + file, "utf8");
    await sql.begin(async tx => {
      await tx.unsafe(source);
      await tx`insert into schema_migrations (id) values (${file.slice(0, -4)})`;
    });
  }

  for (const id of ["admin", "fresh", "active", "expired", "other", "lifetime"]) {
    await sql`insert into users(id,email,password_hash,email_verified) values (${id},${id+"@example.test"},'fixture',true)`;
  }
  const current = new Date();
  const activeExpiry = new Date(current.getTime() + 7*86400000);
  await sql`insert into entitlements(id,user_id,product_code,state,status,starts_at,expires_at,provider,provider_order_id)
    values ('active-old','active','ca_exam_pro_60d','CA','active',now()-interval '20 days',${activeExpiry},'mock','active-old'),
      ('expired-old','expired','az_exam_pro_60d','AZ','active',now()-interval '90 days',now()-interval '30 days','mock','expired-old'),
      ('lifetime-old','lifetime','all_state_pro_lifetime','ALL','active',now()-interval '1 day',null,'mock','lifetime-old')`;

  process.env.DATABASE_URL = scoped.href;
  const { grantManualPro, listManualProGrants } = load("lib/manual-pro.ts");
  const rights = load("lib/entitlements.ts");
  const actor = { kind: "administrator", id: "admin" };
  const input = { requestId: randomUUID(), email: "fresh@example.test", productCode: "az_exam_pro_60d", days: 60, reason: "测试账号续期" };
  const first = await Promise.all([grantManualPro(input, actor),grantManualPro(input, actor)]);
  assert.equal(first.filter(item=>!item.duplicate).length,1);
  assert.equal(first[0].receipt.expiresAt,first[1].receipt.expiresAt);
  assert.equal(first[0].receipt.previousExpiresAt,null);
  assert.equal(first[0].receipt.state,"ALL");
  assert.equal(Date.parse(first[0].receipt.expiresAt)-Date.parse(first[0].receipt.startsAt),60*86400000);
  await assert.rejects(grantManualPro({...input,days:61},actor),/request/);
  await assert.rejects(grantManualPro({...input,email:"other@example.test"},actor),/request/);
  const extended=await grantManualPro({...input,requestId:randomUUID(),email:"active@example.test",productCode:"ca_exam_pro_60d"},actor);
  assert.equal(extended.receipt.previousExpiresAt,activeExpiry.toISOString());
  assert.equal(extended.receipt.startsAt,activeExpiry.toISOString());
  assert.equal(extended.receipt.state,"CA");
  const restored=await grantManualPro({...input,requestId:randomUUID(),email:"expired@example.test"},actor);
  assert.equal(restored.receipt.state,"AZ");
  assert.ok(Date.parse(restored.receipt.previousExpiresAt)<Date.parse(restored.receipt.startsAt));
  await assert.rejects(grantManualPro({...input,requestId:randomUUID(),email:"lifetime@example.test"},actor),/lifetime/);
  const reads=await listManualProGrants();
  assert.equal(reads.length,3);
  assert.equal(reads.find(item=>item.userId==="fresh").email,"fresh@example.test");
  assert.equal((await rights.getArizonaEntitlement("fresh")).state,"ALL");
  assert.equal(await rights.hasStatePro("fresh","NV"),true);
  assert.equal(await rights.hasStatePro("active","AZ"),true);
  assert.equal(await rights.canAccessQuestion("fresh",{is_free:false,state:"NV"}),true);
  assert.equal(await rights.hasArizonaPro("other"),false);
  assert.equal((await sql`select count(*)::int as count from commerce_orders`)[0].count,0);
  assert.equal((await sql`select count(*)::int as count from webhooks`)[0].count,0);
  assert.equal((await sql`select count(*)::int as count from entitlements where provider='manual'`)[0].count,3);
  assert.equal((await sql`select plan from users where id='fresh'`)[0].plan,"pro");
  await assert.rejects(sql`delete from manual_pro_grants where request_id=${input.requestId}`,/append-only/);
  console.log("Isolated PostgreSQL: migration 022, once-only parallel submission, active extension, historical restoration, audit, no paid orders and Pro access passed.");
} finally {
  await sql.end({ timeout: 4 });
  if (created) await operator`drop schema ${operator(schema)} cascade`;
  await operator.end({ timeout: 4 });
}
