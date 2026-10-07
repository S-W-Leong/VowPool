import {z} from 'zod';
import {addressSchema} from '../../../../../packages/shared/src/schema';
import {automaticRefund} from '../../../lib/demo-services';
import {body,fail,rateLimit} from '../../../lib/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{const {address}=z.object({address:addressSchema}).strict().parse(await body(request));rateLimit('refund:'+address,6);rateLimit('refund-total',60);return Response.json(await automaticRefund(address));}catch(e){return fail(e);}}
