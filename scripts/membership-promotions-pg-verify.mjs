import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import postgres from 'postgres';
import { createPgCommerceRepo } from '../lib/commerce/pg-repo.ts';
import { createQuote } from '../lib/commerce/service.ts';

const uri = process.env.COMMUNITY_TEST_DATABASE_URL || (await readFile(path.resolve('..', 'preview-database-url.txt'), 'utf8')).trim();
const parsed = new URL(uri);
assert.ok(['postgres:', 'postgresql:'].includes(parsed.protocol));
assert.equal(parsed.hostname, 'ep-still-voice-a74guk0q.ap-southeast-2.aws.neon.tech');
const schema = `promotion_qa_${randomUUID().replaceAll('-', '')}`;
const operator = postgres(uri, { ssl: 'require', max: 1, onnotice: () => {} });
const clients = [0, 1].map(() => postgres(uri, { ssl: 'require', max: 1, onnotice: () => {} }));
try {
  await operator`create schema ${operator(schema)}`;
  for (const sql of clients) {
    await sql`set search_path to ${sql(schema)}`;
    assert.equal((await sql`select current_schema() as name`)[0].name, schema);
  }
  const [firstSql, secondSql] = clients;
  for (const file of ['001_init', '002_email_reminders', '003_entitlements', '004_commerce', '005_credits_devices', '006_referral_reversals', '007_account_lifecycle', '008_provider_checkout_bindings', '009_paddle_provider']) {
    await firstSql.unsafe(await readFile(new URL(`../db/migrations/${file}.sql`, import.meta.url), 'utf8'));
  }
  await firstSql`insert into users(id,email,password_hash,email_verified_at) values ('promotions','fixture@example.invalid','unusable',now())`;
  const first = createPgCommerceRepo(firstSql);
  const second = createPgCommerceRepo(secondSql);
  const now = new Date();
  const makeQuote = async repo => {
    const result = await createQuote(repo, { userId: 'promotions', applyCredit: false, policyAccepted: true, now });
    assert.equal(result.ok, true);
    return result.quote;
  };
  const quotes = await Promise.all([makeQuote(first), makeQuote(second)]);
  const claim = (repo, quote) => repo.claimCheckoutBinding({ quoteId: quote.id, provider: 'paddle', now: now.toISOString(), expiresAt: quote.expiresAt });
  const results = await Promise.all([claim(first, quotes[0]), claim(second, quotes[1])]);
  assert.equal(results.filter(row => row.created).length, 1);
  const blocked = results.find(row => 'error' in row);
  assert.equal(blocked.error, 'promotion_checkout_in_progress');
  assert.ok(quotes.some(quote => quote.id === blocked.quoteId));
  const winner = quotes.find(quote => quote.id === blocked.quoteId);
  const loser = quotes.find(quote => quote.id !== winner.id);
  assert.equal((await firstSql`select count(*)::int as count from provider_checkout_bindings`)[0].count, 1);
  assert.equal((await firstSql`select count(*)::int as count from promotion_redemptions`)[0].count, 0);
  await first.completeCheckoutBinding({ quoteId: winner.id, providerCheckoutId: 'txn_pgfixture', checkoutUrl: 'paddle-overlay:txn_pgfixture' });
  const resumeClaim = await claim(second, loser);
  assert.equal(resumeClaim.quoteId, winner.id);
  assert.equal(await first.clearCanceledCheckout(winner.id, 'txn_wrong'), false);
  assert.equal(await first.clearCanceledCheckout(winner.id, 'txn_pgfixture'), true);
  assert.equal((await claim(second, loser)).created, true);
  await second.releaseCheckoutClaim(loser.id);
  await first.insertPromotionRedemption({ id: randomUUID(), userId: 'promotions', kind: 'newcomer', orderId: 'paid-fixture', redeemedAt: now.toISOString() });
  const consumed = await claim(second, winner);
  assert.equal(consumed.error, 'PRICE_CHANGED');
  console.log(JSON.stringify({ ok: true, host: parsed.hostname, isolatedSchema: schema, tests: ['real PostgreSQL transaction','concurrent account lock','exact existing quote resume','no premature promotion redemption','conditional canceled binding removal','new claim after cancellation','successful redemption blocks stale claim'] }));
} finally {
  // The generated schema name is the only deletion target, checked by PostgreSQL identifier quoting.
  await operator`drop schema if exists ${operator(schema)} cascade`;
  console.log('Removed isolated promotion verification schema');
  await Promise.all([...clients, operator].map(sql => sql.end({ timeout: 5 })));
}
