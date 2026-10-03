/**
 * Breadth-First Search (BFS) Algorithm for Maze Solving
 * 
 * Strategy: Explores the maze level by level using a FIFO queue.
 * Guarantees the shortest path in an unweighted grid.
 * 
 * Time Complexity:  O(V + E) where V = cells, E = edges between cells
 * Space Complexity: O(V) for the queue and visited set
 */

// Possible movement directions: right, down, left, up
const DIRECTIONS = [
  [0, 1],   // right
  [1, 0],   // down
  [0, -1],  // left
  [-1, 0],  // up
];

/**
 * Runs BFS on the maze and returns the exploration steps and final path.
 * 
 * @param {number[][]} maze - 2D grid (0 = open, 1 = wall)
 * @param {[number, number]} start - Starting cell [row, col]
 * @param {[number, number]} end - Destination cell [row, col]
 * @returns {{ steps: Array, path: Array, visited: Set, executionTime: number }}
 */
export function bfs(maze, start, end) {
  const t0 = performance.now();

  const rows = maze.length;
  const cols = maze[0].length;

  // Queue stores [row, col] pairs for FIFO processing
  const queue = [];
  // Track visited cells to avoid revisiting
  const visited = new Set();
  // Parent map to reconstruct the shortest path
  const parent = new Map();
  // Record every exploration step for animation
  const steps = [];

  const startKey = `${start[0]},${start[1]}`;
  const endKey = `${end[0]},${end[1]}`;

  queue.push(start);
  visited.add(startKey);

  let found = false;

  // BFS main loop: process cells level by level
  while (queue.length > 0) {
    const [row, col] = queue.shift();
    const currentKey = `${row},${col}`;

    // Record this exploration step
    steps.push({ row, col, type: 'visit' });

    // Check if we've reached the destination
    if (currentKey === endKey) {
      found = true;
      break;
    }

    // Explore all 4 neighboring cells
    for (const [dr, dc] of DIRECTIONS) {
      const newRow = row + dr;
      const newCol = col + dc;
      const newKey = `${newRow},${newCol}`;

      // Check bounds, walls, and visited status
      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        maze[newRow][newCol] === 0 &&
        !visited.has(newKey)
      ) {
        visited.add(newKey);
        parent.set(newKey, currentKey);
        queue.push([newRow, newCol]);
      }
    }
  }

  // Reconstruct the shortest path by following parent pointers
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
    algorithm: 'BFS',
  };
}
