import React from 'react';
import './CampaignPromisesSidebar.css';

function CampaignPromisesSidebar({ promises, onIncrement }) {
  return (
    <aside className="campaign-promises-sidebar">
      <h2>Campaign Promises</h2>
      <ul>
        {promises.map(promise => (
          <li key={promise.id} className={promise.progress === promise.max ? 'completed' : ''}>
            <span className="label">{promise.label}</span>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${(promise.progress / promise.max) * 100}%` }}
              />
            </div>
            <span className="progress-count">{promise.progress}/{promise.max}</span>
            <button
              onClick={() => onIncrement(promise.id)}
              disabled={promise.progress >= promise.max}
            >
              +
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default CampaignPromisesSidebar;
