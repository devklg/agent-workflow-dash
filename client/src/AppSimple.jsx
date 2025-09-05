import React, { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('Loading...');
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    // Test backend connection
    fetch('http://localhost:5001/api/agents')
      .then(res => res.json())
      .then(data => {
        setAgents(data);
        setStatus(`Connected! Found ${data.length} agents`);
      })
      .catch(err => {
        setStatus(`Error: ${err.message}`);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🚀 Prometheus Agent Dashboard - Test Mode</h1>
      <h2>Backend Status: {status}</h2>
      
      {agents.length > 0 && (
        <div>
          <h3>Agents by Team:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <div style={{ background: '#1e3a8a', color: 'white', padding: '10px', borderRadius: '8px' }}>
              <h4>🔵 Atlas Team</h4>
              <p>{agents.filter(a => a.team === 'atlas').length} agents</p>
            </div>
            <div style={{ background: '#581c87', color: 'white', padding: '10px', borderRadius: '8px' }}>
              <h4>🟣 Aurora Team</h4>
              <p>{agents.filter(a => a.team === 'aurora').length} agents</p>
            </div>
            <div style={{ background: '#991b1b', color: 'white', padding: '10px', borderRadius: '8px' }}>
              <h4>🔴 Phoenix Team</h4>
              <p>{agents.filter(a => a.team === 'phoenix').length} agents</p>
            </div>
            <div style={{ background: '#14532d', color: 'white', padding: '10px', borderRadius: '8px' }}>
              <h4>🟢 Sentinel Team</h4>
              <p>{agents.filter(a => a.team === 'sentinel').length} agents</p>
            </div>
          </div>
          
          <h3>All Agents:</h3>
          <ul>
            {agents.map(agent => (
              <li key={agent.id}>
                {agent.name} - {agent.role} ({agent.team})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;