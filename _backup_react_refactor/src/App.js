import React, { useState } from 'react';
import CampaignPromisesSidebar from './components/CampaignPromisesSidebar';

const initialPromises = [
  { id: 'education', label: 'Improve Education', progress: 7, max: 10 },
  { id: 'healthcare', label: 'Universal Healthcare', progress: 10, max: 10 },
  { id: 'infrastructure', label: 'Better Roads', progress: 4, max: 10 },
];

function App() {
  const [promises, setPromises] = useState(initialPromises);

  const handleIncrement = id => {
    setPromises(promises =>
      promises.map(p =>
        p.id === id && p.progress < p.max
          ? { ...p, progress: p.progress + 1 }
          : p
      )
    );
  };

  return (
    <div className="app-layout" style={{ display: 'flex' }}>
      <CampaignPromisesSidebar promises={promises} onIncrement={handleIncrement} />
      {/* ...rest of your app... */}
      <div style={{ flex: 1, padding: '2em' }}>
        <h1>India Elections Game (React Refactor)</h1>
        <p>Add your main game UI here.</p>
      </div>
    </div>
  );
}

export default App;
