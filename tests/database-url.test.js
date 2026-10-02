import { expect, test } from "vitest";
import { sqliteRuntimeUrl } from "../lib/database-url.js";
test("SQLite serializes connections and keeps existing URL options", () => {
  expect(sqliteRuntimeUrl("file:./dev.db")).toBe(
    "file:./dev.db?connection_limit=1",
  );
  expect(
    sqliteRuntimeUrl("file:/data/a.db?socket_timeout=10&connection_limit=20"),
  ).toBe("file:/data/a.db?socket_timeout=10&connection_limit=1");
  expect(sqliteRuntimeUrl("postgres://example")).toBe("postgres://example");
});
