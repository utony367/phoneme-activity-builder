-- CreateTable
CREATE TABLE "OperationEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventKey" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "activityId" INTEGER,
    "activityTitle" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'LIVE',
    "errorCategory" TEXT,
    "errorMessage" TEXT,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OperationEvent_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PageVisit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "visitKey" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "visibleDurationMs" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'LIVE',
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Additive migration preserves existing activities and words.
ALTER TABLE "Activity" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'LIVE';

-- CreateIndex
CREATE UNIQUE INDEX "OperationEvent_eventKey_key" ON "OperationEvent"("eventKey");

-- CreateIndex
CREATE INDEX "OperationEvent_source_occurredAt_idx" ON "OperationEvent"("source", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "PageVisit_visitKey_key" ON "PageVisit"("visitKey");

-- CreateIndex
CREATE INDEX "PageVisit_source_occurredAt_idx" ON "PageVisit"("source", "occurredAt");

