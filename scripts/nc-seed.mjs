import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { testLoader, TEST_PASSWORD } from './pack-test-utils.mjs';

process.env.NOTARY_DATA_DIR = path.resolve('.tools/nc-data');
delete process.env.DATABASE_URL;
const load = testLoader();
const { fileStore: store } = load('lib/store/file-store.ts');
const { hashSync } = createRequire(import.meta.url)('bcryptjs');
for (const surface of ['desktop', 'mobile', 'http']) {
  for (const kind of ['free', 'pro', 'expired', 'azpro']) {
    const email = `nc-${kind}-${surface}@example.invalid`;
    let user = await store.getUserByEmail(email);
    if (!user) user = await store.createUser({ email, passwordHash: hashSync(TEST_PASSWORD, 4), name: `NC ${kind} ${surface}` });
    await store.updateUser(user.id, { emailVerified: true, emailVerifiedAt: new Date().toISOString() });
    if (kind !== 'free' && !(await store.listEntitlements(user.id)).length) {
      const expired = kind === 'expired';
      const az = kind === 'azpro';
      await store.insertEntitlement({
        userId: user.id, productCode: az ? 'az_exam_pro_60d' : 'nc_exam_pro_60d', state: az ? 'ALL' : 'NC', status: 'active',
        startsAt: new Date(Date.now() - (expired ? 61 : 1) * 86400000).toISOString(),
        expiresAt: new Date(Date.now() + (expired ? -1 : 59) * 86400000).toISOString(),
        provider: 'mock', providerOrderId: `nc-${kind}-${surface}`, providerCustomerId: null,
      });
    }
  }
}
fs.mkdirSync('.tools', { recursive: true });
const bank = {
  AZ: load('data/questions.ts').publishedQuestions(),
  CA: load('data/ca-questions.ts').publishedCaQuestions(),
  HI: load('data/hi-questions.ts').publishedHiQuestions(),
  NY: load('data/ny-content.ts').publishedNyQuestions(),
  PA: load('data/pa-content.ts').publishedPaQuestions(),
  LA: load('data/la-content.ts').publishedLaQuestions(),
  NC: load('data/nc-content.ts').publishedNcQuestions(),
};
fs.writeFileSync('.tools/pack-bank.json', JSON.stringify(bank, null, 2));
console.log('Seeded 12 isolated NC accounts and seven-state bank in .tools/nc-data');
