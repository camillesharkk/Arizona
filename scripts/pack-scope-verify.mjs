import assert from 'node:assert/strict';
import { verificationStates } from './pack-test-utils.mjs';

assert.equal(typeof verificationStates, 'function', 'Independent candidates need an explicit verification scope');
assert.deepEqual(verificationStates(['NY', 'PA', 'LA'], []), ['NY', 'PA', 'LA']);
assert.deepEqual(verificationStates(['NY', 'PA', 'LA'], ['--state', 'LA']), ['NY', 'LA']);
assert.deepEqual(verificationStates(['NY', 'PA', 'LA'], ['--state', 'PA']), ['NY', 'PA']);
assert.deepEqual(verificationStates(['PA', 'LA'], ['--state', 'LA']), ['LA']);
assert.deepEqual(verificationStates(['NY', 'PA', 'LA'], ['--state', 'NY']), ['NY']);
assert.throws(() => verificationStates(['PA', 'LA'], ['--state']), /--state/);
assert.throws(() => verificationStates(['PA', 'LA'], ['--state', 'AZ']), /--state/);
assert.throws(() => verificationStates(['PA', 'LA'], ['--state', 'NY']), /--state/);
console.log('Verification scope: default coverage retained; explicit PA/LA includes NY where supported; invalid selections fail');
