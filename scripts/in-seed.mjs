import path from 'node:path';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {testLoader} from './pack-test-utils.mjs';
process.env.NOTARY_DATA_DIR=path.resolve('.tools/indiana-data');
process.env.DATABASE_URL='local-isolated';
process.env.STATE_PREVIEW='1';process.env.VERCEL_ENV='preview';
if(process.argv.includes('--fresh')) { const file=path.join(process.env.NOTARY_DATA_DIR,'store.json'); if(fs.existsSync(file))fs.unlinkSync(file); }
const load=testLoader(),store=load('lib/store/file-store.ts').fileStore;
const {hashSync}=createRequire(import.meta.url)('bcryptjs');
const now=Date.now(),password='Indiana-local-test-2026!';
for(const surface of ['desktop','mobile','http']) for(const kind of ['free','pro','other-pro','expired','boundary23','boundary24']) {
 const email=`in-${kind}-${surface}@example.invalid`;
 let user=await store.getUserByEmail(email);
 if(!user)user=await store.createUser({email,passwordHash:hashSync(password,4),name:`Indiana ${kind} ${surface}`});
 await store.updateUser(user.id,{emailVerified:true,emailVerifiedAt:new Date().toISOString()});
 if(['pro','other-pro','expired'].includes(kind)&&!(await store.listEntitlements(user.id)).length)await store.insertEntitlement({userId:user.id,productCode:kind==='other-pro'?'az_exam_pro_60d':'in_exam_pro_60d',state:kind==='other-pro'?'ALL':'IN',status:'active',startsAt:new Date(now-86400000).toISOString(),expiresAt:new Date(now+(kind==='expired'?-3600000:86400000*59)).toISOString(),provider:'mock',providerOrderId:`local-in-${kind}-${surface}`,providerCustomerId:null});
}
fs.mkdirSync('.tools',{recursive:true});
fs.writeFileSync('.tools/in-test-bank.json',JSON.stringify({IN:load('data/in-questions.ts').publishedInQuestions(),AZ:load('data/questions.ts').publishedQuestions()}));
console.log('Seeded 18 isolated local accounts; no production database or email. Password: '+password);
