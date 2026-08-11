import Link from "next/link";

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero-section">
        <p className="eyebrow">Speech Pathology Teaching Tool</p>

        <h2>Create phoneme activities with confidence.</h2>

        <p className="hero-description">
          Phoneme Activity Builder helps teachers create clear,
          browser-based classroom activities for Speech Pathology students.
          Build and preview phoneme Wordle and Word Search activities.
        </p>

        <div className="hero-actions">
          <Link href="/wordle" className="primary-button">
            Create Wordle
          </Link>

          <Link href="/word-search" className="secondary-button">
            Create Word Search
          </Link>
        </div>
      </section>

      <section className="activity-section">
        <div className="section-heading">
          <p className="eyebrow">Choose an activity</p>
          <h2>Build a classroom activity</h2>
        </div>

        <div className="activity-grid">
          <article className="activity-card">
            <div className="card-icon">W</div>

            <h3>Phoneme Wordle</h3>

            <p>
              Create a Wordle-style guessing activity where each grid cell
              represents one phoneme.
            </p>

            <ul>
              <li>Phoneme-based answers</li>
              <li>Accessible phoneme hints</li>
              <li>Difficulty settings</li>
            </ul>

            <Link href="/wordle" className="card-link">
              Start Wordle Builder →
            </Link>
          </article>

          <article className="activity-card">
            <div className="card-icon">WS</div>

            <h3>Phoneme Word Search</h3>

            <p>
              Generate an interactive word search using phoneme-based classroom
              content.
            </p>

            <ul>
              <li>Phoneme puzzle grid</li>
              <li>Small word list</li>
              <li>Interactive discovery</li>
            </ul>

            <Link href="/word-search" className="card-link">
              Start Word Search Builder →
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}