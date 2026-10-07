import {it,expect,beforeEach,afterEach} from 'vitest';
import {Keypair} from '@solana/web3.js';
import {sign,createPrivateKey} from 'node:crypto';
import {MetadataStore,hashEvidence} from '../lib/metadata-store';
import {hashTerms} from '../../../packages/shared/src/terms';
const owner=Keypair.generate();
const address=Keypair.generate().publicKey.toBase58();
const draft={owner:owner.publicKey.toBase58(),goal:'Ship',criteria:'Review',stake:'1',mode:'group',reviewers:[],goalDeadline:1000,reviewDeadline:1100};
const chain={owner:draft.owner,termsHash:Buffer.from(hashTerms(draft)).toString('hex'),amount:1000000n,tokenDecimals:6,mode:'group' as const,reviewers:[],goalDeadline:1000,reviewDeadline:1100};
let now=100,store:MetadataStore;
const sig=(msg:string,key=owner)=>sign(null,Buffer.from(msg),createPrivateKey({key:Buffer.concat([Buffer.from('302e020100300506032b657004220420','hex'),Buffer.from(key.secretKey.slice(0,32))]),format:'der',type:'pkcs8'})).toString('base64');
beforeEach(()=>{now=100;store=new MetadataStore(':memory:',async()=>chain,()=>now);});afterEach(()=>store.close());
it('stores only terms matching confirmed chain hash and retries identical writes',async()=>{
 await store.putTerms(address,draft);await store.putTerms(address,draft);expect((await store.getTerms(address)).terms?.goal).toBe('Ship');
 await expect(store.putTerms(address,{...draft,goal:'Changed'})).rejects.toThrow();expect((await store.getTerms(address)).terms?.goal).toBe('Ship');
});
it('reports missing terms without inventing data',async()=>expect((await store.getTerms(address)).status).toBe('missing'));
it('detects chain hash changes on every read',async()=>{await store.putTerms(address,draft);chain.termsHash='00'.repeat(32);expect((await store.getTerms(address)).status).toBe('unverified');chain.termsHash=Buffer.from(hashTerms(draft)).toString('hex');});
it('accepts owner signature once and rejects replay',async()=>{
 const content={note:'Here is the result',url:'https://github.com/alice/project/pull/1'};
 const c=await store.challenge(address,hashEvidence(content));await store.addEvidence(address,content,c.id,sig(c.message));
 expect(store.evidence(address)).toHaveLength(1);await expect(store.addEvidence(address,content,c.id,sig(c.message))).rejects.toThrow();expect(store.evidence(address)).toHaveLength(1);
});
it.each(['signer','content','commitment','expiry'])('rejects evidence %s substitution',async kind=>{
 const content={note:'Done'};const c=await store.challenge(address,hashEvidence(content));if(kind==='expiry')now=400;
 await expect(store.addEvidence(kind==='commitment'?Keypair.generate().publicKey.toBase58():address,kind==='content'?{note:'Changed'}:content,c.id,sig(c.message,kind==='signer'?Keypair.generate():owner))).rejects.toThrow();expect(store.evidence(address)).toHaveLength(0);
});
it('rejects non-HTTPS and oversized evidence',async()=>{expect(()=>hashEvidence({note:'x',url:'javascript:alert(1)'})).toThrow();expect(()=>hashEvidence({note:'🦉'.repeat(501)})).toThrow();});
