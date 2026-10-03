import React from 'react';
import { ALGORITHM_INFO } from '../utils/mazeUtils';

/**
 * AlgorithmInfo – Educational cards about each algorithm, styled as game knowledge cards.
 */
export default function AlgorithmInfo() {
  const algorithms = ['BFS', 'DFS', 'Backtracking'];
  const icons = { BFS: '🌊', DFS: '🔎', Backtracking: '↩️' };

  return (
    <div className="card">
      <div className="card__title">
        <span>📚</span> About the Algorithms
      </div>

      <div className="algo-cards">
        {algorithms.map((algo) => {
          const info = ALGORITHM_INFO[algo];
          const icon = icons[algo];
          return (
            <div className="algo-info-card" key={algo}>
              <div className="algo-info-card__header">
                <div
                  className="algo-info-card__icon"
                  style={{ background: `${info.color}18`, color: info.color }}
                >
                  {icon}
                </div>
                <div className="algo-info-card__name" style={{ color: info.color }}>
                  {info.name}
                </div>
              </div>

              <div className="algo-info-card__desc">{info.description}</div>

              <div className="algo-info-card__meta">
                {[
                  ['Time', info.timeComplexity],
                  ['Space', info.spaceComplexity],
                  ['Data Structure', info.dataStructure],
                  ['Shortest Path', info.shortestPath],
                  ['Strategy', info.strategy],
                ].map(([key, val]) => (
                  <div className="algo-info-card__meta-row" key={key}>
                    <span className="algo-info-card__meta-key">{key}</span>
                    <span className="algo-info-card__meta-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
