import { test, expect } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
test("telemetry migration preserves Assessment 2 words, Unicode phonemes and configuration", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec(
      readFileSync("prisma/migrations/202609140001_init/migration.sql", "utf8"),
    );
    db.exec(
      `INSERT INTO Activity (id,title,activityType,difficulty,updatedAt) VALUES (1,'Existing','WORDLE','EASY',CURRENT_TIMESTAMP); INSERT INTO Word (text,phonemes,activityId,updatedAt) VALUES ('chair','/tʃ eə/',1,CURRENT_TIMESTAMP);`,
    );
    db.exec(
      readFileSync(
        "prisma/migrations/202610020001_telemetry/migration.sql",
        "utf8",
      ),
    );
    const row = db
      .prepare(
        "SELECT Activity.source,Word.phonemes FROM Activity JOIN Word ON Word.activityId=Activity.id",
      )
      .get();
    expect(row.source).toBe("LIVE");
    expect(row.phonemes).toBe("/tʃ eə/");
  } finally {
    db.close();
  }
});
