import {expect,it} from 'vitest';
import {Keypair,Connection,PublicKey} from '@solana/web3.js';
import {makeGroupSetup,groupPda} from '../lib/groups';
import {initializeGroupAction} from '../lib/actions';
const owner=Keypair.generate().publicKey.toBase58(),reviewer=Keypair.generate().publicKey.toBase58(),mint=Keypair.generate().publicKey.toBase58();
const policy={forwarder:'7kuEAA3mSC1Tz8gQjnvH7bKFda9xSPRRin9SZbH49cNK',forwarderState:'5Tipz3yhTBdVsDbaBxZkrp7Gjf3brGq5SKkxReefPMP7',workflowCid:Array(32).fill(17),workflowName:[48,50,97,99,56,48,100,55,98,53],workflowOwner:Array(20).fill(170)};
it('builds a wallet-owned group and initializes only with the founders signature',async()=>{
 const setup=makeGroupSetup(owner,[reviewer],owner,mint,policy);
 expect(setup.roster).toEqual([owner,reviewer]);expect(setup.treasuryRecipient).toBe(owner);
 const tx=await initializeGroupAction(new Connection('http://localhost:8899'),setup,owner);
 expect(tx.instructions[0].keys.find(k=>k.pubkey.equals(new PublicKey(owner)))?.isSigner).toBe(true);
 expect(tx.instructions[0].keys.some(k=>k.pubkey.equals(groupPda(owner)))).toBe(true);
 await expect(initializeGroupAction(new Connection('http://localhost:8899'),setup,reviewer)).rejects.toThrow(/founder/);
});
it.each([[owner],[reviewer,reviewer],[],Array(8).fill(reviewer)])('rejects invalid invited roster %j',invited=>expect(()=>makeGroupSetup(owner,invited,owner,mint,policy)).toThrow());
it('rejects a treasury role outside the frozen roster',()=>expect(()=>makeGroupSetup(owner,[reviewer],Keypair.generate().publicKey.toBase58(),mint,policy)).toThrow());
