import { z } from "zod";

const optionalHintSchema = z
  .string()
  .trim()
  .max(240)
  .nullable()
  .optional()
  .transform((value) => value || null);

const phonemeCharacterPattern =
  /^[A-Za-z\u00C0-\u024F\u0250-\u02FF\u0300-\u036F\u0370-\u03FF\u1D00-\u1D7F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F. \t]+$/u;
const phonemeSegmentPattern =
  /[A-Za-z\u00C0-\u024F\u0250-\u02AF\u0370-\u03FF\u1D00-\u1D7F]/u;

function phonemeContent(value) {
  const trimmed = value.trim();
  const first = trimmed[0];
  const last = trimmed.at(-1);
  const usesSlash = first === "/" || last === "/";
  const usesBracket = first === "[" || last === "]";

  if (
    (usesSlash && (first !== "/" || last !== "/")) ||
    (usesBracket && (first !== "[" || last !== "]")) ||
    (usesSlash && usesBracket)
  ) {
    return null;
  }

  const content = usesSlash || usesBracket ? trimmed.slice(1, -1).trim() : trimmed;
  return /[/\[\]]/.test(content) ? null : content;
}

/**
 * Accepts Unicode IPA letters, combining diacritics, tie bars, stress/length
 * marks, syllable dots and spaces. A value may optionally be wrapped in one
 * matching pair of /.../ or [...]; nested, mixed, and unclosed wrappers are
 * rejected. This deliberately permissive format preserves multi-character IPA.
 */
export function isValidPhonemeString(value) {
  if (typeof value !== "string") return false;

  const content = phonemeContent(value);
  return Boolean(
    content &&
      phonemeCharacterPattern.test(content) &&
      phonemeSegmentPattern.test(content),
  );
}

export const phonemesSchema = z
  .string()
  .trim()
  .min(1, "Phonemes are required")
  .max(200)
  .superRefine((value, context) => {
    if (value && !isValidPhonemeString(value)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Use IPA symbols with optional matching /.../ or [...] notation",
      });
    }
  });

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
  phonemes: phonemesSchema,
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
