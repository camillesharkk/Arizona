import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
const live=process.argv.includes('--sandbox'), production=process.argv.includes('--production-gates'), built=process.argv.includes('--built'), building=process.argv.includes('--build');
const data=path.resolve(process.env.PACK_TEST_DATA_DIR||'.tools/pack-data');
if(!data.startsWith(path.resolve('.tools')+path.sep))throw new Error('Acceptance data must be in .tools');
const env={...process.env,DATABASE_URL:'local-isolated',NOTARY_DATA_DIR:data,STATE_PREVIEW:'1',VERCEL_ENV:production?'production':'preview',AI_PROVIDER:'local',MOR_PROVIDER:'paddle',NEXT_DIST_DIR:built||building?'.tools/pack-build':'.tools/pack-dev'};
// Never load a database URL, production token, webhook secret or email settings.
if(live) {
  const source=fs.readFileSync('D:/webtest/web/.env.local','utf8');
  const values=Object.fromEntries(source.split(/\r?\n/).flatMap(line=>{const m=line.match(/^([A-Z0-9_]+)=(.*)$/);return m?[[m[1],m[2].trim().replace(/^(['"])(.*)\1$/,'$2')]]:[];}));
  if(values.PADDLE_ENVIRONMENT!=='sandbox') throw new Error('Only existing sandbox configuration may be used');
  for(const key of ['PADDLE_ENVIRONMENT','PADDLE_API_KEY','PADDLE_PRODUCT_ID','NEXT_PUBLIC_PADDLE_CLIENT_TOKEN','NEXT_PUBLIC_PADDLE_ENV']) if(values[key])env[key]=values[key];
  if(process.env.PACK_LIVE_AI==='1')for(const key of ['AI_PROVIDER','DEEPSEEK_API_KEY','AI_MODEL','AI_PROVIDER_DAILY_CAP'])if(values[key])env[key]=values[key];
}
const port=process.env.PACK_TEST_PORT||(production?'3414':built?'3413':'3412');
const args=building?['build']:[built?'start':'dev','--hostname','127.0.0.1','--port',port];
const child=spawn(process.execPath,['node_modules/next/dist/bin/next',...args],{env,stdio:'inherit',windowsHide:true});
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code||0));
