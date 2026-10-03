import React, { useMemo } from 'react';
import { CELL_STATE } from '../utils/mazeUtils';

/**
 * MazeGrid – Game-style maze board with emoji cells and animated player overlay.
 *
 * Walls display 🧱, destination displays 🏁, exploring cells show 🔥,
 * visited cells show 👣, and the final path shows ✨.
 *
 * The 🧙 player is rendered as an absolutely-positioned overlay that smoothly
 * transitions from cell to cell, driven by the algorithm's exploration steps.
 */
export default function MazeGrid({
  maze,
  cellStates,
  start,
  end,
  isCustomMode,
  onCellClick,
  isRunning,
  playerPosition,
}) {
  if (!maze || maze.length === 0) return null;

  const rows = maze.length;
  const cols = maze[0].length;

  // Dynamic cell sizing: fit within a max grid area
  const maxGridSize = 580;
  const cellSize = Math.max(8, Math.min(28, Math.floor(maxGridSize / Math.max(rows, cols))));

  // Emoji sizing relative to cell
  const emojiSize = Math.max(6, Math.floor(cellSize * 0.6));
  const playerEmojiSize = Math.max(10, Math.floor(cellSize * 0.78));
  const showWallEmoji = cellSize >= 13;

  // Grid layout constants (must match CSS)
  const gridGap = 2;
  const gridPadding = 3;

  // Compute player overlay pixel position
  const playerStyle = useMemo(() => {
    if (!playerPosition) return null;
    const [pr, pc] = playerPosition;
    return {
      position: 'absolute',
      top: gridPadding + pr * (cellSize + gridGap),
      left: gridPadding + pc * (cellSize + gridGap),
      width: cellSize,
      height: cellSize,
      transition: 'top 0.14s ease-out, left 0.14s ease-out',
      zIndex: 10,
    };
  }, [playerPosition, cellSize, gridGap, gridPadding]);

  const getCellClass = (r, c) => {
    const isStart = r === start[0] && c === start[1];
    const isEnd = r === end[0] && c === end[1];

    if (isStart) return 'maze-cell maze-cell--start';
    if (isEnd) return 'maze-cell maze-cell--end';

    const key = `${r},${c}`;
    const state = cellStates[key];

    if (state === CELL_STATE.PATH) return 'maze-cell maze-cell--path';
    if (state === CELL_STATE.VISITING) return 'maze-cell maze-cell--visiting';
    if (state === CELL_STATE.VISITED) return 'maze-cell maze-cell--visited';
    if (state === CELL_STATE.BACKTRACK) return 'maze-cell maze-cell--backtrack';

    if (maze[r][c] === 1) return 'maze-cell maze-cell--wall';

    const editable = isCustomMode && !isRunning ? ' maze-cell--editable' : '';
    return `maze-cell maze-cell--open${editable}`;
  };

  /**
   * Returns the emoji content for a cell, or null for empty cells.
   */
  const getCellEmoji = (r, c) => {
    const isStart = r === start[0] && c === start[1];
    const isEnd = r === end[0] && c === end[1];

    if (isEnd) return { emoji: '🏁', cls: 'cell-emoji--end' };
    if (isStart) return null; // Player overlay handles start

    const key = `${r},${c}`;
    const state = cellStates[key];

    if (state === CELL_STATE.PATH) return { emoji: '✨', cls: 'cell-emoji--sparkle' };
    if (state === CELL_STATE.VISITING) return { emoji: '🔥', cls: 'cell-emoji--fire' };
    if (state === CELL_STATE.VISITED) return { emoji: '👣', cls: 'cell-emoji--footprint' };
    if (state === CELL_STATE.BACKTRACK) return { emoji: '👣', cls: 'cell-emoji--footprint' };

    if (maze[r][c] === 1 && showWallEmoji) return { emoji: '🧱', cls: 'cell-emoji--wall' };

    return null;
  };

  const handleClick = (r, c) => {
    if (!isCustomMode || isRunning) return;
    if (r === start[0] && c === start[1]) return;
    if (r === end[0] && c === end[1]) return;
    onCellClick(r, c);
  };

  return (
    <div className="maze-board">
      <div className="maze-board__grid-wrapper">
        <div
          className="maze-grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            gap: `${gridGap}px`,
            padding: `${gridPadding}px`,
          }}
        >
          {maze.map((row, r) =>
            row.map((_, c) => {
              const emojiData = getCellEmoji(r, c);
              return (
                <div
                  key={`${r}-${c}`}
                  className={getCellClass(r, c)}
                  style={{ width: cellSize, height: cellSize }}
                  onClick={() => handleClick(r, c)}
                >
                  {emojiData && (
                    <span
                      className={`cell-emoji ${emojiData.cls}`}
                      style={{ fontSize: emojiSize }}
                    >
                      {emojiData.emoji}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Player Overlay – 🧙 smoothly transitions between cells */}
        {playerStyle && (
          <div className="player-overlay" style={playerStyle}>
            <span className="player-emoji" style={{ fontSize: playerEmojiSize }}>
              🧙
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
