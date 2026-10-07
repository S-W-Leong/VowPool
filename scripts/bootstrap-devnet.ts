// CLI consumes the deployer key file opaquely; the browser founder signs initialization.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {Connection,PublicKey,Keypair,Transaction,SystemProgram,sendAndConfirmTransaction} from '@solana/web3.js';
import {createMint,getOrCreateAssociatedTokenAccount,mintTo,TOKEN_PROGRAM_ID,getAssociatedTokenAddressSync} from '@solana/spl-token';
import {z} from 'zod';
import {DEVNET_GENESIS,PROGRAM_ID} from '../apps/web/lib/chain';
export {policySchema,bootstrapSchema} from '../packages/shared/src/group-setup';
import {bootstrapSchema} from '../packages/shared/src/group-setup';
export async function bootstrap(config:z.infer<typeof bootstrapSchema>,keyFile:string,output='deployments/devnet.json'){
 config=bootstrapSchema.parse(config);const connection=new Connection(process.env.SOLANA_RPC_URL||'https://api.devnet.solana.com','confirmed');if(await connection.getGenesisHash()!==DEVNET_GENESIS)throw new Error('Devnet required');
 if(existsSync(output)&&JSON.parse(readFileSync(output,'utf8')).mint)throw new Error('A mint is already recorded in this output. Resume the prepared setup instead of bootstrapping again.');
 const [forwarder,state]=await connection.getMultipleAccountsInfo([new PublicKey(config.policy.forwarder),new PublicKey(config.policy.forwarderState)],'confirmed');if(!forwarder?.executable||!state?.owner.equals(new PublicKey(config.policy.forwarder)))throw new Error('Forwarder executable/state ownership mismatch');
 const deployer=Keypair.fromSecretKey(new Uint8Array(JSON.parse(readFileSync(keyFile,'utf8'))));if(config.roster.includes(deployer.publicKey.toBase58()))throw new Error('Deployer must be distinct from member roles');
 const receipt=JSON.parse(execFileSync('.tools/solana-release/bin/solana',['program','show',PROGRAM_ID.toBase58(),'--keypair',keyFile,'--url',connection.rpcEndpoint,'--output','json'],{encoding:'utf8'}));
 const plannedGroup=PublicKey.findProgramAddressSync([Buffer.from('group'),new PublicKey(config.founder).toBuffer()],PROGRAM_ID)[0];if(await connection.getAccountInfo(plannedGroup,'confirmed'))throw new Error('Group already exists. Export its confirmed configuration instead of bootstrapping again.');
 const mint=await createMint(connection,deployer,deployer.publicKey,null,6,undefined,{commitment:'confirmed'},TOKEN_PROGRAM_ID);
 const group=plannedGroup,vault=getAssociatedTokenAddressSync(mint,group,true),signatures:string[]=[];
 const previous=output==='deployments/devnet.json'?JSON.parse(readFileSync(output,'utf8')):{};
 const data={...previous,network:'solana-devnet',genesisHash:DEVNET_GENESIS,programId:PROGRAM_ID.toBase58(),upgradeAuthority:receipt.authority,group:group.toBase58(),mint:mint.toBase58(),vault:vault.toBase58(),groupInitialized:false,groupSetup:{...config,mint:mint.toBase58()},bootstrapStage:'mint-created',bootstrapSignatures:signatures,note:'Test tokens only. Member founder must sign group initialization in browser. CRE availability depends on the frozen policy and deployment access.'};
 // Save the mint immediately: a partial funding failure must not invite a duplicate bootstrap.
 const persist=()=>{mkdirSync('deployments',{recursive:true});writeFileSync(output,JSON.stringify(data,null,2)+'\n');};persist();
 for(const member of config.roster){const key=new PublicKey(member);const ata=await getOrCreateAssociatedTokenAccount(connection,deployer,mint,key,false,'confirmed');signatures.push(await mintTo(connection,deployer,mint,ata.address,deployer,100_000_000n,[],{commitment:'confirmed'},TOKEN_PROGRAM_ID));persist();}
 // Only bootstrap rent/fees in Devnet SOL; test-token escrow is separate.
 const funding=new Transaction();for(const member of config.roster)funding.add(SystemProgram.transfer({fromPubkey:deployer.publicKey,toPubkey:new PublicKey(member),lamports:30_000_000}));signatures.push(await sendAndConfirmTransaction(connection,funding,[deployer],{commitment:'confirmed'}));data.bootstrapStage='funded';persist();
 mkdirSync('deployments',{recursive:true});writeFileSync(output,JSON.stringify(data,null,2)+'\n');console.log(JSON.stringify({output,mint:data.mint,group:data.group,vault:data.vault,bootstrapSignatures:signatures,requiredAction:'Founder signs initialization in browser'}));return data;
}
if(import.meta.main){const [configFile,keyFile,output]=process.argv.slice(2);if(!configFile||!keyFile)throw new Error('Usage: bun scripts/bootstrap-devnet.ts PUBLIC_CONFIG_JSON DEPLOYER_KEY_PATH [PUBLIC_OUTPUT_JSON]');await bootstrap(JSON.parse(readFileSync(configFile,'utf8')),keyFile,output);}
