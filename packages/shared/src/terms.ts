import {sha256} from '@noble/hashes/sha256';
import {Writer} from './borsh';
import {draftSchema,githubConfigSchema,modes,type GithubConfig,type CommitmentDraft} from './schema';
import {parseTokenAmount} from './amount';
export type PolicyIdentity={program:string;group:string;commitment:string;workflowCid:number[];workflowName:number[];workflowOwner:number[]};
export type Deadlines={goalDeadline:number;reviewDeadline:number;hardDeadline:number};
function github(w:Writer,c:GithubConfig){return w.str(c.owner).str(c.repo).n(c.pr,4).str(c.targetBranch);}
export function encodeGithubConfig(i:PolicyIdentity,config:GithubConfig,d:Deadlines):Uint8Array {
 const c=githubConfigSchema.parse(config);
 for(const [bytes,size] of [[i.workflowCid,32],[i.workflowName,10],[i.workflowOwner,20]] as const)if(bytes.length!==size||bytes.some(x=>!Number.isInteger(x)||x<0||x>255))throw new Error('Invalid workflow identity');
 if(d.reviewDeadline<=d.goalDeadline||d.hardDeadline!==d.reviewDeadline+172800)throw new Error('Invalid deadlines');
 return github(new Writer().n(1,1).key(i.program).key(i.group).key(i.commitment),c).n(d.goalDeadline,8).n(d.reviewDeadline,8).n(d.hardDeadline,8).n(c.policyVersion,2).raw(i.workflowCid).raw(i.workflowName).raw(i.workflowOwner).finish();
}
export const hashGithubConfig=(i:PolicyIdentity,c:GithubConfig,d:Deadlines)=>sha256(encodeGithubConfig(i,c,d));
// v1: owner, exact text, stake base units, decimals, mode, ordered reviewers,
// UTC deadlines, optional consequence, optional bounded Github configuration.
export function encodeTerms(input:CommitmentDraft|unknown):Uint8Array {
 const d=draftSchema.parse(input);const w=new Writer().n(1,1).key(d.owner).str(d.goal).str(d.criteria).n(parseTokenAmount(d.stake,d.tokenDecimals),8).n(d.tokenDecimals,1).n(modes.indexOf(d.mode),1).n(d.reviewers.length,4);
 d.reviewers.forEach(r=>w.key(r));w.n(d.goalDeadline,8).n(d.reviewDeadline,8).n(d.consequence===undefined?0:1,1);if(d.consequence!==undefined)w.str(d.consequence);
 w.n(d.github?1:0,1);if(d.github)github(w,d.github).n(d.github.policyVersion,2);
 return w.finish();
}
export const hashTerms=(d:unknown)=>sha256(encodeTerms(d));
