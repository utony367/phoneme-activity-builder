export default function AboutPage() {
  return (
    <div className="standard-page">
      {/* Page Introduction */}
      <section className="page-intro">
        <p className="eyebrow">About the project</p>

        <h2>Phoneme Activity Builder</h2>

        <p>
          Phoneme Activity Builder is a frontend web application designed for
          teachers preparing phoneme-based classroom activities for Speech
          Pathology students.
        </p>

        <p>
          The application allows teachers to create, preview and generate two
          classroom activities: Phoneme Wordle and Phoneme Word Search.
        </p>
      </section>

      {/* Project Information */}
      <section className="info-grid">
        <article className="info-card">
          <h3>Assessment 1 Scope</h3>

          <p>
            This CWA Assessment 1 project focuses on frontend design and
            usability. The application demonstrates responsive design,
            accessibility, reusable React components and standalone HTML
            generation.
          </p>

          <p>
            Assessment 1 is frontend only. Database-driven word lists and more
            advanced content management are not included at this stage and can
            be introduced in later assessments.
          </p>
        </article>

        <article className="info-card">
          <h3>Phoneme Wordle</h3>

          <p>
            Phoneme Wordle is a Wordle-style classroom activity where each game
            cell represents one phoneme rather than one standard spelling
            letter.
          </p>

          <p>
            Teachers can select a difficulty level, use phoneme hints, preview
            the activity and generate a standalone playable HTML file.
          </p>
        </article>

        <article className="info-card">
          <h3>Phoneme Word Search</h3>

          <p>
            Phoneme Word Search creates an interactive puzzle using a small
            fixed list of phoneme-based words.
          </p>

          <p>
            Teachers can select the difficulty, generate a puzzle, reveal
            answers and download the activity as a standalone HTML file.
          </p>
        </article>
      </section>

      {/* Student Information */}
      <section className="student-section">
        <div>
          <p className="eyebrow">Student information</p>

          <h2>Assessment details</h2>
        </div>

        <div className="student-card">
          <p>
            <strong>Name:</strong> Tony U
          </p>

          <p>
            <strong>Student ID:</strong> 21822338
          </p>

          <p>
            <strong>Subject:</strong> CWA
          </p>

          <p>
            <strong>Assessment:</strong> Assessment 1 — Frontend Design and
            Usability
          </p>
        </div>
      </section>

      {/* Assessment Video */}
      <section className="video-section">
        <div className="section-heading">
          <p className="eyebrow">Website demonstration</p>

          <h2>How to use the builder</h2>

          <p>
            This demonstration explains how to use the Phoneme Activity
            Builder and shows the main frontend features, including Wordle,
            Word Search, responsive design, accessibility considerations,
            standalone HTML generation and project structure.
          </p>
        </div>

        <div className="video-wrapper">
          <video
            className="assessment-video"
            controls
            preload="metadata"
          >
            <source
              src="/assessment-demo.mp4"
              type="video/mp4"
            />

            Your browser does not support the video element.
          </video>
        </div>
      </section>

      {/* References */}
      <section className="references-section">
        <div className="section-heading">
          <p className="eyebrow">References</p>

          <h2>Design and development sources</h2>

          <p>
            The following academic and industry resources informed the
            frontend development, usability and accessibility decisions used
            in this project.
          </p>
        </div>

        <div className="references-card">
          <ol className="reference-list">
            <li>
              Meta Platforms, Inc. (n.d.). <em>React documentation</em>.
              React.
            </li>

            <li>
              Vercel. (n.d.). <em>Next.js documentation</em>. Next.js.
            </li>

            <li>
              World Wide Web Consortium. (2023).{" "}
              <em>Web Content Accessibility Guidelines (WCAG) 2.2</em>.
            </li>

            <li>
              MDN Web Docs. (n.d.). <em>Accessibility</em>. Mozilla.
            </li>

            <li>
              Nielsen Norman Group. (2024).{" "}
              <em>10 usability heuristics for user interface design</em>.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}