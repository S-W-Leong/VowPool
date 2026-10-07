// Server-only Devnet utility payer: funds test wallets and triggers permissionless refunds.
// It never signs member approvals, activation, group creation or treasury spending.
import {readFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {Connection,Keypair,PublicKey,Transaction,SystemProgram} from '@solana/web3.js';
import {getAccount,getMint,getAssociatedTokenAddressSync,createAssociatedTokenAccountIdempotentInstruction,createMintToInstruction,TOKEN_PROGRAM_ID} from '@solana/spl-token';
import bs58 from 'bs58';
import deployment from '../../../deployments/devnet.json';
import {DEVNET_GENESIS,readCommitment,readCommitments,readGroup,preparedGroup,rpcUrl} from './chain';
import {readGroups} from './groups';
import {lifecycleAction} from './actions';
import {DemoAccess} from './demo-access';
import {refundRecordedOutcome,type RefundResult} from './refunds';
const rpc=new Connection(rpcUrl,'confirmed');
let access:DemoAccess|undefined;
export function demoConfiguration(){
 if(!preparedGroup)throw new Error('Demo mint has not been prepared');
 startRefundKeeper();
 return {mint:preparedGroup.mint,policy:preparedGroup.policy,developmentFixture:preparedGroup.developmentFixture,fundingEnabled:!!process.env.VOWPOOL_DEMO_PAYER_KEY_PATH};
}
function payer(){
 const path=process.env.VOWPOOL_DEMO_PAYER_KEY_PATH;if(!path)throw new Error('Automatic demo service unavailable. Your recorded refund remains available to retry.');
 let signer:Keypair;try{signer=Keypair.fromSecretKey(new Uint8Array(JSON.parse(readFileSync(path,'utf8'))));}catch{throw new Error('Demo service payer unavailable');}
 if(signer.publicKey.toBase58()!==deployment.upgradeAuthority)throw new Error('Unexpected demo utility payer');return signer;
}
export function demoAccess(){
 if(!access){const file=resolve((process.env.VOWPOOL_DATABASE_PATH||'.data/vowpool.db')+'.demo');mkdirSync(dirname(file),{recursive:true});access=new DemoAccess(file);}return access;
}
async function submit(tx:Transaction,signer:Keypair,record?:(signature:string)=>void){
 if(await rpc.getGenesisHash()!==DEVNET_GENESIS)throw new Error('Devnet required');
 const latest=await rpc.getLatestBlockhash('confirmed');tx.recentBlockhash=latest.blockhash;tx.feePayer=signer.publicKey;tx.sign(signer);
 const simulation=await rpc.simulateTransaction(tx);if(simulation.value.err)throw new Error('Devnet transaction simulation failed');
 const signature=bs58.encode(tx.signature!);record?.(signature);
 await rpc.sendRawTransaction(tx.serialize(),{skipPreflight:false,maxRetries:3});
 const confirmed=await rpc.confirmTransaction({signature,...latest},'confirmed');if(confirmed.value.err)throw new Error('Devnet transaction failed');
 return {signature};
}
export async function fundDemoWallet(wallet:string,record:(signature:string)=>void){
 if(await rpc.getGenesisHash()!==DEVNET_GENESIS)throw new Error('Devnet required');
 const config=demoConfiguration(),signer=payer(),owner=new PublicKey(wallet),mint=new PublicKey(config.mint);
 const definition=await getMint(rpc,mint,'confirmed',TOKEN_PROGRAM_ID);
 if(definition.decimals!==6||definition.freezeAuthority||!definition.mintAuthority?.equals(signer.publicKey))throw new Error('Unexpected demo test mint');
 const ata=getAssociatedTokenAddressSync(mint,owner);let tokens=0n;
 if(await rpc.getAccountInfo(ata))tokens=(await getAccount(rpc,ata,'confirmed',TOKEN_PROGRAM_ID)).amount;
 const lamports=await rpc.getBalance(owner,'confirmed'),tx=new Transaction();
 if(tokens<100_000_000n){tx.add(createAssociatedTokenAccountIdempotentInstruction(signer.publicKey,ata,owner,mint));tx.add(createMintToInstruction(mint,ata,signer.publicKey,100_000_000n-tokens));}
 if(lamports<30_000_000)tx.add(SystemProgram.transfer({fromPubkey:signer.publicKey,toPubkey:owner,lamports:30_000_000-lamports}));
 if(!tx.instructions.length)return {signature:null};return submit(tx,signer,record);
}
const refunds=new Map<string,Promise<RefundResult>>();
export function automaticRefund(address:string){
 const existing=refunds.get(address);if(existing)return existing;
 const operation=(async()=>{
  const c=await readCommitment(rpc,address),g=await readGroup(rpc,c.group);
  if(g.mint!==demoConfiguration().mint)throw new Error('Refund service supports only the demo test mint');
  return refundRecordedOutcome(()=>readCommitment(rpc,address),async()=>{const signer=payer();const current=await readCommitment(rpc,address);return submit(await lifecycleAction(rpc,g,current,signer.publicKey.toBase58(),'releaseRefund'),signer);});
 })();refunds.set(address,operation);void operation.finally(()=>refunds.delete(address)).catch(()=>{});return operation;
}
let keeperStarted=false,keeperRunning=false,keeperOffset=0;
function startRefundKeeper(){
 if(keeperStarted||!process.env.VOWPOOL_DEMO_PAYER_KEY_PATH||!preparedGroup)return;
 keeperStarted=true;
 const timer=setInterval(()=>{if(keeperRunning)return;keeperRunning=true;void (async()=>{
  if(await rpc.getGenesisHash()!==DEVNET_GENESIS)return;
  const groups=await readGroups(rpc,preparedGroup!.mint),pending:string[]=[];
  for(const group of groups){let commitments;try{commitments=await readCommitments(rpc,group.address);}catch{continue;}
   for(const c of commitments){if(!['succeeded','unresolved'].includes(c.status)||c.refundReleased)continue;
    pending.push(c.address);
   }
  }
  for(let i=0;i<Math.min(5,pending.length);i++){const address=pending[(keeperOffset+i)%pending.length];try{await automaticRefund(address);}catch{}}
  keeperOffset=pending.length?(keeperOffset+5)%pending.length:0;
 })().catch(()=>{}).finally(()=>{keeperRunning=false;});},30_000);
 timer.unref();
}
