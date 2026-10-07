import {Buffer} from 'buffer';
import type {SigningWallet} from './transactions';
export async function claimDemoFunds(wallet:SigningWallet&{signMessage?:(message:Uint8Array)=>Promise<Uint8Array>},context:()=>string){
 const initial=context(),address=wallet.publicKey?.toBase58();
 if(!address||!wallet.signMessage)throw new Error('Use a wallet that supports message signing to claim demo tokens');
 const response=await fetch(`/api/demo-wallet?wallet=${address}`),challenge=await response.json();if(!response.ok)throw new Error(challenge.error);
 const signature=await wallet.signMessage(new TextEncoder().encode(challenge.message));
 if(context()!==initial)throw new Error('Wallet or group changed. Request a new demo challenge.');
 const funded=await fetch('/api/demo-wallet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:challenge.id,signature:Buffer.from(signature).toString('base64')})});
 const result=await funded.json();if(!funded.ok)throw new Error(result.error);return result as {signature:string|null};
}
