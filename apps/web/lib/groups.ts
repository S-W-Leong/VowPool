import {Buffer} from 'buffer';
import {Connection,PublicKey} from '@solana/web3.js';
import {PROGRAM_ID,programFor,readGroup,type GroupView} from './chain';
import {validateGroupSetup,type PreparedGroup} from '../../../packages/shared/src/group-setup';
export const groupPda=(founder:string)=>PublicKey.findProgramAddressSync([Buffer.from('group'),new PublicKey(founder).toBuffer()],PROGRAM_ID)[0];
export function makeGroupSetup(founder:string,invited:string[],treasurer:string,mint:string,policy:PreparedGroup['policy']):PreparedGroup{
 if(invited.includes(founder))throw new Error('You are already included as the founder');
 return validateGroupSetup({developmentFixture:true,founder,roster:[founder,...invited],treasurer,treasuryRecipient:treasurer,mint,policy});
}
export async function readGroups(connection:Connection,mint?:string):Promise<GroupView[]>{
 const p=programFor(connection),filter=p.coder.accounts.memcmp('group');
 const rows=await connection.getProgramAccounts(PROGRAM_ID,{commitment:'confirmed',filters:[{memcmp:{offset:filter.offset!,bytes:filter.bytes!}}]});
 const groups:GroupView[]=[];
 for(const row of rows){try{
  if(row.account.executable||!row.account.owner.equals(PROGRAM_ID))continue;
  const decoded:any=p.coder.accounts.decode('group',row.account.data);
  if(!row.pubkey.equals(groupPda(decoded.founder.toBase58()))||!Array.isArray(decoded.roster)||decoded.roster.length<2||decoded.roster.length>8)continue;
  if(mint&&decoded.mint.toBase58()!==mint)continue;
  groups.push(await readGroup(connection,row.pubkey.toBase58()));
 }catch{/* An unreadable group must not suppress other groups. */}}
 return groups;
}
