import {connection,fail} from '../../../lib/server';
import {readCommitments,groupAddress} from '../../../lib/chain';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json({addresses:groupAddress?(await readCommitments(connection,groupAddress)).filter(c=>c.status==='active').slice(0,25).map(c=>c.address):[]});}catch(e){return fail(e,503);}}
