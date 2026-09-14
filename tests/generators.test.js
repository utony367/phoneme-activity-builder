import { describe, expect, it } from "vitest";
import { escapeHtml, safeJson } from "../lib/html.js";
import {
  generateActivityHtml,
  generateWordleHtml,
  generateWordSearchHtml,
} from "../lib/generators/index.js";

const wordleActivity = {
  title: "Short vowel Wordle",
  activityType: "WORDLE",
  difficulty: "EASY",
  hint: "A fruit",
  gridSize: 10,
  maxAttempts: 5,
  words: [{ text: "apple", phonemes: "/æ p əl/", hint: "A fruit" }],
};

const wordSearchActivity = {
  title: "Consonant search",
  activityType: "WORD_SEARCH",
  difficulty: "MEDIUM",
  hint: "Find the words",
  gridSize: 10,
  maxAttempts: 6,
  words: [
    { text: "chair", phonemes: "/tʃ eə/", hint: "Furniture" },
    { text: "ship", phonemes: "/ʃ ɪ p/", hint: "Boat" },
  ],
};

describe("HTML safety", () => {
  it("escapes HTML markup", () => {
    expect(escapeHtml("<script>alert(1)</script>")).not.toContain("<script>");
  });

  it("prevents stored data from closing an embedded script", () => {
    const serialized = safeJson({ title: "</script><script>alert(1)</script>" });

    expect(serialized).not.toContain("</script>");
    expect(serialized).not.toContain("<script>");
  });
});

describe("saved activity generators", () => {
  it("generates an interactive Wordle document from stored data", () => {
    const html = generateWordleHtml(wordleActivity);

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Short vowel Wordle");
    expect(html).toContain("apple");
    expect(html).toContain("/æ p əl/");
    expect(html).toContain("maxAttempts");
    expect(html).toContain("addEventListener");
    expect(generateActivityHtml(wordleActivity)).toBe(html);
  });

  it("rejects a Wordle activity without a valid word", () => {
    expect(() => generateWordleHtml({ ...wordleActivity, words: [] }))
      .toThrow("At least one word is required");
  });

  it("generates a Word Search document from every saved word", () => {
    const html = generateWordSearchHtml(wordSearchActivity);

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("chair");
    expect(html).toContain("ship");
    expect(html).toContain("/tʃ eə/");
    expect(html).toContain("/ʃ ɪ p/");
    expect(html).toContain("pointerdown");
    expect(generateActivityHtml(wordSearchActivity)).toBe(html);
  });

  it("rejects a word that cannot fit in its configured grid", () => {
    expect(() => generateWordSearchHtml({
      ...wordSearchActivity,
      gridSize: 8,
      words: [{ text: "longwordx", phonemes: "/l ɔ ŋ/ " }],
    })).toThrow("cannot fit in the grid");
  });
});
