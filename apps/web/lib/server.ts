import {mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {Connection} from '@solana/web3.js';
import {MetadataStore} from './metadata-store';
import {readCommitment,readGroup,rpcUrl} from './chain';
const connection=new Connection(rpcUrl,'confirmed');
let instance:MetadataStore|undefined;
export function store(){
 if(!instance){const file=resolve(process.env.VOWPOOL_DATABASE_PATH||'.data/vowpool.db');mkdirSync(dirname(file),{recursive:true});
 instance=new MetadataStore(file,async address=>{const c=await readCommitment(connection,address);const group=await readGroup(connection,c.group);return {...c,tokenDecimals:group.decimals};});}
 return instance;
}
export {connection};
const requests=new Map<string,{count:number;reset:number}>();
export function rateLimit(key:string,limit=30){const now=Date.now();for(const [k,v] of requests)if(v.reset<now)requests.delete(k);const entry=requests.get(key)||{count:0,reset:now+60000};if(++entry.count>limit)throw new Error('Too many requests. Try again shortly.');requests.set(key,entry);}
export async function body(request:Request){
 const reader=request.body?.getReader();if(!reader)throw new Error('Request body required');const chunks:Uint8Array[]=[];let size=0;
 while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>16384){await reader.cancel();throw new Error('Request too large');}chunks.push(part.value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return JSON.parse(new TextDecoder().decode(bytes));
}
export function fail(e:unknown,status=400){return Response.json({error:e instanceof Error?e.message:'Request failed'},{status});}
