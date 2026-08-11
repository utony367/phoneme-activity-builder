export function generateWordSearchHTML({
  puzzle,
  words,
  difficulty,
}) {
  const safePuzzle = JSON.stringify(puzzle);
  const safeWords = JSON.stringify(words);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>Phoneme Word Search</title>

  <style>
    :root {
      --background: #f4f7f9;
      --surface: #ffffff;
      --primary: #245a73;
      --text: #17242d;
      --soft: #60717c;
      --border: #d7e1e6;

      --selected: #fff1c7;
      --selected-border: #c88a17;

      --found: #dff3e4;
      --found-border: #3f9457;

      --answer: #f7d8ea;
      --answer-border: #d985b4;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 20px;

      background: var(--background);
      color: var(--text);

      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }

    .game {
      width: min(900px, 100%);
      margin: 0 auto;
    }

    .card {
      padding: 24px;

      background: var(--surface);

      border: 1px solid var(--border);
      border-radius: 18px;
    }

    h1 {
      margin-top: 0;
      color: var(--primary);
    }

    .intro {
      color: var(--soft);
    }

    .grid {
      display: grid;
      gap: 3px;

      width: 100%;
      max-width: 650px;

      margin: 25px auto;

      touch-action: none;
    }

    .cell {
      aspect-ratio: 1;

      display: flex;
      align-items: center;
      justify-content: center;

      min-width: 0;

      padding: 0;

      background: #f8fafc;
      color: var(--text);

      border: 1px solid var(--border);
      border-radius: 5px;

      font-size: clamp(
        0.72rem,
        1.5vw,
        1.05rem
      );

      font-weight: 800;

      cursor: pointer;
      user-select: none;
    }

    .cell.selected {
      background: var(--selected);
      border-color: var(--selected-border);
    }

    .cell.found {
      background: var(--found);
      border-color: var(--found-border);
    }

    .cell.answer {
      background: var(--answer);
      border-color: var(--answer-border);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;

      gap: 10px;

      margin: 20px 0;
    }

    button {
      padding: 11px 16px;

      border: 0;
      border-radius: 8px;

      background: var(--primary);
      color: white;

      font-weight: 800;

      cursor: pointer;
    }

    button.secondary {
      background: #667784;
    }

    button:focus-visible {
      outline: 3px solid #f59e0b;
      outline-offset: 3px;
    }

    .feedback {
      margin-top: 18px;
      padding: 14px;

      background: #eef4f7;

      border-radius: 10px;
    }

    .word-list {
      display: flex;
      flex-wrap: wrap;

      gap: 10px;

      margin-top: 20px;
    }

    .word-item {
      padding: 8px 12px;

      background: #eef4f7;

      border-radius: 8px;
    }

    .word-item.found {
      background: var(--found);

      text-decoration: line-through;
    }

    @media (max-width: 600px) {
      body {
        padding: 10px;
      }

      .card {
        padding: 15px;
      }

      .grid {
        gap: 2px;
      }
    }
  </style>
</head>

<body>
  <main class="game">
    <section class="card">
      <h1>
        Phoneme Word Search
      </h1>

      <p class="intro">
        Find all phoneme words in the grid.
        Difficulty: ${difficulty}.
      </p>

      <div
        id="grid"
        class="grid"
        aria-label="Phoneme word search grid"
      ></div>

      <div class="actions">
        <button
          id="answerButton"
          type="button"
        >
          Show Answers
        </button>

        <button
          id="resetButton"
          type="button"
          class="secondary"
        >
          Reset
        </button>
      </div>

      <div
        id="feedback"
        class="feedback"
        aria-live="polite"
      >
        Drag from the first phoneme to the last phoneme.
      </div>

      <h2>
        Words to find
      </h2>

      <div
        id="wordList"
        class="word-list"
      ></div>
    </section>
  </main>

  <script>
    const puzzle = ${safePuzzle};
    const words = ${safeWords};

    let selecting = false;
    let startCell = null;

    let selectedCells = [];
    let foundWords = [];
    let foundCells = [];

    let showAnswers = false;

    const grid =
      document.getElementById("grid");

    const feedback =
      document.getElementById("feedback");

    const wordList =
      document.getElementById("wordList");

    function getPath(start, end) {
      const dr =
        end.row - start.row;

      const dc =
        end.col - start.col;

      const valid =
        dr === 0 ||
        dc === 0 ||
        Math.abs(dr) ===
          Math.abs(dc);

      if (!valid) {
        return [];
      }

      const steps =
        Math.max(
          Math.abs(dr),
          Math.abs(dc)
        );

      const stepRow =
        dr === 0
          ? 0
          : dr / steps;

      const stepCol =
        dc === 0
          ? 0
          : dc / steps;

      const path = [];

      for (
        let i = 0;
        i <= steps;
        i++
      ) {
        path.push({
          row:
            start.row +
            stepRow * i,

          col:
            start.col +
            stepCol * i,
        });
      }

      return path;
    }

    function isSameCell(a, b) {
      return (
        a.row === b.row &&
        a.col === b.col
      );
    }

    function renderGrid() {
      grid.innerHTML = "";

      grid.style.gridTemplateColumns =
        "repeat(" +
        puzzle.cols +
        ", 1fr)";

      puzzle.grid.forEach(
        (row, rowIndex) => {
          row.forEach(
            (phoneme, colIndex) => {
              const button =
                document.createElement(
                  "button"
                );

              button.type =
                "button";

              button.className =
                "cell";

              button.textContent =
                phoneme;

              button.dataset.row =
                rowIndex;

              button.dataset.col =
                colIndex;

              button.setAttribute(
                "aria-label",
                "Phoneme " +
                  phoneme
              );

              const current = {
                row: rowIndex,
                col: colIndex,
              };

              if (
                selectedCells.some(
                  (cell) =>
                    isSameCell(
                      cell,
                      current
                    )
                )
              ) {
                button.classList.add(
                  "selected"
                );
              }

              if (
                foundCells.some(
                  (cell) =>
                    isSameCell(
                      cell,
                      current
                    )
                )
              ) {
                button.classList.add(
                  "found"
                );
              }

              if (
                showAnswers &&
                puzzle.solutions.some(
                  (solution) =>
                    solution.coordinates.some(
                      (cell) =>
                        isSameCell(
                          cell,
                          current
                        )
                    )
                )
              ) {
                button.classList.add(
                  "answer"
                );
              }

              button.addEventListener(
                "pointerdown",
                () => {
                  selecting = true;

                  startCell = {
                    row: rowIndex,
                    col: colIndex,
                  };

                  selectedCells = [
                    startCell,
                  ];

                  renderGrid();
                }
              );

              button.addEventListener(
                "pointerenter",
                () => {
                  if (
                    !selecting ||
                    !startCell
                  ) {
                    return;
                  }

                  const path =
                    getPath(
                      startCell,
                      {
                        row:
                          rowIndex,
                        col:
                          colIndex,
                      }
                    );

                  if (
                    path.length > 0
                  ) {
                    selectedCells =
                      path;

                    renderGrid();
                  }
                }
              );

              button.addEventListener(
                "pointerup",
                finishSelection
              );

              grid.appendChild(
                button
              );
            }
          );
        }
      );
    }

    function finishSelection() {
      if (!selecting) {
        return;
      }

      selecting = false;

      if (
        selectedCells.length === 0
      ) {
        return;
      }

      const selected =
        selectedCells
          .map(
            (position) =>
              puzzle.grid[
                position.row
              ][position.col]
          )
          .join("");

      const reversed =
        [...selected]
          .reverse()
          .join("");

      const match =
        words.find(
          (word) => {
            const wordString =
              word.phonemes.join("");

            return (
              wordString ===
                selected ||
              wordString ===
                reversed
            );
          }
        );

      if (!match) {
        feedback.textContent =
          "That selection is not one of the target phoneme words.";

        selectedCells = [];

        renderGrid();

        return;
      }

      if (
        foundWords.includes(
          match.english
        )
      ) {
        feedback.textContent =
          match.english +
          " has already been found.";

        selectedCells = [];

        renderGrid();

        return;
      }

      const solution =
        puzzle.solutions.find(
          (item) =>
            item.english ===
            match.english
        );

      foundWords.push(
        match.english
      );

      if (solution) {
        foundCells = [
          ...foundCells,
          ...solution.coordinates,
        ];
      }

      feedback.innerHTML =
        "<strong>Found ✓</strong> /" +
        match.phonemes.join(" ") +
        "/ — " +
        match.english;

      selectedCells = [];

      renderWordList();
      renderGrid();

      if (
        foundWords.length ===
        words.length
      ) {
        feedback.innerHTML =
          "<strong>Complete ✓</strong> All phoneme words found.";
      }
    }

    function renderWordList() {
      wordList.innerHTML = "";

      words.forEach(
        (word) => {
          const item =
            document.createElement(
              "div"
            );

          item.className =
            "word-item";

          if (
            foundWords.includes(
              word.english
            )
          ) {
            item.classList.add(
              "found"
            );
          }

          item.textContent =
            "/" +
            word.phonemes.join(" ") +
            "/";

          wordList.appendChild(
            item
          );
        }
      );
    }

    document
      .getElementById(
        "answerButton"
      )
      .addEventListener(
        "click",
        () => {
          showAnswers =
            !showAnswers;

          document.getElementById(
            "answerButton"
          ).textContent =
            showAnswers
              ? "Hide Answers"
              : "Show Answers";

          renderGrid();
        }
      );

    document
      .getElementById(
        "resetButton"
      )
      .addEventListener(
        "click",
        () => {
          selecting = false;
          startCell = null;

          selectedCells = [];
          foundWords = [];
          foundCells = [];

          showAnswers = false;

          document.getElementById(
            "answerButton"
          ).textContent =
            "Show Answers";

          feedback.textContent =
            "Drag from the first phoneme to the last phoneme.";

          renderWordList();
          renderGrid();
        }
      );

    window.addEventListener(
      "pointerup",
      finishSelection
    );

    renderWordList();
    renderGrid();
  </script>
</body>
</html>`;
}