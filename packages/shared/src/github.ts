import { z } from 'zod';
import { githubConfigSchema,type GithubConfig } from './schema';
const repoSchema=z.object({name:z.string().max(100),owner:z.object({login:z.string().max(39)})});
const responseSchema=z.object({number:z.number().int().positive(),merged:z.boolean(),merged_at:z.string().nullable(),base:z.object({ref:z.string(),repo:repoSchema})});
export type Observation={status:number;body:unknown};
export type GithubResult='SUCCESS'|'FAIL'|'PENDING'|'UNKNOWN';
const isoSeconds=(s:string)=>{if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(s))return NaN;const t=Date.parse(s);return Number.isFinite(t)&&new Date(t).toISOString().replace('.000','')===s?t/1000:NaN;};
export function evaluateGithub(config:GithubConfig,observation:Observation,activatedAt:number,goalDeadline:number,observedAt:number):GithubResult {
 try{
  githubConfigSchema.parse(config);
  if(observation.status!==200||JSON.stringify(observation.body).length>262144||!Number.isSafeInteger(observedAt)||observedAt<activatedAt)return 'UNKNOWN';
  const b=responseSchema.parse(typeof observation.body==='string'?JSON.parse(observation.body):observation.body);
  if(b.number!==config.pr||b.base.repo.name.toLowerCase()!==config.repo.toLowerCase()||b.base.repo.owner.login.toLowerCase()!==config.owner.toLowerCase())return 'UNKNOWN';
  let mergedAt=0;
  if(b.merged){if(b.merged_at===null)return 'UNKNOWN';mergedAt=isoSeconds(b.merged_at);if(!Number.isFinite(mergedAt)||mergedAt>observedAt)return 'UNKNOWN';}
  else if(b.merged_at!==null)return 'UNKNOWN';
  if(b.merged&&b.base.ref===config.targetBranch&&mergedAt>activatedAt&&mergedAt<=goalDeadline)return 'SUCCESS';
  return observedAt>goalDeadline?'FAIL':'PENDING';
 }catch{return 'UNKNOWN';}
}
export function githubUrl(c:GithubConfig):string {const v=githubConfigSchema.parse(c);return `https://api.github.com/repos/${v.owner}/${v.repo}/pulls/${v.pr}`;}
