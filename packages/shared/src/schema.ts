import { z } from 'zod';
import bs58 from 'bs58';
import { parseTokenAmount } from './amount';
export const utf8 = (max:number) => z.string().refine(s=>new TextEncoder().encode(s).length<=max,`Maximum ${max} UTF-8 bytes`);
export const addressSchema=z.string().refine(s=>{try{return bs58.decode(s).length===32;}catch{return false;}},'Invalid wallet address');
export const modes=['single','multiple','group','github'] as const;
export type VerificationMode=typeof modes[number];
export const githubConfigSchema=z.object({
 owner:z.string().min(1).max(39).regex(/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/),
 repo:z.string().min(1).max(100).regex(/^[A-Za-z0-9_.-]+$/).refine(s=>s!=='.'&&s!=='..'),
 pr:z.number().int().positive().max(4294967295),
 targetBranch:utf8(100).refine(s=>s.length>0&&!/[\x00-\x20\x7f~^:?*\[\\]/.test(s)&&!s.includes('..')&&!s.includes('@{')&&!s.endsWith('.lock')&&!s.endsWith('/')&&!s.startsWith('/'),'Invalid branch'),
 policyVersion:z.literal(1),
}).strict();
export type GithubConfig=z.infer<typeof githubConfigSchema>;
export const timestampSchema=z.number().int().nonnegative().max(8_640_000_000_000);
export const draftSchema=z.object({
 owner:addressSchema,goal:utf8(500).refine(s=>s.trim().length>0),criteria:utf8(2000).refine(s=>s.trim().length>0),
 stake:z.string(),tokenDecimals:z.number().int().min(0).max(18).default(6),
 consequence:utf8(2000).optional(),goalDeadline:timestampSchema,reviewDeadline:timestampSchema,
 mode:z.enum(modes),reviewers:z.array(addressSchema).max(7),github:githubConfigSchema.optional(),
}).strict().superRefine((d,ctx)=>{
 const issue=(message:string,path:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message,path:[path]});
 try{parseTokenAmount(d.stake,d.tokenDecimals);}catch{issue('Invalid stake','stake');}
 if(d.reviewDeadline<=d.goalDeadline)issue('Review must be after goal deadline','reviewDeadline');
 if(new Set(d.reviewers).size!==d.reviewers.length||d.reviewers.includes(d.owner))issue('Reviewers must be distinct non-owner members','reviewers');
 if((d.mode==='single'&&d.reviewers.length!==1)||(d.mode==='multiple'&&d.reviewers.length<1)||(['group','github'].includes(d.mode)&&d.reviewers.length!==0))issue('Invalid reviewers for mode','reviewers');
 if(d.mode==='github'&&!d.github)issue('GitHub configuration required','github');
 if(d.mode!=='github'&&d.github)issue('GitHub config only allowed for automated mode','github');
});
export type CommitmentDraft=z.infer<typeof draftSchema>;
