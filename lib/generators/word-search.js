import { escapeHtml, safeJson, savedWords } from "../html.js";

const DIRECTIONS = [
  [0, 1], [1, 0], [1, 1], [1, -1],
  [0, -1], [-1, 0], [-1, -1], [-1, 1],
];

function pathFor(row, column, letters, direction) {
  return letters.map((_, index) => ({
    row: row + direction[0] * index,
    column: column + direction[1] * index,
  }));
}

function fits(grid, letters, cells) {
  return cells.every((cell, index) =>
    cell.row >= 0 && cell.row < grid.length &&
    cell.column >= 0 && cell.column < grid.length &&
    (grid[cell.row][cell.column] === "" || grid[cell.row][cell.column] === letters[index]));
}

function placeWords(words, size) {
  const grid = Array.from({ length: size }, () => Array(size).fill(""));
  const placements = [];

  for (const word of words) {
    const letters = [...word.text.toUpperCase()];
    let placed = false;

    for (const direction of DIRECTIONS) {
      for (let row = 0; row < size && !placed; row += 1) {
        for (let column = 0; column < size && !placed; column += 1) {
          const cells = pathFor(row, column, letters, direction);
          if (fits(grid, letters, cells)) {
            cells.forEach((cell, index) => { grid[cell.row][cell.column] = letters[index]; });
            placements.push({ text: word.text, cells });
            placed = true;
          }
        }
      }
      if (placed) break;
    }

    if (!placed) throw new Error("Word \"" + word.text + "\" cannot fit in the grid");
  }

  grid.forEach((row, rowIndex) => row.forEach((letter, column) => {
    if (!letter) row[column] = String.fromCharCode(65 + ((rowIndex * size + column) % 26));
  }));

  return { grid, placements };
}

function wordSearchData(activity) {
  const words = savedWords(activity);
  if (words.length === 0) throw new Error("At least one word is required to generate a Word Search activity");

  const size = Number.isInteger(activity.gridSize) ? activity.gridSize : 12;
  if (size < 8 || size > 20) throw new Error("Grid size must be between 8 and 20");
  const tooLong = words.find((word) => word.text.length > size);
  if (tooLong) throw new Error("Word \"" + tooLong.text + "\" cannot fit in the grid");

  return {
    title: String(activity.title ?? "Phoneme Word Search"),
    difficulty: String(activity.difficulty ?? "MEDIUM"),
    hint: String(activity.hint ?? "").trim(),
    size,
    words,
    ...placeWords(words, size),
  };
}

export function generateWordSearchHtml(activity) {
  const data = wordSearchData(activity);
  const safeData = safeJson(data);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(data.title)}</title>
  <style>
    :root { --ink:#163040; --paper:#f4f8fa; --card:#fff; --accent:#245a73; --selected:#fff1c7; --found:#dff3e4; }
    * { box-sizing:border-box; } body { margin:0; padding:1.5rem; background:var(--paper); color:var(--ink); font-family:Arial,sans-serif; }
    main { max-width:780px; margin:auto; background:var(--card); padding:1.5rem; border-radius:1rem; box-shadow:0 1px 6px #0002; }
    h1 { margin-top:0; color:var(--accent); } #grid { display:grid; gap:3px; max-width:620px; margin:1.25rem auto; touch-action:none; }
    .cell { aspect-ratio:1; padding:0; border:1px solid #d7e1e6; border-radius:.2rem; background:#f8fafc; color:var(--ink); font-weight:bold; cursor:pointer; }
    .cell.selected { background:var(--selected); } .cell.found { background:var(--found); } #words { display:flex; flex-wrap:wrap; gap:.5rem; }
    .word { padding:.4rem .6rem; background:#eef4f7; border-radius:.4rem; } .word.found { text-decoration:line-through; background:var(--found); }
    button.action { background:var(--accent); color:#fff; border:0; border-radius:.4rem; padding:.65rem .9rem; font-weight:bold; cursor:pointer; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(data.title)}</h1>
    <p id="intro"></p>
    <div id="grid" aria-label="Word Search grid"></div>
    <button class="action" id="reset" type="button">Reset</button>
    <p id="message" aria-live="polite"></p>
    <h2>Words to find</h2>
    <div id="words"></div>
  </main>
  <script>
    const activity = ${safeData};
    const gridElement = document.getElementById("grid");
    const wordsElement = document.getElementById("words");
    const message = document.getElementById("message");
    let start = null;
    let selected = [];
    const found = new Set();

    document.getElementById("intro").textContent =
      "Difficulty: " + activity.difficulty + ". Drag from the first letter to the last letter." +
      (activity.hint ? " Teacher hint: " + activity.hint : "");

    function key(cell) { return cell.row + ":" + cell.column; }
    function same(a, b) { return a.row === b.row && a.column === b.column; }
    function getPath(from, to) {
      const rowChange = to.row - from.row;
      const colChange = to.column - from.column;
      if (!(rowChange === 0 || colChange === 0 || Math.abs(rowChange) === Math.abs(colChange))) return [];
      const steps = Math.max(Math.abs(rowChange), Math.abs(colChange));
      const rowStep = steps ? rowChange / steps : 0;
      const colStep = steps ? colChange / steps : 0;
      return Array.from({ length: steps + 1 }, (_, index) => ({ row: from.row + rowStep * index, column: from.column + colStep * index }));
    }
    function matchedPlacement() {
      return activity.placements.find((placement) =>
        placement.cells.length === selected.length &&
        placement.cells.every((cell, index) => same(cell, selected[index])) ||
        placement.cells.length === selected.length &&
        placement.cells.every((cell, index) => same(cell, selected[selected.length - 1 - index])));
    }
    function renderWords() {
      wordsElement.innerHTML = "";
      activity.words.forEach((word) => {
        const item = document.createElement("div");
        item.className = "word" + (found.has(word.text) ? " found" : "");
        item.textContent = word.text + " — " + word.phonemes;
        wordsElement.appendChild(item);
      });
    }
    function renderGrid() {
      gridElement.innerHTML = "";
      gridElement.style.gridTemplateColumns = "repeat(" + activity.size + ", 1fr)";
      const foundCells = new Set(activity.placements.filter((placement) => found.has(placement.text)).flatMap((placement) => placement.cells.map(key)));
      activity.grid.forEach((row, rowIndex) => row.forEach((letter, column) => {
        const button = document.createElement("button");
        const current = { row: rowIndex, column };
        button.type = "button";
        button.className = "cell" + (selected.some((cell) => same(cell, current)) ? " selected" : "") + (foundCells.has(key(current)) ? " found" : "");
        button.textContent = letter;
        button.setAttribute("aria-label", "Letter " + letter);
        button.addEventListener("pointerdown", (event) => { event.preventDefault(); start = current; selected = [current]; renderGrid(); });
        button.addEventListener("pointerenter", () => { if (start) { selected = getPath(start, current); renderGrid(); } });
        button.addEventListener("pointerup", finishSelection);
        gridElement.appendChild(button);
      }));
    }
    function finishSelection() {
      if (!start) return;
      const match = matchedPlacement();
      if (match && !found.has(match.text)) {
        found.add(match.text);
        message.textContent = "Found " + match.text + "!";
      } else if (!match) {
        message.textContent = "That selection is not a target word.";
      }
      start = null;
      selected = [];
      renderWords();
      renderGrid();
      if (found.size === activity.words.length) message.textContent = "Complete! All words found.";
    }
    window.addEventListener("pointerup", finishSelection);
    document.getElementById("reset").addEventListener("click", () => { start = null; selected = []; found.clear(); message.textContent = ""; renderWords(); renderGrid(); });
    renderWords();
    renderGrid();
  </script>
</body>
</html>`;
}
