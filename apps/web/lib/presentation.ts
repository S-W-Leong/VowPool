import type {CommitmentView,GroupView} from './chain';
import {availableActions} from './actions';

// Reviews are member decisions, not permissionless expiry or payout processing.
export function needsReview(c:CommitmentView,g:GroupView,wallet:string|undefined,now:number){
 return availableActions(c,g,wallet,now).some(a=>a==='acknowledge'||a==='approve');
}

export function commitmentStatus(c:CommitmentView,now:number){
 if(c.status==='draft'){
  const needsAcknowledgment=['single','multiple'].includes(c.mode)&&c.acknowledgments!==(1<<c.reviewers.length)-1;
  return needsAcknowledgment?'Awaiting reviewer acceptance':'Ready to lock stake';
 }
 if(c.status==='failed')return 'Forfeited to communal pool';
 if(c.status==='unresolved')return c.refundReleased?'Unresolved · refunded':'Unresolved · refund available';
 if(c.status==='succeeded')return `${c.mode==='github'?'Verified':'Approved'} · ${c.refundReleased?'refunded':'refund available'}`;
 if(c.mode==='github')return 'Verification pending';
 return now>c.reviewDeadline?'Expired · settlement pending':'Awaiting review';
}
