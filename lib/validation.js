import { z } from "zod";

const optionalHintSchema = z
  .string()
  .trim()
  .max(240)
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const activitySchema = z.object({
  title: z.string().trim().min(1).max(100),
  activityType: z.enum(["WORDLE", "WORD_SEARCH"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  hint: optionalHintSchema,
  gridSize: z.number().int().min(8).max(20).default(12),
  maxAttempts: z.number().int().min(3).max(10).default(6),
});

export const wordSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[A-Za-z]+$/, "Word text must contain letters A-Z only")
    .transform((value) => value.toLowerCase()),
  phonemes: z.string().trim().min(1).max(200),
  hint: optionalHintSchema,
});

export function parsePositiveId(value) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new Error("Invalid ID");
  }

  const id = Number(value);
  if (!Number.isSafeInteger(id)) {
    throw new Error("Invalid ID");
  }

  return id;
}
