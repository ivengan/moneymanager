import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validatePin } from '../services/db';

function PinLock() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 6) {
      handlePinSubmit(pin);
    }
  }, [pin]);

  const handlePinSubmit = async (enteredPin) => {
    const isValid = await validatePin(enteredPin);
    if (isValid) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 500);
    }
  };

  const handleOnChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 6) {
      setPin(val);
      setError(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="fade-in">
      <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Money Manager</h1>
      <p style={{ margin: '10px 0 30px', color: 'var(--text-secondary)' }}>Enter PIN to unlock</p>
      
      <div className={`glass-panel ${error ? 'shake' : ''}`} style={{ padding: '40px 30px', margin: '0 auto', maxWidth: '320px', width: '100%', transition: 'all 0.3s' }}>
        <input 
          type="password" 
          inputMode="numeric" 
          pattern="[0-9]*"
          value={pin}
          onChange={handleOnChange}
          autoFocus
          placeholder="••••••"
          style={{
            width: '100%',
            fontSize: '2.5rem',
            textAlign: 'center',
            letterSpacing: '0.3em',
            background: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${error ? 'var(--danger-color)' : 'var(--primary-color)'}`,
            color: error ? 'var(--danger-color)' : 'white',
            outline: 'none',
            transition: 'border-color 0.3s, color 0.3s'
          }}
        />
        {error && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontSize: '0.9rem' }}>Incorrect PIN. Try again.</p>}
        {pin.length === 0 && <p style={{ color: 'var(--text-secondary)', marginTop: '15px', fontSize: '0.8rem' }}>First time? Entering a PIN will set it.</p>}
      </div>
      <style>{`
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}

export default PinLock;
