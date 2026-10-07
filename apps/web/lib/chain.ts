import {Buffer} from 'buffer';
import {Program,BN,type Idl} from '@coral-xyz/anchor';
import {Connection,PublicKey} from '@solana/web3.js';
import {getMint,TOKEN_PROGRAM_ID} from '@solana/spl-token';
import idl from '../../../idl/vowpool.json';
import {modes,githubConfigSchema,type GithubConfig,type VerificationMode} from '../../../packages/shared/src/schema';
export const PROGRAM_ID=new PublicKey(idl.address);
export const DEVNET_GENESIS='EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG';
export const rpcUrl=process.env.NEXT_PUBLIC_SOLANA_RPC_URL||'https://api.devnet.solana.com';
export const groupAddress=process.env.NEXT_PUBLIC_VOWPOOL_GROUP||'';
export const programFor=(connection:Connection)=>new Program(idl as Idl,{connection});
export type Policy={forwarder:PublicKey;forwarderState:PublicKey;workflowCid:number[];workflowName:number[];workflowOwner:number[]};
export type GroupView={address:string;founder:string;roster:string[];treasurer:string;treasuryRecipient:string;mint:string;vault:string;active:bigint;refundable:bigint;pool:bigint;decimals:number;policy:Policy;automatedReady:boolean};
export type CommitmentView={address:string;group:string;owner:string;nonce:bigint;termsHash:string;amount:bigint;mode:VerificationMode;reviewers:string[];goalDeadline:number;reviewDeadline:number;hardDeadline:number;activatedAt:number;acknowledgments:number;approvals:number;status:'draft'|'active'|'succeeded'|'failed'|'unresolved';refundReleased:boolean;github?:GithubConfig;configHash:string;policy:Policy;observedAt:number;mergedAt:number};
const hex=(a:number[])=>Buffer.from(a).toString('hex');
function commitment(address:PublicKey,c:any):CommitmentView{
 const expected=PublicKey.findProgramAddressSync([Buffer.from('commitment'),c.group.toBuffer(),c.owner.toBuffer(),c.nonce.toArrayLike(Buffer,'le',8)],PROGRAM_ID)[0];
 if(!address.equals(expected)||!modes[c.mode])throw new Error('Invalid commitment account');
 return {address:address.toBase58(),group:c.group.toBase58(),owner:c.owner.toBase58(),nonce:BigInt(c.nonce.toString()),termsHash:hex(c.termsHash),amount:BigInt(c.amount.toString()),mode:modes[c.mode],reviewers:c.reviewers.map((p:PublicKey)=>p.toBase58()),goalDeadline:c.goalDeadline.toNumber(),reviewDeadline:c.reviewDeadline.toNumber(),hardDeadline:c.hardDeadline.toNumber(),activatedAt:c.activatedAt.toNumber(),acknowledgments:c.acknowledgments,approvals:c.approvals,status:Object.keys(c.status)[0] as CommitmentView['status'],refundReleased:c.refundReleased,github:c.github?githubConfigSchema.parse(c.github):undefined,configHash:hex(c.configHash),policy:c.policy,observedAt:c.observedAt.toNumber(),mergedAt:c.mergedAt.toNumber()};
}
export async function readGroup(connection:Connection,address:string):Promise<GroupView>{
 const key=new PublicKey(address),p=programFor(connection),g=await (p.account as any).group.fetch(key,'confirmed');
 if(!key.equals(PublicKey.findProgramAddressSync([Buffer.from('group'),g.founder.toBuffer()],PROGRAM_ID)[0]))throw new Error('Invalid group PDA');
 const mint=await getMint(connection,g.mint,'confirmed',TOKEN_PROGRAM_ID);
 return {address,founder:g.founder.toBase58(),roster:g.roster.map((k:PublicKey)=>k.toBase58()),treasurer:g.treasurer.toBase58(),treasuryRecipient:g.treasuryRecipient.toBase58(),mint:g.mint.toBase58(),vault:g.vault.toBase58(),active:BigInt(g.active.toString()),refundable:BigInt(g.refundable.toString()),pool:BigInt(g.pool.toString()),decimals:mint.decimals,policy:g.policy,automatedReady:[g.policy.workflowCid,g.policy.workflowName,g.policy.workflowOwner].every((v:number[])=>v.some(x=>x!==0))};
}
export async function readCommitment(connection:Connection,address:string){
 const p=programFor(connection),key=new PublicKey(address);return commitment(key,await (p.account as any).commitment.fetch(key,'confirmed'));
}
export async function readCommitments(connection:Connection,group:string):Promise<CommitmentView[]>{
 const p=programFor(connection);const rows=await (p.account as any).commitment.all([{memcmp:{offset:8,bytes:new PublicKey(group).toBase58()}}]);
 return rows.map((r:any)=>commitment(r.publicKey,r.account)).sort((a:CommitmentView,b:CommitmentView)=>b.goalDeadline-a.goalDeadline);
}
export const commitmentPda=(group:string,owner:string,nonce:bigint)=>PublicKey.findProgramAddressSync([Buffer.from('commitment'),new PublicKey(group).toBuffer(),new PublicKey(owner).toBuffer(),new BN(nonce.toString()).toArrayLike(Buffer,'le',8)],PROGRAM_ID)[0];
