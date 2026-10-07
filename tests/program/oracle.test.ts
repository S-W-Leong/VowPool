import { test, expect, beforeAll } from 'bun:test';
import { AnchorProvider, Program, Wallet, type Idl } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import { readFileSync } from 'node:fs';
const rpc = new Connection('http://127.0.0.1:8899','confirmed');
const payer = Keypair.generate();
const idl = JSON.parse(readFileSync('target/idl/vowpool.json','utf8')) as Idl;
const program = new Program(idl,new AnchorProvider(rpc,new Wallet(payer),{commitment:'confirmed'}));
const forwarder = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkgMQHGhGusJA');
const [state] = PublicKey.findProgramAddressSync([Buffer.from('state')],forwarder);
const [group] = PublicKey.findProgramAddressSync([Buffer.from('group'),payer.publicKey.toBuffer()],program.programId);
const [authority] = PublicKey.findProgramAddressSync([Buffer.from('forwarder'),state.toBuffer(),program.programId.toBuffer()],forwarder);
const metadata = Buffer.concat([Buffer.alloc(32,1),Buffer.alloc(10,2),Buffer.alloc(20,3),Buffer.alloc(2)]);
const vec = (b:Buffer) => {const len=Buffer.alloc(4);len.writeUInt32LE(b.length);return Buffer.concat([len,b]);};
beforeAll(async()=>{
 const sig = await rpc.requestAirdrop(payer.publicKey,2e9);await rpc.confirmTransaction(sig,'confirmed');
 if(!await rpc.getAccountInfo(state)) await sendAndConfirmTransaction(rpc,new Transaction().add(new TransactionInstruction({programId:forwarder,keys:[{pubkey:payer.publicKey,isSigner:true,isWritable:true},{pubkey:state,isSigner:false,isWritable:true},{pubkey:PublicKey.default,isSigner:false,isWritable:false}],data:Buffer.from([0])})),[payer]);
 await program.methods.initializeGroup({forwarder,forwarderState:state,workflowCid:[...metadata.subarray(0,32)],workflowName:[...metadata.subarray(32,42)],workflowOwner:[...metadata.subarray(42,62)]}).accounts({founder:payer.publicKey,group}).rpc();
},30000);
async function deliver(meta=metadata, suppliedState=state){
 const [deliveryAuthority]=PublicKey.findProgramAddressSync([Buffer.from('forwarder'),suppliedState.toBuffer(),program.programId.toBuffer()],forwarder);
 const ix = new TransactionInstruction({programId:forwarder,keys:[{pubkey:suppliedState,isSigner:false,isWritable:false},{pubkey:deliveryAuthority,isSigner:false,isWritable:false},{pubkey:program.programId,isSigner:false,isWritable:false},{pubkey:group,isSigner:false,isWritable:true}],data:Buffer.concat([Buffer.from([1]),vec(meta),vec(Buffer.alloc(0))])});
 return sendAndConfirmTransaction(rpc,new Transaction().add(ix),[payer]);
}
test('rejects_unsigned_authority',async()=>{
 const ix=await program.methods.onReport(metadata,Buffer.alloc(0)).accounts({state,forwarderAuthority:authority,group}).instruction();
 ix.keys.find(k=>k.pubkey.equals(authority))!.isSigner=false;
 await expect(sendAndConfirmTransaction(rpc,new Transaction().add(ix),[payer])).rejects.toThrow();
});
test('rejects_wrong_forwarder_state',async()=>{await expect(deliver(metadata,group)).rejects.toThrow();});
test('rejects_other_workflow_cid',async()=>{const m=Buffer.from(metadata);m[0]=7;await expect(deliver(m)).rejects.toThrow();});
test('rejects_short_metadata',async()=>{await expect(deliver(metadata.subarray(0,63))).rejects.toThrow();});
test('accepts_authenticated_mock_forwarder_cpi',async()=>{await expect(deliver()).resolves.toBeString();});
