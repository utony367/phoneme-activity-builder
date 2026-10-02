import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync, spawn } from "node:child_process";
mkdirSync(".test-data", { recursive: true });
const file = resolve(
  ".test-data/" + (process.env.EVIDENCE_DB || "evidence") + ".db",
);
if (!existsSync(file)) writeFileSync(file, "");
const port = process.env.PORT || "3001";
const env = { ...process.env, DATABASE_URL: "file:" + file, PORT: port };
execFileSync(
  "node",
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  { env, stdio: "inherit" },
);
const server = spawn(
  "node",
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    port,
  ],
  { env, stdio: "inherit" },
);
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      ready = (await fetch(`http://127.0.0.1:${port}/api/status`)).ok;
      if (ready) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  if (!ready) throw new Error("Evidence server did not become ready");
  const [command, ...args] = process.argv.slice(2);
  const code = await new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", resolve);
  });
  process.exitCode = code || 0;
} finally {
  server.kill("SIGTERM");
}
