/**
 * Depth-First Search (DFS) Algorithm for Maze Solving
 * 
 * Strategy: Explores as deeply as possible along each branch before backtracking.
 * Uses a stack (iterative) to avoid call-stack overflow on large mazes.
 * 
 * Does NOT guarantee the shortest path.
 * 
 * Time Complexity:  O(V + E)
 * Space Complexity: O(V) for the stack and visited set
 */

const DIRECTIONS = [
  [0, 1],   // right
  [1, 0],   // down
  [0, -1],  // left
  [-1, 0],  // up
];

/**
 * Runs DFS on the maze and returns exploration steps and final path.
 * 
 * @param {number[][]} maze - 2D grid (0 = open, 1 = wall)
 * @param {[number, number]} start - Starting cell [row, col]
 * @param {[number, number]} end - Destination cell [row, col]
 * @returns {{ steps: Array, path: Array, visited: Set, executionTime: number }}
 */
export function dfs(maze, start, end) {
  const t0 = performance.now();

  const rows = maze.length;
  const cols = maze[0].length;

  // Stack stores [row, col] pairs for LIFO processing (depth-first)
  const stack = [];
  // Track visited cells
  const visited = new Set();
  // Parent map to reconstruct the path
  const parent = new Map();
  // Record every exploration step for animation
  const steps = [];

  const startKey = `${start[0]},${start[1]}`;
  const endKey = `${end[0]},${end[1]}`;

  stack.push(start);

  let found = false;

  // DFS main loop: always process the most recently added cell
  while (stack.length > 0) {
    const [row, col] = stack.pop();
    const currentKey = `${row},${col}`;

    // Skip if already visited (stack may contain duplicates)
    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    // Record this exploration step
    steps.push({ row, col, type: 'visit' });

    // Check if we've reached the destination
    if (currentKey === endKey) {
      found = true;
      break;
    }

    // Explore all 4 neighboring cells
    // Push in reverse order so that the first direction is processed first
    for (let i = DIRECTIONS.length - 1; i >= 0; i--) {
      const [dr, dc] = DIRECTIONS[i];
      const newRow = row + dr;
      const newCol = col + dc;
      const newKey = `${newRow},${newCol}`;

      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        maze[newRow][newCol] === 0 &&
        !visited.has(newKey)
      ) {
        parent.set(newKey, currentKey);
        stack.push([newRow, newCol]);
      }
    }
  }

  // Reconstruct the path by following parent pointers
  const path = [];
  if (found) {
    let current = endKey;
    while (current !== startKey) {
      const [r, c] = current.split(',').map(Number);
      path.unshift({ row: r, col: c });
      current = parent.get(current);
    }
    path.unshift({ row: start[0], col: start[1] });
  }

  const executionTime = performance.now() - t0;

  return {
    steps,
    path,
    visited,
    executionTime,
    found,
    algorithm: 'DFS',
  };
}
