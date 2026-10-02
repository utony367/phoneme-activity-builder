import { afterAll, beforeAll, expect, test } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'phoneme-model-'));
const url = `file:${join(dir, 'db.sqlite')}`;
let db;
beforeAll(() => {
  writeFileSync(join(dir, "db.sqlite"), "");
  execFileSync('node', ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe' });
  db = new PrismaClient({ datasources: { db: { url } } });
});
afterAll(async () => { await db?.$disconnect(); rmSync(dir, { recursive: true, force: true }); });

test('historical generation survives activity deletion while words cascade', async () => {
  const activity = await db.activity.create({ data: { title: 'History', activityType: 'WORDLE', difficulty: 'EASY', words: { create: { text: 'chair', phonemes: '/tʃ eə/' } } } });
  expect(activity.source).toBe('LIVE');
  await db.operationEvent.create({ data: { eventKey: 'history-generation', eventType: 'GENERATION', outcome: 'SUCCESS', activityId: activity.id, activityTitle: 'History', activityType: 'WORDLE', durationMs: 12 } });
  await db.activity.delete({ where: { id: activity.id } });
  expect(await db.word.count()).toBe(0);
  const history = await db.operationEvent.findUnique({ where: { eventKey: 'history-generation' } });
  expect(history.activityId).toBeNull();
  expect(history.activityTitle).toBe('History');
  expect(history.source).toBe('LIVE');
});

test('demo seeding twice does not inflate activities or telemetry', async () => {
  for (let i = 0; i < 2; i++) execFileSync('node', ['scripts/seed-demo.mjs'], { env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe' });
  expect(await db.activity.count({ where: { source: 'SIMULATED' } })).toBe(3);
  expect(await db.operationEvent.count({ where: { source: 'SIMULATED' } })).toBe(7);
  expect(await db.pageVisit.count({ where: { source: 'SIMULATED' } })).toBe(3);
});
