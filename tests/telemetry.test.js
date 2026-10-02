import { expect, test, vi } from 'vitest';
import { visitSchema } from '../lib/telemetry-validation.js';
import { upsertVisit, recordGeneration } from '../lib/telemetry.js';
test('visit input restricts duration, path and client controlled metadata', () => {
 const good = { visitKey: 'route-entry-12345', path:'/dashboard', visibleDurationMs:100 };
 expect(visitSchema.safeParse(good).success).toBe(true);
 for (const patch of [{visibleDurationMs:-1},{visibleDurationMs:1800001},{visibleDurationMs:1.5},{path:'/private'},{source:'SIMULATED'},{occurredAt:'2020-01-01'}]) expect(visitSchema.safeParse({...good,...patch}).success).toBe(false);
});
test('replayed visit uses atomic maximum and never increments duration', async () => {
 const db = { $executeRaw:vi.fn(), pageVisit:{findUnique:vi.fn().mockResolvedValue({visibleDurationMs:900})} };
 expect((await upsertVisit(db,{visitKey:'abcdefgh',path:'/dashboard',visibleDurationMs:500})).visibleDurationMs).toBe(900);
 expect(db.$executeRaw.mock.calls[0][0].join('')).toContain('MAX');
});
test('logging failure becomes unavailable', async () => {
 await expect(recordGeneration({operationEvent:{create:vi.fn().mockRejectedValue(new Error('db'))}},{})).rejects.toMatchObject({status:503});
});
