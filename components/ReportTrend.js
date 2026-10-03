export default function ReportTrend({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.successes + r.failures));
  return (
    <section className="saved-panel" aria-labelledby="trend-title">
      <h2 id="trend-title">Generation trend</h2>
      <p>UTC daily totals. All-time charts show the most recent 90 days.</p>
      <div className="trend-bars" aria-hidden="true">
        {rows.map((r) => (
          <div
            key={r.date}
            title={`${r.date}: ${r.successes} successful, ${r.failures} failed`}
          >
            <span
              style={{ height: `${((r.successes + r.failures) / max) * 100}%` }}
            />
            <small>{r.date.slice(5)}</small>
          </div>
        ))}
      </div>
      <details>
        <summary>View trend data table</summary>
        <div className="table-scroll">
          <table>
            <caption>Daily operations (UTC)</caption>
            <thead>
              <tr>
                <th>Date</th>
                <th>Created</th>
                <th>Successful</th>
                <th>Failed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.date}>
                  <th scope="row">{r.date}</th>
                  <td>{r.created}</td>
                  <td>{r.successes}</td>
                  <td>{r.failures}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
