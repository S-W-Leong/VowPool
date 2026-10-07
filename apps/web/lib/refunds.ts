type Outcome={status:string;refundReleased:boolean};
export type RefundResult={status:'paid'|'pending'|'not-ready';signature:string|null;error?:string};
export async function refundRecordedOutcome(read:()=>Promise<Outcome>,submit:()=>Promise<{signature:string}>):Promise<RefundResult>{
 const before=await read();
 if(!['succeeded','unresolved'].includes(before.status))return {status:'not-ready',signature:null};
 if(before.refundReleased)return {status:'paid',signature:null};
 let signature:string|null=null;
 try{signature=(await submit()).signature;const after=await read();return {status:after.refundReleased?'paid':'pending',signature};}
 catch(error){
  // Another caller may have released it while our transaction was in flight.
  try{if((await read()).refundReleased)return {status:'paid',signature};}catch{}
  return {status:'pending',signature,error:error instanceof Error?error.message:'Refund delivery unavailable'};
 }
}
