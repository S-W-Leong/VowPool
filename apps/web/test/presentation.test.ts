import {describe,it,expect} from 'vitest';
import {needsReview,commitmentStatus} from '../lib/presentation';
import type {CommitmentView,GroupView} from '../lib/chain';

const group={roster:['owner','reviewer','member']} as GroupView;
const base={owner:'owner',mode:'single',status:'active',reviewers:['reviewer'],acknowledgments:1,approvals:0,goalDeadline:100,reviewDeadline:200,hardDeadline:300,refundReleased:false} as CommitmentView;
describe('minimal dashboard presentation',()=>{
 it('keeps expiry and refund processing out of the reviewer inbox',()=>{
  expect(needsReview({...base,reviewDeadline:50},group,'member',100)).toBe(false);
  expect(needsReview({...base,status:'succeeded'},group,'reviewer',100)).toBe(false);
  expect(needsReview(base,group,'reviewer',100)).toBe(true);
  expect(needsReview(base,group,'owner',100)).toBe(false);
  expect(needsReview(base,group,undefined,100)).toBe(false);
 });
 it('shows appointed role acceptance separately from approval',()=>{
  const draft={...base,status:'draft' as const,acknowledgments:0};
  expect(needsReview(draft,group,'reviewer',100)).toBe(true);
  expect(commitmentStatus(draft,100)).toBe('Awaiting reviewer acceptance');
  expect(commitmentStatus({...draft,acknowledgments:1},100)).toBe('Ready to lock stake');
 });
 it('does not represent automated pending or unresolved results as failed or approved',()=>{
  expect(commitmentStatus({...base,mode:'github'},400)).toBe('Verification pending');
  expect(commitmentStatus({...base,mode:'github',status:'succeeded'},100)).toBe('Verified · refund available');
  expect(commitmentStatus({...base,mode:'github',status:'unresolved'},400)).toBe('Unresolved · refund available');
  expect(commitmentStatus({...base,status:'unresolved',refundReleased:true},400)).toBe('Unresolved · refunded');
 });
 it('keeps deadline boundary and recorded refund entitlement visible',()=>{
  expect(commitmentStatus(base,200)).toBe('Awaiting review');
  expect(commitmentStatus(base,201)).toBe('Expired · settlement pending');
  expect(commitmentStatus({...base,status:'succeeded'},400)).toBe('Approved · refund available');
  expect(commitmentStatus({...base,status:'succeeded',refundReleased:true},400)).toBe('Approved · refunded');
 });
});
