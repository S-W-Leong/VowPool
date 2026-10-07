import {store,body,fail} from '../../../lib/server';
export const runtime='nodejs';
export async function GET(request:Request){try{const address=new URL(request.url).searchParams.get('address')||'';return Response.json(await store().getTerms(address));}catch(e){return fail(e);}}
export async function POST(request:Request){try{const {address,terms}=await body(request);await store().putTerms(address,terms);return Response.json({stored:true});}catch(e){return fail(e);}}
