import {DatabaseSync} from 'node:sqlite';
import {createHash,randomUUID,createPublicKey,verify} from 'node:crypto';
import bs58 from 'bs58';
import {z} from 'zod';
import {draftSchema,addressSchema,utf8,type CommitmentDraft} from '../../../packages/shared/src/schema';
import {encodeTerms} from '../../../packages/shared/src/terms';
import {parseTokenAmount} from '../../../packages/shared/src/amount';
export type ChainTerms={owner:string;termsHash:string;amount:bigint;tokenDecimals:number;mode:CommitmentDraft['mode'];reviewers:string[];goalDeadline:number;reviewDeadline:number;github?:CommitmentDraft['github']};
function matches(d:CommitmentDraft,chain:ChainTerms,bytes:Uint8Array){
 return chain.owner===d.owner&&createHash('sha256').update(bytes).digest('hex')===chain.termsHash&&
 chain.amount===parseTokenAmount(d.stake,d.tokenDecimals)&&chain.tokenDecimals===d.tokenDecimals&&chain.mode===d.mode&&
 chain.goalDeadline===d.goalDeadline&&chain.reviewDeadline===d.reviewDeadline&&JSON.stringify(chain.reviewers)===JSON.stringify(d.reviewers)&&
 JSON.stringify(chain.github)===JSON.stringify(d.github);
}
const evidenceSchema=z.object({note:utf8(2000).refine(s=>s.length>0),url:z.string().max(2048).url().refine(u=>{const p=new URL(u);return p.protocol==='https:'&&!p.username&&!p.password;}).optional()}).strict();
export type Evidence=z.infer<typeof evidenceSchema>;
export const hashEvidence=(input:unknown)=>{
 const e=evidenceSchema.parse(input);return createHash('sha256').update(JSON.stringify({note:e.note,url:e.url??null})).digest('hex');
};
export class MetadataStore {
 private db:DatabaseSync;
 constructor(file:string,private readChain:(address:string)=>Promise<ChainTerms>,private now=()=>Math.floor(Date.now()/1000)){
  this.db=new DatabaseSync(file);this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
   CREATE TABLE IF NOT EXISTS terms(address TEXT PRIMARY KEY,json TEXT NOT NULL,hex TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS challenges(id TEXT PRIMARY KEY,address TEXT NOT NULL,owner TEXT NOT NULL,content_hash TEXT NOT NULL,message TEXT NOT NULL,expires INTEGER NOT NULL,used INTEGER NOT NULL DEFAULT 0);
   CREATE TABLE IF NOT EXISTS evidence(id TEXT PRIMARY KEY,address TEXT NOT NULL,json TEXT NOT NULL,created INTEGER NOT NULL);`);
 }
 close(){this.db.close();}
 async putTerms(address:string,input:unknown){
  addressSchema.parse(address);const d=draftSchema.parse(input);const chain=await this.readChain(address);
  const bytes=encodeTerms(d),hex=Buffer.from(bytes).toString('hex');
  if(!matches(d,chain,bytes))throw new Error('Terms do not match confirmed commitment');
  // Immutable insert; serialize writes and never replace an existing value.
  this.db.exec('BEGIN IMMEDIATE');try{
   const existing=this.db.prepare('SELECT hex FROM terms WHERE address=?').get(address) as {hex:string}|undefined;
   if(existing&&existing.hex!==hex)throw new Error('Terms are immutable');
   this.db.prepare('INSERT OR IGNORE INTO terms VALUES(?,?,?)').run(address,JSON.stringify(d),hex);this.db.exec('COMMIT');
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 async getTerms(address:string):Promise<{status:'verified'|'missing'|'unverified';terms?:CommitmentDraft;canonicalHex?:string}>{
  addressSchema.parse(address);const chain=await this.readChain(address);const row=this.db.prepare('SELECT json,hex FROM terms WHERE address=?').get(address) as {json:string;hex:string}|undefined;
  if(!row)return {status:'missing'};
  try{const d=draftSchema.parse(JSON.parse(row.json));const bytes=encodeTerms(d);
   if(!matches(d,chain,bytes)||Buffer.from(bytes).toString('hex')!==row.hex)return {status:'unverified'};
   return {status:'verified',terms:d,canonicalHex:row.hex};
  }catch{return {status:'unverified'};}
 }
 async challenge(address:string,contentHash:string){
  addressSchema.parse(address);if(!/^[0-9a-f]{64}$/.test(contentHash))throw new Error('Invalid content hash');
  const chain=await this.readChain(address);const id=randomUUID(),expires=this.now()+300;
  const message=JSON.stringify({version:1,domain:'vowpool-evidence',action:'publish-evidence',commitment:address,owner:chain.owner,termsHash:chain.termsHash,contentHash,nonce:id,expires});
  this.db.prepare('DELETE FROM challenges WHERE expires<?').run(this.now()-300);
  this.db.prepare('INSERT INTO challenges(id,address,owner,content_hash,message,expires) VALUES(?,?,?,?,?,?)').run(id,address,chain.owner,contentHash,message,expires);
  return {id,message,expires};
 }
 async addEvidence(address:string,input:unknown,id:string,signature:string){
  addressSchema.parse(address);const e=evidenceSchema.parse(input),contentHash=hashEvidence(e),chain=await this.readChain(address);
  const row=this.db.prepare('SELECT * FROM challenges WHERE id=?').get(id) as {address:string;owner:string;content_hash:string;message:string;expires:number;used:number}|undefined;
  if(!row||row.address!==address||row.owner!==chain.owner||row.content_hash!==contentHash||row.expires<=this.now()||row.used||JSON.parse(row.message).termsHash!==chain.termsHash)throw new Error('Invalid, expired or used challenge');
  if(!/^[A-Za-z0-9+/]{86}==$/.test(signature))throw new Error('Invalid signature');
  const publicKey=createPublicKey({key:Buffer.concat([Buffer.from('302a300506032b6570032100','hex'),Buffer.from(bs58.decode(chain.owner))]),format:'der',type:'spki'});
  if(!verify(null,Buffer.from(row.message),publicKey,Buffer.from(signature,'base64')))throw new Error('Owner signature required');
  this.db.exec('BEGIN IMMEDIATE');try{
   const result=this.db.prepare('UPDATE challenges SET used=1 WHERE id=? AND used=0 AND expires>?').run(id,this.now());
   if(result.changes!==1)throw new Error('Challenge already consumed');
   this.db.prepare('INSERT INTO evidence VALUES(?,?,?,?)').run(id,address,JSON.stringify(e),this.now());this.db.exec('COMMIT');
  }catch(err){this.db.exec('ROLLBACK');throw err;}
 }
 evidence(address:string):Array<Evidence&{created:number}>{
  addressSchema.parse(address);return (this.db.prepare('SELECT json,created FROM evidence WHERE address=? ORDER BY created DESC LIMIT 50').all(address) as {json:string;created:number}[]).map(r=>({...JSON.parse(r.json),created:r.created}));
 }
}
