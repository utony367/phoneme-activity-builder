import { wordSchema } from "./validation.js";

function normalizedWordData(input) {
  const word = wordSchema.parse(input);

  return {
    text: word.text,
    phonemes: word.phonemes,
    hint: word.hint ?? null,
  };
}

export function createWordData(activityId, input) {
  return {
    activityId,
    ...normalizedWordData(input),
  };
}

export function updateWordData(input) {
  return normalizedWordData(input);
}
