import {demoConfiguration} from '../../../lib/demo-services';
import {fail} from '../../../lib/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(demoConfiguration());}catch(e){return fail(e,503);}}
