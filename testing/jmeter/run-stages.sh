#!/usr/bin/env bash
set -euo pipefail
JMETER_BIN=${JMETER_BIN:-jmeter}
OUTPUT=${OUTPUT:-evidence/jmeter}
mkdir -p "$OUTPUT"
for users in ${STAGES:-1 10 100 1000 10000}; do
  threads=$((users < 10 ? users : 10))
  loops=$((users / threads))
  ramp=$((threads))
  echo "Stage: $users total users; peak $threads concurrent; $loops loops/thread; 9 requests/user"
  "$JMETER_BIN" -n -t testing/jmeter/workflow.jmx -Jthreads="$threads" -Jloops="$loops" -Jramp="$ramp" -Jhost="${HOST:-127.0.0.1}" -Jport="${PORT:-3000}" -l "$OUTPUT/$users.jtl" -j "$OUTPUT/$users.log" -e -o "$OUTPUT/$users-report"
  node testing/jmeter/summarize.mjs "$OUTPUT/$users.jtl" "$users" "$threads" > "$OUTPUT/$users-summary.json"
done
