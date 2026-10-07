// Explicit Devnet development rehearsal. Disposable member keys exist only in memory.
// This does not sign for the real SW_Dev/Tim wallets or claim browser-wallet evidence.
import {writeFileSync} from 'node:fs';
import {createPrivateKey,sign} from 'node:crypto';
import {Connection,Keypair,PublicKey,sendAndConfirmTransaction,type Transaction} from '@solana/web3.js';
import {getAccount,getAssociatedTokenAddressSync} from '@solana/spl-token';
import {DEVNET_GENESIS,PROGRAM_ID,readGroup,readCommitment} from '../apps/web/lib/chain';
import {makeGroupSetup,groupPda,readGroups} from '../apps/web/lib/groups';
import {initializeGroupAction,createAction,lifecycleAction} from '../apps/web/lib/actions';
import type {CommitmentDraft} from '../packages/shared/src/schema';
const origin=process.env.VOWPOOL_REHEARSAL_URL||'http://localhost:3000';
if(new URL(origin).hostname!=='localhost')throw new Error('Local demo server required');
const rpc=new Connection('https://api.devnet.solana.com','confirmed');if(await rpc.getGenesisHash()!==DEVNET_GENESIS)throw new Error('Devnet required');
const owner=Keypair.generate(),reviewer=Keypair.generate(),receipts:Array<{action:string;signature:string}>=[];
const output='deployments/self-service-verification.json';
const result:any={network:'solana-devnet',developmentFixture:true,liveDon:false,browserWalletRehearsal:false,programId:PROGRAM_ID.toBase58(),owner:owner.publicKey.toBase58(),reviewer:reviewer.publicKey.toBase58(),receipts,note:'Disposable scripted fixture. Exercises the actual HTTP services and deployed Devnet program. No real member keys are used.'};
const persist=()=>writeFileSync(output,JSON.stringify(result,null,2)+'\n');
async function api(path:string,input?:unknown){const response=await fetch(origin+path,input?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)}:undefined);const value=await response.json();if(!response.ok)throw new Error(value.error||`HTTP ${response.status}`);return value;}
const signature=(message:string,key:Keypair)=>sign(null,Buffer.from(message),createPrivateKey({key:Buffer.concat([Buffer.from('302e020100300506032b657004220420','hex'),Buffer.from(key.secretKey.slice(0,32))]),format:'der',type:'pkcs8'})).toString('base64');
async function fund(key:Keypair){const challenge=await api(`/api/demo-wallet?wallet=${key.publicKey.toBase58()}`);const grant=await api('/api/demo-wallet',{id:challenge.id,signature:signature(challenge.message,key)});if(grant.signature)receipts.push({action:'wallet-signed demo funding',signature:grant.signature});persist();}
async function send(action:string,transaction:Transaction,signer:Keypair){const signature=await sendAndConfirmTransaction(rpc,transaction,[signer],{commitment:'confirmed'});receipts.push({action,signature});persist();console.log(JSON.stringify({action,signature}));return signature;}
const config=await api('/api/demo-config');if(!config.fundingEnabled||!config.developmentFixture)throw new Error('Explicit funded demo service required');
persist();await fund(owner);await fund(reviewer);
const setup=makeGroupSetup(owner.publicKey.toBase58(),[reviewer.publicKey.toBase58()],owner.publicKey.toBase58(),config.mint,config.policy);
const groupKey=groupPda(setup.founder).toBase58();result.group=groupKey;result.mint=config.mint;persist();
await send('founder signs group creation',await initializeGroupAction(rpc,setup,setup.founder),owner);
const g=await readGroup(rpc,groupKey);if(g.roster.join(',')!==setup.roster.join(',')||g.treasurer!==setup.founder)throw new Error('Wrong frozen group');
if(!(await readGroups(rpc,config.mint)).some(group=>group.address===groupKey&&group.roster.includes(reviewer.publicKey.toBase58())))throw new Error('Reviewer cannot discover invitation');
const now=Math.floor(Date.now()/1000),terms:CommitmentDraft={owner:setup.founder,goal:'DEVELOPMENT REHEARSAL: self-service group and automatic refund',criteria:'Exercise new group creation and approval-triggered payout through actual Devnet accounts.',stake:'1',tokenDecimals:6,mode:'single',reviewers:[reviewer.publicKey.toBase58()],goalDeadline:now+600,reviewDeadline:now+900};
const created=await createAction(rpc,g,terms,1n);result.commitment=created.address;persist();await send('create peer commitment',created.transaction,owner);
await api('/api/metadata',{address:created.address,terms});const stored=await api(`/api/metadata?address=${created.address}`);if(stored.status!=='verified')throw new Error('Cross-group metadata not verified');
let c=await readCommitment(rpc,created.address);await send('reviewer acknowledges',await lifecycleAction(rpc,g,c,reviewer.publicKey.toBase58(),'acknowledge'),reviewer);
c=await readCommitment(rpc,created.address);await send('owner locks 1 test token',await lifecycleAction(rpc,g,c,setup.founder,'activate'),owner);
const ownerAta=getAssociatedTokenAddressSync(new PublicKey(config.mint),owner.publicKey);
if((await getAccount(rpc,ownerAta)).amount!==99_000_000n)throw new Error('Exact escrow transfer missing');
const candidates=await api(`/api/candidates?group=${groupKey}`);if(!candidates.addresses.includes(created.address))throw new Error('Candidate discovery did not honor requested group');
const before=await api('/api/refund',{address:created.address});if(before.status!=='not-ready')throw new Error('Service accepted an unapproved refund');
c=await readCommitment(rpc,created.address);await send('reviewer approves; owner makes no payout transaction',await lifecycleAction(rpc,g,c,reviewer.publicKey.toBase58(),'approve'),reviewer);
// Deliberately do not call the refund API: prove the server retry loop works without an owner action.
const started=Date.now(),timeout=started+65_000;
do{c=await readCommitment(rpc,created.address);if(c.refundReleased)break;await new Promise(resolve=>setTimeout(resolve,3000));}while(Date.now()<timeout);
if(c.status!=='succeeded'||!c.refundReleased)throw new Error('Automatic refund not observed before timeout');
const final=await readGroup(rpc,groupKey),balance=(await getAccount(rpc,ownerAta)).amount,vault=(await getAccount(rpc,new PublicKey(final.vault))).amount;
if(balance!==100_000_000n||vault!==0n||final.active!==0n||final.refundable!==0n||final.pool!==0n)throw new Error('Refund accounting mismatch');
const txs=await rpc.getSignaturesForAddress(new PublicKey(created.address),{limit:10},'confirmed');
const known=new Set(receipts.map(r=>r.signature));const payout=txs.find(tx=>!known.has(tx.signature)&&!tx.err);if(!payout)throw new Error('Missing independent refund receipt');
receipts.push({action:'automatic server-paid refund; no owner signature',signature:payout.signature});
const replay=await api('/api/refund',{address:created.address});if(replay.status!=='paid'||replay.signature!==null||(await getAccount(rpc,ownerAta)).amount!==balance)throw new Error('Replay changed payout');
const statuses=await rpc.getSignatureStatuses(receipts.map(r=>r.signature),{searchTransactionHistory:true});if(statuses.value.some(s=>!s||s.err||!['confirmed','finalized'].includes(s.confirmationStatus??'')))throw new Error('Unconfirmed rehearsal receipt');
result.verifiedAt=new Date().toISOString();result.confirmedReceiptCount=receipts.length;result.refundObservedAfterSeconds=Math.round((Date.now()-started)/1000);result.checks={invitedReviewerDiscovery:true,crossGroupTerms:true,scopedCandidates:true,unapprovedRefundRejected:true,automaticRefundWithoutOwnerAction:true,duplicateRefundSafe:true};result.final={status:c.status,refundReleased:c.refundReleased,ownerTestTokens:'100',vaultBaseUnits:vault.toString(),active:final.active.toString(),refundable:final.refundable.toString(),pool:final.pool.toString()};persist();console.log(JSON.stringify(result,null,2));
