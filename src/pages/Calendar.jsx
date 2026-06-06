import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

function Calendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Mock upcoming expenses
  const expenses = {
    '2026-06-10': [
      { id: 1, name: 'Netflix', amount: 55, type: 'auto' }
    ],
    '2026-06-15': [
      { id: 2, name: 'UOB Installment', amount: 300, type: 'manual' }
    ]
  };

  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate 30 days starting from today for demonstration
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return (
    <div style={{ padding: '20px', minHeight: '100vh' }} className="fade-in">
      <header style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <CalendarIcon size={24} color="var(--primary-color)" />
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '1.8rem' }}>Cashflow</h2>
      </header>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>{currentMonth}</p>

      {/* Grid Calendar representation */}
      <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center' }}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={`header-${i}`} style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>{d}</div>
        ))}
        
        {days.map((dateStr, i) => {
          const dateObj = new Date(dateStr);
          const dayNum = dateObj.getDate();
          const hasAuto = expenses[dateStr]?.some(e => e.type === 'auto');
          const hasManual = expenses[dateStr]?.some(e => e.type === 'manual');

          return (
            <div 
              key={dateStr}
              onClick={() => expenses[dateStr] && setSelectedDate(dateStr)}
              style={{
                padding: '10px 0',
                borderRadius: '8px',
                background: expenses[dateStr] ? 'rgba(255,255,255,0.05)' : 'transparent',
                cursor: expenses[dateStr] ? 'pointer' : 'default',
                position: 'relative'
              }}
            >
              <span style={{ fontWeight: expenses[dateStr] ? 600 : 400 }}>{dayNum}</span>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '4px' }}>
                {hasAuto && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ccc' }} />}
                {hasManual && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary-color)' }} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sheet Details */}
      {selectedDate && (
        <div className="slide-up" style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          background: 'var(--surface-color-solid)',
          borderTop: '1px solid var(--surface-border)',
          padding: '25px',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{selectedDate}</h3>
            <button onClick={() => setSelectedDate(null)} style={{ color: 'var(--text-secondary)', padding: '5px' }}>Close</button>
          </div>
          
          {expenses[selectedDate].map(exp => (
            <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <div>
                <p style={{ fontWeight: 600 }}>{exp.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {exp.type === 'auto' ? 'Auto Deduct' : 'Requires Approval'}
                </p>
              </div>
              <p style={{ fontWeight: 600 }}>RM {exp.amount}</p>
            </div>
          ))}

          {expenses[selectedDate].some(e => e.type === 'manual') && (
            <button className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={() => {
              alert('Payment confirmed & ledger updated!');
              setSelectedDate(null);
            }}>
              <CheckCircle2 size={20} /> Confirm Paid
            </button>
          )}
        </div>
      )}

      <style>{`
        .slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Calendar;
