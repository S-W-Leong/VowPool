import {it,expect} from 'vitest';
import {availableActions} from '../lib/actions';
const group:any={roster:['owner','reviewer'],decimals:6};
const c:any={owner:'owner',status:'active',mode:'github',reviewers:[],goalDeadline:1000,reviewDeadline:1100,hardDeadline:173900,acknowledgments:0,approvals:0,refundReleased:false};
it('automated mode has no human approval or peer expiry control',()=>{expect(availableActions(c,group,'reviewer',1200)).toEqual([]);expect(availableActions(c,group,'owner',173901)).toEqual(['resolveUnverified']);});
it('requires all acknowledgment bits before activation',()=>{const d={...c,mode:'multiple',status:'draft',reviewers:['reviewer','second'],acknowledgments:1};expect(availableActions(d,group,'owner',900)).toEqual([]);expect(availableActions({...d,acknowledgments:3},group,'owner',900)).toEqual(['activate']);});
it('shows approval at cutoff and expiry only after cutoff',()=>{const d={...c,mode:'group'};expect(availableActions(d,group,'reviewer',1100)).toEqual(['approve']);expect(availableActions(d,group,'reviewer',1101)).toEqual(['settleExpired']);});
it('never offers self approval or duplicate refund',()=>{expect(availableActions({...c,mode:'group'},group,'owner',1000)).toEqual([]);expect(availableActions({...c,status:'unresolved',refundReleased:true},group,'reviewer',200000)).toEqual([]);});
it('requires the fixed founder to initialize the prepared group',async()=>{
 const {initializeGroupAction}=await import('../lib/actions');
 const {Keypair,Connection,PublicKey}=await import('@solana/web3.js');
 const founder=Keypair.generate().publicKey.toBase58(),other=Keypair.generate().publicKey.toBase58(),mint=Keypair.generate().publicKey.toBase58();
 const config={founder,roster:[founder,other],treasurer:other,treasuryRecipient:other,mint,policy:{forwarder:'CXsKEJcs25TQEYU2e5jZ8QTPE3ffMLZhH6BWHrdcCCB5',forwarderState:'8QoomCQyPSkJ8WopJbX9B4HyvrFzziwvJdU8hZE6DCr9',workflowCid:Array(32).fill(0),workflowName:Array(10).fill(0),workflowOwner:Array(20).fill(0)}};
 await expect(initializeGroupAction(new Connection('http://localhost:8899'),config,other)).rejects.toThrow(/founder/);
 const tx=await initializeGroupAction(new Connection('http://localhost:8899'),config,founder);
 expect(tx.instructions[0].keys[0].pubkey.equals(new PublicKey(founder))).toBe(true);expect(tx.instructions[0].keys[0].isSigner).toBe(true);
});
