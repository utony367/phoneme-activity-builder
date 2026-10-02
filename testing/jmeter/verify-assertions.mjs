import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const directory = await mkdtemp(join(tmpdir(), "jmeter-negative-"));
const server = createServer((request, response) => {
  request.resume();
  response.setHeader(
    "Content-Type",
    request.url.includes("generate") ? "text/html" : "application/json",
  );
  response.end(
    request.url.includes("generate")
      ? "<p>Wrong output</p>"
      : JSON.stringify({ id: 1, activity: { id: 1 }, word: { id: 1 } }),
  );
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
try {
  const result = join(directory, "result.jtl");
  const child = spawn(
    process.env.JMETER_BIN || "jmeter",
    [
      "-n",
      "-t",
      "testing/jmeter/workflow.jmx",
      "-Jthreads=1",
      "-Jloops=1",
      "-Jramp=1",
      `-Jport=${server.address().port}`,
      "-l",
      result,
      "-j",
      join(directory, "jmeter.log"),
    ],
    { stdio: "ignore" },
  );
  const code = await new Promise((resolve) => child.on("exit", resolve));
  if (code !== 0) throw new Error(`JMeter exited ${code}`);
  const rows = (await readFile(result, "utf8")).trim().split("\n");
  const columns = rows.shift().split(",");
  const label = columns.indexOf("label"),
    success = columns.indexOf("success");
  const generation = rows
    .map((row) =>
      row
        .match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g)
        .map((value) => value.replace(/,$/, "").replace(/^"|"$/g, "")),
    )
    .filter((row) => row[label].startsWith("Generate"));
  if (
    generation.length !== 2 ||
    generation.some((row) => row[success] !== "false")
  )
    throw new Error(
      "Both HTTP 200 wrong generation outputs must fail content assertions",
    );
  console.log(
    "Verified: both HTTP 200 malformed generation outputs are rejected.",
  );
} finally {
  await new Promise((resolve) => server.close(resolve));
  await rm(directory, { recursive: true, force: true });
}
