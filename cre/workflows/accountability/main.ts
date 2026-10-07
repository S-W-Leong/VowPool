import {CronCapability,HTTPClient,Runner,handler,consensusIdenticalAggregation,type HTTPSendRequester,type Runtime} from '@chainlink/cre-sdk';
import {z} from 'zod';
import {evaluateGithub,githubUrl} from '../../../packages/shared/src/github';
import {githubConfigSchema} from '../../../packages/shared/src/schema';
const localSchema=z.object({mode:z.literal('local-simulation'),schedule:z.string(),samplePreviousPrice:z.string(),sample:githubConfigSchema.extend({activatedAt:z.number().int(),goalDeadline:z.number().int()})}).strict();
type Config=z.infer<typeof localSchema>;
const fetchGithub=(sender:HTTPSendRequester,url:string):string=>{
 try{
  const response=sender.sendRequest({url,method:'GET',headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'VowPool-CRE'}}).result();
  if(response.statusCode!==200||response.body.length>262144)return JSON.stringify({status:response.statusCode,body:null});
  return JSON.stringify({status:200,body:JSON.parse(new TextDecoder().decode(response.body))});
 }catch{return JSON.stringify({status:0,body:null});}
};
export const onCron=(runtime:Runtime<Config>):string=>{
 const config=localSchema.parse(runtime.config),now=Math.floor(runtime.now().getTime()/1000);
 const {activatedAt,goalDeadline,...githubConfig}=config.sample;
 const raw=new HTTPClient().sendRequest(runtime,fetchGithub,consensusIdenticalAggregation<string>())(githubUrl(githubConfig)).result();
 const result=evaluateGithub(githubConfig,JSON.parse(raw),activatedAt,goalDeadline,now);
 const summary=JSON.stringify({mode:'local-simulation',source:'public-github-api',result,observedAt:now,warning:'Sample criteria; no VowPool account read or transaction submitted'});
 runtime.log(summary);return summary;
};
const initWorkflow=(config:Config)=>[handler(new CronCapability().trigger({schedule:config.schedule}),onCron)];
export async function main(){const runner=await Runner.newRunner<Config>({configSchema:localSchema});await runner.run(initWorkflow);}
main();
