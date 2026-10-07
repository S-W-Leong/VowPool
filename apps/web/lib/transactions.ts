import {type Connection,type PublicKey,Transaction} from '@solana/web3.js';
import {DEVNET_GENESIS} from './chain';
export type TransactionPhase='signature requested'|'submitted'|'confirmed'|'failed';
export type SigningWallet={publicKey:PublicKey|null;signTransaction?:(tx:Transaction)=>Promise<Transaction>};
export async function sendAndConfirm(tx:Transaction,wallet:SigningWallet,connection:Connection,options:{context:()=>string;onPhase?:(phase:TransactionPhase,signature?:string)=>void}){
 const initial=options.context(),owner=wallet.publicKey;
 if(!owner||!wallet.signTransaction)throw new Error('Connect a wallet that can sign transactions');
 const checkContext=()=>{if(options.context()!==initial||!wallet.publicKey?.equals(owner))throw new Error('Wallet or network changed. Retry from the current wallet.');};
 const checkCluster=async()=>{if(await connection.getGenesisHash()!==DEVNET_GENESIS)throw new Error('Select Solana Devnet before sending a transaction');};
 let signature:string|undefined;
 try{
 await checkCluster();checkContext();const latest=await connection.getLatestBlockhash('confirmed');checkContext();tx.recentBlockhash=latest.blockhash;tx.feePayer=owner;
 options.onPhase?.('signature requested');const signed=await wallet.signTransaction(tx);checkContext();await checkCluster();checkContext();
 signature=await connection.sendRawTransaction(signed.serialize(),{skipPreflight:false,maxRetries:3});options.onPhase?.('submitted',signature);
 const confirmation=await connection.confirmTransaction({signature,...latest},'confirmed');
 if(confirmation.value.err)throw new Error('Transaction failed: '+JSON.stringify(confirmation.value.err));
 options.onPhase?.('confirmed',signature);return {signature,confirmedSlot:confirmation.context.slot};
 }catch(error){options.onPhase?.('failed',signature);throw Object.assign(error instanceof Error?error:new Error('Transaction failed'),{signature});}
}
