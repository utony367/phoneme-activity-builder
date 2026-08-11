"use client";

import { useState } from "react";

import PhonemeButton from "./PhonemeButton";
import DifficultySelector from "./DifficultySelector";

import {
  phonemeKeyboard,
  wordleWords,
} from "../utils/phonemeData";

import {
  generateWordleHTML,
} from "../utils/generateWordleHTML";

import {
  downloadHTML,
} from "../utils/downloadHTML";

const MAX_GUESSES = 6;

export default function WordleBuilder() {
  const [difficulty, setDifficulty] = useState("easy");
  const [wordIndex, setWordIndex] = useState(0);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [message, setMessage] = useState("");
  const [gameWon, setGameWon] = useState(false);

  const words = wordleWords[difficulty];

  const targetWord =
    words[wordIndex % words.length];

  // Change difficulty
  function handleDifficultyChange(newDifficulty) {
    setDifficulty(newDifficulty);

    setWordIndex(0);
    setCurrentGuess([]);
    setGuesses([]);
    setMessage("");
    setGameWon(false);
  }

  // Add a phoneme to the current guess
  function handlePhonemeSelect(symbol) {
    if (
      gameWon ||
      guesses.length >= MAX_GUESSES ||
      currentGuess.length >= targetWord.phonemes.length
    ) {
      return;
    }

    setCurrentGuess([
      ...currentGuess,
      symbol,
    ]);

    setMessage("");
  }

  // Delete the last phoneme
  function handleDelete() {
    if (gameWon) {
      return;
    }

    setCurrentGuess(
      currentGuess.slice(0, -1)
    );

    setMessage("");
  }

  // Check each phoneme
  function checkGuess(guess) {
    return guess.map((phoneme, index) => {
      // Correct phoneme and correct position
      if (
        phoneme === targetWord.phonemes[index]
      ) {
        return "correct";
      }

      // Phoneme exists elsewhere
      if (
        targetWord.phonemes.includes(phoneme)
      ) {
        return "present";
      }

      // Phoneme does not exist
      return "absent";
    });
  }

  // Submit current guess
  function handleSubmit() {
    if (gameWon) {
      return;
    }

    if (
      guesses.length >= MAX_GUESSES
    ) {
      return;
    }

    if (
      currentGuess.length !==
      targetWord.phonemes.length
    ) {
      setMessage(
        "Complete all phoneme cells before submitting."
      );

      return;
    }

    const result =
      checkGuess(currentGuess);

    const submittedGuess = {
      phonemes: [...currentGuess],
      result,
    };

    const updatedGuesses = [
      ...guesses,
      submittedGuess,
    ];

    setGuesses(updatedGuesses);

    const correct =
      result.every(
        (status) => status === "correct"
      );

    if (correct) {
      setGameWon(true);

      setMessage(
        `Correct ✓ English equivalent: ${targetWord.english}`
      );
    } else if (
      updatedGuesses.length >= MAX_GUESSES
    ) {
      setMessage(
        `Game over. The answer was /${targetWord.phonemes.join(
          " "
        )}/ — ${targetWord.english}.`
      );
    } else {
      setMessage(
        "Try again. Review the feedback and choose another phoneme sequence."
      );
    }

    setCurrentGuess([]);
  }

  // Reset current game
  function handleReset() {
    setCurrentGuess([]);
    setGuesses([]);
    setMessage("");
    setGameWon(false);
  }

  // Move to another word
  function handleNewWord() {
    setWordIndex(
      (wordIndex + 1) % words.length
    );

    setCurrentGuess([]);
    setGuesses([]);
    setMessage("");
    setGameWon(false);
  }

  // Generate standalone HTML
  function handleGenerateHTML() {
    const html =
      generateWordleHTML({
        targetWord,
        difficulty,
        phonemeKeyboard,
      });

    downloadHTML(
      html,
      `phoneme-wordle-${targetWord.english}.html`
    );
  }

  return (
    <div className="wordle-builder-layout">

      {/* =========================
          TEACHER CONTROL PANEL
      ========================== */}

      <section className="builder-panel">
        <p className="eyebrow">
          Teacher controls
        </p>

        <h3>
          Build Wordle activity
        </h3>

        <p>
          Choose the difficulty and preview how
          students will interact with the phoneme
          activity.
        </p>

        {/* Difficulty */}

        <DifficultySelector
          difficulty={difficulty}
          onChange={
            handleDifficultyChange
          }
        />

        {/* Activity information */}

        <div className="target-info">
          <strong>
            {targetWord.phonemes.length}
            -phoneme activity
          </strong>

          <span>
            Students have up to{" "}
            {MAX_GUESSES} guesses.
          </span>

          <span>
            The English answer is hidden during
            gameplay.
          </span>
        </div>

        {/* Phoneme keyboard */}

        <h4>
          Phoneme keyboard
        </h4>

        <p>
          Select a phoneme to add it to the
          current guess. Hover over a button to
          view its English sound hint.
        </p>

        <div className="phoneme-keyboard">
          {phonemeKeyboard.map(
            (phoneme) => (
              <PhonemeButton
                key={phoneme.symbol}
                phoneme={phoneme}
                onSelect={
                  handlePhonemeSelect
                }
                disabled={
                  gameWon ||
                  guesses.length >=
                    MAX_GUESSES
                }
              />
            )
          )}
        </div>

        {/* Game controls */}

        <div className="wordle-actions">
          <button
            type="button"
            className="secondary-action"
            onClick={handleDelete}
            disabled={gameWon}
          >
            Delete
          </button>

          <button
            type="button"
            className="primary-action"
            onClick={handleSubmit}
            disabled={
              gameWon ||
              guesses.length >=
                MAX_GUESSES
            }
          >
            Submit Guess
          </button>

          <button
            type="button"
            className="secondary-action"
            onClick={handleReset}
          >
            Reset
          </button>

          <button
            type="button"
            className="secondary-action"
            onClick={handleNewWord}
          >
            New Word
          </button>
        </div>

        {/* Generate HTML */}

        <div className="generate-section">
          <div>
            <h4>
              Generate classroom file
            </h4>

            <p>
              Download this activity as one
              standalone playable HTML file.
            </p>
          </div>

          <button
            type="button"
            className="generate-button"
            onClick={
              handleGenerateHTML
            }
          >
            Generate HTML
          </button>
        </div>
      </section>

      {/* =========================
          LIVE PREVIEW
      ========================== */}

      <section className="builder-panel">
        <p className="eyebrow">
          Live preview
        </p>

        <h3>
          Student activity
        </h3>

        <p>
          Guess the phoneme sequence using the
          phoneme keyboard.
        </p>

        {/* Guess counter */}

        <p className="guess-counter">
          Guesses:{" "}
          {guesses.length} /{" "}
          {MAX_GUESSES}
        </p>

        {/* Wordle board */}

        <div className="guess-board">

          {/* Previous guesses */}

          {guesses.map(
            (guess, rowIndex) => (
              <div
                className="wordle-row"
                key={rowIndex}
              >
                {guess.phonemes.map(
                  (
                    phoneme,
                    index
                  ) => (
                    <div
                      className={`wordle-cell ${guess.result[index]}`}
                      key={index}
                      aria-label={`${phoneme}: ${guess.result[index]}`}
                    >
                      {phoneme}
                    </div>
                  )
                )}
              </div>
            )
          )}

          {/* Current guess */}

          {!gameWon &&
            guesses.length <
              MAX_GUESSES && (
              <div
                className="wordle-row current-row"
                aria-label="Current guess"
              >
                {Array.from({
                  length:
                    targetWord.phonemes
                      .length,
                }).map(
                  (_, index) => (
                    <div
                      className="wordle-cell"
                      key={index}
                    >
                      {currentGuess[
                        index
                      ] || ""}
                    </div>
                  )
                )}
              </div>
            )}
        </div>

        {/* Accessibility legend */}

        <div className="feedback-legend">
          <span>
            <strong>
              ✓ Correct
            </strong>{" "}
            — correct phoneme and position
          </span>

          <span>
            <strong>
              • Present
            </strong>{" "}
            — phoneme exists in another
            position
          </span>

          <span>
            <strong>
              × Absent
            </strong>{" "}
            — phoneme is not in the word
          </span>
        </div>

        {/* Feedback */}

        <div
          className="game-message"
          role="status"
          aria-live="polite"
        >
          {message ||
            "Choose phonemes from the keyboard."}
        </div>

        {/* Correct answer */}

        {gameWon && (
          <div className="answer-card">
            <strong>
              /
              {targetWord.phonemes.join(
                " "
              )}
              /
            </strong>

            <span>
              English equivalent:{" "}
              {targetWord.english}
            </span>
          </div>
        )}

        {/* Game over answer */}

        {!gameWon &&
          guesses.length >=
            MAX_GUESSES && (
            <div className="answer-card">
              <strong>
                /
                {targetWord.phonemes.join(
                  " "
                )}
                /
              </strong>

              <span>
                English equivalent:{" "}
                {targetWord.english}
              </span>
            </div>
          )}
      </section>
    </div>
  );
}