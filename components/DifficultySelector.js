export default function DifficultySelector({
  difficulty,
  onChange,
}) {
  return (
    <div className="form-field">
      <label htmlFor="difficulty">
        Difficulty
      </label>

      <select
        id="difficulty"
        value={difficulty}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        <option value="easy">
          Easy — 3 phonemes
        </option>

        <option value="medium">
          Medium — 4 phonemes
        </option>

        <option value="hard">
          Hard — 5 phonemes
        </option>
      </select>
    </div>
  );
}