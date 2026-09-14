import { escapeHtml, safeJson, savedWords } from "../html.js";

function wordleData(activity) {
  const words = savedWords(activity);
  if (words.length === 0) {
    throw new Error("At least one word is required to generate a Wordle activity");
  }

  const target = words[0];
  const maxAttempts = Number.isInteger(activity.maxAttempts) ? activity.maxAttempts : 6;

  return {
    title: String(activity.title ?? "Phoneme Wordle"),
    difficulty: String(activity.difficulty ?? "MEDIUM"),
    hint: target.hint || String(activity.hint ?? "").trim(),
    maxAttempts: Math.min(10, Math.max(3, maxAttempts)),
    target,
  };
}

export function generateWordleHtml(activity) {
  const data = wordleData(activity);
  const safeData = safeJson(data);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(data.title)}</title>
  <style>
    :root { color-scheme: light; --ink:#163040; --paper:#f4f8fa; --card:#fff; --accent:#245a73; --ok:#3f9457; --present:#c88a17; --absent:#89969d; }
    * { box-sizing:border-box; } body { margin:0; padding:1.5rem; background:var(--paper); color:var(--ink); font-family:Arial,sans-serif; }
    main { max-width:680px; margin:auto; background:var(--card); padding:1.5rem; border-radius:1rem; box-shadow:0 1px 6px #0002; }
    h1 { margin-top:0; color:var(--accent); } .hint { background:#eef4f7; padding:.8rem; border-radius:.5rem; }
    #board { display:grid; gap:.5rem; margin:1.5rem 0; } .row { display:grid; grid-template-columns:repeat(var(--letters), minmax(2rem, 1fr)); gap:.35rem; }
    input { width:100%; min-height:3rem; text-align:center; text-transform:uppercase; border:2px solid #d7e1e6; border-radius:.35rem; font-size:1.1rem; font-weight:bold; }
    input.correct { background:#dff3e4; border-color:var(--ok); } input.present { background:#fff1c7; border-color:var(--present); } input.absent { background:#e8ecef; border-color:var(--absent); }
    button { background:var(--accent); color:#fff; border:0; border-radius:.4rem; padding:.7rem 1rem; font-weight:bold; cursor:pointer; } #message { min-height:1.5rem; font-weight:bold; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(data.title)}</h1>
    <p>Difficulty: <strong>${escapeHtml(data.difficulty)}</strong>. Guess the stored word in ${data.maxAttempts} attempts.</p>
    <p class="hint" id="hint"></p>
    <div id="board" aria-label="Wordle game board"></div>
    <button id="submit" type="button">Check guess</button>
    <button id="reset" type="button">Reset</button>
    <p id="message" aria-live="polite"></p>
  </main>
  <script>
    const activity = ${safeData};
    const board = document.getElementById("board");
    const message = document.getElementById("message");
    let currentRow = 0;
    let finished = false;

    document.getElementById("hint").textContent =
      "Phonemes: " + activity.target.phonemes + (activity.hint ? " · Hint: " + activity.hint : "");

    function scoreGuess(guess, target) {
      const result = Array(target.length).fill("absent");
      const remaining = {};
      for (let index = 0; index < target.length; index += 1) {
        if (guess[index] === target[index]) result[index] = "correct";
        else remaining[target[index]] = (remaining[target[index]] || 0) + 1;
      }
      for (let index = 0; index < target.length; index += 1) {
        if (result[index] !== "correct" && remaining[guess[index]] > 0) {
          result[index] = "present";
          remaining[guess[index]] -= 1;
        }
      }
      return result;
    }

    function render() {
      board.innerHTML = "";
      board.style.setProperty("--letters", activity.target.text.length);
      for (let rowIndex = 0; rowIndex < activity.maxAttempts; rowIndex += 1) {
        const row = document.createElement("div");
        row.className = "row";
        for (let column = 0; column < activity.target.text.length; column += 1) {
          const input = document.createElement("input");
          input.maxLength = 1;
          input.autocomplete = "off";
          input.setAttribute("aria-label", "Guess " + (rowIndex + 1) + ", letter " + (column + 1));
          input.disabled = finished || rowIndex !== currentRow;
          input.addEventListener("input", () => {
            input.value = input.value.replace(/[^a-z]/gi, "").slice(0, 1).toUpperCase();
            if (input.value && input.nextElementSibling && !input.nextElementSibling.disabled) input.nextElementSibling.focus();
          });
          row.appendChild(input);
        }
        board.appendChild(row);
      }
    }

    function submitGuess() {
      if (finished) return;
      const inputs = [...board.children[currentRow].querySelectorAll("input")];
      const guess = inputs.map((input) => input.value.toLowerCase()).join("");
      if (guess.length !== activity.target.text.length) {
        message.textContent = "Enter every letter before checking your guess.";
        return;
      }
      const result = scoreGuess(guess, activity.target.text);
      inputs.forEach((input, index) => {
        input.classList.add(result[index]);
        input.disabled = true;
      });
      if (guess === activity.target.text) {
        finished = true;
        message.textContent = "Correct! The word is " + activity.target.text + ".";
      } else if (currentRow + 1 === activity.maxAttempts) {
        finished = true;
        message.textContent = "No attempts left. The answer was " + activity.target.text + ".";
      } else {
        currentRow += 1;
        message.textContent = "Try again.";
        render();
        const oldRows = [...board.children];
        oldRows.slice(0, currentRow).forEach((row, rowIndex) => row.querySelectorAll("input").forEach((input, index) => {
          input.value = inputs[index]?.value || "";
          input.className = inputs[index]?.className || "";
          input.disabled = true;
        }));
      }
    }

    document.getElementById("submit").addEventListener("click", submitGuess);
    document.getElementById("reset").addEventListener("click", () => { currentRow = 0; finished = false; message.textContent = ""; render(); });
    render();
  </script>
</body>
</html>`;
}
