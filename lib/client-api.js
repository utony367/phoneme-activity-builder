function errorMessage(payload, status) {
  if (payload && typeof payload === "object" && typeof payload.error === "string") {
    return payload.error;
  }

  return `Request failed (${status})`;
}

export async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status));
  }

  return payload;
}

export function safeActivityFilename(title) {
  const stem = String(title ?? "")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${stem || "phoneme-activity"}.html`;
}

export async function fetchActivityHtml(id) {
  const response = await fetch(`/api/activities/${id}/generate`);

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(errorMessage(payload, response.status));
  }

  return response.text();
}

export function downloadHtml(html, title) {
  const href = URL.createObjectURL(new Blob([html], { type: "text/html; charset=utf-8" }));
  const link = document.createElement("a");
  link.href = href;
  link.download = safeActivityFilename(title);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

export async function downloadActivity(id, title) {
  downloadHtml(await fetchActivityHtml(id), title);
}
