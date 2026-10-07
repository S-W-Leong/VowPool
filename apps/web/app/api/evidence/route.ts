import {store,body,fail,rateLimit} from '../../../lib/server';
export const runtime='nodejs';
export async function GET(request:Request){try{return Response.json({evidence:store().evidence(new URL(request.url).searchParams.get('address')||'')});}catch(e){return fail(e);}}
export async function POST(request:Request){try{const {address,evidence,id,signature}=await body(request);rateLimit('evidence:'+address,10);await store().addEvidence(address,evidence,id,signature);return Response.json({stored:true});}catch(e){return fail(e);}}
