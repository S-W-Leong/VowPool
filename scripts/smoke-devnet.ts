// Read-only confirmed verification. Never treats simulator logs as chain confirmation.
import {readFileSync,writeFileSync} from 'node:fs';
import {Connection,PublicKey} from '@solana/web3.js';
import {getAccount,getAssociatedTokenAddressSync,TOKEN_PROGRAM_ID} from '@solana/spl-token';
import {DEVNET_GENESIS,PROGRAM_ID,readGroup,readCommitments} from '../apps/web/lib/chain';
const [receiptFile='deployments/devnet.json',outputFile]=process.argv.slice(2),receipt=JSON.parse(readFileSync(receiptFile,'utf8'));
const rpc=new Connection(process.env.SOLANA_RPC_URL||'https://api.devnet.solana.com','confirmed');if(await rpc.getGenesisHash()!==DEVNET_GENESIS)throw new Error('Devnet required');
const program=await rpc.getAccountInfo(PROGRAM_ID,'confirmed');if(!program?.executable)throw new Error('Program not deployed');
if(!receipt.group||!receipt.mint)throw new Error('Fixed group/mint bootstrap remains pending');
const group=await readGroup(rpc,receipt.group),commitments=await readCommitments(rpc,receipt.group),vault=await getAccount(rpc,new PublicKey(group.vault),'confirmed',TOKEN_PROGRAM_ID);
if(group.mint!==receipt.mint||group.vault!==receipt.vault||!vault.owner.equals(new PublicKey(group.address)))throw new Error('Mint/vault binding mismatch');
let active=0n,refundable=0n,pool=0n;
for(const c of commitments){if(c.status==='active')active+=c.amount;if(['succeeded','unresolved'].includes(c.status)&&!c.refundReleased)refundable+=c.amount;if(c.status==='failed')pool+=c.amount;}
if(active!==group.active||refundable!==group.refundable||vault.amount<group.active+group.refundable+group.pool)throw new Error('Escrow liability invariant failed');
const signatures=[...(receipt.fixtureReceipts??[]),...(receipt.creReceipts??[])].map((r:{signature:string})=>r.signature);
if(signatures.length){const statuses=await rpc.getSignatureStatuses(signatures,{searchTransactionHistory:true});if(statuses.value.some(v=>!v||v.err||!['confirmed','finalized'].includes(v.confirmationStatus??'')))throw new Error('Missing or failed receipt');}
const balances=await Promise.all(group.roster.map(async member=>({member,baseUnits:(await getAccount(rpc,getAssociatedTokenAddressSync(new PublicKey(group.mint),new PublicKey(member)),'confirmed')).amount.toString()})));
if(receipt.groupSetup?.developmentFixture){
 const peer=commitments.find(c=>c.nonce===4n),expired=commitments.find(c=>c.nonce===2n),github=commitments.find(c=>c.nonce===3n);
 if(peer?.status!=='succeeded'||!peer.refundReleased||expired?.status!=='failed'||github?.status!=='failed'||group.active!==0n||group.refundable!==0n||group.pool!==2_000_000n||vault.amount!==2_000_000n)throw new Error('Fixture terminal state does not match the recorded demo');
 if(balances.find(b=>b.member===group.founder)?.baseUnits!=='98000000')throw new Error('Exact owner refund balance mismatch');
}
const result={verifiedAt:new Date().toISOString(),network:'solana-devnet',developmentFixture:!!receipt.groupSetup?.developmentFixture,programId:PROGRAM_ID.toBase58(),group:group.address,mint:group.mint,vault:group.vault,accounting:{active:group.active.toString(),refundable:group.refundable.toString(),pool:group.pool.toString(),vaultBaseUnits:vault.amount.toString()},balances,commitments:commitments.map(c=>({address:c.address,mode:c.mode,status:c.status,amount:c.amount.toString(),refundReleased:c.refundReleased,nonce:c.nonce.toString()})),confirmedReceiptCount:signatures.length,warning:receipt.groupSetup?.developmentFixture?'Fresh development wallets and official mock forwarder. No live DON origin or qualifying post-activation merge demonstrated.':null};
if(outputFile)writeFileSync(outputFile,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
