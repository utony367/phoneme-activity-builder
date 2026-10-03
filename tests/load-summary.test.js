import { test, expect } from "vitest";
import { summarize } from "../testing/jmeter/summarize.mjs";
test("summary derives finite counts, failures and p95 only from actual samples", () => {
  const r = summarize(
    "timeStamp,elapsed,label,success\n1000,20,Create,true\n1020,80,Delete activity,false",
    1,
    1,
  );
  expect(r.samples).toBe(2);
  expect(r.errors).toBe(1);
  expect(r.p95Ms).toBe(80);
  expect(r.complete).toBe(false);
});
