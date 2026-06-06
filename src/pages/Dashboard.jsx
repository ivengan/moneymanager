import React from 'react';

function Dashboard() {
  return (
    <div style={{ padding: '20px' }} className="fade-in">
      <h2>Dashboard</h2>
      <div className="glass-panel" style={{ padding: '20px', marginTop: '20px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Net Worth</p>
        <h1 className="gradient-text">RM 0.00</h1>
      </div>
    </div>
  );
}

export default Dashboard;
