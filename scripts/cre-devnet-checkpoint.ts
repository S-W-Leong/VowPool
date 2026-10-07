// Development-only zero-stake observation checkpoint; never a live DON proof.
import {readFileSync,writeFileSync} from 'node:fs';
import {Connection,Keypair,PublicKey,Transaction,sendAndConfirmTransaction} from '@solana/web3.js';
import {DEVNET_GENESIS,commitmentPda,readGroup,readCommitment} from '../apps/web/lib/chain';
import {createAction,lifecycleAction} from '../apps/web/lib/actions';
import {type CommitmentDraft} from '../packages/shared/src/schema';
import {hashTerms} from '../packages/shared/src/terms';

const [fixtureFile,ownerFile,outputFile]=process.argv.slice(2);
if(!fixtureFile||!ownerFile||!outputFile)throw new Error('Usage: bun scripts/cre-devnet-checkpoint.ts FIXTURE_RECEIPT OWNER_FIXTURE_KEY OUTPUT');
const fixture=JSON.parse(readFileSync(fixtureFile,'utf8'));
if(!fixture.groupSetup?.developmentFixture||fixture.groupSetup.policy.forwarder!=='7kuEAA3mSC1Tz8gQjnvH7bKFda9xSPRRin9SZbH49cNK')throw new Error('Explicit mock-forwarder development fixture required');
// The authorized fixture CLI consumes this disposable key without printing it.
const owner=Keypair.fromSecretKey(new Uint8Array(JSON.parse(readFileSync(ownerFile,'utf8'))));
if(owner.publicKey.toBase58()!==fixture.groupSetup.founder)throw new Error('Fixture owner mismatch');
const rpc=new Connection(process.env.SOLANA_RPC_URL||'https://api.devnet.solana.com','confirmed');
if(await rpc.getGenesisHash()!==DEVNET_GENESIS)throw new Error('Devnet required');
const group=await readGroup(rpc,fixture.group),nonce=5n,address=commitmentPda(group.address,owner.publicKey.toBase58(),nonce).toBase58();
let checkpoint:any;
try{checkpoint=JSON.parse(readFileSync(outputFile,'utf8'));}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
if(checkpoint&&(checkpoint.address!==address||checkpoint.group!==group.address))throw new Error('Checkpoint binding mismatch');
const now=Math.floor(Date.now()/1000);
const terms:CommitmentDraft=checkpoint?.terms??{owner:owner.publicKey.toBase58(),goal:'DEVELOPMENT CHECKPOINT: real RPC and GitHub observation',criteria:'PR1652 merged before activation; it must remain pending before the deadline and fail afterward.',stake:'0',tokenDecimals:6,goalDeadline:now+120,reviewDeadline:now+150,mode:'github',reviewers:[],github:{owner:'smartcontractkit',repo:'chainlink-solana',pr:1652,targetBranch:'develop',policyVersion:1}};
checkpoint??={network:'solana-devnet',developmentFixture:true,liveDon:false,group:group.address,address,nonce:nonce.toString(),terms,fixtureReceipts:[],note:'Zero-stake checkpoint of the current native CRE workflow. Official mock forwarder only. No qualifying merge or token transfer is demonstrated.'};
const persist=()=>writeFileSync(outputFile,JSON.stringify(checkpoint,null,2)+'\n');
persist();
async function send(action:string,transaction:Transaction){const signature=await sendAndConfirmTransaction(rpc,transaction,[owner],{commitment:'confirmed'});checkpoint.fixtureReceipts.push({action,signature});persist();console.log(JSON.stringify({action,signature}));}
if(!await rpc.getAccountInfo(new PublicKey(address),'confirmed')){
 const built=await createAction(rpc,group,terms,nonce);await send('create zero-stake D checkpoint',built.transaction);
}
let commitment=await readCommitment(rpc,address);
if(commitment.amount!==0n||commitment.mode!=='github'||commitment.termsHash!==Buffer.from(hashTerms(terms)).toString('hex'))throw new Error('Unexpected checkpoint terms');
if(commitment.status==='draft')await send('activate zero-stake D checkpoint',await lifecycleAction(rpc,group,commitment,owner.publicKey.toBase58(),'activate'));
commitment=await readCommitment(rpc,address);
checkpoint.confirmedBefore={status:commitment.status,amount:commitment.amount.toString(),activatedAt:commitment.activatedAt,goalDeadline:commitment.goalDeadline,reviewDeadline:commitment.reviewDeadline,hardDeadline:commitment.hardDeadline,configHash:commitment.configHash};persist();
console.log(JSON.stringify({address,...checkpoint.confirmedBefore}));
