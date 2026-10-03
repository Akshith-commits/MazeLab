import React from 'react';

/**
 * Statistics – Game HUD style performance metrics.
 */
export default function Statistics({ stats }) {
  const items = [
    { label: 'Path', value: stats.pathLength !== null ? stats.pathLength : '—', id: 'stat-path-length' },
    { label: 'Visited', value: stats.visitedCells !== null ? stats.visitedCells : '—', id: 'stat-visited' },
    { label: 'Time', value: stats.executionTime !== null ? `${stats.executionTime.toFixed(2)}ms` : '—', id: 'stat-time' },
    { label: 'Steps', value: stats.explorationSteps !== null ? stats.explorationSteps : '—', id: 'stat-steps' },
  ];

  return (
    <div className="card">
      <div className="card__title">
        <span>📈</span> Performance
      </div>
      <div className="game-stats">
        {items.map(({ label, value, id }) => (
          <div className="game-stat" key={id} id={id}>
            <div className="game-stat__value">{value}</div>
            <div className="game-stat__label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
