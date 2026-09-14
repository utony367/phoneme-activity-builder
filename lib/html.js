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
  const normalized = words.map((word) => ({
    text: String(word?.text ?? "").trim().toLowerCase(),
    phonemes: String(word?.phonemes ?? "").trim(),
    hint: String(word?.hint ?? "").trim(),
  }));

  const invalidText = normalized.find((word) => !/^[a-z]+$/.test(word.text));
  if (invalidText) {
    throw new Error("Stored words must contain letters A-Z only");
  }

  const missingPhonemes = normalized.find((word) => word.phonemes.length === 0);
  if (missingPhonemes) {
    throw new Error("Stored words must include phonemes");
  }

  return normalized;
}
