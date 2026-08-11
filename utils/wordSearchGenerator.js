export function generateWordSearch(words, rows = 10, cols = 10) {
  const grid = Array.from(
    { length: rows },
    () => new Array(cols).fill(null)
  );

  const directions = [
    { dr: 0, dc: 1 },
    { dr: 0, dc: -1 },
    { dr: 1, dc: 0 },
    { dr: -1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: -1, dc: 1 },
    { dr: -1, dc: -1 },
  ];

  const solutions = [];
  const phonemePool = [];

  words.forEach((word) => {
    word.phonemes.forEach((phoneme) => {
      if (!phonemePool.includes(phoneme)) {
        phonemePool.push(phoneme);
      }
    });
  });

  function canPlace(units, row, col, direction) {
    const endRow =
      row + direction.dr * (units.length - 1);

    const endCol =
      col + direction.dc * (units.length - 1);

    if (
      endRow < 0 ||
      endRow >= rows ||
      endCol < 0 ||
      endCol >= cols
    ) {
      return false;
    }

    for (let i = 0; i < units.length; i++) {
      const r = row + direction.dr * i;
      const c = col + direction.dc * i;

      if (
        grid[r][c] &&
        grid[r][c] !== units[i]
      ) {
        return false;
      }
    }

    return true;
  }

  words.forEach((word) => {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 200) {
      attempts++;

      const direction =
        directions[
          Math.floor(
            Math.random() * directions.length
          )
        ];

      const row =
        Math.floor(Math.random() * rows);

      const col =
        Math.floor(Math.random() * cols);

      if (
        canPlace(
          word.phonemes,
          row,
          col,
          direction
        )
      ) {
        const coordinates = [];

        word.phonemes.forEach(
          (phoneme, index) => {
            const r =
              row + direction.dr * index;

            const c =
              col + direction.dc * index;

            grid[r][c] = phoneme;

            coordinates.push({
              row: r,
              col: c,
            });
          }
        );

        solutions.push({
          english: word.english,
          phonemes: word.phonemes,
          coordinates,
        });

        placed = true;
      }
    }
  });

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!grid[row][col]) {
        grid[row][col] =
          phonemePool[
            Math.floor(
              Math.random() * phonemePool.length
            )
          ];
      }
    }
  }

  return {
    grid,
    solutions,
    rows,
    cols,
  };
}