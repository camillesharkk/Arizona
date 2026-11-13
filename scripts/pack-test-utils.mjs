import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Keep existing-state regressions when checking an independently releasable pack.
export function verificationStates(defaults, args = process.argv.slice(2)) {
  const index = args.indexOf('--state');
  if (index < 0) return defaults;
  const state = args[index + 1];
  if (!defaults.includes(state)) throw new Error(`--state must be one of ${defaults.join(', ')}`);
  return defaults.includes('NY') && state !== 'NY' ? ['NY', state] : [state];
}

// For isolated scripts only. Production session/auth logic is never replaced by this loader.
export function testLoader(overrides = {}, globals = {}) {
  const native = createRequire(import.meta.url), cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if(fs.existsSync(file) && fs.statSync(file).isDirectory())file=path.join(file,'index');
    if (!path.extname(file)) file += fs.existsSync(file+'.ts') ? '.ts' : '.tsx';
    if (cache.has(file)) return cache.get(file).exports;
    const module={exports:{}}; cache.set(file,module);
    const require = name => Object.hasOwn(overrides,name) ? overrides[name] : name==='server-only' ? {} : name.startsWith('@/') ? load(name.slice(2)) : name.startsWith('.') ? load(path.resolve(path.dirname(file),name)) : native(name);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{module,exports:module.exports,require,console,process,Date,Math,Error,Intl,URL,URLSearchParams,Request,Response,Headers,AbortSignal,AbortController,setTimeout,clearTimeout,fetch,structuredClone,TextEncoder,TextDecoder,...globals});
    return module.exports;
  }
  return load;
}

export const TEST_PASSWORD = 'Pack-local-test-2026!';
if (process.argv.includes('--seed')) {
  const data=path.resolve(process.env.NOTARY_DATA_DIR || '.tools/pack-data');
  if (!data.startsWith(path.resolve('.tools')+path.sep)) throw new Error('Acceptance seed must stay in this worktree .tools directory');
  process.env.NOTARY_DATA_DIR=data;
  delete process.env.DATABASE_URL;
  const load=testLoader();
  const {fileStore:store}=load('lib/store/file-store.ts');
  const {hashSync}=createRequire(import.meta.url)('bcryptjs');
  for (const surface of ['desktop','mobile','http']) for (const kind of ['free','pro','expired']) {
    const email=`pack-${kind}-${surface}@example.invalid`;
    let user=await store.getUserByEmail(email);
    if (!user) user=await store.createUser({email,passwordHash:hashSync(TEST_PASSWORD,4),name:`Pack ${kind} ${surface}`});
    await store.updateUser(user.id,{emailVerified:true,emailVerifiedAt:new Date().toISOString()});
    if(kind!=='free' && !(await store.listEntitlements(user.id)).length) await store.insertEntitlement({userId:user.id,productCode:'az_exam_pro_60d',state:'ALL',status:'active',startsAt:new Date(Date.now()-86400000*2).toISOString(),expiresAt:new Date(Date.now()+(kind==='pro'?86400000*30:-86400000)).toISOString(),provider:'mock',providerOrderId:`pack-${kind}-${surface}`,providerCustomerId:null});
  }
  fs.mkdirSync('.tools',{recursive:true});
  const bank={AZ:load('data/questions.ts').publishedQuestions(),CA:load('data/ca-questions.ts').publishedCaQuestions(),HI:load('data/hi-questions.ts').publishedHiQuestions(),NY:load('data/ny-content.ts').publishedNyQuestions(),PA:load('data/pa-content.ts').publishedPaQuestions(),LA:load('data/la-content.ts').publishedLaQuestions()};
  fs.writeFileSync('.tools/pack-bank.json',JSON.stringify(bank,null,2));
  console.log(JSON.stringify({data,accounts:9,questionCounts:Object.fromEntries(Object.entries(bank).map(([state,qs])=>[state,qs.length]))}));
}
