export function generateWordleHTML({
  targetWord,
  difficulty,
  phonemeKeyboard,
}) {
  const safeTarget = JSON.stringify(targetWord);
  const safeKeyboard = JSON.stringify(phonemeKeyboard);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>Phoneme Wordle</title>

  <style>
    :root {
      --background: #f4f7f9;
      --surface: #ffffff;
      --primary: #245a73;
      --text: #17242d;
      --soft: #60717c;
      --border: #d7e1e6;

      --correct: #dff3e4;
      --correct-border: #3f9457;

      --present: #fff1c7;
      --present-border: #c88a17;

      --absent: #e8ecef;
      --absent-border: #89969d;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 24px;

      background: var(--background);
      color: var(--text);

      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }

    .game {
      width: min(820px, 100%);
      margin: 0 auto;
    }

    .card {
      padding: 28px;

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

    .counter {
      margin-top: 20px;
      font-weight: 700;
      color: var(--soft);
    }

    .grid {
      display: grid;
      gap: 10px;

      margin: 28px 0;
    }

    .row {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .cell {
      width: 62px;
      height: 62px;

      display: flex;
      align-items: center;
      justify-content: center;

      border: 2px solid var(--border);
      border-radius: 10px;

      background: white;

      font-size: 1.2rem;
      font-weight: 800;
    }

    .cell.correct {
      background: var(--correct);
      border-color: var(--correct-border);
    }

    .cell.present {
      background: var(--present);
      border-color: var(--present-border);
    }

    .cell.absent {
      background: var(--absent);
      border-color: var(--absent-border);
    }

    .keyboard {
      display: grid;

      grid-template-columns:
        repeat(auto-fit, minmax(95px, 1fr));

      gap: 8px;

      margin-top: 20px;
    }

    .phoneme-button {
      min-height: 62px;

      padding: 8px;

      border: 1px solid var(--border);
      border-radius: 8px;

      background: white;
      color: var(--text);

      cursor: pointer;
      font-weight: 800;
    }

    .phoneme-button small {
      display: block;

      margin-top: 4px;

      color: var(--soft);

      font-size: 0.72rem;
      font-weight: 500;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;

      gap: 10px;

      margin: 20px 0;
    }

    .action-button {
      padding: 11px 18px;

      border: 0;
      border-radius: 8px;

      background: var(--primary);
      color: white;

      cursor: pointer;
      font-weight: 800;
    }

    .secondary {
      background: #667784;
    }

    .feedback {
      margin-top: 18px;
      padding: 14px;

      background: #eef4f7;

      border-radius: 10px;
    }

    .legend {
      display: grid;
      gap: 5px;

      margin-top: 20px;
      padding: 14px;

      background: #f4f7f9;

      border-radius: 10px;

      color: var(--soft);

      font-size: 0.85rem;
    }

    button:focus-visible {
      outline: 3px solid #f59e0b;
      outline-offset: 3px;
    }

    @media (max-width: 520px) {
      body {
        padding: 12px;
      }

      .card {
        padding: 18px;
      }

      .cell {
        width: 50px;
        height: 50px;
      }

      .keyboard {
        grid-template-columns:
          repeat(3, 1fr);
      }
    }
  </style>
</head>

<body>
  <main class="game">
    <section class="card">
      <h1>Phoneme Wordle</h1>

      <p class="intro">
        Select phonemes to guess the target word.
        Difficulty: ${difficulty}.
      </p>

      <p class="counter">
        Guesses:
        <span id="guessCount">0</span>
        / 6
      </p>

      <div
        id="grid"
        class="grid"
        aria-label="Wordle game grid"
      ></div>

      <div class="actions">
        <button
          id="deleteButton"
          class="action-button secondary"
          type="button"
        >
          Delete
        </button>

        <button
          id="submitButton"
          class="action-button"
          type="button"
        >
          Submit Guess
        </button>

        <button
          id="resetButton"
          class="action-button secondary"
          type="button"
        >
          Reset
        </button>
      </div>

      <div
        id="feedback"
        class="feedback"
        aria-live="polite"
      >
        Choose phonemes from the keyboard.
      </div>

      <div class="legend">
        <span>✓ Correct — correct position</span>
        <span>• Present — phoneme exists elsewhere</span>
        <span>× Absent — phoneme is not in the word</span>
      </div>

      <h2>Phoneme keyboard</h2>

      <div
        id="keyboard"
        class="keyboard"
      ></div>
    </section>
  </main>

  <script>
    const targetWord = ${safeTarget};
    const phonemeKeyboard = ${safeKeyboard};

    const MAX_GUESSES = 6;

    let currentGuess = [];
    let guesses = [];
    let finished = false;

    const grid =
      document.getElementById("grid");

    const keyboard =
      document.getElementById("keyboard");

    const feedback =
      document.getElementById("feedback");

    const guessCount =
      document.getElementById("guessCount");

    function checkGuess(guess) {
      return guess.map((phoneme, index) => {
        if (
          phoneme ===
          targetWord.phonemes[index]
        ) {
          return "correct";
        }

        if (
          targetWord.phonemes.includes(
            phoneme
          )
        ) {
          return "present";
        }

        return "absent";
      });
    }

    function renderGrid() {
      grid.innerHTML = "";

      guesses.forEach((guess) => {
        const row =
          document.createElement("div");

        row.className = "row";

        guess.phonemes.forEach(
          (phoneme, index) => {
            const cell =
              document.createElement("div");

            cell.className =
              "cell " +
              guess.result[index];

            cell.textContent =
              phoneme;

            row.appendChild(cell);
          }
        );

        grid.appendChild(row);
      });

      if (
        !finished &&
        guesses.length < MAX_GUESSES
      ) {
        const activeRow =
          document.createElement("div");

        activeRow.className = "row";

        for (
          let index = 0;
          index < targetWord.phonemes.length;
          index++
        ) {
          const cell =
            document.createElement("div");

          cell.className = "cell";
          cell.textContent =
            currentGuess[index] || "";

          activeRow.appendChild(cell);
        }

        grid.appendChild(activeRow);
      }

      guessCount.textContent =
        guesses.length;
    }

    function renderKeyboard() {
      keyboard.innerHTML = "";

      phonemeKeyboard.forEach(
        (phoneme) => {
          const button =
            document.createElement("button");

          button.type = "button";
          button.className =
            "phoneme-button";

          const hint =
            phoneme.label +
            " (as in " +
            phoneme.example +
            ")";

          button.title = hint;

          button.setAttribute(
            "aria-label",
            phoneme.symbol +
              ", " +
              hint
          );

          button.innerHTML =
            "/" +
            phoneme.symbol +
            "/<small>" +
            hint +
            "</small>";

          button.addEventListener(
            "click",
            () => {
              if (
                finished ||
                currentGuess.length >=
                  targetWord.phonemes.length
              ) {
                return;
              }

              currentGuess.push(
                phoneme.symbol
              );

              renderGrid();
            }
          );

          keyboard.appendChild(button);
        }
      );
    }

    document
      .getElementById("deleteButton")
      .addEventListener(
        "click",
        () => {
          if (finished) return;

          currentGuess.pop();

          renderGrid();
        }
      );

    document
      .getElementById("submitButton")
      .addEventListener(
        "click",
        () => {
          if (finished) return;

          if (
            currentGuess.length !==
            targetWord.phonemes.length
          ) {
            feedback.textContent =
              "Complete all phoneme cells before submitting.";

            return;
          }

          const result =
            checkGuess(currentGuess);

          const correct =
            result.every(
              (status) =>
                status === "correct"
            );

          guesses.push({
            phonemes: [
              ...currentGuess,
            ],
            result,
          });

          currentGuess = [];

          if (correct) {
            finished = true;

            feedback.innerHTML =
              "<strong>Correct ✓</strong><br>" +
              "/" +
              targetWord.phonemes.join(" ") +
              "/<br>" +
              "English equivalent: <strong>" +
              targetWord.english +
              "</strong>";
          } else if (
            guesses.length >=
            MAX_GUESSES
          ) {
            finished = true;

            feedback.innerHTML =
              "<strong>Game over.</strong><br>" +
              "The answer was /" +
              targetWord.phonemes.join(" ") +
              "/ — <strong>" +
              targetWord.english +
              "</strong>";
          } else {
            feedback.innerHTML =
              "<strong>Try again.</strong> " +
              "Review the feedback and choose another phoneme sequence.";
          }

          renderGrid();
        }
      );

    document
      .getElementById("resetButton")
      .addEventListener(
        "click",
        () => {
          currentGuess = [];
          guesses = [];
          finished = false;

          feedback.textContent =
            "Choose phonemes from the keyboard.";

          renderGrid();
        }
      );

    renderKeyboard();
    renderGrid();
  </script>
</body>
</html>`;
}