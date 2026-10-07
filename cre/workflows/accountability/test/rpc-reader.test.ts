import {it,expect} from 'vitest';
import {Buffer} from 'buffer';
import {Keypair,PublicKey} from '@solana/web3.js';
import {address as solanaAddress} from '@solana/addresses';
import {hashGithubConfig} from '../../../../packages/shared/src/terms';
import {readRpcSnapshot,rpcSnapshotConsensus} from '../rpc-reader';
import {ACCOUNT_GROUP_DISCRIMINATOR,ACCOUNT_COMMITMENT_DISCRIMINATOR,groupCodec,commitmentCodec,decodeCommitmentAccount,Lifecycle,VOWPOOL_PROGRAM_ID} from '../generated/Vowpool';
const program=VOWPOOL_PROGRAM_ID,key=()=>solanaAddress(Keypair.generate().publicKey.toBase58()),founder=key(),owner=key();
const group=PublicKey.findProgramAddressSync([Buffer.from('group'),new PublicKey(founder).toBuffer()],new PublicKey(program))[0].toBase58();
const nonce=9007199254740993n,nonceBytes=Buffer.alloc(8);nonceBytes.writeBigUInt64LE(nonce);
const commitment=PublicKey.findProgramAddressSync([Buffer.from('commitment'),new PublicKey(group).toBuffer(),new PublicKey(owner).toBuffer(),nonceBytes],new PublicKey(program))[0].toBase58();
const policy={forwarder:key(),forwarderState:key(),workflowCid:Array(32).fill(1),workflowName:Array(10).fill(2),workflowOwner:Array(20).fill(3)};
const github={owner:'alice',repo:'project',pr:1,targetBranch:'main',policyVersion:1 as const};
const g={founder,bump:1,roster:[founder,owner],treasurer:founder,treasuryRecipient:founder,mint:key(),vault:key(),active:1n,refundable:2n,pool:3n,policy};
const c={group:solanaAddress(group),owner,nonce,bump:1,termsHash:Array(32).fill(1),amount:9007199254740995n,goalDeadline:1100n,reviewDeadline:1200n,hardDeadline:174000n,activatedAt:1000n,mode:3,reviewers:[],acknowledgments:0,approvals:0,status:Lifecycle.Active,refundReleased:false,github,configHash:Array.from(hashGithubConfig({program,group,commitment,...policy},github,{goalDeadline:1100,reviewDeadline:1200,hardDeadline:174000})),policy,observedAt:0n,mergedAt:0n,branchHash:Array(32).fill(0),reportId:[0,0]};
const raw=(disc:Uint8Array,data:Uint8Array)=>Buffer.concat([disc,data]);
const account=(data:Uint8Array,accountOwner:string=program)=>({owner:accountOwner,executable:false,data:[Buffer.from(data).toString('base64'),'base64'],lamports:1});
const clock=Buffer.alloc(40);clock.writeBigInt64LE(1050n,32);
const fixture=()=>({jsonrpc:'2.0',id:1,result:{context:{slot:100},value:[account(clock,'Sysvar1111111111111111111111111111111111111'),account(Buffer.alloc(1),policy.forwarder),account(raw(ACCOUNT_GROUP_DISCRIMINATOR,new Uint8Array(groupCodec.encode(g)))),account(raw(ACCOUNT_COMMITMENT_DISCRIMINATOR,new Uint8Array(commitmentCodec.encode(c))))]}});
function sender(response:unknown,status=200){const requests:any[]=[];return {requests,sendRequest:(request:unknown)=>{requests.push(request);return {result:()=>({statusCode:status,body:new TextEncoder().encode(JSON.stringify(response)),headers:{'Retry-After':'30'}})};}};}
const read=(response:unknown,status=200,addresses=[commitment])=>readRpcSnapshot(sender(response,status) as any,'https://api.devnet.solana.com',program,group,policy.forwarder,policy.forwarderState,addresses,1051);
it('uses one confirmed base64 getMultipleAccounts batch in request order',()=>{
 const s=sender(fixture());const result=readRpcSnapshot(s as any,'https://api.devnet.solana.com',program,group,policy.forwarder,policy.forwarderState,[commitment],1051);
 const request=JSON.parse(Buffer.from(s.requests[0].body,'base64').toString());
 expect(request.method).toBe('getMultipleAccounts');expect(request.params[0]).toEqual(['SysvarC1ock11111111111111111111111111111111',policy.forwarderState,group,commitment]);expect(request.params[1]).toEqual({encoding:'base64',commitment:'confirmed'});expect(result.slot).toBe(100);expect(result.chainTime).toBe(1050);
});
it.each([403,429,500])('HTTP %s is read unavailable and cannot produce candidates',status=>expect(()=>read(fixture(),status)).toThrow('unavailable'));
it('rejects JSON-RPC error, timeout, malformed envelope and oversized body',()=>{
 expect(()=>read({error:{code:-32005,message:'busy'}})).toThrow();expect(()=>read({result:{value:[]}})).toThrow();expect(()=>read('x'.repeat(20000))).toThrow();
 expect(()=>readRpcSnapshot({sendRequest:()=>{throw new Error('timeout');}} as any,'https://api.devnet.solana.com',program,group,policy.forwarder,policy.forwarderState,[commitment],1051)).toThrow('timeout');
});
it.each(['null','owner','discriminator','truncated','group','hash','pda','vector'])('isolates invalid %s candidate and continues the valid next item',kind=>{
 const f:any=fixture();const bad=structuredClone(f.result.value[3]);let candidate=structuredClone(c);
 if(kind==='null')f.result.value.push(null);
 else {if(kind==='owner')bad.owner=owner;if(kind==='discriminator')bad.data[0]=Buffer.alloc(100).toString('base64');if(kind==='truncated')bad.data[0]=Buffer.from([1]).toString('base64');if(kind==='group')candidate.group=owner;if(kind==='hash')candidate.configHash[0]^=1;
 if(['group','hash'].includes(kind))bad.data[0]=raw(ACCOUNT_COMMITMENT_DISCRIMINATOR,new Uint8Array(commitmentCodec.encode(candidate))).toString('base64');
 if(kind==='vector'){const bytes=Buffer.from(bad.data[0],'base64');bytes.writeUInt32LE(0xffffffff,154);bad.data[0]=bytes.toString('base64');}
 f.result.value.push(bad);}
 [f.result.value[3],f.result.value[4]]=[f.result.value[4],f.result.value[3]];
 const out=JSON.parse(read(f,200,[kind==='pda'?owner:commitment,commitment]).semantic);
 expect(out.candidates[0].account).toBeNull();expect(out.candidates[0].diagnostic).toBe('invalid/unavailable account');expect(out.candidates[1].account).not.toBeNull();
});
it('requires correct group owner, discriminator and forwarder state',()=>{
 for(const position of [1,2]){const f:any=fixture();f.result.value[position].owner=owner;expect(()=>read(f)).toThrow();}
 const f=fixture();f.result.value[2].data[0]=Buffer.alloc(100).toString('base64');expect(()=>read(f)).toThrow();
});
it('consensus ignores context slots, rent, lamports and unrelated group accounting',()=>{
 const a=fixture(),b=fixture();b.result.context.slot=101;b.result.value[3].lamports=99;b.result.value[2].data[0]=raw(ACCOUNT_GROUP_DISCRIMINATOR,new Uint8Array(groupCodec.encode({...g,pool:999n,active:888n}))).toString('base64');
 expect(read(a).semantic).toBe(read(b).semantic);expect(read(a).slot).not.toBe(read(b).slot);
 const descriptor:any=rpcSnapshotConsensus().descriptor;
 expect(descriptor.descriptor.case).toBe('fieldsMap');expect(Object.keys(descriptor.descriptor.value.fields)).toEqual(['semantic','slot','chainTime']);
});
it('relevant state disagreement changes the identical-consensus field',()=>{
 const f=fixture();f.result.value[3].data[0]=raw(ACCOUNT_COMMITMENT_DISCRIMINATOR,new Uint8Array(commitmentCodec.encode({...c,status:Lifecycle.Succeeded}))).toString('base64');expect(read(f).semantic).not.toBe(read(fixture()).semantic);
});
it('preserves nonce and amount above JS safe integer precision',()=>{
 const output=JSON.parse(read(fixture()).semantic);const decoded=decodeCommitmentAccount(Buffer.from(output.candidates[0].account.data[0],'base64'));expect(decoded.nonce).toBe(nonce);expect(decoded.amount).toBe(c.amount);
});
