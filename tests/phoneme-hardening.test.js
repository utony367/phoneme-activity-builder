import { describe, expect, it } from "vitest";

import { generateActivityHtml } from "../lib/generators/index.js";
import { wordSchema } from "../lib/validation.js";

const validPhonemes = [
  "/tʃ eə/",
  "[ˈhæp.i]",
  "t͡ʃ aɪ",
  "/ˌdʒəˈrəf/",
];

const invalidPhonemes = [
  "123",
  "/",
  "[ ]",
  "/ˈ ː/",
  "/tʃ",
  "tʃ/",
  "[tʃ/",
  "/tʃ]",
  "/tʃ/ [a]",
  "tʃ!",
];

describe("phoneme format validation", () => {
  it.each(validPhonemes)("accepts supported IPA notation %s", (phonemes) => {
    expect(wordSchema.safeParse({ text: "chair", phonemes }).success).toBe(true);
  });

  it.each(invalidPhonemes)("rejects malformed phoneme notation %s", (phonemes) => {
    expect(wordSchema.safeParse({ text: "chair", phonemes }).success).toBe(false);
  });

  it("rejects legacy malformed phonemes during server generation", () => {
    expect(() =>
      generateActivityHtml({
        title: "Legacy data",
        activityType: "WORDLE",
        maxAttempts: 6,
        words: [{ text: "chair", phonemes: "123", hint: null }],
      }),
    ).toThrow("Stored word phonemes are invalid");
  });
});
