export { generateWordleHtml } from "./wordle.js";
export { generateWordSearchHtml } from "./word-search.js";

import { generateWordleHtml } from "./wordle.js";
import { generateWordSearchHtml } from "./word-search.js";

export function generateActivityHtml(activity) {
  if (activity?.activityType === "WORDLE") return generateWordleHtml(activity);
  if (activity?.activityType === "WORD_SEARCH") return generateWordSearchHtml(activity);
  throw new Error("Unsupported activity type");
}
