import {CronCapability,HTTPClient,SolanaClient,Runner,handler,consensusIdenticalAggregation,bytesToHex,solanaAccountMeta,solanaAccountMetasToJson,calculateAccountsHash,encodeForwarderReport,prepareSolanaReportRequest,type HTTPSendRequester,type Runtime,type SolanaAccountMeta} from '@chainlink/cre-sdk';
import {PublicKey} from '@solana/web3.js';
import {Buffer} from 'buffer';
import bs58 from 'bs58';
import {sha256} from '@noble/hashes/sha256';
import {z} from 'zod';
import {evaluateGithub,githubUrl,type Observation} from '../../../packages/shared/src/github';
import {githubConfigSchema,addressSchema} from '../../../packages/shared/src/schema';
import {decodeGroupAccount,decodeCommitmentAccount,oracleReportCodec,VOWPOOL_PROGRAM_ID,Lifecycle,type Group,type OracleReport} from './generated/Vowpool';
import {compactGithubObservation,selectCandidates,validateFrozenAccount,operationFor} from './processing';
import {accountSchema,rpcRead,readRpcSnapshot,rpcSnapshotConsensus} from './rpc-reader';
const localSchema=z.object({mode:z.literal('local-simulation'),schedule:z.string(),samplePreviousPrice:z.string(),sample:githubConfigSchema.extend({activatedAt:z.number().int(),goalDeadline:z.number().int()})}).strict();
const httpsUrl=z.string().max(2048).regex(/^https:\/\/[A-Za-z0-9.-]+(?::[0-9]+)?(?:\/[^\s]*)?$/);
const deployedSchema=z.object({mode:z.enum(['staging','live','rpc-check']),schedule:z.string(),chainSelector:z.literal('16423721717087811551'),rpcUrl:httpsUrl,receiverProgramId:z.literal(VOWPOOL_PROGRAM_ID),group:addressSchema,forwarderProgramId:addressSchema,forwarderState:addressSchema,candidatesUrl:httpsUrl.optional(),candidateAddresses:z.array(addressSchema).max(100).optional()}).strict().refine(c=>!!c.candidatesUrl||!!c.candidateAddresses?.length,'Configure candidatesUrl or known candidateAddresses');
const configSchema=z.union([localSchema,deployedSchema]);
type Config=z.infer<typeof configSchema>;type DeployedConfig=z.infer<typeof deployedSchema>;
const requestGithub=(sender:HTTPSendRequester,config:z.infer<typeof githubConfigSchema>):string=>{
 try{const response=sender.sendRequest({url:githubUrl(config),method:'GET',headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'VowPool-CRE'},timeout:'10s',cacheSettings:{store:false}}).result();
 return JSON.stringify(compactGithubObservation(response.statusCode,new TextDecoder().decode(response.body)));
 }catch{return JSON.stringify({status:0,body:null});}
};
const genesis=(sender:HTTPSendRequester,url:string):string=>z.string().parse(rpcRead(sender,url,'getGenesisHash',[]));
const requestCandidates=(sender:HTTPSendRequester,url:string):string=>{
 const response=sender.sendRequest({url,method:'GET',timeout:'10s',cacheSettings:{store:false}}).result();if(response.statusCode!==200||response.body.length>16384)throw new Error('Discovery unavailable');
 const data=z.object({addresses:z.array(z.unknown()).max(100)}).parse(JSON.parse(new TextDecoder().decode(response.body)));return JSON.stringify(data.addresses);
};
function metas(config:DeployedConfig,address:string):SolanaAccountMeta[]{const state=new PublicKey(config.forwarderState),receiver=new PublicKey(config.receiverProgramId);const authority=PublicKey.findProgramAddressSync([Buffer.from('forwarder'),state.toBuffer(),receiver.toBuffer()],new PublicKey(config.forwarderProgramId))[0];return [solanaAccountMeta(config.forwarderState,false),solanaAccountMeta(authority.toBase58(),false),solanaAccountMeta(config.group,true),solanaAccountMeta(address,true)];}
function makeReport(runtime:Runtime<Config>,input:OracleReport,accounts:SolanaAccountMeta[]){return runtime.report(prepareSolanaReportRequest(encodeForwarderReport({accountHash:calculateAccountsHash(accounts),payload:new Uint8Array(oracleReportCodec.encode(input))}))).result();}
function metadata(report:ReturnType<typeof makeReport>){const raw=report.rawReport();return {workflowCid:Array.from(raw.slice(45,77)),workflowName:Array.from(raw.slice(77,87)),workflowOwner:Array.from(raw.slice(87,107))};}
export const onCron=(runtime:Runtime<Config>):string=>{
 const config=configSchema.parse(runtime.config),http=new HTTPClient();let now=Math.floor(runtime.now().getTime()/1000);
 if(config.mode==='local-simulation'){
 const {activatedAt,goalDeadline,...githubConfig}=config.sample;const raw=http.sendRequest(runtime,requestGithub,consensusIdenticalAggregation<string>())(githubConfig).result();const result=evaluateGithub(githubConfig,JSON.parse(raw),activatedAt,goalDeadline,now);
 const summary=JSON.stringify({mode:config.mode,source:'public-github-api',result,observedAt:now,warning:'Sample criteria; no VowPool account read or transaction submitted'});runtime.log(summary);return summary;
 }
 const genesisHash=http.sendRequest(runtime,genesis,consensusIdenticalAggregation<string>())(config.rpcUrl).result();if(genesisHash!=='EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG')throw new Error('Configured RPC is not Solana Devnet');
 let hints:unknown=config.candidateAddresses??[];
 if(config.candidatesUrl){try{hints=JSON.parse(http.sendRequest(runtime,requestCandidates,consensusIdenticalAggregation<string>())(config.candidatesUrl).result());}catch{runtime.log('Candidate API unavailable; using configured public-address hints');}}
 const candidates=selectCandidates(hints,now);
 const snapshot=http.sendRequest(runtime,readRpcSnapshot,rpcSnapshotConsensus())(config.rpcUrl,config.receiverProgramId,config.group,config.forwarderProgramId,config.forwarderState,candidates,now).result();
 now=snapshot.chainTime;
 const decoded=z.object({group:accountSchema.nullable(),candidates:z.array(z.object({address:addressSchema,account:accountSchema.nullable(),diagnostic:z.string().nullable()})).max(5)}).parse(JSON.parse(snapshot.semantic));
 const rawGroup=decoded.group;
 const readEvidence={read:'confirmed-devnet-rpc',slot:snapshot.slot,group:config.group,candidates:decoded.candidates.map(row=>{if(!row.account)return {address:row.address,diagnostic:row.diagnostic,write:false};const c=decodeCommitmentAccount(Buffer.from(row.account.data[0],'base64'));return {address:row.address,nonce:c.nonce.toString(),amount:c.amount.toString(),status:c.status,goalDeadline:c.goalDeadline.toString(),reviewDeadline:c.reviewDeadline.toString(),configHash:Buffer.from(c.configHash).toString('hex')};})};
 runtime.log(JSON.stringify(readEvidence));
 if(config.mode==='rpc-check')return JSON.stringify({...readEvidence,mode:config.mode,readOnly:true,reportCreated:false,write:false});
 if(!rawGroup){const accounts=metas(config,config.group);const preview=makeReport(runtime,{operation:4,commitment:config.group as OracleReport['commitment'],configHash:Array(32).fill(0),policyVersion:1,source:1,observedAt:BigInt(now),merged:false,mergedAt:0n,branchHash:Array(32).fill(0)},accounts);const summary=JSON.stringify({mode:config.mode,group:config.group,policyMetadata:metadata(preview),warning:'Group absent. Policy preflight only; no Solana write.'});runtime.log(summary);return summary;}
 if(rawGroup.owner!==config.receiverProgramId||rawGroup.executable)throw new Error('Group account owner mismatch');const group=decodeGroupAccount(Buffer.from(rawGroup.data[0],'base64'));
 if(group.policy.forwarder!==config.forwarderProgramId||group.policy.forwarderState!==config.forwarderState)throw new Error('Wrong configured forwarder');
 const results:unknown[]=[];
 const client=new SolanaClient(BigInt(config.chainSelector));
 for(const row of decoded.candidates){const address=row.address;if(!row.account){results.push({address,state:'read-unavailable',write:false});continue;}try{
 const c=validateFrozenAccount(config.receiverProgramId,config.group,address,group,decodeCommitmentAccount(Buffer.from(row.account.data[0],'base64')),group.policy);
 let observation:Observation={status:0,body:null},result:'SUCCESS'|'FAIL'|'PENDING'|'UNKNOWN'='UNKNOWN';
 if(c.mode===3&&c.status===Lifecycle.Active&&now<=Number(c.hardDeadline)){
 const github=githubConfigSchema.parse(c.github);observation=JSON.parse(http.sendRequest(runtime,requestGithub,consensusIdenticalAggregation<string>())(github).result());result=evaluateGithub(github,observation,Number(c.activatedAt),Number(c.goalDeadline),now);
 }
 const operation=operationFor(c,now,result);if(operation===null){results.push({address,result,write:false});continue;}
 const body=observation.body as {merged:boolean;merged_at:string|null;base:{ref:string}}|null;
 const input:OracleReport={operation,commitment:address as OracleReport['commitment'],configHash:c.configHash,policyVersion:1,source:1,observedAt:BigInt(now),merged:body?.merged??false,mergedAt:body?.merged&&body.merged_at?BigInt(Date.parse(body.merged_at)/1000):0n,branchHash:Array.from(sha256(new TextEncoder().encode(body?.base.ref??'')))};
 const accounts=metas(config,address);
 if(operation===3){const token=new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');const destination=PublicKey.findProgramAddressSync([new PublicKey(c.owner).toBuffer(),token.toBuffer(),new PublicKey(group.mint).toBuffer()],new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'))[0];accounts.push(solanaAccountMeta(group.vault,true),solanaAccountMeta(destination.toBase58(),true),solanaAccountMeta(token.toBase58(),false));}
 const report=makeReport(runtime,input,accounts),actual=metadata(report);for(const field of ['workflowCid','workflowName','workflowOwner'] as const)if(JSON.stringify(actual[field])!==JSON.stringify(group.policy[field]))throw new Error('Report workflow identity differs from frozen group policy');
 const delivery=client.writeReport(runtime,{receiver:bytesToHex(new PublicKey(config.receiverProgramId).toBytes()),remainingAccounts:solanaAccountMetasToJson(accounts),computeConfig:{computeLimit:250000},report}).result();
 if(delivery.txStatus!==2||delivery.receiverContractExecutionStatus!==0)throw new Error(`Report rejected (${delivery.txStatus}/${delivery.receiverContractExecutionStatus}): ${(delivery.errorMessage??'No capability detail').slice(0,1000)}`);
 if(config.mode==='live'&&!delivery.txSignature?.length)throw new Error('Live delivery returned no transaction signature');
 results.push({address,operation,result,txStatus:delivery.txStatus,receiverStatus:delivery.receiverContractExecutionStatus,signature:delivery.txSignature?.length?bs58.encode(delivery.txSignature):null,dryRun:!delivery.txSignature?.length});
 }catch(error){results.push({address,state:'retry',error:error instanceof Error?error.message:'Unavailable evidence'});}}
 const summary=JSON.stringify({mode:config.mode,observedAt:now,results});runtime.log(summary);return summary;
};
const initWorkflow=(config:Config)=>[handler(new CronCapability().trigger({schedule:config.schedule}),onCron)];
export async function main(){const runner=await Runner.newRunner<Config>({configSchema});await runner.run(initWorkflow);}main();
