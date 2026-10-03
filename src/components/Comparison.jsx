import React from 'react';
import { ALGORITHM_INFO } from '../utils/mazeUtils';

/**
 * Comparison – "Algorithm Battle" styled comparison with table and bar charts.
 */
export default function Comparison({ results }) {
  if (!results || results.length === 0) {
    return (
      <div className="card">
        <div className="battle-header">
          <div className="battle-header__icon">⚔️</div>
          <div className="battle-header__title">ALGORITHM BATTLE</div>
          <div className="battle-header__subtitle">Same maze. Three different strategies.</div>
        </div>
        <div className="empty-state">
          <div className="empty-state__icon">📊</div>
          <div className="empty-state__text">
            Select "Compare All" and click Start to pit all three algorithms against each other.
          </div>
        </div>
      </div>
    );
  }

  const validResults = results.filter(r => r.found);
  const bestPath = validResults.length > 0 ? Math.min(...validResults.map(r => r.path.length)) : null;
  const bestVisited = validResults.length > 0 ? Math.min(...validResults.map(r => r.visited.size)) : null;
  const bestTime = validResults.length > 0 ? Math.min(...validResults.map(r => r.executionTime)) : null;

  const maxPath = Math.max(...results.map(r => r.path.length || 1));
  const maxVisited = Math.max(...results.map(r => r.visited.size || 1));
  const maxTime = Math.max(...results.map(r => r.executionTime || 0.01));

  const algoColors = { BFS: '#3b82f6', DFS: '#a855f7', Backtracking: '#f59e0b' };
  const algoIcons = { BFS: '🌊', DFS: '🔎', Backtracking: '↩️' };

  return (
    <div className="card">
      <div className="battle-header">
        <div className="battle-header__icon">⚔️</div>
        <div className="battle-header__title">ALGORITHM BATTLE</div>
        <div className="battle-header__subtitle">Same maze. Three different strategies.</div>
      </div>

      {/* Comparison Table */}
      <div className="comparison">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Path Length</th>
              <th>Visited Cells</th>
              <th>Exec. Time</th>
              <th>Shortest?</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const info = ALGORITHM_INFO[result.algorithm];
              const color = algoColors[result.algorithm];
              const icon = algoIcons[result.algorithm];
              return (
                <tr key={result.algorithm}>
                  <td>
                    <span className="algo-name">
                      <span className="algo-dot" style={{ background: color }} />
                      {icon} {result.algorithm}
                    </span>
                  </td>
                  <td className={result.found && result.path.length === bestPath ? 'best-value' : ''}>
                    {result.found ? result.path.length : 'N/A'}
                  </td>
                  <td className={result.found && result.visited.size === bestVisited ? 'best-value' : ''}>
                    {result.visited.size}
                  </td>
                  <td className={result.found && result.executionTime === bestTime ? 'best-value' : ''}>
                    {result.executionTime.toFixed(2)} ms
                  </td>
                  <td>
                    {info?.shortestPath === 'Yes – guaranteed for unweighted grids' ? '✓ Yes' : '✗ No'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bar Charts */}
      <div className="bar-charts">
        <BarChart
          title="Path Length"
          data={results.map(r => ({
            label: r.algorithm.substring(0, 3),
            displayValue: r.found ? r.path.length.toString() : 'N/A',
            color: algoColors[r.algorithm],
            pct: r.found ? (r.path.length / maxPath) * 100 : 0,
          }))}
        />
        <BarChart
          title="Visited Cells"
          data={results.map(r => ({
            label: r.algorithm.substring(0, 3),
            displayValue: r.visited.size.toString(),
            color: algoColors[r.algorithm],
            pct: (r.visited.size / maxVisited) * 100,
          }))}
        />
        <BarChart
          title="Execution Time"
          data={results.map(r => ({
            label: r.algorithm.substring(0, 3),
            displayValue: `${r.executionTime.toFixed(2)}ms`,
            color: algoColors[r.algorithm],
            pct: (r.executionTime / maxTime) * 100,
          }))}
        />
      </div>
    </div>
  );
}

function BarChart({ title, data }) {
  return (
    <div className="bar-chart">
      <div className="bar-chart__title">{title}</div>
      <div className="bar-chart__bars">
        {data.map(({ label, displayValue, color, pct }) => (
          <div className="bar-chart__row" key={label}>
            <span className="bar-chart__label">{label}</span>
            <div className="bar-chart__track">
              <div
                className="bar-chart__fill"
                style={{
                  width: `${Math.max(pct, 10)}%`,
                  background: `linear-gradient(90deg, ${color}aa, ${color})`,
                }}
              >
                <span className="bar-chart__val">{displayValue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
