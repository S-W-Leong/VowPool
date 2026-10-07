import {z} from 'zod';
import {addressSchema} from '../../../../../packages/shared/src/schema';
import {body,fail,rateLimit} from '../../../lib/server';
import {demoAccess,demoConfiguration,fundDemoWallet} from '../../../lib/demo-services';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{rateLimit('demo-wallet-challenge',60);const wallet=addressSchema.parse(new URL(request.url).searchParams.get('wallet'));const config=demoConfiguration();if(!config.fundingEnabled)throw new Error('Demo funding unavailable');return Response.json(demoAccess().challenge(wallet,config.mint));}catch(e){return fail(e);}}
export async function POST(request:Request){try{rateLimit('demo-wallet-grants',10);const input=z.object({id:z.string().uuid(),signature:z.string().max(100)}).strict().parse(await body(request));return Response.json(await demoAccess().claim(input.id,input.signature,fundDemoWallet));}catch(e){return fail(e);}}
