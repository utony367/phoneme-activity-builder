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

  it("normalizes a word and rejects an empty phoneme", () => {
    expect(
      wordSchema.parse({ text: "  APPLE ", phonemes: "/æ p əl/" }).text,
    ).toBe("apple");
    expect(wordSchema.safeParse({ text: "cat", phonemes: " " }).success).toBe(
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
});
