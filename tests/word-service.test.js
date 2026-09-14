import { describe, expect, it } from "vitest";
import { createWordData, updateWordData } from "../lib/words.js";

describe("Word data mappers", () => {
  it("normalizes a new word and attaches its Activity ID", () => {
    expect(createWordData(4, { text: " CHAIR ", phonemes: "/tʃ eə/" })).toEqual({
      activityId: 4,
      text: "chair",
      phonemes: "/tʃ eə/",
      hint: null,
    });
  });

  it("preserves a supplied hint", () => {
    expect(updateWordData({ text: "ship", phonemes: "/ʃ ɪ p/", hint: "Boat" })).toEqual({
      text: "ship",
      phonemes: "/ʃ ɪ p/",
      hint: "Boat",
    });
  });

  it("normalizes an empty hint to null", () => {
    expect(updateWordData({ text: "ship", phonemes: "/ʃ ɪ p/", hint: "   " }).hint).toBeNull();
  });

  it("rejects invalid phonemes", () => {
    expect(() => createWordData(4, { text: "cat", phonemes: " " })).toThrow();
  });
});
