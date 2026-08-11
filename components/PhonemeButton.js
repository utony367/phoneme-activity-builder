export default function PhonemeButton({
  phoneme,
  onSelect,
  disabled = false,
}) {
  const hint =
    `${phoneme.label} (as in ${phoneme.example})`;

  return (
    <button
      type="button"
      className="phoneme-button"
      onClick={() =>
        onSelect(
          phoneme.symbol
        )
      }
      disabled={disabled}
      title={hint}
      aria-label={`${phoneme.symbol}, ${hint}`}
    >
      <span className="phoneme-symbol">
        /{phoneme.symbol}/
      </span>

      <span className="phoneme-hint">
        {hint}
      </span>
    </button>
  );
}