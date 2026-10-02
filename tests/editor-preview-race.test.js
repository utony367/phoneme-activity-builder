import { test, expect } from "vitest";
import { readFileSync } from "node:fs";
function harness(requestJson, fetchActivityHtml, initialPreview = "") {
  const source = readFileSync("components/ActivityEditor.js", "utf8");
  const start = source.indexOf("export default function ActivityEditor");
  const end = source.indexOf("  if (loading)", start);
  const body =
    source.slice(start, end).replace("export default ", "") +
    "\n return {loadActivity,preview};\n}";
  const state = [
    { words: [{ text: "chair" }] },
    {},
    false,
    false,
    false,
    initialPreview,
    null,
  ];
  let index = 0;
  const ref = { current: 0 };
  const useState = () => {
    const key = index++;
    return [
      state[key],
      (value) => {
        state[key] = typeof value === "function" ? value(state[key]) : value;
      },
    ];
  };
  const callbacks = Function(
    "useState",
    "useRef",
    "useEffect",
    "requestJson",
    "fetchActivityHtml",
    "downloadActivity",
    body + "\nreturn ActivityEditor({activityId:1});",
  )(
    useState,
    () => ref,
    () => {},
    requestJson,
    fetchActivityHtml,
    () => {},
  );
  return { state, ...callbacks };
}
test("word reload invalidates an older pending generation response", async () => {
  let release;
  const pending = new Promise((r) => {
    release = r;
  });
  const h = harness(
    async () => ({ words: [{ text: "fish" }] }),
    () => pending,
  );
  const old = h.preview();
  await h.loadActivity();
  release("OLD chair HTML");
  await old;
  expect(h.state[5]).toBe("");
});
test("a failed reload still clears HTML from before the saved word mutation", async () => {
  const h = harness(
    async () => {
      throw new Error("reload unavailable");
    },
    async () => "",
    "OLD chair HTML",
  );
  await h.loadActivity();
  expect(h.state[5]).toBe("");
  expect(h.state[6].message).toContain("reload unavailable");
});
