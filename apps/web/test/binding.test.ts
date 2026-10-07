import {it,expect} from 'vitest';
import {Keypair} from '@solana/web3.js';
import {MetadataStore} from '../lib/metadata-store';
import {hashTerms} from '../../../packages/shared/src/terms';
const owner=Keypair.generate().publicKey.toBase58(),address=Keypair.generate().publicKey.toBase58();
const draft={owner,goal:'Ship',criteria:'Review',stake:'1',tokenDecimals:6,mode:'group',reviewers:[],goalDeadline:1000,reviewDeadline:1100} as const;
it.each(['amount','mode','goalDeadline','reviewDeadline','tokenDecimals','reviewers'])('rejects hash-valid terms with substituted chain %s',async field=>{
 const facts:any={owner,termsHash:Buffer.from(hashTerms(draft)).toString('hex'),amount:1000000n,tokenDecimals:6,mode:'group',reviewers:[],goalDeadline:1000,reviewDeadline:1100,github:undefined};
 facts[field]=({amount:2n,mode:'single',goalDeadline:999,reviewDeadline:1111,tokenDecimals:9,reviewers:[owner]} as any)[field];
 const store=new MetadataStore(':memory:',async()=>facts);
 try{await expect(store.putTerms(address,draft)).rejects.toThrow('Terms do not match');}finally{store.close();}
});
