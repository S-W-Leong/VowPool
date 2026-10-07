import {test,expect} from 'bun:test';
import {setup} from './helpers';
import {BN} from '@coral-xyz/anchor';
import {getAssociatedTokenAddressSync,TOKEN_PROGRAM_ID} from '@solana/spl-token';
import {PublicKey,SystemProgram as System} from '@solana/web3.js';
test('refund is exact, permissionless, owner-only, replay-safe and separate from outcome',async()=>{
 const h=await setup(),c=await h.create(2,[]);await h.act('activate',c);await h.act('approve',c,h.other);
 expect(h.balance(h.ownerAta)).toBe(8750000n);expect(h.read(c).refundReleased).toBe(false);
 const wrong=getAssociatedTokenAddressSync(h.mint.publicKey,h.other.publicKey);
 await expect(h.act('releaseRefund',c,h.outsider,{destination:wrong})).rejects.toThrow();expect(h.read(c).status).toEqual({succeeded:{}});expect(h.readGroup().refundable.toString()).toBe('1250000');
 await h.act('releaseRefund',c,h.outsider);expect(h.balance(h.ownerAta)).toBe(10000000n);expect(h.readGroup().refundable.toString()).toBe('0');await expect(h.act('releaseRefund',c)).rejects.toThrow();
});
test('treasurer can spend only forfeitures and only to fixed recipient ATA',async()=>{
 const h=await setup(),active=await h.create(2,[]),refundable=await h.create(2,[]),failed=await h.create(2,[]);
 for(const c of [active,refundable,failed])await h.act('activate',c);await h.act('approve',refundable,h.reviewer);h.clock(1201);await h.act('settleExpired',failed);
 const withdraw=async(amount:number,signer=h.other,destination=h.treasury)=>h.send(await h.program.methods.withdrawPool(new BN(amount)).accounts({group:h.group,treasurer:signer.publicKey,treasuryRecipient:h.other.publicKey,mint:h.mint.publicKey,vault:h.vault,destination,tokenProgram:TOKEN_PROGRAM_ID}).instruction(),[signer]);
 await expect(withdraw(1250001)).rejects.toThrow();await expect(withdraw(1,h.outsider)).rejects.toThrow();await expect(withdraw(1,h.other,h.ownerAta)).rejects.toThrow();await withdraw(1250000);
 expect(h.balance(h.vault)).toBe(2500000n);expect(h.readGroup().active.toString()).toBe('1250000');expect(h.readGroup().refundable.toString()).toBe('1250000');
});
test('activation rejects substituted vault, mint, token program and owner',async()=>{
 const h=await setup(),c=await h.create(2,[]);
 for(const extra of [{vault:h.ownerAta},{mint:h.other.publicKey},{tokenProgram:System.programId},{owner:h.other.publicKey}])await expect(h.act('activate',c,h.owner,extra)).rejects.toThrow();expect(h.readGroup().active.toString()).toBe('0');
});
test('zero-stake lifecycle records success without transferring tokens',async()=>{
 const h=await setup(),c=await h.create(2,[],{amount:new BN(0)});await h.act('activate',c);await h.act('approve',c,h.other);await h.act('releaseRefund',c,h.outsider);expect(h.balance(h.ownerAta)).toBe(10000000n);expect(h.read(c).refundReleased).toBe(true);
});

test('token CPI payout failure preserves entitlement and refund retries after thaw',async()=>{
 const {createFreezeAccountInstruction,createThawAccountInstruction}=await import('@solana/spl-token');
 const h=await setup(),c=await h.create(2,[]);await h.act('activate',c);await h.act('approve',c,h.other);
 h.send(createFreezeAccountInstruction(h.ownerAta,h.mint.publicKey,h.owner.publicKey));
 await expect(h.act('releaseRefund',c,h.outsider)).rejects.toThrow();expect(h.read(c).status).toEqual({succeeded:{}});expect(h.read(c).refundReleased).toBe(false);expect(h.readGroup().refundable.toString()).toBe('1250000');
 h.send(createThawAccountInstruction(h.ownerAta,h.mint.publicKey,h.owner.publicKey));await h.act('releaseRefund',c,h.outsider);expect(h.balance(h.ownerAta)).toBe(10000000n);
});
test('unsolicited donations do not credit spendable pool',async()=>{
 const {createTransferInstruction}=await import('@solana/spl-token');const h=await setup();h.send(createTransferInstruction(h.ownerAta,h.vault,h.owner.publicKey,500000n));
 expect(h.readGroup().pool.toString()).toBe('0');await expect(h.program.methods.withdrawPool(new BN(1)).accounts({group:h.group,treasurer:h.other.publicKey,treasuryRecipient:h.other.publicKey,mint:h.mint.publicKey,vault:h.vault,destination:h.treasury}).instruction().then(ix=>h.send(ix,[h.other]))).rejects.toThrow();
});
test('valid account data copied to a substituted commitment PDA is rejected',async()=>{
 const {Keypair}=await import('@solana/web3.js');const h=await setup(),c=await h.create(2,[]);await h.act('activate',c);const alias=Keypair.generate().publicKey;h.svm.setAccount(alias,h.svm.getAccount(c)!);
 await expect(h.act('approve',alias,h.reviewer)).rejects.toThrow();expect(h.readGroup().active.toString()).toBe('1250000');expect(h.read(c).status).toEqual({active:{}});
});
