/**
 * Maze utility constants and helpers
 */

// Cell type constants
export const CELL = {
  OPEN: 0,
  WALL: 1,
};

// Cell visual state for rendering
export const CELL_STATE = {
  OPEN: 'open',
  WALL: 'wall',
  START: 'start',
  END: 'end',
  VISITING: 'visiting',    // Currently being explored (yellow)
  VISITED: 'visited',      // Already explored (blue)
  PATH: 'path',            // Final solution path (purple)
  BACKTRACK: 'backtrack',  // Backtracking undo (faded)
};

// Algorithm status states
export const STATUS = {
  READY: 'Ready',
  RUNNING: 'Running',
  PAUSED: 'Paused',
  SOLVED: 'Solved',
  NO_PATH: 'No Path Found',
};

// Algorithm metadata for display
export const ALGORITHM_INFO = {
  BFS: {
    name: 'Breadth-First Search',
    shortName: 'BFS',
    description: 'Explores the maze level by level using a queue. Visits all cells at the current depth before moving deeper.',
    strategy: 'Level-by-level exploration',
    dataStructure: 'Queue (FIFO)',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    shortestPath: 'Yes – guaranteed for unweighted grids',
    color: '#3b82f6',
    icon: '🌊',
  },
  DFS: {
    name: 'Depth-First Search',
    shortName: 'DFS',
    description: 'Explores as deeply as possible along each branch before backtracking. Prioritizes depth over breadth.',
    strategy: 'Go deep, then backtrack',
    dataStructure: 'Stack (LIFO)',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    shortestPath: 'Not guaranteed',
    color: '#8b5cf6',
    icon: '🔍',
  },
  Backtracking: {
    name: 'Backtracking',
    shortName: 'Backtracking',
    description: 'Builds a solution incrementally, trying each direction. When a dead end is reached, it undoes the last decision and tries the next option.',
    strategy: 'Try → Check → Undo',
    dataStructure: 'Recursion stack',
    timeComplexity: 'Potentially exponential',
    spaceComplexity: 'O(recursion depth)',
    shortestPath: 'Not guaranteed',
    color: '#f59e0b',
    icon: '🔄',
  },
};

/**
 * Deep-clones a 2D maze array.
 */
export function cloneMaze(maze) {
  return maze.map(row => [...row]);
}
