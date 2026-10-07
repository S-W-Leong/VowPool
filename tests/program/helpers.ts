import {LiteSVM,FailedTransactionMetadata} from 'litesvm';
import {AnchorProvider,Program,Wallet,BN,type Idl} from '@coral-xyz/anchor';
import {Keypair,PublicKey,Transaction,TransactionInstruction,SystemProgram,Connection} from '@solana/web3.js';
import {createInitializeMint2Instruction,createAssociatedTokenAccountInstruction,createMintToInstruction,getAssociatedTokenAddressSync,TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID,MINT_SIZE,AccountLayout} from '@solana/spl-token';
import {readFileSync} from 'node:fs';
export const forwarder=new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkgMQHGhGusJA');
export const metadata=Buffer.concat([Buffer.alloc(32,1),Buffer.alloc(10,2),Buffer.alloc(20,3),Buffer.alloc(2)]);
export const vec=(b:Buffer)=>{const len=Buffer.alloc(4);len.writeUInt32LE(b.length);return Buffer.concat([len,b]);};
export async function setup(){
 const svm=new LiteSVM();const owner=Keypair.generate(),reviewer=Keypair.generate(),other=Keypair.generate(),outsider=Keypair.generate(),mint=Keypair.generate();
 for(const k of [owner,reviewer,other,outsider])svm.airdrop(k.publicKey,10_000_000_000n);
 const idl=JSON.parse(readFileSync('target/idl/vowpool.json','utf8')) as Idl;
 const program=new Program(idl,new AnchorProvider(new Connection('http://127.0.0.1:8899'),new Wallet(owner),{}));
 svm.addProgramFromFile(program.programId,'target/deploy/vowpool.so');svm.addProgramFromFile(forwarder,'target/deploy/mock_forwarder.so');
 const clock=(time:number)=>{const c=svm.getClock();c.unixTimestamp=BigInt(time);svm.setClock(c);};clock(1000);
 function send(ix:TransactionInstruction|TransactionInstruction[],signers=[owner]){
  svm.expireBlockhash();const tx=new Transaction({feePayer:signers[0].publicKey,recentBlockhash:svm.latestBlockhash()}).add(...(Array.isArray(ix)?ix:[ix]));tx.sign(...signers);
  const result=svm.sendTransaction(tx);if(result instanceof FailedTransactionMetadata)throw new Error(result.err().toString()+'\n'+result.meta().logs().join('\n'));return result;
 }
 const [state]=PublicKey.findProgramAddressSync([Buffer.from('state')],forwarder);
 const [group]=PublicKey.findProgramAddressSync([Buffer.from('group'),owner.publicKey.toBuffer()],program.programId);
 const [authority]=PublicKey.findProgramAddressSync([Buffer.from('forwarder'),state.toBuffer(),program.programId.toBuffer()],forwarder);
 send(new TransactionInstruction({programId:forwarder,keys:[{pubkey:owner.publicKey,isSigner:true,isWritable:true},{pubkey:state,isSigner:false,isWritable:true},{pubkey:SystemProgram.programId,isSigner:false,isWritable:false}],data:Buffer.from([0])}));
 send([SystemProgram.createAccount({fromPubkey:owner.publicKey,newAccountPubkey:mint.publicKey,lamports:Number(svm.minimumBalanceForRentExemption(BigInt(MINT_SIZE))),space:MINT_SIZE,programId:TOKEN_PROGRAM_ID}),createInitializeMint2Instruction(mint.publicKey,6,owner.publicKey,owner.publicKey)], [owner,mint]);
 const ownerAta=getAssociatedTokenAddressSync(mint.publicKey,owner.publicKey);
 send([createAssociatedTokenAccountInstruction(owner.publicKey,ownerAta,owner.publicKey,mint.publicKey),createMintToInstruction(mint.publicKey,ownerAta,owner.publicKey,10_000_000n)]);
 const vault=getAssociatedTokenAddressSync(mint.publicKey,group,true),treasury=getAssociatedTokenAddressSync(mint.publicKey,other.publicKey);
 const policy={forwarder,forwarderState:state,workflowCid:[...metadata.subarray(0,32)],workflowName:[...metadata.subarray(32,42)],workflowOwner:[...metadata.subarray(42,62)]};
 await send(await program.methods.initializeGroup({roster:[owner.publicKey,reviewer.publicKey,other.publicKey],treasurer:other.publicKey,treasuryRecipient:other.publicKey,policy}).accounts({founder:owner.publicKey,group,mint:mint.publicKey,vault,tokenProgram:TOKEN_PROGRAM_ID,associatedTokenProgram:ASSOCIATED_TOKEN_PROGRAM_ID,systemProgram:SystemProgram.programId}).instruction());
 let nonce=0;
 const create=async(mode=0,reviewers=[reviewer.publicKey],extra:Record<string,unknown>={})=>{
  const n=new BN(++nonce);const [commitment]=PublicKey.findProgramAddressSync([Buffer.from('commitment'),group.toBuffer(),owner.publicKey.toBuffer(),n.toArrayLike(Buffer,'le',8)],program.programId);
  await send(await program.methods.createCommitment({nonce:n,termsHash:Array(32).fill(4),amount:new BN(1_250_000),goalDeadline:new BN(1100),reviewDeadline:new BN(1200),mode,reviewers,github:null,...extra}).accounts({owner:owner.publicKey,group,commitment}).instruction());return commitment;
 };
 const read=(address:PublicKey)=>program.coder.accounts.decode('commitment',Buffer.from(svm.getAccount(address)!.data)) as any;
 const readGroup=()=>program.coder.accounts.decode('group',Buffer.from(svm.getAccount(group)!.data)) as any;
 const act=async(name:string,c:PublicKey,signer=owner,extra:Record<string,PublicKey>={})=>send(await program.methods[name]().accounts({group,commitment:c,member:signer.publicKey,owner:owner.publicKey,caller:signer.publicKey,mint:mint.publicKey,vault,source:ownerAta,destination:ownerAta,tokenProgram:TOKEN_PROGRAM_ID,associatedTokenProgram:ASSOCIATED_TOKEN_PROGRAM_ID,systemProgram:SystemProgram.programId,...extra}).instruction(),[signer]);
 const deliver=(c:PublicKey,report:Buffer,meta=metadata,suppliedState=state)=>send(new TransactionInstruction({programId:forwarder,keys:[{pubkey:suppliedState,isSigner:false,isWritable:false},{pubkey:authority,isSigner:false,isWritable:false},{pubkey:program.programId,isSigner:false,isWritable:false},{pubkey:group,isSigner:false,isWritable:true},{pubkey:c,isSigner:false,isWritable:true}],data:Buffer.concat([Buffer.from([1]),vec(meta),vec(report)])}));
 const balance=(address:PublicKey)=>AccountLayout.decode(Buffer.from(svm.getAccount(address)!.data)).amount;
 return {svm,program,owner,reviewer,other,outsider,mint,ownerAta,vault,treasury,state,group,authority,policy,send,clock,create,read,readGroup,act,deliver,balance};
}
