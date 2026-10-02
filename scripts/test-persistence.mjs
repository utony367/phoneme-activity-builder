import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
mkdirSync(".test-data", { recursive: true });
mkdirSync("evidence", { recursive: true });
const file = resolve(".test-data/persistence.db");
if (!existsSync(file)) writeFileSync(file, "");
const env = { ...process.env, DATABASE_URL: "file:" + file, PORT: "3003" };
execFileSync(
  "node",
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  { env, stdio: "inherit" },
);
const base = "http://127.0.0.1:3003";
let server;
async function start() {
  server = spawn(
    "node",
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--port",
      "3003",
      "--hostname",
      "127.0.0.1",
    ],
    { env, stdio: "inherit" },
  );
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base + "/api/status")).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Server not ready");
}
async function stop() {
  await new Promise((r) => {
    server.once("exit", r);
    server.kill("SIGTERM");
  });
}
async function json(path, options = {}) {
  const response = await fetch(base + path, {
    ...options,
    headers: { "Content-Type": "application/json" },
  });
  assert.ok(response.ok, `${path}: ${response.status}`);
  return response.json();
}
try {
  await start();
  const activity = await json("/api/activities", {
    method: "POST",
    body: JSON.stringify({
      title: "Restart persistence " + Date.now(),
      activityType: "WORDLE",
      difficulty: "EASY",
    }),
  });
  await json(`/api/activities/${activity.id}/words`, {
    method: "POST",
    body: JSON.stringify({ text: "chair", phonemes: "/tʃ eə/" }),
  });
  assert.equal(
    (await fetch(base + `/api/activities/${activity.id}/generate`)).status,
    200,
  );
  await stop();
  await start();
  const saved = await json("/api/activities/" + activity.id);
  assert.equal(saved.words[0].phonemes, "/tʃ eə/");
  await json("/api/activities/" + activity.id, { method: "DELETE" });
  const report = await json("/api/reports?range=all");
  assert.equal(
    report.recentEvents.filter((e) => e.title === activity.title).length,
    2,
  );
  assert.equal(
    (await fetch(base + "/api/activities/" + activity.id)).status,
    404,
  );
  writeFileSync(
    "evidence/persistence.json",
    JSON.stringify(
      {
        passed: true,
        checkedAt: new Date().toISOString(),
        runtime: process.version,
        checks: [
          "Saved Unicode word and activity survive server restart with same SQLite file",
          "Deleted activity returns 404",
          "Creation and generation history survives deletion",
        ],
      },
      null,
      2,
    ),
  );
  console.log("Persistence checks passed");
} finally {
  if (server && !server.killed) await stop();
}
