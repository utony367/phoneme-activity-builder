import WordleBuilder from "../../components/WordleBuilder";

export default function WordlePage() {
  return (
    <div className="standard-page">
      <section className="page-intro">
        <p className="eyebrow">
          Activity Builder
        </p>

        <h2>Phoneme Wordle</h2>

        <p>
          Create a Wordle-style classroom activity where each cell represents
          one HCE phoneme.
        </p>
      </section>

      <WordleBuilder />
    </div>
  );
}