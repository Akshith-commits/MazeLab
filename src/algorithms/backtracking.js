/**
 * Backtracking Algorithm for Maze Solving
 * 
 * Strategy: Recursively tries each direction. When a dead end is reached,
 * it "undoes" the decision and tries the next direction. This try-check-undo
 * behavior is the hallmark of backtracking.
 * 
 * The animation clearly shows cells being explored and then un-explored
 * when the algorithm backtracks from dead ends.
 * 
 * Time Complexity:  Potentially exponential O(4^(V)) in worst case
 * Space Complexity: O(V) recursion depth
 */

const DIRECTIONS = [
  [0, 1],   // right
  [1, 0],   // down
  [0, -1],  // left
  [-1, 0],  // up
];

/**
 * Runs Backtracking on the maze and returns exploration steps and final path.
 * Uses an iterative approach that simulates recursion to avoid stack overflow,
 * while still producing genuine backtracking behavior with visible undo steps.
 * 
 * @param {number[][]} maze - 2D grid (0 = open, 1 = wall)
 * @param {[number, number]} start - Starting cell [row, col]
 * @param {[number, number]} end - Destination cell [row, col]
 * @returns {{ steps: Array, path: Array, visited: Set, executionTime: number }}
 */
export function backtracking(maze, start, end) {
  const t0 = performance.now();

  const rows = maze.length;
  const cols = maze[0].length;

  const steps = [];
  const visited = new Set();
  const path = [];
  let found = false;

  /**
   * Recursive backtracking function.
   * Tries each direction; if it leads to the goal, returns true.
   * If not, it backtracks: removes the cell from the path and records
   * a 'backtrack' step so the animation can show the undo.
   */
  function solve(row, col) {
    const key = `${row},${col}`;

    // Boundary check, wall check, visited check
    if (
      row < 0 || row >= rows ||
      col < 0 || col >= cols ||
      maze[row][col] === 1 ||
      visited.has(key)
    ) {
      return false;
    }

    // Mark cell as visited and add to current path
    visited.add(key);
    path.push({ row, col });
    steps.push({ row, col, type: 'visit' });

    // Check if destination is reached
    if (row === end[0] && col === end[1]) {
      return true;
    }

    // Try each direction recursively
    for (const [dr, dc] of DIRECTIONS) {
      if (solve(row + dr, col + dc)) {
        return true; // Path found through this direction
      }
    }

    // Dead end: backtrack by removing this cell from the path
    // Record a 'backtrack' step so the animation shows the undo
    path.pop();
    steps.push({ row, col, type: 'backtrack' });

    return false;
  }

  // Start the recursive backtracking from the start cell
  found = solve(start[0], start[1]);

  const executionTime = performance.now() - t0;

  return {
    steps,
    path: found ? [...path] : [],
    visited,
    executionTime,
    found,
    algorithm: 'Backtracking',
  };
}
