export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function safeJson(value) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

export function savedWords(activity) {
  const words = Array.isArray(activity?.words) ? activity.words : [];
  return words
    .map((word) => ({
      text: String(word?.text ?? "").trim().toLowerCase(),
      phonemes: String(word?.phonemes ?? "").trim(),
      hint: String(word?.hint ?? "").trim(),
    }))
    .filter((word) => /^[a-z]+$/.test(word.text) && word.phonemes.length > 0);
}
