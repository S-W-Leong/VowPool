import {DatabaseSync} from 'node:sqlite';
import {randomUUID,createPublicKey,verify} from 'node:crypto';
import bs58 from 'bs58';
import {addressSchema} from '../../../packages/shared/src/schema';
type Receipt={signature:string|null};
type Challenge={id:string;wallet:string;mint:string;message:string;expires:number;used:number};
export class DemoAccess{
 private db:DatabaseSync;
 constructor(file:string,private now=()=>Math.floor(Date.now()/1000)){
  this.db=new DatabaseSync(file);this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
   CREATE TABLE IF NOT EXISTS demo_challenges(id TEXT PRIMARY KEY,wallet TEXT,mint TEXT,message TEXT,expires INTEGER,used INTEGER DEFAULT 0);
   CREATE TABLE IF NOT EXISTS demo_grants(wallet TEXT,mint TEXT,status TEXT,signature TEXT,PRIMARY KEY(wallet,mint));`);
 }
 challenge(wallet:string,mint:string){
  addressSchema.parse(wallet);addressSchema.parse(mint);const id=randomUUID(),expires=this.now()+300;
  const message=JSON.stringify({version:1,domain:'vowpool-devnet-demo',action:'claim-test-tokens-and-devnet-sol',wallet,mint,nonce:id,expires});
  this.db.prepare('DELETE FROM demo_challenges WHERE expires<?').run(this.now()-300);
  this.db.prepare('INSERT INTO demo_challenges(id,wallet,mint,message,expires) VALUES(?,?,?,?,?)').run(id,wallet,mint,message,expires);
  return {id,message,expires};
 }
 async claim(id:string,signature:string,fund:(wallet:string,recordSignature:(signature:string)=>void)=>Promise<Receipt>):Promise<Receipt>{
  const row=this.db.prepare('SELECT * FROM demo_challenges WHERE id=?').get(id) as Challenge|undefined;
  if(!row||row.used||row.expires<=this.now())throw new Error('Invalid, expired or used challenge');
  if(!/^[A-Za-z0-9+/]{86}==$/.test(signature))throw new Error('Invalid wallet signature');
  const publicKey=createPublicKey({key:Buffer.concat([Buffer.from('302a300506032b6570032100','hex'),Buffer.from(bs58.decode(row.wallet))]),format:'der',type:'spki'});
  if(!verify(null,Buffer.from(row.message),publicKey,Buffer.from(signature,'base64')))throw new Error('Wallet signature required');
  const consumed=this.db.prepare('UPDATE demo_challenges SET used=1 WHERE id=? AND used=0').run(id);
  if(consumed.changes!==1)throw new Error('Challenge already used');
  const previous=this.db.prepare('SELECT status,signature FROM demo_grants WHERE wallet=? AND mint=?').get(row.wallet,row.mint) as {status:string;signature:string|null}|undefined;
  if(previous?.status==='confirmed')return {signature:previous.signature};
  if(previous)throw new Error('Funding confirmation pending. Check the receipt before retrying.');
  const count=this.db.prepare('SELECT COUNT(*) AS count FROM demo_grants').get() as {count:number};
  if(count.count>=20)throw new Error('Demo funding limit reached. Ask the presenter for test tokens.');
  this.db.prepare('INSERT INTO demo_grants VALUES(?,?,?,NULL)').run(row.wallet,row.mint,'pending');
  let submitted=false;
  try{
   const receipt=await fund(row.wallet,s=>{submitted=true;this.db.prepare('UPDATE demo_grants SET signature=? WHERE wallet=? AND mint=?').run(s,row.wallet,row.mint);});
   this.db.prepare('UPDATE demo_grants SET status=?,signature=? WHERE wallet=? AND mint=?').run('confirmed',receipt.signature,row.wallet,row.mint);
   return receipt;
  }catch(error){if(!submitted)this.db.prepare('DELETE FROM demo_grants WHERE wallet=? AND mint=?').run(row.wallet,row.mint);throw error;}
 }
}
