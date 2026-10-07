import {expect,it} from 'vitest';
import {refundRecordedOutcome} from '../lib/refunds';
it.each(['active','failed','draft'])('cannot refund a %s commitment',async status=>{
 const result=await refundRecordedOutcome(async()=>({status,refundReleased:false}),async()=>{throw Error('Must not submit');});
 expect(result.status).toBe('not-ready');
});
it('releases a confirmed entitlement and verifies the paid chain state',async()=>{
 let paid=false;
 const result=await refundRecordedOutcome(async()=>({status:'succeeded',refundReleased:paid}),async()=>{paid=true;return {signature:'receipt'};});
 expect(result).toEqual({status:'paid',signature:'receipt'});expect(paid).toBe(true);
});
it('keeps a recorded outcome pending when payout fails',async()=>{
 const chain={status:'succeeded',refundReleased:false};
 const result=await refundRecordedOutcome(async()=>chain,async()=>{throw Error('Token transfer unavailable');});
 expect(result.status).toBe('pending');expect(chain).toEqual({status:'succeeded',refundReleased:false});
});
it('does not announce payment from submission alone',async()=>{
 const result=await refundRecordedOutcome(async()=>({status:'unresolved',refundReleased:false}),async()=>({signature:'submitted'}));
 expect(result.status).toBe('pending');
});
it('does not submit a second payout after release',async()=>{
 expect(await refundRecordedOutcome(async()=>({status:'succeeded',refundReleased:true}),async()=>{throw Error('Replay');})).toEqual({status:'paid',signature:null});
});
