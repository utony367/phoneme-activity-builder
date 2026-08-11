"use client";

import { useState } from "react";

import { generateWordSearch } from "../utils/wordSearchGenerator";
import { generateWordSearchHTML } from "../utils/generateWordSearchHTML";
import { downloadHTML } from "../utils/downloadHTML";

const words = [
  {
    english: "chin",
    phonemes: ["tʃ", "ɪ", "n"],
  },
  {
    english: "bait",
    phonemes: ["b", "æɪ", "t"],
  },
  {
    english: "jam",
    phonemes: ["dʒ", "æ", "m"],
  },
  {
    english: "bad",
    phonemes: ["b", "æ", "d"],
  },
  {
    english: "boot",
    phonemes: ["b", "ʉː", "t"],
  },
];

const difficultySettings = {
  easy: {
    rows: 8,
    cols: 8,
  },

  medium: {
    rows: 10,
    cols: 10,
  },

  hard: {
    rows: 12,
    cols: 12,
  },
};

export default function WordSearchBuilder() {
  const [difficulty, setDifficulty] =
    useState("medium");

  const [puzzle, setPuzzle] =
    useState(null);

  const [showAnswers, setShowAnswers] =
    useState(false);

  const [isSelecting, setIsSelecting] =
    useState(false);

  const [startCell, setStartCell] =
    useState(null);

  const [selectedCells, setSelectedCells] =
    useState([]);

  const [foundWords, setFoundWords] =
    useState([]);

  const [foundCells, setFoundCells] =
    useState([]);

  const [message, setMessage] =
    useState("");

  function handleGenerate() {
    const settings =
      difficultySettings[difficulty];

    const generated =
      generateWordSearch(
        words,
        settings.rows,
        settings.cols
      );

    setPuzzle(generated);

    setShowAnswers(false);
    setIsSelecting(false);
    setStartCell(null);
    setSelectedCells([]);
    setFoundWords([]);
    setFoundCells([]);

    setMessage(
      "Drag from the first phoneme to the last phoneme."
    );
  }

  function getPath(start, end) {
    const rowDifference =
      end.row - start.row;

    const colDifference =
      end.col - start.col;

    const validDirection =
      rowDifference === 0 ||
      colDifference === 0 ||
      Math.abs(rowDifference) ===
        Math.abs(colDifference);

    if (!validDirection) {
      return [];
    }

    const steps =
      Math.max(
        Math.abs(rowDifference),
        Math.abs(colDifference)
      );

    const rowStep =
      rowDifference === 0
        ? 0
        : rowDifference / steps;

    const colStep =
      colDifference === 0
        ? 0
        : colDifference / steps;

    const path = [];

    for (
      let index = 0;
      index <= steps;
      index++
    ) {
      path.push({
        row:
          start.row +
          rowStep * index,

        col:
          start.col +
          colStep * index,
      });
    }

    return path;
  }

  function handlePointerDown(
    row,
    col
  ) {
    if (!puzzle) {
      return;
    }

    const cell = {
      row,
      col,
    };

    setIsSelecting(true);
    setStartCell(cell);
    setSelectedCells([cell]);
  }

  function handlePointerEnter(
    row,
    col
  ) {
    if (
      !isSelecting ||
      !startCell ||
      !puzzle
    ) {
      return;
    }

    const path =
      getPath(
        startCell,
        {
          row,
          col,
        }
      );

    if (path.length > 0) {
      setSelectedCells(path);
    }
  }

  function finishSelection() {
    if (
      !isSelecting ||
      !puzzle
    ) {
      return;
    }

    setIsSelecting(false);

    if (
      selectedCells.length === 0
    ) {
      return;
    }

    const selectedString =
      selectedCells
        .map(
          ({ row, col }) =>
            puzzle.grid[row][col]
        )
        .join("");

    const reversedString =
      [...selectedString]
        .reverse()
        .join("");

    const matchedWord =
      words.find((word) => {
        const wordString =
          word.phonemes.join("");

        return (
          wordString ===
            selectedString ||
          wordString ===
            reversedString
        );
      });

    if (!matchedWord) {
      setMessage(
        "That selection is not one of the target phoneme words."
      );

      setSelectedCells([]);
      setStartCell(null);

      return;
    }

    if (
      foundWords.includes(
        matchedWord.english
      )
    ) {
      setMessage(
        `${matchedWord.english} has already been found.`
      );

      setSelectedCells([]);
      setStartCell(null);

      return;
    }

    const matchedSolution =
      puzzle.solutions.find(
        (solution) =>
          solution.english ===
          matchedWord.english
      );

    const updatedFoundWords = [
      ...foundWords,
      matchedWord.english,
    ];

    setFoundWords(
      updatedFoundWords
    );

    if (matchedSolution) {
      setFoundCells([
        ...foundCells,
        ...matchedSolution.coordinates,
      ]);
    }

    if (
      updatedFoundWords.length ===
      words.length
    ) {
      setMessage(
        "Complete ✓ All phoneme words found."
      );
    } else {
      setMessage(
        `Found ✓ /${matchedWord.phonemes.join(
          " "
        )}/ — ${matchedWord.english}`
      );
    }

    setSelectedCells([]);
    setStartCell(null);
  }

  function isSelected(
    row,
    col
  ) {
    return selectedCells.some(
      (cell) =>
        cell.row === row &&
        cell.col === col
    );
  }

  function isFoundCell(
    row,
    col
  ) {
    return foundCells.some(
      (cell) =>
        cell.row === row &&
        cell.col === col
    );
  }

  function isAnswerCell(
    row,
    col
  ) {
    if (
      !showAnswers ||
      !puzzle
    ) {
      return false;
    }

    return puzzle.solutions.some(
      (solution) =>
        solution.coordinates.some(
          (cell) =>
            cell.row === row &&
            cell.col === col
        )
    );
  }

  function resetActivity() {
    if (!puzzle) {
      return;
    }

    setSelectedCells([]);
    setFoundWords([]);
    setFoundCells([]);
    setStartCell(null);
    setIsSelecting(false);
    setShowAnswers(false);

    setMessage(
      "Activity reset. Find the phoneme words again."
    );
  }

  function handleGenerateHTML() {
    if (!puzzle) {
      setMessage(
        "Generate a puzzle before downloading the HTML file."
      );

      return;
    }

    const html =
      generateWordSearchHTML({
        puzzle,
        words,
        difficulty,
      });

    downloadHTML(
      html,
      "phoneme-word-search.html"
    );
  }

  return (
    <div className="wordle-builder-layout">

      {/* TEACHER CONTROLS */}

      <section className="builder-panel">
        <p className="eyebrow">
          Teacher controls
        </p>

        <h3>
          Build Word Search activity
        </h3>

        <p>
          Choose a difficulty and generate an
          interactive phoneme-based word search.
        </p>

        {/* Difficulty */}

        <div className="form-field">
          <label htmlFor="word-search-difficulty">
            Difficulty
          </label>

          <select
            id="word-search-difficulty"
            value={difficulty}
            onChange={(event) => {
              setDifficulty(
                event.target.value
              );

              setPuzzle(null);
              setShowAnswers(false);
              setFoundWords([]);
              setFoundCells([]);
              setSelectedCells([]);
              setStartCell(null);
              setIsSelecting(false);
              setMessage("");
            }}
          >
            <option value="easy">
              Easy — 8 × 8
            </option>

            <option value="medium">
              Medium — 10 × 10
            </option>

            <option value="hard">
              Hard — 12 × 12
            </option>
          </select>
        </div>

        {/* Included words */}

        <div className="target-info">
          <strong>
            Included phoneme words
          </strong>

          {words.map((word) => (
            <span
              key={word.english}
            >
              /
              {word.phonemes.join(
                " "
              )}
              / — {word.english}
            </span>
          ))}
        </div>

        {/* Controls */}

        <div className="wordle-actions">
          <button
            type="button"
            className="primary-action"
            onClick={
              handleGenerate
            }
          >
            Generate Puzzle
          </button>

          <button
            type="button"
            className="secondary-action"
            disabled={!puzzle}
            onClick={() =>
              setShowAnswers(
                !showAnswers
              )
            }
          >
            {showAnswers
              ? "Hide Answers"
              : "Show Answers"}
          </button>

          <button
            type="button"
            className="secondary-action"
            disabled={!puzzle}
            onClick={
              resetActivity
            }
          >
            Reset
          </button>
        </div>

        {/* Generate standalone HTML */}

        <div className="generate-section">
          <div>
            <h4>
              Generate classroom file
            </h4>

            <p>
              Download this puzzle as one
              standalone playable HTML file.
            </p>
          </div>

          <button
            type="button"
            className="generate-button"
            disabled={!puzzle}
            onClick={
              handleGenerateHTML
            }
          >
            Generate HTML
          </button>
        </div>
      </section>

      {/* LIVE PREVIEW */}

      <section className="builder-panel">
        <p className="eyebrow">
          Live preview
        </p>

        <h3>
          Student activity
        </h3>

        {!puzzle && (
          <p>
            Select a difficulty and click
            Generate Puzzle to create the
            activity.
          </p>
        )}

        {puzzle && (
          <>
            <p className="word-search-instruction">
              Drag from the first phoneme to the
              last phoneme to select a word.
            </p>

            {/* Puzzle Grid */}

            <div
              className="word-search-grid"
              style={{
                gridTemplateColumns:
                  `repeat(${puzzle.cols}, 1fr)`,
              }}
              onPointerLeave={() => {
                if (isSelecting) {
                  finishSelection();
                }
              }}
            >
              {puzzle.grid.map(
                (
                  row,
                  rowIndex
                ) =>
                  row.map(
                    (
                      phoneme,
                      colIndex
                    ) => {
                      const selected =
                        isSelected(
                          rowIndex,
                          colIndex
                        );

                      const found =
                        isFoundCell(
                          rowIndex,
                          colIndex
                        );

                      const answer =
                        isAnswerCell(
                          rowIndex,
                          colIndex
                        );

                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          type="button"
                          className={[
                            "word-search-cell",

                            selected
                              ? "selected"
                              : "",

                            found
                              ? "found-cell"
                              : "",

                            answer
                              ? "answer-cell"
                              : "",
                          ].join(" ")}
                          onPointerDown={() =>
                            handlePointerDown(
                              rowIndex,
                              colIndex
                            )
                          }
                          onPointerEnter={() =>
                            handlePointerEnter(
                              rowIndex,
                              colIndex
                            )
                          }
                          onPointerUp={
                            finishSelection
                          }
                          aria-label={`Phoneme ${phoneme}`}
                        >
                          {phoneme}
                        </button>
                      );
                    }
                  )
              )}
            </div>

            {/* Word List */}

            <div className="word-search-list">
              <h4>
                Words to find
              </h4>

              <div className="word-search-list-items">
                {words.map(
                  (word) => {
                    const found =
                      foundWords.includes(
                        word.english
                      );

                    return (
                      <div
                        key={
                          word.english
                        }
                        className={`word-search-list-item ${
                          found
                            ? "found-word"
                            : ""
                        }`}
                      >
                        <strong>
                          /
                          {word.phonemes.join(
                            " "
                          )}
                          /
                        </strong>

                        {found && (
                          <span>
                            Found ✓
                          </span>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Feedback */}

            <div
              className="game-message"
              role="status"
              aria-live="polite"
            >
              {message ||
                "Find the five phoneme words in the puzzle."}
            </div>
          </>
        )}
      </section>
    </div>
  );
}