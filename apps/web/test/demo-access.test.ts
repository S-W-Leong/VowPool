import {expect,it} from 'vitest';
import {Keypair} from '@solana/web3.js';
import {createPrivateKey,sign} from 'node:crypto';
import {DemoAccess} from '../lib/demo-access';
const wallet=Keypair.generate(),mint=Keypair.generate().publicKey.toBase58();
const signature=(message:string,key=wallet)=>sign(null,Buffer.from(message),createPrivateKey({key:Buffer.concat([Buffer.from('302e020100300506032b657004220420','hex'),Buffer.from(key.secretKey.slice(0,32))]),format:'der',type:'pkcs8'})).toString('base64');
it('requires wallet ownership and consumes a funding challenge once',async()=>{
 const access=new DemoAccess(':memory:',()=>100);const c=access.challenge(wallet.publicKey.toBase58(),mint);
 await expect(access.claim(c.id,signature(c.message,Keypair.generate()),async()=>({signature:null}))).rejects.toThrow(/signature/);
 const result=await access.claim(c.id,signature(c.message),async()=>({signature:'confirmed-receipt'}));
 expect(result.signature).toBe('confirmed-receipt');
 await expect(access.claim(c.id,signature(c.message),async()=>({signature:'duplicate'}))).rejects.toThrow(/used/);
 const next=access.challenge(wallet.publicKey.toBase58(),mint);
 const repeated=await access.claim(next.id,signature(next.message),async()=>{throw Error('Must not fund again');});
 expect(repeated.signature).toBe('confirmed-receipt');
});
it('rejects expired signed requests',async()=>{
 let now=100;const access=new DemoAccess(':memory:',()=>now),c=access.challenge(wallet.publicKey.toBase58(),mint);now=400;
 await expect(access.claim(c.id,signature(c.message),async()=>({signature:null}))).rejects.toThrow(/expired/);
});
it('does not resend a grant when submission confirmation is unavailable',async()=>{
 const access=new DemoAccess(':memory:',()=>100),c=access.challenge(wallet.publicKey.toBase58(),mint);
 await expect(access.claim(c.id,signature(c.message),async(_wallet,record)=>{record('uncertain-receipt');throw Error('Confirmation unavailable');})).rejects.toThrow();
 const next=access.challenge(wallet.publicKey.toBase58(),mint);
 await expect(access.claim(next.id,signature(next.message),async()=>{throw Error('Unsafe duplicate');})).rejects.toThrow(/pending/);
});
it('bounds the utility payer to twenty distinct demo grants',async()=>{
 const access=new DemoAccess(':memory:',()=>100);
 for(let i=0;i<20;i++){const key=Keypair.generate(),c=access.challenge(key.publicKey.toBase58(),mint);await access.claim(c.id,signature(c.message,key),async()=>({signature:null}));}
 const c=access.challenge(wallet.publicKey.toBase58(),mint);
 await expect(access.claim(c.id,signature(c.message),async()=>{throw Error('Must not exceed funding budget');})).rejects.toThrow(/limit/);
});
