import {bytesToBase64,ConsensusAggregationByFields,identical,median,type HTTPSendRequester} from '@chainlink/cre-sdk';
import {Buffer} from 'buffer';
import {PublicKey} from '@solana/web3.js';
import {z} from 'zod';
import {addressSchema} from '../../../packages/shared/src/schema';
import {chainObservationTime,validateFrozenAccount} from './processing';
import {VOWPOOL_IDL,ACCOUNT_GROUP_DISCRIMINATOR,ACCOUNT_COMMITMENT_DISCRIMINATOR,decodeGroupAccount,decodeCommitmentAccount,groupCodec,commitmentCodec} from './generated/Vowpool';
export const accountSchema=z.object({owner:addressSchema,executable:z.boolean(),data:z.tuple([z.string().max(8192),z.literal('base64')])});
export type RpcSnapshot={semantic:string;slot:number;chainTime:number};
export const rpcSnapshotConsensus=()=>ConsensusAggregationByFields<RpcSnapshot>({semantic:()=>identical<string>(),slot:()=>median<number>(),chainTime:()=>median<number>()});
export function rpcRead(sender:HTTPSendRequester,url:string,method:string,params:unknown[]):unknown{
 const response=sender.sendRequest({url,method:'POST',headers:{'Content-Type':'application/json'},body:bytesToBase64(new TextEncoder().encode(JSON.stringify({jsonrpc:'2.0',id:1,method,params}))),timeout:'10s',cacheSettings:{store:false}}).result();
 if(response.statusCode!==200||response.body.length>16384)throw new Error(`RPC read unavailable (${response.statusCode})`);
 const parsed=JSON.parse(new TextDecoder().decode(response.body));if(!parsed||parsed.error||!('result' in parsed))throw new Error('RPC read unavailable (JSON-RPC error)');return parsed.result;
}
// Derive each vector prefix from the deployed IDL's fixed preceding fields.
function vectorOffset(typeName:string,fieldName:string){
 const definition=VOWPOOL_IDL.types.find(t=>t.name===typeName) as any;let offset=8;
 for(const field of definition.type.fields){if(field.name===fieldName)return offset;const type=field.type;
  const bytes=typeof type==='string'?({pubkey:32,u8:1,u64:8,i64:8} as Record<string,number>)[type]:type.array?.[0]==='u8'?type.array[1]:undefined;
  if(bytes===undefined)throw new Error('Unexpected IDL layout');offset+=bytes;
 }throw new Error('Missing IDL field');
}
function accountBytes(raw:unknown,program:string){
 const account=accountSchema.parse(raw);if(account.owner!==program||account.executable)throw new Error('Wrong program account owner');
 const data=Buffer.from(account.data[0],'base64');if(data.length<8||data.length>4096||data.toString('base64')!==account.data[0])throw new Error('Invalid account bytes');return data;
}
function boundedVector(data:Buffer,type:string,field:string,limit:number){const offset=vectorOffset(type,field),count=data.readUInt32LE(offset);if(count>limit||offset+4+count*32>data.length)throw new Error('Invalid account vector');return offset+4+count*32;}
function boundedCommitment(data:Buffer){
 let cursor=boundedVector(data,'Commitment','reviewers',7)+4; // ack, approvals, lifecycle, refund flag
 const present=data[cursor++];if(present!==0&&present!==1)throw new Error('Invalid GitHub option');
 if(present){for(const [limit,skip] of [[39,0],[100,4],[100,2]]){const size=data.readUInt32LE(cursor);cursor+=4;if(size>limit||cursor+size+skip>data.length)throw new Error('Invalid configuration string');cursor+=size+skip;}}
}
const canonicalAccount=(program:string,discriminator:Uint8Array,encoded:Uint8Array)=>({owner:program,executable:false,data:[Buffer.concat([discriminator,encoded]).toString('base64'),'base64']});
export function readRpcSnapshot(sender:HTTPSendRequester,url:string,program:string,groupAddress:string,forwarder:string,stateAddress:string,addresses:string[],wallNow:number):RpcSnapshot{
 if(addresses.length>5)throw new Error('Batch too large');[program,groupAddress,forwarder,stateAddress,...addresses].forEach(a=>addressSchema.parse(a));
 const keys=['SysvarC1ock11111111111111111111111111111111',stateAddress,groupAddress,...addresses];
 const result=z.object({context:z.object({slot:z.number().int().nonnegative().safe()}),value:z.array(z.unknown())}).parse(rpcRead(sender,url,'getMultipleAccounts',[keys,{encoding:'base64',commitment:'confirmed'}]));
 if(result.value.length!==keys.length)throw new Error('RPC account order/count mismatch');
 const clock=accountSchema.nullable().parse(result.value[0]),chainTime=chainObservationTime(clock,wallNow);
 const state=accountSchema.parse(result.value[1]);if(state.owner!==forwarder||state.executable)throw new Error('Forwarder state binding failed');
 let canonicalGroup:ReturnType<typeof canonicalAccount>|null=null,group:ReturnType<typeof decodeGroupAccount>|null=null;
 if(result.value[2]!==null){
  const data=accountBytes(result.value[2],program);boundedVector(data,'Group','roster',8);group=decodeGroupAccount(data);
  const expected=PublicKey.findProgramAddressSync([Buffer.from('group'),new PublicKey(group.founder).toBuffer()],new PublicKey(program))[0].toBase58();
  if(expected!==groupAddress||group.policy.forwarder!==forwarder||group.policy.forwarderState!==stateAddress)throw new Error('Group/PDA/policy binding failed');
  // Accounting is irrelevant to observation eligibility; the receiver owns it.
  canonicalGroup=canonicalAccount(program,ACCOUNT_GROUP_DISCRIMINATOR,new Uint8Array(groupCodec.encode({...group,active:0n,refundable:0n,pool:0n})));
 }
 const candidates=addresses.map((address,index)=>{try{
  if(!group)throw new Error('Group absent');const data=accountBytes(result.value[index+3],program);boundedCommitment(data);
  const c=validateFrozenAccount(program,groupAddress,address,group,decodeCommitmentAccount(data),group.policy);
  return {address,account:canonicalAccount(program,ACCOUNT_COMMITMENT_DISCRIMINATOR,new Uint8Array(commitmentCodec.encode(c))),diagnostic:null};
 }catch{return {address,account:null,diagnostic:'invalid/unavailable account'};}});
 return {slot:result.context.slot,chainTime,semantic:JSON.stringify({group:canonicalGroup,candidates})};
}
