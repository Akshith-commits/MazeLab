import React from 'react';

/**
 * Legend – Game-style emoji legend for maze cell types.
 */
export default function Legend() {
  const items = [
    { emoji: '🧙', label: 'Player' },
    { emoji: '🏁', label: 'Destination' },
    { emoji: '🧱', label: 'Wall' },
    { emoji: '🔥', label: 'Exploring' },
    { emoji: '👣', label: 'Visited' },
    { emoji: '✨', label: 'Path' },
    { color: '#0b1120', border: '#1e293b', label: 'Open' },
  ];

  return (
    <div className="legend">
      {items.map(({ emoji, color, border, label }) => (
        <div className="legend__item" key={label}>
          {emoji ? (
            <span className="legend__emoji">{emoji}</span>
          ) : (
            <div className="legend__color" style={{ background: color, borderColor: border }} />
          )}
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
