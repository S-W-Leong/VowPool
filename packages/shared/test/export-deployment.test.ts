import {it,expect} from 'vitest';
import {verifiedProgramMetadata} from '../../../scripts/export-deployment';
import {DEVNET_GENESIS,PROGRAM_ID} from '../../../apps/web/lib/chain';
const details={programId:PROGRAM_ID.toBase58(),owner:'BPFLoaderUpgradeab1e11111111111111111111111',programdataAddress:'9oMTFFjho8qDmhzbg3aVDjTdMZw9hwnKt35fvTdvy1ke',authority:'4SrzkRNsAcKdeN7k7TNUvUzAdZWwg8dgckpJ2tmBZ3DB',lastDeploySlot:508399160,dataLen:428800};
it('rejects export from another cluster or substituted program',()=>{
 expect(()=>verifiedProgramMetadata('mainnet',details)).toThrow('Devnet');
 expect(()=>verifiedProgramMetadata(DEVNET_GENESIS,{...details,programId:details.authority})).toThrow('program');
 expect(()=>verifiedProgramMetadata(DEVNET_GENESIS,{...details,owner:details.authority})).toThrow('loader');
});
it('exports actual retained authority and deployed slot',()=>{
 expect(verifiedProgramMetadata(DEVNET_GENESIS,details)).toMatchObject({upgradeAuthority:details.authority,deploySlot:508399160,programBytes:428800});
});
it('preserves null authority rather than claiming retained control',()=>{
 expect(verifiedProgramMetadata(DEVNET_GENESIS,{...details,authority:null}).upgradeAuthority).toBeNull();
});
