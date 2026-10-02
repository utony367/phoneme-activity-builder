import { randomUUID } from 'node:crypto';
import { ApiError } from './api.js';
export async function recordGeneration(db, data) {
  try { return await db.operationEvent.create({ data: { eventKey: randomUUID(), eventType:'GENERATION', ...data } }); }
  catch { throw new ApiError('Activity tracking is unavailable. Please try again.',503); }
}
export async function upsertVisit(db, {visitKey,path,visibleDurationMs}) {
  // SQLite executes this in one statement: concurrent/replayed deliveries cannot inflate time.
  await db.$executeRaw`INSERT INTO PageVisit (visitKey,path,visibleDurationMs,source,occurredAt) VALUES (${visitKey},${path},${visibleDurationMs},'LIVE',${new Date()}) ON CONFLICT(visitKey) DO UPDATE SET visibleDurationMs=MAX(PageVisit.visibleDurationMs,excluded.visibleDurationMs)`;
  return db.pageVisit.findUnique({where:{visitKey}});
}
export async function getReadiness(db) {
  await db.$queryRaw`SELECT 1`;
  return {status:'ready',database:'available',serverTime:new Date().toISOString()};
}
