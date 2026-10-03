import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync, spawn } from "node:child_process";
const directory = mkdtempSync(join(tmpdir(), "phoneme-evidence-"));
const file = join(directory, "database.db");
writeFileSync(file, "");
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
  await new Promise((resolve) => {
    server.once("exit", resolve);
    server.kill("SIGTERM");
  });
  rmSync(directory, { recursive: true, force: true });
}
