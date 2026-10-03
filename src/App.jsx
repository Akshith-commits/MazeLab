import React, { useState, useCallback, useRef, useEffect } from 'react';
import MazeGrid from './components/MazeGrid.jsx';
import Legend from './components/Legend.jsx';
import AlgorithmSelector from './components/AlgorithmSelector.jsx';
import Controls from './components/Controls.jsx';
import Statistics from './components/Statistics.jsx';
import Comparison from './components/Comparison.jsx';
import AlgorithmInfo from './components/AlgorithmInfo.jsx';
import { generateMaze, createEmptyMaze, getDifficultySize } from './utils/mazeGenerator.js';
import { CELL_STATE, STATUS, cloneMaze } from './utils/mazeUtils.js';
import { bfs } from './algorithms/bfs.js';
import { dfs } from './algorithms/dfs.js';
import { backtracking } from './algorithms/backtracking.js';

/**
 * App – Main orchestrator for MazeLab.
 *
 * Manages maze state, algorithm execution, step-by-step animation,
 * pause/resume, comparison mode, player position tracking, success panel,
 * and toast notifications.
 *
 * All algorithm logic is preserved exactly as originally implemented.
 */
export default function App() {
  // ---- Maze State ----
  const [maze, setMaze] = useState(null);
  const [rows, setRows] = useState(21);
  const [cols, setCols] = useState(21);
  const [difficulty, setDifficulty] = useState('medium');
  const [start, setStart] = useState([0, 0]);
  const [end, setEnd] = useState([20, 20]);

  // ---- Algorithm & Animation State ----
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('BFS');
  const [cellStates, setCellStates] = useState({});
  const [status, setStatus] = useState(STATUS.READY);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // ---- Player & Success ----
  const [playerPosition, setPlayerPosition] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  // ---- Statistics ----
  const [stats, setStats] = useState({
    pathLength: null,
    visitedCells: null,
    executionTime: null,
    explorationSteps: null,
  });

  // ---- Comparison ----
  const [comparisonResults, setComparisonResults] = useState([]);

  // ---- Active Tab ----
  const [activeTab, setActiveTab] = useState('visualizer');

  // ---- Toast Notifications ----
  const [toasts, setToasts] = useState([]);

  // ---- Refs for animation control ----
  const animationRef = useRef(null);
  const stepsRef = useRef([]);
  const pathRef = useRef([]);
  const stepIndexRef = useRef(0);
  const isPausedRef = useRef(false);
  const isRunningRef = useRef(false);
  const cellStatesRef = useRef({});

  // Keep refs in sync with state
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // ---- Toast Helper ----
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // ---- Generate Maze ----
  const handleGenerate = useCallback(() => {
    // Ensure odd dimensions for proper maze generation
    const r = rows % 2 === 0 ? rows + 1 : rows;
    const c = cols % 2 === 0 ? cols + 1 : cols;
    setRows(r);
    setCols(c);

    const newMaze = generateMaze(r, c, difficulty);
    setMaze(newMaze);
    setStart([0, 0]);
    setEnd([r - 1, c - 1]);
    setCellStates({});
    cellStatesRef.current = {};
    setPlayerPosition([0, 0]);
    setShowSuccess(false);
    setSuccessInfo(null);
    setStats({ pathLength: null, visitedCells: null, executionTime: null, explorationSteps: null });
    setComparisonResults([]);
    setStatus(STATUS.READY);
    setIsRunning(false);
    setIsPaused(false);
    cancelAnimation();
    addToast('New maze generated!', 'success');
  }, [rows, cols, difficulty, addToast]);

  // Generate initial maze on mount
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Difficulty Change ----
  const handleDifficultyChange = useCallback((d) => {
    setDifficulty(d);
    const { rows: r, cols: c } = getDifficultySize(d);
    setRows(r);
    setCols(c);
  }, []);

  // ---- Clear Maze (remove all visualization, keep walls) ----
  const handleClear = useCallback(() => {
    setCellStates({});
    cellStatesRef.current = {};
    setPlayerPosition(null);
    setShowSuccess(false);
    setStats({ pathLength: null, visitedCells: null, executionTime: null, explorationSteps: null });
    setStatus(STATUS.READY);
    setIsRunning(false);
    setIsPaused(false);
    cancelAnimation();
  }, []);

  // ---- Full Reset ----
  const handleReset = useCallback(() => {
    cancelAnimation();
    setIsRunning(false);
    setIsPaused(false);
    setCellStates({});
    cellStatesRef.current = {};
    setPlayerPosition(null);
    setShowSuccess(false);
    setSuccessInfo(null);
    setStats({ pathLength: null, visitedCells: null, executionTime: null, explorationSteps: null });
    setComparisonResults([]);
    setStatus(STATUS.READY);
    addToast('Reset complete', 'info');
  }, [addToast]);

  // ---- Cancel Animation ----
  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // ---- Speed to delay mapping (1-100 → 200ms-1ms) ----
  const getDelay = useCallback(() => {
    // Exponential mapping: low speed = slow (200ms), high speed = fast (1ms)
    return Math.max(1, Math.floor(200 * Math.pow(0.96, speed)));
  }, [speed]);

  // ---- Cell Click (Custom Mode) ----
  const handleCellClick = useCallback((r, c) => {
    if (!maze) return;
    const newMaze = cloneMaze(maze);
    newMaze[r][c] = newMaze[r][c] === 0 ? 1 : 0;
    setMaze(newMaze);
  }, [maze]);

  // ---- Get Algorithm Function ----
  const getAlgorithmFn = useCallback((algo) => {
    switch (algo) {
      case 'BFS': return bfs;
      case 'DFS': return dfs;
      case 'Backtracking': return backtracking;
      default: return null;
    }
  }, []);

  // ---- Animate Steps ----
  const animateSteps = useCallback((steps, path, result, onComplete) => {
    stepIndexRef.current = 0;
    stepsRef.current = steps;
    pathRef.current = path;

    const animate = () => {
      // Check if paused
      if (isPausedRef.current) {
        animationRef.current = setTimeout(animate, 100);
        return;
      }

      const idx = stepIndexRef.current;

      if (idx < steps.length) {
        const step = steps[idx];
        const key = `${step.row},${step.col}`;

        // Don't overwrite start/end visual states
        const isStart = step.row === start[0] && step.col === start[1];
        const isEnd = step.row === end[0] && step.col === end[1];

        if (!isStart && !isEnd) {
          cellStatesRef.current = {
            ...cellStatesRef.current,
            [key]: step.type === 'backtrack' ? CELL_STATE.BACKTRACK : CELL_STATE.VISITING,
          };

          // Mark previous visiting cells as visited (except current)
          if (step.type !== 'backtrack') {
            const updated = { ...cellStatesRef.current };
            for (const k of Object.keys(updated)) {
              if (updated[k] === CELL_STATE.VISITING && k !== key) {
                updated[k] = CELL_STATE.VISITED;
              }
            }
            updated[key] = CELL_STATE.VISITING;
            cellStatesRef.current = updated;
          }

          setCellStates({ ...cellStatesRef.current });
        }

        // Move the 🧙 player to the current exploration cell
        setPlayerPosition([step.row, step.col]);

        stepIndexRef.current++;
        animationRef.current = setTimeout(animate, getDelay());
      } else {
        // Exploration done — now animate the path
        animatePath(path, result, onComplete);
      }
    };

    animate();
  }, [start, end, getDelay]);

  // ---- Animate Final Path ----
  const animatePath = useCallback((path, result, onComplete) => {
    if (!result.found || path.length === 0) {
      setStatus(STATUS.NO_PATH);
      setIsRunning(false);
      isRunningRef.current = false;
      addToast('No path exists between start and destination.', 'error');
      if (onComplete) onComplete();
      return;
    }

    let pathIdx = 0;

    // First mark all visiting as visited
    const cleaned = { ...cellStatesRef.current };
    for (const k of Object.keys(cleaned)) {
      if (cleaned[k] === CELL_STATE.VISITING) {
        cleaned[k] = CELL_STATE.VISITED;
      }
    }
    cellStatesRef.current = cleaned;
    setCellStates({ ...cellStatesRef.current });

    const animPath = () => {
      if (isPausedRef.current) {
        animationRef.current = setTimeout(animPath, 100);
        return;
      }

      if (pathIdx < path.length) {
        const { row, col } = path[pathIdx];
        const key = `${row},${col}`;
        const isStartCell = row === start[0] && col === start[1];
        const isEndCell = row === end[0] && col === end[1];

        if (!isStartCell && !isEndCell) {
          cellStatesRef.current = {
            ...cellStatesRef.current,
            [key]: CELL_STATE.PATH,
          };
          setCellStates({ ...cellStatesRef.current });
        }

        // Move the 🧙 player along the solution path
        setPlayerPosition([row, col]);

        pathIdx++;
        animationRef.current = setTimeout(animPath, getDelay() * 1.5);
      } else {
        // Animation complete — show success
        setStatus(STATUS.SOLVED);
        setIsRunning(false);
        isRunningRef.current = false;
        setStats({
          pathLength: result.path.length,
          visitedCells: result.visited.size,
          executionTime: result.executionTime,
          explorationSteps: result.steps.length,
        });
        setShowSuccess(true);
        setSuccessInfo({
          algorithm: result.algorithm,
          pathLength: result.path.length,
          visitedCells: result.visited.size,
          executionTime: result.executionTime,
        });
        addToast(`${result.algorithm} found a path of length ${result.path.length}!`, 'success');
        if (onComplete) onComplete();
      }
    };

    animPath();
  }, [start, end, getDelay, addToast]);

  // ---- Solve ----
  const handleSolve = useCallback(() => {
    if (!maze) {
      addToast('Generate a maze first!', 'error');
      return;
    }

    if (isRunningRef.current) {
      addToast('An algorithm is already running!', 'error');
      return;
    }

    // Clear previous visualization
    setCellStates({});
    cellStatesRef.current = {};
    setComparisonResults([]);
    setShowSuccess(false);
    setSuccessInfo(null);
    setPlayerPosition(start);

    if (selectedAlgorithm === 'CompareAll') {
      // Compare mode: run all algorithms instantly, show comparison
      handleCompareAll();
      return;
    }

    const algoFn = getAlgorithmFn(selectedAlgorithm);
    if (!algoFn) {
      addToast('Select an algorithm first!', 'error');
      return;
    }

    setIsRunning(true);
    isRunningRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;
    setStatus(`Running ${selectedAlgorithm}...`);

    // Run algorithm to get all steps (instant computation)
    const result = algoFn(maze, start, end);

    // Animate step by step
    animateSteps(result.steps, result.path, result);
  }, [maze, selectedAlgorithm, start, end, getAlgorithmFn, animateSteps, addToast]);

  // ---- Compare All ----
  const handleCompareAll = useCallback(() => {
    if (!maze) return;

    setIsRunning(true);
    isRunningRef.current = true;
    setStatus('Comparing algorithms...');
    setPlayerPosition(null);

    // Run all three algorithms on the same maze
    const bfsResult = bfs(maze, start, end);
    const dfsResult = dfs(maze, start, end);
    const btResult = backtracking(maze, start, end);

    const results = [bfsResult, dfsResult, btResult];
    setComparisonResults(results);

    // Show the BFS result as the default visualization
    const defaultResult = bfsResult;
    const newStates = {};

    // Mark visited cells
    for (const step of defaultResult.steps) {
      const key = `${step.row},${step.col}`;
      const isStartCell = step.row === start[0] && step.col === start[1];
      const isEndCell = step.row === end[0] && step.col === end[1];
      if (!isStartCell && !isEndCell) {
        newStates[key] = CELL_STATE.VISITED;
      }
    }

    // Mark path
    for (const { row, col } of defaultResult.path) {
      const key = `${row},${col}`;
      const isStartCell = row === start[0] && col === start[1];
      const isEndCell = row === end[0] && col === end[1];
      if (!isStartCell && !isEndCell) {
        newStates[key] = CELL_STATE.PATH;
      }
    }

    cellStatesRef.current = newStates;
    setCellStates(newStates);

    setStats({
      pathLength: defaultResult.path.length,
      visitedCells: defaultResult.visited.size,
      executionTime: defaultResult.executionTime,
      explorationSteps: defaultResult.steps.length,
    });

    setIsRunning(false);
    isRunningRef.current = false;
    setStatus(STATUS.SOLVED);
    setActiveTab('compare');
    addToast('Comparison complete! All algorithms ran on the same maze.', 'success');
  }, [maze, start, end, addToast]);

  // ---- Pause/Resume ----
  const handlePause = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
    setStatus(STATUS.PAUSED);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    isPausedRef.current = false;
    setStatus(`Running ${selectedAlgorithm}...`);
  }, [selectedAlgorithm]);

  // ---- Step Mode ----
  const handleStep = useCallback(() => {
    if (!maze) {
      addToast('Generate a maze first!', 'error');
      return;
    }

    // If not started yet, initialize
    if (!isRunningRef.current) {
      if (selectedAlgorithm === 'CompareAll') {
        addToast('Step mode is not available in Compare All mode.', 'error');
        return;
      }

      const algoFn = getAlgorithmFn(selectedAlgorithm);
      if (!algoFn) {
        addToast('Select an algorithm first!', 'error');
        return;
      }

      // Clear previous
      setCellStates({});
      cellStatesRef.current = {};
      setShowSuccess(false);
      setSuccessInfo(null);
      setPlayerPosition(start);

      // Run algorithm to get steps
      const result = algoFn(maze, start, end);
      stepsRef.current = result.steps;
      pathRef.current = result.path;
      stepIndexRef.current = 0;

      setIsRunning(true);
      isRunningRef.current = true;
      setIsPaused(true);
      isPausedRef.current = true;
      setStatus(STATUS.PAUSED);

      // Store result for later
      stepsRef.current._result = result;
    }

    // Execute next step
    const steps = stepsRef.current;
    const idx = stepIndexRef.current;

    if (idx < steps.length) {
      const step = steps[idx];
      const key = `${step.row},${step.col}`;
      const isStartCell = step.row === start[0] && step.col === start[1];
      const isEndCell = step.row === end[0] && step.col === end[1];

      if (!isStartCell && !isEndCell) {
        // Mark previous visiting as visited
        const updated = { ...cellStatesRef.current };
        for (const k of Object.keys(updated)) {
          if (updated[k] === CELL_STATE.VISITING) {
            updated[k] = CELL_STATE.VISITED;
          }
        }

        if (step.type === 'backtrack') {
          updated[key] = CELL_STATE.BACKTRACK;
        } else {
          updated[key] = CELL_STATE.VISITING;
        }

        cellStatesRef.current = updated;
        setCellStates({ ...updated });
      }

      // Move the 🧙 player
      setPlayerPosition([step.row, step.col]);

      stepIndexRef.current++;
    } else {
      // Exploration done — show path
      const result = stepsRef.current._result;
      if (result && result.found) {
        // Mark all visiting as visited
        const cleaned = { ...cellStatesRef.current };
        for (const k of Object.keys(cleaned)) {
          if (cleaned[k] === CELL_STATE.VISITING) {
            cleaned[k] = CELL_STATE.VISITED;
          }
        }

        // Mark path
        for (const { row, col } of result.path) {
          const pk = `${row},${col}`;
          const isS = row === start[0] && col === start[1];
          const isE = row === end[0] && col === end[1];
          if (!isS && !isE) {
            cleaned[pk] = CELL_STATE.PATH;
          }
        }

        cellStatesRef.current = cleaned;
        setCellStates({ ...cleaned });

        setStats({
          pathLength: result.path.length,
          visitedCells: result.visited.size,
          executionTime: result.executionTime,
          explorationSteps: result.steps.length,
        });

        setStatus(STATUS.SOLVED);
        setIsRunning(false);
        isRunningRef.current = false;
        setIsPaused(false);
        isPausedRef.current = false;
        setShowSuccess(true);
        setSuccessInfo({
          algorithm: result.algorithm,
          pathLength: result.path.length,
          visitedCells: result.visited.size,
          executionTime: result.executionTime,
        });
        addToast(`${result.algorithm} solved! Path length: ${result.path.length}`, 'success');
      } else {
        setStatus(STATUS.NO_PATH);
        setIsRunning(false);
        isRunningRef.current = false;
        setIsPaused(false);
        addToast('No path exists between start and destination.', 'error');
      }
    }
  }, [maze, selectedAlgorithm, start, end, getAlgorithmFn, addToast]);

  // ---- Custom Mode Toggle ----
  const handleCustomModeToggle = useCallback(() => {
    setIsCustomMode((prev) => !prev);
    if (!isCustomMode && !maze) {
      const newMaze = createEmptyMaze(rows, cols);
      setMaze(newMaze);
      setStart([0, 0]);
      setEnd([rows - 1, cols - 1]);
    }
    handleClear();
  }, [isCustomMode, maze, rows, cols, handleClear]);

  // ---- HUD Helpers ----
  const getAlgoLabel = () => {
    switch (selectedAlgorithm) {
      case 'BFS': return '🧭 BFS';
      case 'DFS': return '🧭 DFS';
      case 'Backtracking': return '🧭 BACKTRACK';
      case 'CompareAll': return '⚔️ COMPARE';
      default: return '🧭 —';
    }
  };

  const getStatusDotClass = () => {
    if (status === STATUS.READY) return 'hud-dot--ready';
    if (status === STATUS.PAUSED) return 'hud-dot--paused';
    if (status === STATUS.SOLVED) return 'hud-dot--solved';
    if (status === STATUS.NO_PATH) return 'hud-dot--no-path';
    if (typeof status === 'string' && (status.includes('Running') || status.includes('Comparing'))) return 'hud-dot--running';
    return '';
  };

  const getStatusLabel = () => {
    if (status === STATUS.READY) return 'READY';
    if (status === STATUS.PAUSED) return 'PAUSED';
    if (status === STATUS.SOLVED) return 'PATH FOUND';
    if (status === STATUS.NO_PATH) return 'NO PATH';
    if (typeof status === 'string' && status.includes('Running')) return 'EXPLORING';
    if (typeof status === 'string' && status.includes('Comparing')) return 'COMPARING';
    return 'READY';
  };

  return (
    <div className="app">
      {/* ---- Hero Section ---- */}
      <header className="hero">
        <div className="hero__badge">🧭 DAA Algorithm Visualizer</div>
        <h1 className="hero__title">MAZELAB</h1>
        <p className="hero__subtitle">Can you escape the maze?</p>
        <p className="hero__tagline">Watch algorithms think, explore, and find their way.</p>

        <div className="nav-tabs__wrapper">
          <div className="nav-tabs">
            <button
              className={`nav-tab${activeTab === 'visualizer' ? ' nav-tab--active' : ''}`}
              onClick={() => setActiveTab('visualizer')}
              id="tab-visualizer"
            >
              🔬 Visualizer
            </button>
            <button
              className={`nav-tab${activeTab === 'compare' ? ' nav-tab--active' : ''}`}
              onClick={() => setActiveTab('compare')}
              id="tab-compare"
            >
              ⚔️ Compare
            </button>
            <button
              className={`nav-tab${activeTab === 'about' ? ' nav-tab--active' : ''}`}
              onClick={() => setActiveTab('about')}
              id="tab-about"
            >
              📚 Algorithms
            </button>
          </div>
        </div>
      </header>

      {/* ---- Game HUD ---- */}
      <div className="game-hud" id="game-hud">
        <div className="hud-mode">{getAlgoLabel()}</div>
        <div className="hud-divider" />
        <div className="hud-status">
          <div className={`hud-dot ${getStatusDotClass()}`} />
          <span className="hud-label">{getStatusLabel()}</span>
        </div>
        <div className="hud-divider" />
        <div className="hud-stat">
          <span className="hud-stat__value">{stats.pathLength !== null ? stats.pathLength : '—'}</span>
          <span className="hud-stat__label">Path</span>
        </div>
        <div className="hud-stat">
          <span className="hud-stat__value">{stats.visitedCells !== null ? stats.visitedCells : '—'}</span>
          <span className="hud-stat__label">Visited</span>
        </div>
        <div className="hud-stat">
          <span className="hud-stat__value">{stats.executionTime !== null ? `${stats.executionTime.toFixed(1)}` : '—'}</span>
          <span className="hud-stat__label">ms</span>
        </div>
      </div>

      {/* ---- Visualizer Tab ---- */}
      {activeTab === 'visualizer' && (
        <>
          <div className="main-layout">
            {/* Left: Maze Board */}
            <div>
              {maze ? (
                <>
                  <MazeGrid
                    maze={maze}
                    cellStates={cellStates}
                    start={start}
                    end={end}
                    isCustomMode={isCustomMode}
                    onCellClick={handleCellClick}
                    isRunning={isRunning}
                    playerPosition={playerPosition}
                  />
                  <div style={{ marginTop: 12 }}>
                    <Legend />
                  </div>
                </>
              ) : (
                <div className="card">
                  <div className="empty-state">
                    <div className="empty-state__icon">🧩</div>
                    <div className="empty-state__text">
                      Click "New Maze" to create a maze and start visualizing algorithms.
                    </div>
                  </div>
                </div>
              )}

              {/* Success Panel – appears after solving */}
              {showSuccess && successInfo && (
                <div className="success-panel">
                  <div className="success-panel__icon">🎉</div>
                  <div className="success-panel__title">MAZE SOLVED!</div>
                  <div className="success-panel__desc">
                    {successInfo.algorithm} found the destination in {successInfo.pathLength} moves.
                  </div>
                  <div className="success-panel__stats">
                    <div className="success-panel__stat">
                      <div className="success-panel__stat-val">{successInfo.visitedCells}</div>
                      <div className="success-panel__stat-label">Visited</div>
                    </div>
                    <div className="success-panel__stat">
                      <div className="success-panel__stat-val">{successInfo.executionTime.toFixed(2)}ms</div>
                      <div className="success-panel__stat-label">Time</div>
                    </div>
                    <div className="success-panel__stat">
                      <div className="success-panel__stat-val">{successInfo.pathLength}</div>
                      <div className="success-panel__stat-label">Path</div>
                    </div>
                  </div>
                  <div className="success-panel__actions">
                    <button
                      className="btn btn--start"
                      onClick={() => {
                        setShowSuccess(false);
                        setSelectedAlgorithm('CompareAll');
                        handleCompareAll();
                      }}
                    >
                      <span className="btn__icon">⚔️</span> Compare Algorithms
                    </button>
                    <button
                      className="btn"
                      onClick={() => {
                        setShowSuccess(false);
                        handleReset();
                      }}
                    >
                      <span className="btn__icon">↻</span> Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="sidebar">
              <AlgorithmSelector
                selectedAlgorithm={selectedAlgorithm}
                onSelect={setSelectedAlgorithm}
                isRunning={isRunning}
              />
              <Controls
                difficulty={difficulty}
                onDifficultyChange={handleDifficultyChange}
                rows={rows}
                cols={cols}
                onRowsChange={setRows}
                onColsChange={setCols}
                speed={speed}
                onSpeedChange={setSpeed}
                isCustomMode={isCustomMode}
                onCustomModeToggle={handleCustomModeToggle}
                isRunning={isRunning}
                isPaused={isPaused}
                isSolved={status === STATUS.SOLVED}
                selectedAlgorithm={selectedAlgorithm}
                onGenerate={handleGenerate}
                onClear={handleClear}
                onReset={handleReset}
                onSolve={handleSolve}
                onPause={handlePause}
                onResume={handleResume}
                onStep={handleStep}
              />
            </div>
          </div>

          {/* Bottom: Statistics */}
          <div className="bottom-section">
            <Statistics stats={stats} />
          </div>
        </>
      )}

      {/* ---- Compare Tab ---- */}
      {activeTab === 'compare' && (
        <div className="bottom-section" style={{ marginTop: 20 }}>
          <Comparison results={comparisonResults} />
          {maze && (
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button
                className="btn btn--start"
                onClick={() => {
                  setSelectedAlgorithm('CompareAll');
                  handleCompareAll();
                }}
                disabled={isRunning}
                id="btn-run-comparison"
              >
                <span className="btn__icon">⚔️</span>
                Run Comparison on Current Maze
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---- About Tab ---- */}
      {activeTab === 'about' && (
        <div className="bottom-section" style={{ marginTop: 20 }}>
          <AlgorithmInfo />
        </div>
      )}

      {/* ---- Toast Notifications ---- */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div className={`toast toast--${toast.type}`} key={toast.id}>
            <span className="toast__icon">
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
