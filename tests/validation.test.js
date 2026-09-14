import { describe, expect, it } from "vitest";
import {
  activitySchema,
  parsePositiveId,
  wordSchema,
} from "../lib/validation.js";

describe("validation", () => {
  it("accepts a multi-character IPA phoneme", () => {
    const result = wordSchema.safeParse({
      text: "chair",
      phonemes: "/tʃ eə/",
      hint: "Furniture",
    });

    expect(result.success).toBe(true);
    expect(result.data.text).toBe("chair");
  });

  it("normalizes a word and rejects empty or unsupported word text", () => {
    expect(
      wordSchema.parse({ text: "  APPLE ", phonemes: "/æ p əl/" }).text,
    ).toBe("apple");
    expect(wordSchema.safeParse({ text: "cat", phonemes: " " }).success).toBe(
      false,
    );
    expect(wordSchema.safeParse({ text: "co-op", phonemes: "/k əʊ ɒ p/" }).success).toBe(
      false,
    );
    expect(wordSchema.safeParse({ text: "café", phonemes: "/k æ f eɪ/" }).success).toBe(
      false,
    );
  });

  it("validates activity settings and positive IDs", () => {
    expect(
      activitySchema.safeParse({
        title: "Short vowels",
        activityType: "WORDLE",
        difficulty: "EASY",
        gridSize: 10,
        maxAttempts: 6,
      }).success,
    ).toBe(true);
    expect(parsePositiveId("2")).toBe(2);
    expect(() => parsePositiveId("0")).toThrow("Invalid ID");
  });

  it("normalizes a cleared activity hint to null", () => {
    expect(
      activitySchema.parse({
        title: "Short vowels",
        activityType: "WORDLE",
        difficulty: "EASY",
        hint: "   ",
      }).hint,
    ).toBeNull();
  });
});
