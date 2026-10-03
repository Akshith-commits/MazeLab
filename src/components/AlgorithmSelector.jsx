import React from 'react';
import { ALGORITHM_INFO } from '../utils/mazeUtils';

/**
 * AlgorithmSelector – Game-style algorithm cards with icons and descriptions.
 * Each card shows a large icon, the algorithm name, and a short tagline.
 */

const ALGO_CARDS = [
  {
    key: 'BFS',
    icon: '🌊',
    name: 'Breadth-First Search',
    desc: 'Explore layer by layer',
    cssKey: 'bfs',
  },
  {
    key: 'DFS',
    icon: '🔎',
    name: 'Depth-First Search',
    desc: 'Go deep. Then try another route.',
    cssKey: 'dfs',
  },
  {
    key: 'Backtracking',
    icon: '↩️',
    name: 'Backtracking',
    desc: 'Try. Fail. Undo. Try again.',
    cssKey: 'backtracking',
  },
];

export default function AlgorithmSelector({
  selectedAlgorithm,
  onSelect,
  isRunning,
}) {
  return (
    <div className="card">
      <div className="card__title">
        <span>⚡</span> Algorithm
      </div>

      <div className="algo-selector">
        {ALGO_CARDS.map(({ key, icon, name, desc, cssKey }) => (
          <button
            key={key}
            className={
              `algo-card-btn algo-card-btn--${cssKey}` +
              (selectedAlgorithm === key ? ' algo-card-btn--active' : '')
            }
            onClick={() => onSelect(key)}
            disabled={isRunning}
            id={`algo-btn-${cssKey}`}
          >
            <div className="algo-card-btn__icon">{icon}</div>
            <div className="algo-card-btn__text">
              <div className="algo-card-btn__name">{name}</div>
              <div className="algo-card-btn__desc">{desc}</div>
            </div>
          </button>
        ))}

        {/* Compare All */}
        <button
          className={
            'algo-card-btn algo-card-btn--compare' +
            (selectedAlgorithm === 'CompareAll' ? ' algo-card-btn--active' : '')
          }
          onClick={() => onSelect('CompareAll')}
          disabled={isRunning}
          id="algo-btn-compare"
        >
          <div className="algo-card-btn__icon">⚔️</div>
          <div className="algo-card-btn__text">
            <div className="algo-card-btn__name">Compare All</div>
            <div className="algo-card-btn__desc">Same maze. Three strategies.</div>
          </div>
        </button>
      </div>

      {/* Detail panel for selected algorithm */}
      {selectedAlgorithm && selectedAlgorithm !== 'CompareAll' && ALGORITHM_INFO[selectedAlgorithm] && (
        <AlgoDetailPanel algorithm={selectedAlgorithm} />
      )}
    </div>
  );
}

function AlgoDetailPanel({ algorithm }) {
  const info = ALGORITHM_INFO[algorithm];
  if (!info) return null;

  return (
    <div className="algo-detail">
      <div className="algo-detail__name" style={{ color: info.color }}>
        <span>{info.icon}</span> {info.name}
      </div>
      <div className="algo-detail__desc">{info.description}</div>
      <div className="algo-detail__grid">
        <div className="algo-detail__item">
          <div className="algo-detail__key">Strategy</div>
          <div className="algo-detail__val">{info.strategy}</div>
        </div>
        <div className="algo-detail__item">
          <div className="algo-detail__key">Data Structure</div>
          <div className="algo-detail__val">{info.dataStructure}</div>
        </div>
        <div className="algo-detail__item">
          <div className="algo-detail__key">Time</div>
          <div className="algo-detail__val">{info.timeComplexity}</div>
        </div>
        <div className="algo-detail__item">
          <div className="algo-detail__key">Space</div>
          <div className="algo-detail__val">{info.spaceComplexity}</div>
        </div>
        <div className="algo-detail__item algo-detail__item--full">
          <div className="algo-detail__key">Shortest Path</div>
          <div className="algo-detail__val">{info.shortestPath}</div>
        </div>
      </div>
    </div>
  );
}
