import { z } from 'zod';
export const visitSchema = z.object({
  visitKey: z.string().min(8).max(100).regex(/^[a-zA-Z0-9-]+$/),
  path: z.string().regex(/^\/(?:dashboard|activities(?:\/[1-9]\d*)?|wordle|word-search)?$/),
  visibleDurationMs: z.number().int().min(0).max(1800000),
}).strict();
