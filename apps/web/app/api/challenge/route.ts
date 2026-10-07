import {store,fail,rateLimit} from '../../../lib/server';
export const runtime='nodejs';
export async function GET(request:Request){try{const params=new URL(request.url).searchParams;const address=params.get('address')||'';rateLimit('challenge:'+address,10);return Response.json(await store().challenge(address,params.get('contentHash')||''));}catch(e){return fail(e);}}
