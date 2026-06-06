import React from 'react';
import { useNavigate } from 'react-router-dom';

function PinLock() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', textAlign: 'center' }} className="fade-in">
      <h1 className="gradient-text">Money Manager</h1>
      <p style={{ margin: '20px 0', color: 'var(--text-secondary)' }}>Enter PIN to unlock</p>
      
      <div className="glass-panel" style={{ padding: '30px', margin: '20px auto', maxWidth: '300px' }}>
        <input 
          type="password" 
          inputMode="numeric" 
          pattern="[0-9]*"
          maxLength="6"
          placeholder="••••••"
          style={{
            width: '100%',
            fontSize: '2rem',
            textAlign: 'center',
            letterSpacing: '0.5em',
            background: 'transparent',
            border: 'none',
            borderBottom: '2px solid var(--primary-color)',
            color: 'white',
            outline: 'none'
          }}
          onChange={(e) => {
            if(e.target.value.length === 6) {
              // Mock auth success
              navigate('/dashboard');
            }
          }}
        />
      </div>
    </div>
  );
}

export default PinLock;
