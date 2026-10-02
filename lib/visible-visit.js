export function createVisibleVisit(path, { now, isVisible, newKey, send }) {
  const visitKey = newKey();
  let elapsed = 0,
    since = null;
  function flush() {
    const current = now();
    if (since !== null) elapsed += current - since;
    since = isVisible() ? current : null;
    if (elapsed >= 1)
      send({
        visitKey,
        path,
        visibleDurationMs: Math.min(1800000, Math.round(elapsed)),
      });
  }
  return {
    resume() {
      since = isVisible() ? now() : null;
    },
    flush,
    pause() {
      flush();
      since = null;
    },
  };
}
