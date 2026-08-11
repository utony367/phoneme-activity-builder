export default function AboutPage() {
  return (
    <div className="standard-page">
      <section className="page-intro">
        <p className="eyebrow">
          About the project
        </p>

        <h2>
          Supporting phoneme-based classroom activities
        </h2>

        <p>
          Phoneme Activity Builder is a frontend web application designed for
          teachers preparing phoneme-based classroom activities for Speech
          Pathology students.
        </p>

        <p>
          The application allows teachers to build, preview and generate two
          different activities: Phoneme Wordle and Phoneme Word Search.
        </p>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <h3>
            Assessment 1 Scope
          </h3>

          <p>
            Assessment 1 focuses on frontend design, usability, accessibility,
            responsive design and standalone HTML generation.
          </p>

          <p>
            Database-driven word lists and more advanced content management are
            not included at this stage and can be introduced in later
            assessments.
          </p>
        </article>

        <article className="info-card">
          <h3>
            Phoneme Wordle
          </h3>

          <p>
            The Wordle builder creates a Wordle-style classroom activity where
            each game cell represents one phoneme rather than one English
            spelling letter.
          </p>

          <p>
            Teachers can choose the difficulty, use phoneme hints, preview the
            activity and download a standalone playable HTML file.
          </p>
        </article>

        <article className="info-card">
          <h3>
            Phoneme Word Search
          </h3>

          <p>
            The Word Search builder generates an interactive phoneme-based
            puzzle using a small fixed classroom word list.
          </p>

          <p>
            The activity includes difficulty settings, answer display,
            interactive word selection and standalone HTML generation.
          </p>
        </article>
      </section>

      <section className="student-section">
        <div>
          <p className="eyebrow">
            Student information
          </p>

          <h2>
            Assessment details
          </h2>
        </div>

        <div className="student-card">
          <p>
            <strong>Name:</strong> Tony U
          </p>

          <p>
            <strong>Student ID:</strong> XXXXXXXX
          </p>

          <p>
            <strong>Subject:</strong> CSE3CWA
          </p>

          <p>
            <strong>Assessment:</strong> Assessment 1 — Frontend Design and
            Usability
          </p>
        </div>
      </section>

      <section className="video-section">
        <div className="section-heading">
          <p className="eyebrow">
            Website demonstration
          </p>

          <h2>
            How to use the builder
          </h2>

          <p>
            This video demonstrates the main application workflow, responsive
            interface, accessibility features, standalone HTML generation and
            project structure.
          </p>
        </div>

        <div className="video-wrapper">
          <video
            controls
            preload="metadata"
            className="assessment-video"
          >
            <source
              src="/assessment-demo.mp4"
              type="video/mp4"
            />

            Your browser does not support the video element.
          </video>
        </div>

        <p className="video-note">
          Add the final 6–8 minute assessment video to the public folder using
          the filename assessment-demo.mp4.
        </p>
      </section>

      <section className="references-section">
        <div className="section-heading">
          <p className="eyebrow">
            References
          </p>

          <h2>
            Design and development sources
          </h2>

          <p>
            These sources informed the component architecture, frontend
            implementation, accessibility and usability decisions used in this
            project.
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
              Nielsen Norman Group. (n.d.).{" "}
              <em>10 usability heuristics for user interface design</em>.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}