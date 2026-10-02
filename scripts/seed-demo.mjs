import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
try {
  await db.$transaction(async (tx) => {
    const definitions = [
      ["Wordle practice", "WORDLE", ["chair", "cheer"]],
      ["Word Search practice", "WORD_SEARCH", ["ship", "fish"]],
      ["Empty list warning", "WORDLE", []],
    ];
    const activities = [];
    for (let i = 0; i < definitions.length; i++) {
      const [title, activityType, words] = definitions[i];
      const key = `demo-created-${i}`;
      const previous = await tx.operationEvent.findUnique({
        where: { eventKey: key },
      });
      if (previous) {
        activities.push(previous);
        continue;
      }
      const activity = await tx.activity.create({
        data: {
          title: `[Demo] ${title}`,
          activityType,
          difficulty: "EASY",
          source: "SIMULATED",
          words: {
            create: words.map((text) => ({
              text,
              phonemes: text === "chair" ? "/tʃ eə/" : "/ʃ/",
            })),
          },
        },
      });
      activities.push(
        await tx.operationEvent.create({
          data: {
            eventKey: key,
            eventType: "ACTIVITY_CREATED",
            outcome: "SUCCESS",
            activityId: activity.id,
            activityTitle: activity.title,
            activityType,
            source: "SIMULATED",
          },
        }),
      );
    }
    for (let i = 0; i < 4; i++) {
      const activity = activities[i === 3 ? 2 : i % 2];
      await tx.operationEvent.upsert({
        where: { eventKey: `demo-generation-${i}` },
        update: {},
        create: {
          eventKey: `demo-generation-${i}`,
          eventType: "GENERATION",
          outcome: i === 3 ? "FAILURE" : "SUCCESS",
          activityId: activity.activityId,
          activityTitle: activity.activityTitle,
          activityType: activity.activityType,
          source: "SIMULATED",
          durationMs: 20 + i * 8,
          ...(i === 3
            ? {
                errorCategory: "INVALID_ACTIVITY",
                errorMessage: "Add words before generating an activity.",
              }
            : {}),
        },
      });
    }
    for (let i = 0; i < 3; i++)
      await tx.pageVisit.upsert({
        where: { visitKey: `demo-visit-${i}` },
        update: {},
        create: {
          visitKey: `demo-visit-${i}`,
          path: i === 0 ? "/dashboard" : "/activities",
          visibleDurationMs: 30000 + i * 15000,
          source: "SIMULATED",
        },
      });
  });
  console.log(
    "Demo fixtures ready: 3 activities, 7 events, 3 visits. Re-running does not add records.",
  );
} finally {
  await db.$disconnect();
}
