import {it,expect} from 'vitest';
import {Keypair} from '@solana/web3.js';
import {bootstrapSchema} from '../../../scripts/bootstrap-devnet';
const key=()=>Keypair.generate().publicKey.toBase58(),a=key(),b=key();
const config={roster:[a,b],founder:a,treasurer:b,treasuryRecipient:b,policy:{forwarder:'CXsKEJcs25TQEYU2e5jZ8QTPE3ffMLZhH6BWHrdcCCB5',forwarderState:key(),workflowCid:Array(32).fill(0),workflowName:Array(10).fill(0),workflowOwner:Array(20).fill(0)}};
it('rejects duplicate or omitted founder/treasurer roles',()=>{expect(()=>bootstrapSchema.parse({...config,roster:[a,a]})).toThrow();expect(()=>bootstrapSchema.parse({...config,founder:key()})).toThrow();expect(()=>bootstrapSchema.parse({...config,treasurer:key()})).toThrow();});
it('rejects zero forwarder addresses',()=>{expect(()=>bootstrapSchema.parse({...config,policy:{...config.policy,forwarder:'11111111111111111111111111111111'}})).toThrow();});
it('rejects mock forwarder in a real group configuration',()=>{expect(()=>bootstrapSchema.parse({...config,policy:{...config.policy,forwarder:'7kuEAA3mSC1Tz8gQjnvH7bKFda9xSPRRin9SZbH49cNK'}})).toThrow('fixture');});
it('accepts the live forwarder and explicitly labeled fixture',()=>{expect(bootstrapSchema.parse(config).developmentFixture).toBe(false);expect(bootstrapSchema.parse({...config,developmentFixture:true,policy:{...config.policy,forwarder:'7kuEAA3mSC1Tz8gQjnvH7bKFda9xSPRRin9SZbH49cNK'}}).developmentFixture).toBe(true);});
