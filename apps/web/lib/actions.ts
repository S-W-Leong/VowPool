import {BN} from '@coral-xyz/anchor';
import {Buffer} from 'buffer';
import {Connection,PublicKey,Transaction} from '@solana/web3.js';
import {getAssociatedTokenAddressSync} from '@solana/spl-token';
import {programFor,commitmentPda,type GroupView,type CommitmentView} from './chain';
import {hashTerms} from '../../../packages/shared/src/terms';
import {draftSchema,modes,type CommitmentDraft} from '../../../packages/shared/src/schema';
import {parseTokenAmount} from '../../../packages/shared/src/amount';
import {validateGroupSetup} from '../../../packages/shared/src/group-setup';
export async function initializeGroupAction(connection:Connection,input:unknown,wallet:string){
 const setup=validateGroupSetup(input);if(wallet!==setup.founder)throw new Error('Only the fixed member founder can initialize this group');
 const founder=new PublicKey(setup.founder),mint=new PublicKey(setup.mint),p=programFor(connection);
 const group=PublicKey.findProgramAddressSync([Buffer.from('group'),founder.toBuffer()],p.programId)[0];
 const policy={...setup.policy,forwarder:new PublicKey(setup.policy.forwarder),forwarderState:new PublicKey(setup.policy.forwarderState)};
 const ix=await p.methods.initializeGroup({roster:setup.roster.map(s=>new PublicKey(s)),treasurer:new PublicKey(setup.treasurer),treasuryRecipient:new PublicKey(setup.treasuryRecipient),policy}).accounts({founder,group,mint,vault:getAssociatedTokenAddressSync(mint,group,true)}).instruction();
 return new Transaction().add(ix);
}
export async function createAction(connection:Connection,group:GroupView,input:CommitmentDraft,nonce:bigint){
 const draft=draftSchema.parse(input);if(!group.roster.includes(draft.owner)||draft.reviewers.some(r=>!group.roster.includes(r)))throw new Error('Owner and reviewers must be group members');
 if(draft.tokenDecimals!==group.decimals)throw new Error('Mint decimals changed');if(draft.mode==='github'&&!group.automatedReady)throw new Error('The group has no authorized CRE policy yet');
 const p=programFor(connection),address=commitmentPda(group.address,draft.owner,nonce);
 const ix=await p.methods.createCommitment({nonce:new BN(nonce.toString()),termsHash:Array.from(hashTerms(draft)),amount:new BN(parseTokenAmount(draft.stake,draft.tokenDecimals).toString()),goalDeadline:new BN(draft.goalDeadline),reviewDeadline:new BN(draft.reviewDeadline),mode:modes.indexOf(draft.mode),reviewers:draft.reviewers.map(r=>new PublicKey(r)),github:draft.github??null}).accounts({owner:new PublicKey(draft.owner),group:new PublicKey(group.address),commitment:address}).instruction();
 return {address:address.toBase58(),transaction:new Transaction().add(ix)};
}
export type LifecycleAction='acknowledge'|'activate'|'approve'|'settleExpired'|'resolveUnverified'|'releaseRefund';
export function availableActions(c:CommitmentView,g:GroupView,wallet:string|undefined,now:number):LifecycleAction[]{
 if(!wallet)return [];const actions:LifecycleAction[]=[];const member=g.roster.includes(wallet),reviewer=c.reviewers.indexOf(wallet),peer=c.mode!=='github';
 if(c.status==='draft'){
 if(member&&reviewer>=0&&!((c.acknowledgments>>reviewer)&1))actions.push('acknowledge');
 if(wallet===c.owner&&now<c.goalDeadline&&(!['single','multiple'].includes(c.mode)||c.acknowledgments===(1<<c.reviewers.length)-1))actions.push('activate');
 }
 if(c.status==='active'){
 if(peer&&now<=c.reviewDeadline&&wallet!==c.owner&&member&&(c.mode==='group'||(reviewer>=0&&!((c.approvals>>reviewer)&1))))actions.push('approve');
 if(peer&&now>c.reviewDeadline)actions.push('settleExpired');
 if(!peer&&now>c.hardDeadline)actions.push('resolveUnverified');
 }
 if(['succeeded','unresolved'].includes(c.status)&&!c.refundReleased)actions.push('releaseRefund');return actions;
}
export async function lifecycleAction(connection:Connection,group:GroupView,c:CommitmentView,wallet:string,action:LifecycleAction){
 const p=programFor(connection),owner=new PublicKey(c.owner),member=new PublicKey(wallet),mint=new PublicKey(group.mint),base={group:new PublicKey(group.address),commitment:new PublicKey(c.address)};
 const accounts:Record<string,PublicKey>={...base,owner,member,caller:member,mint,vault:new PublicKey(group.vault),source:getAssociatedTokenAddressSync(mint,owner),destination:getAssociatedTokenAddressSync(mint,owner)};
 return new Transaction().add(await p.methods[action]().accounts(accounts).instruction());
}
export async function withdrawAction(connection:Connection,group:GroupView,wallet:string,amount:bigint){
 const mint=new PublicKey(group.mint),recipient=new PublicKey(group.treasuryRecipient);return new Transaction().add(await programFor(connection).methods.withdrawPool(new BN(amount.toString())).accounts({treasurer:new PublicKey(wallet),group:new PublicKey(group.address),mint,vault:new PublicKey(group.vault),treasuryRecipient:recipient,destination:getAssociatedTokenAddressSync(mint,recipient)}).instruction());
}
