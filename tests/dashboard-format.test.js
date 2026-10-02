import { expect, test } from "vitest";
import {
  rateLabel,
  durationLabel,
  mostUsedLabel,
} from "../lib/dashboard-format.js";
test("empty values and tied activity types are explicit", () => {
  expect(rateLabel(null)).toBe("No data");
  expect(durationLabel(null)).toBe("No data");
  expect(mostUsedLabel(["WORDLE", "WORD_SEARCH"])).toContain("(tie)");
  expect(rateLabel(0)).toBe("0%");
});
