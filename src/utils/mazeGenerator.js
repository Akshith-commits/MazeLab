/**
 * Maze Generator using Recursive Backtracking (randomized DFS)
 * 
 * Generates a perfect maze (exactly one path between any two cells),
 * then selectively removes walls to create multiple paths based on difficulty.
 * 
 * The maze is guaranteed to always have at least one valid path from
 * the top-left corner to the bottom-right corner.
 */

/**
 * Generates a random solvable maze grid.
 * 
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {number[][]} - 2D grid where 0 = open, 1 = wall
 */
export function generateMaze(rows, cols, difficulty = 'medium') {
  // Start with all walls
  const maze = Array.from({ length: rows }, () => Array(cols).fill(1));

  // Use recursive backtracking to carve passages
  // We work on odd-indexed cells as the "rooms" and carve between them
  const visited = new Set();

  function carve(r, c) {
    visited.add(`${r},${c}`);
    maze[r][c] = 0;

    // Randomize direction order for variety
    const dirs = shuffle([
      [0, 2],   // right
      [2, 0],   // down
      [0, -2],  // left
      [-2, 0],  // up
    ]);

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;

      if (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < cols &&
        !visited.has(`${nr},${nc}`)
      ) {
        // Carve the wall between current cell and neighbor
        maze[r + dr / 2][c + dc / 2] = 0;
        carve(nr, nc);
      }
    }
  }

  // Start carving from (0, 0) — ensure start is always open
  carve(0, 0);

  // Make sure the end cell is open
  maze[rows - 1][cols - 1] = 0;

  // If end cell is isolated, carve a path to it
  if (maze[rows - 2] && maze[rows - 2][cols - 1] === 1 &&
      maze[rows - 1][cols - 2] === 1) {
    // Open at least one neighbor
    if (rows - 2 >= 0) maze[rows - 2][cols - 1] = 0;
    else if (cols - 2 >= 0) maze[rows - 1][cols - 2] = 0;
  }

  // Adjust difficulty by removing extra walls to create more open space
  const wallRemovalRate = {
    easy: 0.35,    // Remove many walls → lots of open paths
    medium: 0.18,  // Moderate removal
    hard: 0.05,    // Keep most walls → tight corridors
  };

  const rate = wallRemovalRate[difficulty] || 0.18;

  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (maze[r][c] === 1 && Math.random() < rate) {
        maze[r][c] = 0;
      }
    }
  }

  // Ensure start and end are open
  maze[0][0] = 0;
  maze[rows - 1][cols - 1] = 0;

  // Verify the maze is solvable; if not, force a path
  if (!isSolvable(maze, [0, 0], [rows - 1, cols - 1])) {
    forcePath(maze, rows, cols);
  }

  return maze;
}

/**
 * Fisher-Yates shuffle for randomizing direction arrays.
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Quick BFS check to verify the maze has a valid path.
 */
function isSolvable(maze, start, end) {
  const rows = maze.length;
  const cols = maze[0].length;
  const visited = new Set();
  const queue = [start];
  visited.add(`${start[0]},${start[1]}`);
  const endKey = `${end[0]},${end[1]}`;

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    if (`${r},${c}` === endKey) return true;

    for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < cols &&
        maze[nr][nc] === 0 &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  return false;
}

/**
 * Forces a simple path from top-left to bottom-right
 * by carving a diagonal staircase pattern.
 */
function forcePath(maze, rows, cols) {
  let r = 0, c = 0;
  while (r < rows - 1 || c < cols - 1) {
    maze[r][c] = 0;
    if (r < rows - 1 && c < cols - 1) {
      // Randomly go right or down
      if (Math.random() < 0.5) {
        c++;
      } else {
        r++;
      }
    } else if (r < rows - 1) {
      r++;
    } else {
      c++;
    }
  }
  maze[rows - 1][cols - 1] = 0;
}

/**
 * Creates an empty maze (all open paths).
 */
export function createEmptyMaze(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

/**
 * Returns grid dimensions based on difficulty preset.
 */
export function getDifficultySize(difficulty) {
  switch (difficulty) {
    case 'easy':   return { rows: 11, cols: 11 };
    case 'medium': return { rows: 21, cols: 21 };
    case 'hard':   return { rows: 31, cols: 31 };
    default:       return { rows: 21, cols: 21 };
  }
}
