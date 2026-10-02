"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { requestJson } from "../lib/client-api";
import {
  typeLabel,
  rateLabel,
  durationLabel,
  mostUsedLabel,
} from "../lib/dashboard-format";
import ReportTrend from "./ReportTrend";
export default function OperationalDashboard() {
  const [range, setRange] = useState("7d"),
    [source, setSource] = useState("live"),
    [revision, setRevision] = useState(0);
  const [report, setReport] = useState(null),
    [health, setHealth] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const beginLoad = () => {
    setLoading(true);
    setError("");
    setHealth(null);
  };
  useEffect(() => {
    let active = true;
    const filters = new URLSearchParams({ range, source });
    Promise.all([
      requestJson("/api/reports?" + filters),
      Promise.allSettled([requestJson("/health"), requestJson("/api/status")]),
    ])
      .then(([data, status]) => {
        if (!active) return;
        setReport(data);
        setHealth({
          live:
            status[0].status === "fulfilled" && status[0].value.status === "ok",
          ready:
            status[1].status === "fulfilled" &&
            status[1].value.status === "ready",
        });
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setReport(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [range, source, revision]);
  const cards = report
    ? [
        ["Saved activities", report.inventory.total],
        ["Words stored", report.inventory.words],
        ["Activities created in period", report.operations.created],
        ["Successful generations", report.operations.successes],
        ["Failed generations", report.operations.failures],
        ["Generation success rate", rateLabel(report.operations.successRate)],
        ["Average visible time", durationLabel(report.visits.averageVisibleMs)],
        ["Most-used activity type", mostUsedLabel(report.mostUsedType.types)],
      ]
    : [];
  return (
    <div className="standard-page operations-page">
      <p className="eyebrow">Teacher reporting</p>
      <h1>Activity dashboard</h1>
      <p>
        Review saved classroom content, generation history and service status.
      </p>
      <div className="report-controls">
        <label>
          Period (UTC)
          <select
            value={range}
            onChange={(e) => {
              beginLoad();
              setRange(e.target.value);
            }}
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </label>
        <label>
          Data source
          <select
            value={source}
            onChange={(e) => {
              beginLoad();
              setSource(e.target.value);
            }}
          >
            <option value="live">Live use</option>
            <option value="simulated">Simulated demonstration</option>
            <option value="all">Live and simulated</option>
          </select>
        </label>
        <button
          type="button"
          className="secondary-action"
          onClick={() => {
            beginLoad();
            setRevision((v) => v + 1);
          }}
        >
          Refresh report
        </button>
        <a
          className="primary-action"
          href={"/api/reports/export?" + new URLSearchParams({ range, source })}
        >
          Export CSV
        </a>
      </div>
      {source !== "live" && (
        <p className="source-notice">
          This view includes simulated demonstration records. These are not
          measured classroom usage.
        </p>
      )}
      {loading && <p role="status">Loading report…</p>}
      {error && <p role="alert">Report unavailable: {error}</p>}
      {report && !loading && (
        <>
          <p className="report-meta">
            Checked {new Date(report.generatedAt).toLocaleString()} · All period
            boundaries use UTC. Saved inventory is current; it is not filtered
            by date. Visible time covers {report.visits.count} recorded visits,
            capped at 30 minutes each.
          </p>
          <div className="metric-grid">
            {cards.map(([label, value]) => (
              <article className="metric-card" key={label}>
                <h2>{label}</h2>
                <p>{value}</p>
              </article>
            ))}
          </div>
          <section className="saved-panel">
            <h2>Service health</h2>
            <p>
              Liveness:{" "}
              <strong>{health?.live ? "Healthy" : "Unavailable"}</strong> ·
              Database readiness:{" "}
              <strong>{health?.ready ? "Ready" : "Unavailable"}</strong>
            </p>
            <p>
              Generation counters measure export and preview requests, not
              student gameplay.
            </p>
          </section>
          <section className="saved-panel">
            <h2>Alerts</h2>
            {report.alerts.length ? (
              report.alerts.map((a, i) => (
                <p key={i}>
                  {a.message}{" "}
                  {a.activityIds.map((id) => (
                    <Link key={id} href={"/activities/" + id}>
                      Open activity #{id}{" "}
                    </Link>
                  ))}
                </p>
              ))
            ) : (
              <p>No alerts for this selection.</p>
            )}
          </section>
          <section className="saved-panel">
            <h2>Activity type comparison</h2>
            <table>
              <caption>Generation attempts by type</caption>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Attempts</th>
                  <th>Successful</th>
                </tr>
              </thead>
              <tbody>
                {report.operations.byType.map((t) => (
                  <tr key={t.type}>
                    <th scope="row">{typeLabel(t.type)}</th>
                    <td>{t.attempts}</td>
                    <td>{t.successes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <ReportTrend rows={report.trends} />
          <section className="saved-panel">
            <h2>Saved activity inventory</h2>
            {report.inventory.activities.length ? (
              <ul>
                {report.inventory.activities.map((a) => (
                  <li key={a.id}>
                    <Link href={"/activities/" + a.id}>{a.title}</Link> —{" "}
                    {typeLabel(a.type)}, {a.wordCount} words,{" "}
                    {a.difficulty.toLowerCase()}, {a.source.toLowerCase()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No saved activities in this source.</p>
            )}
            <Link href="/activities">Manage saved activities</Link>
          </section>
          <section className="saved-panel">
            <h2>Recent operations</h2>
            <p>
              Most recent 20 events in this selection. History remains after
              activity deletion.
            </p>
            {report.recentEvents.length ? (
              <div className="table-scroll">
                <table>
                  <caption>Recent activity operations</caption>
                  <thead>
                    <tr>
                      <th>Time (UTC)</th>
                      <th>Activity</th>
                      <th>Type</th>
                      <th>Event</th>
                      <th>Outcome</th>
                      <th>Source</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.recentEvents.map((e) => (
                      <tr key={e.id}>
                        <td>{e.occurredAt}</td>
                        <td>{e.title}</td>
                        <td>{typeLabel(e.type)}</td>
                        <td>
                          {e.event === "GENERATION" ? "Generation" : "Created"}
                        </td>
                        <td>{e.outcome}</td>
                        <td>{e.source}</td>
                        <td>{e.error || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No operations recorded in this period.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
