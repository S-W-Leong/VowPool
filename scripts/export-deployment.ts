// Read-only RPC/CLI checks; the CLI consumes its required signer file opaquely.
import {readFileSync,writeFileSync,mkdirSync,renameSync,copyFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {Connection,PublicKey} from '@solana/web3.js';
import {getAccount,TOKEN_PROGRAM_ID} from '@solana/spl-token';
import {z} from 'zod';
import {DEVNET_GENESIS,PROGRAM_ID,readGroup} from '../apps/web/lib/chain';
const address=z.string().refine(v=>{try{return new PublicKey(v).toBase58()===v;}catch{return false;}},'Invalid public address');
const metadata=z.object({programId:address,owner:address,programdataAddress:address,authority:address.nullable(),lastDeploySlot:z.number().int().nonnegative(),dataLen:z.number().int().positive()});
export function verifiedProgramMetadata(genesis:string,raw:unknown){
 if(genesis!==DEVNET_GENESIS)throw new Error('Devnet required');
 const p=metadata.parse(raw);
 if(p.programId!==PROGRAM_ID.toBase58())throw new Error('Substituted program');
 if(p.owner!=='BPFLoaderUpgradeab1e11111111111111111111111')throw new Error('Unexpected program loader');
 return {network:'solana-devnet',genesisHash:genesis,programId:p.programId,programData:p.programdataAddress,upgradeAuthority:p.authority,deploySlot:p.lastDeploySlot,programBytes:p.dataLen};
}
export async function exportDeployment(inputFile:string,keyFile:string,outputFile=inputFile){
 const previous=JSON.parse(readFileSync(inputFile,'utf8'));
 const rpc=new Connection(process.env.SOLANA_RPC_URL||'https://api.devnet.solana.com','confirmed');
 const genesis=await rpc.getGenesisHash();if(genesis!==DEVNET_GENESIS)throw new Error('Devnet required');
 const raw=JSON.parse(execFileSync('.tools/solana-release/bin/solana',['program','show',PROGRAM_ID.toBase58(),'--keypair',keyFile,'--url',rpc.rpcEndpoint,'--output','json'],{encoding:'utf8'}));
 const verified=verifiedProgramMetadata(genesis,raw);
 const program=await rpc.getAccountInfo(PROGRAM_ID,'confirmed');if(!program?.executable)throw new Error('Program not executable');
 let groupInitialized=false,confirmedGroup:unknown=null;
 if(previous.group){
  const account=await rpc.getAccountInfo(new PublicKey(previous.group),'confirmed');
  if(account){
   const group=await readGroup(rpc,previous.group);
   if(group.mint!==previous.mint||group.vault!==previous.vault)throw new Error('Mint/vault configuration mismatch');
   const vault=await getAccount(rpc,new PublicKey(group.vault),'confirmed',TOKEN_PROGRAM_ID);
   if(!vault.owner.equals(new PublicKey(group.address))||!vault.mint.equals(new PublicKey(group.mint)))throw new Error('Vault authority/mint mismatch');
   groupInitialized=true;
   confirmedGroup={founder:group.founder,roster:group.roster,treasurer:group.treasurer,treasuryRecipient:group.treasuryRecipient,decimals:group.decimals,policy:{forwarder:group.policy.forwarder.toBase58(),forwarderState:group.policy.forwarderState.toBase58(),workflowCid:group.policy.workflowCid,workflowName:group.policy.workflowName,workflowOwner:group.policy.workflowOwner}};
  }
 }
 const data={...previous,...verified,groupInitialized,confirmedGroup,exportedAt:new Date().toISOString(),idl:'vowpool.json'};
 const directory=dirname(outputFile);mkdirSync(directory,{recursive:true});
 const idlOutput=join(directory,'vowpool.json');if(resolve(idlOutput)!==resolve('idl/vowpool.json'))copyFileSync('idl/vowpool.json',idlOutput);
 const temporary=outputFile+'.export.tmp';writeFileSync(temporary,JSON.stringify(data,null,2)+'\n');renameSync(temporary,outputFile);
 console.log(JSON.stringify({outputFile,programId:data.programId,upgradeAuthority:data.upgradeAuthority,groupInitialized,idl:idlOutput}));return data;
}
if(import.meta.main){const [input,key,output]=process.argv.slice(2);if(!input||!key)throw new Error('Usage: bun scripts/export-deployment.ts PUBLIC_RECEIPT_JSON DEPLOYER_KEY_PATH [OUTPUT_JSON]');await exportDeployment(input,key,output);}
