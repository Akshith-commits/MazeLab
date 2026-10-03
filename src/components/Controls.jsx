import React from 'react';

/**
 * Controls – Game-style control panel.
 * Large START button, game-like difficulty levels, and maze actions.
 */
export default function Controls({
  difficulty,
  onDifficultyChange,
  rows,
  cols,
  onRowsChange,
  onColsChange,
  speed,
  onSpeedChange,
  isCustomMode,
  onCustomModeToggle,
  isRunning,
  isPaused,
  isSolved,
  selectedAlgorithm,
  onGenerate,
  onClear,
  onReset,
  onSolve,
  onPause,
  onResume,
  onStep,
}) {
  const canSolve = selectedAlgorithm && !isRunning;
  const canStep = selectedAlgorithm && (!isRunning || isPaused);

  return (
    <div className="card">
      <div className="card__title">
        <span>🎮</span> Controls
      </div>

      <div className="controls">
        {/* Difficulty – game levels */}
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600, letterSpacing: '0.5px' }}>
            DIFFICULTY
          </div>
          <div className="difficulty">
            {[
              { key: 'easy', icon: '🌱', label: 'Easy' },
              { key: 'medium', icon: '🌲', label: 'Medium' },
              { key: 'hard', icon: '🔥', label: 'Hard' },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                className={`difficulty__btn${difficulty === key ? ' difficulty__btn--active' : ''}`}
                onClick={() => onDifficultyChange(key)}
                disabled={isRunning}
                id={`difficulty-${key}`}
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Size */}
        <div className="grid-control">
          <span className="grid-control__label">Grid:</span>
          <input
            className="grid-control__input"
            type="number"
            min="5" max="51" step="2"
            value={rows}
            onChange={(e) => onRowsChange(parseInt(e.target.value) || 5)}
            disabled={isRunning}
            id="input-rows"
          />
          <span className="grid-control__x">×</span>
          <input
            className="grid-control__input"
            type="number"
            min="5" max="51" step="2"
            value={cols}
            onChange={(e) => onColsChange(parseInt(e.target.value) || 5)}
            disabled={isRunning}
            id="input-cols"
          />
        </div>

        <div className="divider" />

        {/* Maze Actions */}
        <div className="controls__row">
          <button className="btn btn--generate" onClick={onGenerate} disabled={isRunning} id="btn-generate">
            <span className="btn__icon">🎲</span> New Maze
          </button>
          <button className="btn" onClick={onClear} disabled={isRunning} id="btn-clear">
            <span className="btn__icon">🧹</span> Clear
          </button>
          <button className="btn btn--danger" onClick={onReset} id="btn-reset">
            <span className="btn__icon">↻</span> Reset
          </button>
        </div>

        <div className="divider" />

        {/* Main Solve / Pause */}
        <div className="controls__row">
          {!isRunning || isPaused ? (
            <button
              className="btn btn--start btn--full"
              onClick={isPaused ? onResume : onSolve}
              disabled={!canSolve && !isPaused}
              id="btn-solve"
            >
              <span className="btn__icon">▶</span>
              {isPaused ? 'RESUME' : 'START'}
            </button>
          ) : (
            <button className="btn btn--pause btn--full" onClick={onPause} id="btn-pause">
              <span className="btn__icon">⏸</span> PAUSE
            </button>
          )}
        </div>

        <div className="controls__row">
          <button className="btn btn--full" onClick={onStep} disabled={!canStep} id="btn-step">
            <span className="btn__icon">⏭</span> STEP
          </button>
        </div>

        <div className="divider" />

        {/* Speed */}
        <div className="speed-control">
          <span className="speed-control__label">Speed</span>
          <input
            className="speed-control__slider"
            type="range" min="1" max="100"
            value={speed}
            onChange={(e) => onSpeedChange(parseInt(e.target.value))}
            id="slider-speed"
          />
          <span className="speed-control__value">{speed}%</span>
        </div>

        <div className="divider" />

        {/* Custom Mode */}
        <div className="custom-toggle" onClick={isRunning ? undefined : onCustomModeToggle}>
          <button
            className={`custom-toggle__switch${isCustomMode ? ' custom-toggle__switch--active' : ''}`}
            disabled={isRunning}
            id="toggle-custom"
            aria-label="Toggle custom maze mode"
          />
          <span>Custom Maze</span>
        </div>
        {isCustomMode && (
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Click cells to toggle walls. Start and End are locked.
          </div>
        )}
      </div>
    </div>
  );
}
