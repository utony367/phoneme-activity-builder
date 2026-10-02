import {apiError} from '../../../lib/api.js';
import {prisma} from '../../../lib/prisma.js';
import {getReport,parseReportFilters} from '../../../lib/reporting.js';
export const dynamic='force-dynamic';
export async function GET(request){try{const now=new Date();return Response.json(await getReport(prisma,parseReportFilters(new URL(request.url).searchParams,now),now),{headers:{'Cache-Control':'no-store'}});}catch(e){return apiError(e);}}
