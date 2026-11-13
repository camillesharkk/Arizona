/** Candidate states remain blocked in production pending a coordinated release. */
export function productionStateBlocked(state: unknown): boolean {
 if(state!=='CT' && state!=='NC' && state!=='IN')return false;
 return process.env.VERCEL_ENV==='production' || (state==='CT' ? process.env.NEXT_PUBLIC_CT_PREVIEW!=='1' : process.env.STATE_PREVIEW!=='1');
}
export function prepPageEnabled(slug:string):boolean {
 const candidates:Record<string,string>={connecticut:'CT','north-carolina':'NC',indiana:'IN'};
 if(candidates[slug])return !productionStateBlocked(candidates[slug]);
 return ['new-york','pennsylvania','louisiana'].includes(slug) || (process.env.VERCEL_ENV!=='production' && process.env.STATE_PREVIEW==='1');
}
