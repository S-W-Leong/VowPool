import { describe, it, expect } from 'vitest';
import { parseTokenAmount, formatTokenAmount } from '../src/amount';
import { draftSchema, githubConfigSchema } from '../src/schema';
import { evaluateGithub } from '../src/github';
const owner='11111111111111111111111111111111';
const reviewer='TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const base={owner,goal:'Ship login',criteria:'Review the public PR',stake:'1.25',mode:'single',reviewers:[reviewer],goalDeadline:1000,reviewDeadline:1100};
const config={owner:'alice',repo:'project',pr:1,targetBranch:'main',policyVersion:1};
const observation=(overrides:Record<string,unknown>={})=>({status:200,body:{number:1,merged:true,merged_at:'1970-01-01T00:15:00Z',base:{ref:'main',repo:{name:'project',owner:{login:'alice'}}}},...overrides});
describe('integer token amounts',()=>{
 it.each([['0',6,0n],['1.25',6,1250000n],['18446744073709551615',0,18446744073709551615n],['9007199254740993',0,9007199254740993n]] as const)('converts %s without precision loss',(s,d,n)=>expect(parseTokenAmount(s,d)).toBe(n));
 it.each(['-1','+1','1e3','1.0000001','18446744073709551616','NaN',' 1','1.','01'])('rejects unsafe amount %s',s=>expect(()=>parseTokenAmount(s,6)).toThrow());
 it('formats beyond number precision',()=>expect(formatTokenAmount(9007199254740993123n,6)).toBe('9007199254740.993123'));
});
describe('frozen configuration',()=>{
 it('accepts valid single mode and zero stake',()=>expect(draftSchema.parse({...base,stake:'0'}).stake).toBe('0'));
 it.each([{reviewers:[reviewer,reviewer],mode:'multiple'},{reviewers:[owner]},{reviewers:[]},{reviewDeadline:1000},{mode:'github',reviewers:[],github:{...config,pr:0}},{mode:'github',reviewers:[reviewer],github:config},{mode:'group',reviewers:[reviewer]},{goal:'🦉'.repeat(126)}])('rejects invalid terms %j',extra=>expect(()=>draftSchema.parse({...base,...extra})).toThrow());
 it.each([{owner:'a/b'},{repo:'../repo'},{pr:0},{policyVersion:2},{targetBranch:'x'.repeat(101)},{repo:'repo?x=evil'}])('rejects unsafe Github config %j',extra=>expect(()=>githubConfigSchema.parse({...config,...extra})).toThrow());
});
describe('Github evidence',()=>{
 it('accepts a timely merge into exact branch',()=>expect(evaluateGithub(config,observation(),800,1000,1001)).toBe('SUCCESS'));
 it('accepts deadline-inclusive merge',()=>expect(evaluateGithub(config,observation({body:{...(observation().body),merged_at:'1970-01-01T00:16:40Z'}}),800,1000,1000)).toBe('SUCCESS'));
 it.each([['wrong PR',{number:2}],['wrong repository',{base:{ref:'main',repo:{name:'other',owner:{login:'alice'}}}}],['malformed timestamp',{merged_at:'yesterday'}],['missing boolean',{merged:undefined}]])('treats %s as unknown',(_,extra)=>expect(evaluateGithub(config,observation({body:{...observation().body,...extra}}),800,1000,1001)).toBe('UNKNOWN'));
 it.each([['wrong branch',{base:{ref:'develop',repo:{name:'project',owner:{login:'alice'}}}}],['preactivation merge',{merged_at:'1970-01-01T00:13:20Z'}],['late merge',{merged_at:'1970-01-01T00:16:41Z'}],['unmerged',{merged:false,merged_at:null}]])('keeps %s pending early and fails after deadline',(_,extra)=>{
  const o=observation({body:{...observation().body,...extra}});expect(evaluateGithub(config,o,800,1000,1000)).toBe(extra.merged_at==='1970-01-01T00:16:41Z'?'UNKNOWN':'PENDING');expect(evaluateGithub(config,o,800,1000,1002)).toBe('FAIL');
 });
 it.each([404,429,500])('treats HTTP %s as unknown',status=>expect(evaluateGithub(config,observation({status}),800,1000,1001)).toBe('UNKNOWN'));
 it('rejects future merged time',()=>expect(evaluateGithub(config,observation(),800,1000,899)).toBe('UNKNOWN'));
 it('bounds oversized responses',()=>expect(evaluateGithub(config,observation({body:'x'.repeat(262145)}),800,1000,1001)).toBe('UNKNOWN'));
});
