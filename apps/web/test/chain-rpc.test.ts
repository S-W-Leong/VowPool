import {it,expect,vi} from 'vitest';
import {Connection,PublicKey} from '@solana/web3.js';
import {programFor,readGroup,readCommitments,readCommitment,PROGRAM_ID} from '../lib/chain';
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
