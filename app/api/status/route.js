import {prisma} from '../../../lib/prisma.js';
import {getReadiness} from '../../../lib/telemetry.js';
export const dynamic = 'force-dynamic';
export async function GET() {
 try {return Response.json(await getReadiness(prisma),{headers:{'Cache-Control':'no-store'}});}
 catch {return Response.json({status:'unavailable',database:'unavailable',serverTime:new Date().toISOString()},{status:503});}
}
