import {it,expect,vi} from 'vitest';
import {Connection,PublicKey} from '@solana/web3.js';
import {programFor,readGroup,readCommitments,readCommitment,PROGRAM_ID} from '../lib/chain';
import {BN} from '@coral-xyz/anchor';
import {Keypair} from '@solana/web3.js';
import {commitmentPda} from '../lib/chain';
it.each(['9007199254740993','9000000000000'])('isolates unsupported timestamp %s without hiding valid records',async timestamp=>{
 const p=programFor({} as Connection),group=Keypair.generate().publicKey,owner=Keypair.generate().publicKey;
 const policy={forwarder:PublicKey.default,forwarderState:PublicKey.default,workflowCid:Array(32).fill(1),workflowName:Array(10).fill(2),workflowOwner:Array(20).fill(3)};
 const valid={group,owner,nonce:new BN(1),bump:1,termsHash:Array(32).fill(1),amount:new BN(1250000),goalDeadline:new BN(1100),reviewDeadline:new BN(1200),hardDeadline:new BN(174000),activatedAt:new BN(1000),mode:0,reviewers:[],acknowledgments:0,approvals:0,status:{active:{}},refundReleased:false,github:null,configHash:Array(32).fill(0),policy,observedAt:new BN(0),mergedAt:new BN(0),branchHash:Array(32).fill(0),reportId:[0,0]};
 const bad={...valid,nonce:new BN(2),goalDeadline:new BN(timestamp)};
 const badAddress=commitmentPda(group.toBase58(),owner.toBase58(),2n),validAddress=commitmentPda(group.toBase58(),owner.toBase58(),1n);
 const rows=[{pubkey:badAddress,account:{owner:PROGRAM_ID,executable:false,data:await p.coder.accounts.encode('commitment',bad)}},{pubkey:validAddress,account:{owner:PROGRAM_ID,executable:false,data:await p.coder.accounts.encode('commitment',valid)}}];
 const rejected:string[]=[];
 const read=await readCommitments({getProgramAccounts:async()=>rows} as unknown as Connection,group.toBase58(),undefined,address=>rejected.push(address));
 expect(read.map(c=>c.address)).toEqual([validAddress.toBase58()]);expect(rejected).toEqual([badAddress.toBase58()]);
});
it('requires the confirmed transaction slot when refreshing commitment discovery',async()=>{
 const getProgramAccounts=vi.fn().mockResolvedValue([]);
 await readCommitments({getProgramAccounts} as unknown as Connection,PublicKey.default.toBase58(),123);
 expect(getProgramAccounts).toHaveBeenCalledWith(PROGRAM_ID,expect.objectContaining({commitment:'confirmed',minContextSlot:123}));
});
it.skipIf(process.env.VOWPOOL_RPC_SMOKE!=='1')('reads real local-validator group and commitments through the web chain adapter',async()=>{
 const connection=new Connection('http://127.0.0.1:8899','confirmed'),p=programFor(connection);const groups=await (p.account as any).group.all();expect(groups.length).toBeGreaterThan(0);
 const address=groups[0].publicKey.toBase58();const group=await readGroup(connection,address);expect(group.roster.length).toBe(2);expect(group.decimals).toBe(6);
 const commitments=await readCommitments(connection,address);expect(commitments.length).toBeGreaterThan(0);const c=await readCommitment(connection,commitments[0].address);expect(c.status).toBe('succeeded');expect(c.refundReleased).toBe(true);expect(c.amount).toBe(1250000n);
 const account=await connection.getAccountInfo(new PublicKey(c.address),'confirmed');expect(account?.owner.equals(PROGRAM_ID)).toBe(true);
});
