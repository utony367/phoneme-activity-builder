import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync, spawn } from "node:child_process";
mkdirSync(".test-data", { recursive: true });
const file = resolve(".test-data/browser.db");
if (!existsSync(file)) writeFileSync(file, "");
const env = { ...process.env, DATABASE_URL: "file:" + file };
execFileSync(
  "node",
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  { env, stdio: "inherit" },
);
const server = spawn(
  "node",
  ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1"],
  { env, stdio: "inherit" },
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => server.kill(signal));
server.on("exit", (code) => process.exit(code || 0));
