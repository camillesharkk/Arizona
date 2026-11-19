import assert from "node:assert/strict";
import { testLoader } from "./pack-test-utils.mjs";
const load = testLoader({
  "@/lib/store": { getStore() { throw new Error("Unexpected store access"); } },
});
const { manualProWindow, ManualProGrantError } = load("lib/manual-pro-window.ts");
const { manualProInput, SITE_PRO_PRODUCT_CODE } = load("lib/manual-pro-input.ts");
const now = new Date("2026-11-19T10:05:00.000Z");
const timed = (startsAt, expiresAt, options={}) => ({
  startsAt,expiresAt,productCode:SITE_PRO_PRODUCT_CODE,state:"ALL",provider:"paddle",providerOrderId:"order-a",status:"active",...options,
});
const key = {requestId:"49b988b3-9ac2-4cc6-876e-f22bc014607f",email:"ACCOUNT@EXAMPLE.TEST",productCode:SITE_PRO_PRODUCT_CODE,days:"60",reason:"测试账号续期"};
assert.equal(manualProInput.parse(key).email,"account@example.test");
assert.equal(manualProInput.safeParse({...key,days:0}).success,false);
assert.equal(manualProInput.safeParse({...key,productCode:"all_state_pro_lifetime"}).success,false);
const fresh=manualProWindow([],SITE_PRO_PRODUCT_CODE,60,now);
assert.equal(fresh.state,"ALL");
assert.equal(fresh.previousExpiresAt,null);
assert.equal(fresh.startsAt,now.toISOString());
assert.equal(fresh.expiresAt,"2027-01-18T10:05:00.000Z");
const expired=timed("2026-08-01T10:05:00Z","2026-09-30T10:05:00Z",{state:"AZ"});
const restored=manualProWindow([expired],SITE_PRO_PRODUCT_CODE,60,now);
assert.equal(restored.state,"AZ");
assert.equal(restored.previousExpiresAt,"2026-09-30T10:05:00.000Z");
assert.equal(restored.startsAt,now.toISOString());
const active=timed("2026-11-01T10:05:00Z","2026-12-01T10:05:00Z");
const extended=manualProWindow([expired,active],SITE_PRO_PRODUCT_CODE,60,now);
assert.equal(extended.startsAt,"2026-12-01T10:05:00.000Z");
assert.equal(extended.expiresAt,"2027-01-30T10:05:00.000Z");
const queued=timed("2026-12-01T10:05:00Z","2026-12-11T10:05:00Z",{providerOrderId:"order-b"});
assert.equal(manualProWindow([active,queued],SITE_PRO_PRODUCT_CODE,60,now).startsAt,"2026-12-11T10:05:00.000Z");
const futureOnly=timed("2027-04-01T10:05:00Z","2027-06-01T10:05:00Z",{providerOrderId:"future"});
assert.equal(manualProWindow([futureOnly],SITE_PRO_PRODUCT_CODE,60,now).startsAt,now.toISOString());
assert.equal(manualProWindow([active,futureOnly],SITE_PRO_PRODUCT_CODE,60,now).startsAt,"2026-12-01T10:05:00.000Z");
const overlapping=timed("2026-11-08T10:05:00Z","2026-12-02T10:05:00Z",{providerOrderId:"overlap"});
assert.equal(manualProWindow([active,overlapping],SITE_PRO_PRODUCT_CODE,60,now).startsAt,"2026-12-02T10:05:00.000Z");
const lifetime=timed("2026-11-01T10:05:00Z",null,{productCode:"all_state_pro_lifetime"});
assert.throws(()=>manualProWindow([lifetime],SITE_PRO_PRODUCT_CODE,60,now),error=>error instanceof ManualProGrantError&&error.code==="lifetime");
assert.throws(()=>manualProWindow([],"ca_exam_pro_60d",60,now),/product/);
console.log("Manual Pro: normalization, no-history, expired, active, queued, legacy scope and lifetime boundaries passed.");
