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
          Phoneme Activity Builder is a frontend tool designed for teachers
          preparing classroom activities for Speech Pathology students.
        </p>

        <p>
          Assessment 1 focuses on frontend design, usability, accessibility,
          responsive design and standalone HTML generation.
        </p>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <h3>
            Phoneme Wordle
          </h3>

          <p>
            Create a Wordle-style activity where each cell represents one
            phoneme rather than one standard spelling letter.
          </p>
        </article>

        <article className="info-card">
          <h3>
            Phoneme Word Search
          </h3>

          <p>
            Generate an interactive puzzle using phoneme-based words for
            classroom practice.
          </p>
        </article>

        <article className="info-card">
          <h3>
            Assessment Scope
          </h3>

          <p>
            Database-driven word lists are not included in Assessment 1.
            These features can be introduced in later project stages.
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
            <strong>Subject:</strong> CSE3MAD
          </p>

          <p>
            <strong>Assessment:</strong> Assessment 1 — Frontend Design and Usability
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
            The final walkthrough video will demonstrate the activity builders,
            responsive design, accessibility features and standalone HTML
            generation.
          </p>
        </div>

        <div className="video-placeholder">
          <div>
            <span aria-hidden="true">
              ▶
            </span>

            <p>
              Assessment walkthrough video
            </p>

            <small>
              Final 6–8 minute video will be added before submission.
            </small>
          </div>
        </div>
      </section>

      <section className="references-section">
        <div className="section-heading">
          <p className="eyebrow">
            References
          </p>

          <h2>
            Design and development sources
          </h2>
        </div>

        <div className="references-card">
          <p>
            A minimum of five academic or industry references will be included
            in APA 7th edition style before final submission.
          </p>
        </div>
      </section>
    </div>
  );
}