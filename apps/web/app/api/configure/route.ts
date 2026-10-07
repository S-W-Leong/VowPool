import {randomUUID} from 'node:crypto';
import {body,fail,rateLimit} from '../../../lib/server';
import {requestAiDraft} from '../../../lib/ai';
export const runtime='nodejs';
export async function POST(request:Request){try{
 const cookie=request.headers.get('cookie')?.match(/(?:^|;\s*)vowpool-session=([a-f0-9-]{36})(?:;|$)/)?.[1]||randomUUID();rateLimit('ai-session:'+cookie,4);rateLimit('ai-global',12);
 const output=await requestAiDraft(await body(request),{key:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL||'gpt-4o-mini'});
 return Response.json(output,{headers:{'Set-Cookie':`vowpool-session=${cookie}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600${new URL(request.url).protocol==='https:'?'; Secure':''}`}});
 }catch(e){return fail(e,503);}}
