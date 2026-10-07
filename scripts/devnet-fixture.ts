// Explicit development-only fixture: fresh test wallets, public receipts, mock forwarder.
import {readFileSync,writeFileSync} from 'node:fs';
import {Connection,Keypair,PublicKey,Transaction,sendAndConfirmTransaction} from '@solana/web3.js';
import {getAccount,getAssociatedTokenAddressSync} from '@solana/spl-token';
import {BN} from '@coral-xyz/anchor';
import {DEVNET_GENESIS,PROGRAM_ID,programFor,readGroup,readCommitments,readCommitment,commitmentPda} from '../apps/web/lib/chain';
import {createAction,lifecycleAction} from '../apps/web/lib/actions';
import {type CommitmentDraft} from '../packages/shared/src/schema';
const [receiptFile,ownerFile,reviewerFile]=process.argv.slice(2);
if(!receiptFile||!ownerFile||!reviewerFile)throw new Error('Usage: bun scripts/devnet-fixture.ts FIXTURE_RECEIPT OWNER_FIXTURE_KEY REVIEWER_FIXTURE_KEY');
const receipt=JSON.parse(readFileSync(receiptFile,'utf8')),setup=receipt.groupSetup;
if(!setup?.developmentFixture||setup.policy.forwarder!=='7kuEAA3mSC1Tz8gQjnvH7bKFda9xSPRRin9SZbH49cNK')throw new Error('Explicit mock development fixture required');
const key=(path:string)=>Keypair.fromSecretKey(new Uint8Array(JSON.parse(readFileSync(path,'utf8'))));
const owner=key(ownerFile),reviewer=key(reviewerFile);
if(owner.publicKey.toBase58()!==setup.founder||reviewer.publicKey.toBase58()!==setup.treasurer)throw new Error('Fixture wallet mismatch');
const rpc=new Connection(process.env.SOLANA_RPC_URL||'https://api.devnet.solana.com','confirmed');if(await rpc.getGenesisHash()!==DEVNET_GENESIS)throw new Error('Devnet required');
const p=programFor(rpc),groupKey=new PublicKey(receipt.group),mint=new PublicKey(receipt.mint),vault=new PublicKey(receipt.vault);
const receipts:Array<{action:string;signature:string}>=receipt.fixtureReceipts??[];
const persist=()=>writeFileSync(receiptFile,JSON.stringify({...receipt,fixtureReceipts:receipts},null,2)+'\n');
async function send(action:string,tx:Transaction,signer:Keypair){const signature=await sendAndConfirmTransaction(rpc,tx,[signer],{commitment:'confirmed'});receipts.push({action,signature});persist();console.log(JSON.stringify({action,signature}));}
if(!await rpc.getAccountInfo(groupKey,'confirmed')){
 const policy={...setup.policy,forwarder:new PublicKey(setup.policy.forwarder),forwarderState:new PublicKey(setup.policy.forwarderState)};
 const ix=await p.methods.initializeGroup({roster:setup.roster.map((s:string)=>new PublicKey(s)),treasurer:new PublicKey(setup.treasurer),treasuryRecipient:new PublicKey(setup.treasuryRecipient),policy}).accounts({founder:owner.publicKey,group:groupKey,mint,vault}).instruction();await send('fixture initialize group',new Transaction().add(ix),owner);receipt.groupInitialized=true;persist();
}
const group=await readGroup(rpc,receipt.group);
const terms:Array<{address:string;terms:CommitmentDraft}>=receipt.fixtureTerms??[];
for(const [nonce,mode,stake] of [[4n,'single','1.25'],[2n,'group','1'],[3n,'github','1']] as const){
 const address=commitmentPda(receipt.group,owner.publicKey.toBase58(),nonce);
 if(await rpc.getAccountInfo(address,'confirmed'))continue;
 const now=Math.floor(Date.now()/1000);
 const draft:CommitmentDraft={owner:owner.publicKey.toBase58(),goal:`DEVELOPMENT FIXTURE ${mode}`,criteria:mode==='github'?'Public PR1652 was merged before activation, so this is a non-qualifying test.':'Development-only peer lifecycle test.',stake,tokenDecimals:6,goalDeadline:now+120,reviewDeadline:now+150,mode,reviewers:mode==='single'?[reviewer.publicKey.toBase58()]:[],...(mode==='github'?{github:{owner:'smartcontractkit',repo:'chainlink-solana',pr:1652,targetBranch:'develop',policyVersion:1}}:{})};
 const built=await createAction(rpc,group,draft,nonce);await send(`fixture create ${mode}`,built.transaction,owner);
 terms.push({address:built.address,terms:draft});receipt.fixtureTerms=terms;persist();
 const slot=(await rpc.getSignatureStatuses([receipts.at(-1)!.signature])).value[0]!.slot;
 let c=await readCommitment(rpc,built.address,slot);
 if(mode==='single')await send('fixture acknowledge',await lifecycleAction(rpc,group,c,reviewer.publicKey.toBase58(),'acknowledge'),reviewer);
 await send(`fixture activate ${mode}`,await lifecycleAction(rpc,group,c,owner.publicKey.toBase58(),'activate'),owner);
 if(mode==='single')await send('fixture approve; refund left for CRE',await lifecycleAction(rpc,group,c,reviewer.publicKey.toBase58(),'approve'),reviewer);
}
const commitments=await readCommitments(rpc,receipt.group);receipt.confirmedState={group:{active:(await readGroup(rpc,receipt.group)).active.toString(),refundable:(await readGroup(rpc,receipt.group)).refundable.toString(),pool:(await readGroup(rpc,receipt.group)).pool.toString()},commitments:commitments.map(c=>({address:c.address,mode:c.mode,status:c.status,refundReleased:c.refundReleased,activatedAt:c.activatedAt,goalDeadline:c.goalDeadline,reviewDeadline:c.reviewDeadline}))};persist();
writeFileSync('.superpowers/sdd/2026-10-07-vowpool-mvp/candidate-fixture.json',JSON.stringify({addresses:commitments.map(c=>c.address)}));
console.log(JSON.stringify({developmentFixture:true,addresses:commitments.map(c=>c.address),ownerTestTokens:(await getAccount(rpc,getAssociatedTokenAddressSync(mint,owner.publicKey))).amount.toString()}));
