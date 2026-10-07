import {test,expect} from 'bun:test';
import {setup,metadata,forwarder} from './helpers';
import {Writer} from '../../packages/shared/src/borsh';
import {sha256} from '@noble/hashes/sha256';
import {BN} from '@coral-xyz/anchor';
import {PublicKey} from '@solana/web3.js';
const github={owner:'alice',repo:'project',pr:1,targetBranch:'main',policyVersion:1};
const report=(c:PublicKey,hash:number[],overrides:Record<string,any>={})=>{
 const r={operation:0,commitment:c.toBase58(),configHash:hash,policyVersion:1,source:1,observedAt:1050,merged:true,mergedAt:1050,branchHash:sha256(new TextEncoder().encode('main')),...overrides};
 return Buffer.from(new Writer().n(r.operation,1).key(r.commitment).raw(r.configHash).n(r.policyVersion,2).n(r.source,1).n(r.observedAt,8).n(r.merged?1:0,1).n(r.mergedAt,8).raw(r.branchHash).finish());
};
async function active(){const h=await setup(),c=await h.create(3,[],{github});await h.act('activate',c);h.clock(1050);return {h,c,payload:report(c,h.read(c).configHash)};}
test('rejects_unsigned_authority',async()=>{const {h,c,payload}=await active();const ix=await h.program.methods.onReport(metadata,payload).accounts({state:h.state,forwarderAuthority:h.authority,group:h.group,commitment:c}).instruction();ix.keys.find(k=>k.pubkey.equals(h.authority))!.isSigner=false;expect(()=>h.send(ix)).toThrow();});
test('rejects_wrong_forwarder_state',async()=>{const {h,c,payload}=await active();expect(()=>h.deliver(c,payload,metadata,h.group)).toThrow();});
test('rejects_other_workflow_cid',async()=>{const {h,c,payload}=await active();const m=Buffer.from(metadata);m[0]=7;expect(()=>h.deliver(c,payload,m)).toThrow();});
test('rejects_short_metadata',async()=>{const {h,c,payload}=await active();expect(()=>h.deliver(c,payload,metadata.subarray(0,63))).toThrow();});
test('accepts_authenticated_mock_forwarder_cpi',async()=>{const {h,c,payload}=await active();h.deliver(c,payload);expect(h.read(c).status).toEqual({succeeded:{}});expect(h.readGroup().refundable.toString()).toBe('1250000');expect(()=>h.deliver(c,payload)).toThrow();});
test('rejects unauthorized workflow owner/name and malformed/trailing payload',async()=>{const {h,c,payload}=await active();for(const offset of [32,42]){const m=Buffer.from(metadata);m[offset]++;expect(()=>h.deliver(c,payload,m)).toThrow();}expect(()=>h.deliver(c,Buffer.concat([payload,Buffer.from([0])]))).toThrow();expect(()=>h.deliver(c,payload.subarray(0,10))).toThrow();});
test('D rejects human approval and peer expiry',async()=>{const {h,c}=await active();await expect(h.act('approve',c,h.reviewer)).rejects.toThrow();h.clock(1201);await expect(h.act('settleExpired',c)).rejects.toThrow();});
test('rejects config/policy/source/commitment substitution, future facts and early failure',async()=>{
 const {h,c}=await active(),hash=h.read(c).configHash;
 for(const override of [{configHash:Array(32).fill(9)},{policyVersion:2},{source:2},{commitment:h.group.toBase58()},{observedAt:1051},{mergedAt:1000},{mergedAt:1101},{operation:1,merged:false,mergedAt:0}])expect(()=>h.deliver(c,report(c,hash,override))).toThrow();expect(h.read(c).status).toEqual({active:{}});
});
test('valid non-qualifying evidence fails only strictly after goal deadline',async()=>{
 const {h,c}=await active(),hash=h.read(c).configHash;h.clock(1100);expect(()=>h.deliver(c,report(c,hash,{operation:1,observedAt:1100,merged:false,mergedAt:0}))).toThrow();h.clock(1101);h.deliver(c,report(c,hash,{operation:1,observedAt:1101,merged:false,mergedAt:0}));expect(h.read(c).status).toEqual({failed:{}});expect(h.readGroup().pool.toString()).toBe('1250000');
});
test('D hard deadline is inclusive; unresolved refund strictly after 48-hour grace',async()=>{
 const {h,c,payload}=await active();const hard=174000;h.clock(hard);await expect(h.act('resolveUnverified',c)).rejects.toThrow();h.deliver(c,payload);expect(h.read(c).status).toEqual({succeeded:{}});
 const h2=await setup(),c2=await h2.create(3,[],{github});await h2.act('activate',c2);h2.clock(hard+1);expect(()=>h2.deliver(c2,report(c2,h2.read(c2).configHash))).toThrow();await h2.act('resolveUnverified',c2,h2.outsider);expect(h2.read(c2).status).toEqual({unresolved:{}});await expect(h2.act('resolveUnverified',c2)).rejects.toThrow();await h2.act('releaseRefund',c2,h2.outsider);expect(h2.balance(h2.ownerAta)).toBe(10000000n);
});
test('oracle outcomes cannot settle peer mode or replay into another D commitment',async()=>{
 const {h,c,payload}=await active();const other=await h.create(3,[],{github});await h.act('activate',other);expect(()=>h.deliver(other,payload)).toThrow();const peer=await h.create(2,[]);await h.act('activate',peer);expect(()=>h.deliver(peer,report(peer,h.read(peer).configHash))).toThrow();
});
