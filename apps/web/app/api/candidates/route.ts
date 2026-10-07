import {connection,fail} from '../../../lib/server';
import {readCommitments,groupAddress} from '../../../lib/chain';
import {addressSchema} from '../../../../../packages/shared/src/schema';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const selected=new URL(request.url).searchParams.get('group')||groupAddress;const group=selected?addressSchema.parse(selected):'';return Response.json({addresses:group?(await readCommitments(connection,group)).filter(c=>c.status==='active'||(['succeeded','unresolved'].includes(c.status)&&!c.refundReleased)).slice(0,25).map(c=>c.address):[]});}catch(e){return fail(e,503);}}
