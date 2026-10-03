// SQLite permits one writer. A single Prisma connection avoids competing
// interactive write transactions timing out under concurrent requests.
export function sqliteRuntimeUrl(url) {
  if (!url?.startsWith("file:")) return url;
  const [path, query = ""] = url.split("?");
  const params = new URLSearchParams(query);
  params.set("connection_limit", "1");
  return path + "?" + params;
}
