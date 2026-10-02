import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { createServer } from "node:http";
import { mkdirSync, writeFileSync } from "node:fs";
const base = `http://127.0.0.1:${process.env.PORT || 3001}`;
const output = process.env.ACCESSIBILITY_OUTPUT || "evidence/lighthouse";
mkdirSync(output, { recursive: true });
const fixtures = [];
let chrome, staticServer;
const json = async (path, options = {}) => {
  const r = await fetch(base + path, {
    ...options,
    headers: { "Content-Type": "application/json" },
  });
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
};
try {
  const html = {};
  for (const type of ["WORDLE", "WORD_SEARCH"]) {
    const a = await json("/api/activities", {
      method: "POST",
      body: JSON.stringify({
        title: "Accessibility " + type,
        activityType: type,
        difficulty: "EASY",
        gridSize: 8,
        maxAttempts: 6,
      }),
    });
    fixtures.push(a.id);
    await json(`/api/activities/${a.id}/words`, {
      method: "POST",
      body: JSON.stringify({ text: "chair", phonemes: "/tʃ eə/" }),
    });
    const r = await fetch(base + `/api/activities/${a.id}/generate`);
    if (!r.ok) throw new Error("Generation failed");
    html["/" + type.toLowerCase()] = await r.text();
  }
  staticServer = createServer((req, res) => {
    res.writeHead(html[req.url] ? 200 : 404, {
      "Content-Type": "text/html; charset=utf-8",
    });
    res.end(html[req.url] || "Not found");
  });
  await new Promise((r) => staticServer.listen(3002, "127.0.0.1", r));
  chrome = await chromeLauncher.launch({
    chromePath: process.env.CHROME_PATH,
    chromeFlags: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"],
  });
  const targets = [
    ["dashboard", base + "/dashboard"],
    ["builder", base + "/activities/" + fixtures[0]],
    ["wordle", "http://127.0.0.1:3002/wordle"],
    ["word-search", "http://127.0.0.1:3002/word_search"],
  ];
  const summary = [];
  for (const [name, url] of targets) {
    const result = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: ["accessibility"],
      output: ["json", "html"],
      logLevel: "error",
    });
    writeFileSync(`${output}/${name}.json`, result.report[0]);
    writeFileSync(`${output}/${name}.html`, result.report[1]);
    summary.push({
      name,
      url,
      score: result.lhr.categories.accessibility.score,
      version: result.lhr.lighthouseVersion,
      fetchTime: result.lhr.fetchTime,
      failedAudits: Object.values(result.lhr.audits)
        .filter((a) => a.score === 0)
        .map((a) => ({ id: a.id, title: a.title, description: a.description })),
    });
  }
  writeFileSync(`${output}/summary.json`, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await chrome?.kill();
  staticServer?.close();
  for (const id of fixtures)
    await fetch(base + "/api/activities/" + id, { method: "DELETE" });
}
