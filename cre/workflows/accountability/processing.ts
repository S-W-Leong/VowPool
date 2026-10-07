import {PublicKey} from '@solana/web3.js';
import {Buffer} from 'buffer';
import {z} from 'zod';
import {addressSchema,githubConfigSchema} from '../../../packages/shared/src/schema';
import {Writer} from '../../../packages/shared/src/borsh';
import {hashGithubConfig} from '../../../packages/shared/src/terms';
import {Lifecycle,type Commitment,type Group,type GroupPolicy} from './generated/Vowpool';
import type {GithubResult,Observation} from '../../../packages/shared/src/github';
const equal=(a:number[],b:number[])=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const policyEqual=(a:GroupPolicy,b:GroupPolicy)=>a.forwarder===b.forwarder&&a.forwarderState===b.forwarderState&&equal(a.workflowCid,b.workflowCid)&&equal(a.workflowName,b.workflowName)&&equal(a.workflowOwner,b.workflowOwner);
export function selectCandidates(hints:unknown,now:number):string[]{
 if(!Array.isArray(hints))return [];const valid=[...new Set(hints.slice(0,100).filter((v):v is string=>addressSchema.safeParse(v).success))].slice(0,25);if(!valid.length)return [];
 const start=(Math.floor(now/30)%Math.ceil(valid.length/5))*5;return valid.slice(start,start+5);
}
export function validateFrozenAccount(program:string,group:string,address:string,g:Group,c:Commitment,expectedPolicy:GroupPolicy):Commitment{
 const programKey=new PublicKey(program),groupKey=new PublicKey(group);
 if(!groupKey.equals(PublicKey.findProgramAddressSync([Buffer.from('group'),new PublicKey(g.founder).toBuffer()],programKey)[0]))throw new Error('Wrong group PDA');
 if(c.group!==group||!new PublicKey(address).equals(PublicKey.findProgramAddressSync([Buffer.from('commitment'),groupKey.toBuffer(),new PublicKey(c.owner).toBuffer(),Buffer.from(new Writer().n(c.nonce,8).finish())],programKey)[0]))throw new Error('Wrong commitment binding');
 if(!policyEqual(g.policy,expectedPolicy)||!policyEqual(c.policy,g.policy))throw new Error('Wrong policy binding');
 if(c.mode===3){const config=githubConfigSchema.parse(c.github);const expected=hashGithubConfig({program,group,commitment:address,...c.policy},config,{goalDeadline:Number(c.goalDeadline),reviewDeadline:Number(c.reviewDeadline),hardDeadline:Number(c.hardDeadline)});if(!equal(c.configHash,Array.from(expected)))throw new Error('Wrong configuration hash');}
 return c;
}
export function operationFor(c:Commitment,now:number,result:GithubResult):number|null{
 if((c.status===Lifecycle.Succeeded||c.status===Lifecycle.Unresolved)&&!c.refundReleased)return 3;
 if(c.status!==Lifecycle.Active)return null;
 if(c.mode!==3)return now>Number(c.reviewDeadline)?2:null;
 if(now>Number(c.hardDeadline))return 4;
 if(result==='SUCCESS')return 0;if(result==='FAIL')return 1;return null;
}
const compactSchema=z.object({number:z.number().int().positive(),merged:z.boolean(),merged_at:z.string().max(30).nullable(),base:z.object({ref:z.string().max(100),repo:z.object({name:z.string().max(100),owner:z.object({login:z.string().max(39)})})})});
export function compactGithubObservation(status:number,text:string):Observation{
 if(status!==200||new TextEncoder().encode(text).length>262144)return {status,body:null};
 try{return {status:200,body:compactSchema.parse(JSON.parse(text))};}catch{return {status:0,body:null};}
}
export function chainObservationTime(account:{owner:string;executable:boolean;data:[string,string]}|null,wallNow:number):number{
 if(!account||account.owner!=='Sysvar1111111111111111111111111111111111111'||account.executable)throw new Error('Invalid clock sysvar owner');
 const data=Buffer.from(account.data[0],'base64');if(account.data[1]!=='base64'||data.length!==40)throw new Error('Invalid clock sysvar layout');
 const timestamp=Number(data.readBigInt64LE(32));if(!Number.isSafeInteger(timestamp)||timestamp<0)throw new Error('Invalid chain timestamp');return Math.min(timestamp,wallNow);
}
