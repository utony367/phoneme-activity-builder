export const typeLabel = (type) =>
  ({ WORDLE: "Wordle", WORD_SEARCH: "Word Search" })[type] || type;
export const rateLabel = (rate) =>
  rate === null ? "No data" : `${Math.round(rate * 100)}%`;
export const durationLabel = (ms) =>
  ms === null ? "No data" : `${(ms / 1000).toFixed(1)} seconds`;
export const mostUsedLabel = (types) =>
  types.length
    ? types.map(typeLabel).join(" / ") + (types.length > 1 ? " (tie)" : "")
    : "No data";
