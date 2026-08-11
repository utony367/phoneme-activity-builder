import WordSearchBuilder from "../../components/WordSearchBuilder";

export default function WordSearchPage() {
  return (
    <div className="standard-page">
      <section className="page-intro">
        <p className="eyebrow">
          Activity Builder
        </p>

        <h2>
          Phoneme Word Search
        </h2>

        <p>
          Generate an interactive phoneme-based
          word search using a small classroom
          word list.
        </p>
      </section>

      <WordSearchBuilder />
    </div>
  );
}