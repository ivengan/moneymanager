import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getObligations, updateObligation, addTransaction } from '../services/db';

function Calendar() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [expenses, setExpenses] = useState({});
  const [paidSet, setPaidSet] = useState(new Set()); // Track items paid in current session

  const loadData = async () => {
    try {
      const obs = await getObligations();
      const mapped = {};
      
      obs.forEach(ob => {
        if (ob.nextDueDate) {
          const date = ob.nextDueDate;
          if (!mapped[date]) mapped[date] = [];
          mapped[date].push(ob);
        }
      });
      
      setExpenses(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmPaid = async (exp) => {
    try {
      if (exp.type === 'installment') {
        const updated = {
          ...exp,
          termsCompleted: exp.termsCompleted + 1,
          remainingPrincipal: exp.remainingPrincipal - exp.amountPerTerm
        };
        const date = new Date(exp.nextDueDate);
        date.setMonth(date.getMonth() + 1);
        updated.nextDueDate = date.toISOString().split('T')[0];
        
        await updateObligation(updated);
        await addTransaction({
          amount: exp.amountPerTerm,
          note: `Paid ${exp.name}`,
          accountId: 'cash',
          date: new Date().toISOString().split('T')[0],
          category: 'Liability'
        });
      } else if (exp.type === 'strategic_debt') {
        const amount = exp.minimumPayment || 0; // simplistic assumption for calendar quick-pay
        const updated = { ...exp, remainingDebt: Math.max(0, exp.remainingDebt - amount) };
        const date = new Date(exp.nextDueDate);
        date.setMonth(date.getMonth() + 1); // mock advance
        updated.nextDueDate = date.toISOString().split('T')[0];

        await updateObligation(updated);
        await addTransaction({
          amount: amount,
          note: `Payment for ${exp.name}`,
          accountId: 'cash',
          date: new Date().toISOString().split('T')[0],
          category: 'Liability'
        });
      }
      
      // Update UI state to show green checkmark
      setPaidSet(prev => new Set(prev).add(exp.id));
      
      // Reload data in background to update dots
      setTimeout(() => loadData(), 1500);

    } catch (err) {
      console.error(err);
    }
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
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }} className="fade-in">
      <header style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarIcon size={24} color="var(--text-primary)" />
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '1.8rem', margin: 0, color: 'var(--text-primary)' }}>Cashflow</h2>
        </div>
      </header>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '1.1rem' }}>{currentMonth}</p>

      {/* Grid Calendar representation */}
      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center', background: 'var(--surface-color)', borderRadius: '16px' }}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={`header-${i}`} style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>{d}</div>
        ))}
        
        {days.map((dateStr) => {
          const dateObj = new Date(dateStr);
          const dayNum = dateObj.getDate();
          
          // Filter out items we just paid in UI memory
          const dayExpenses = expenses[dateStr]?.filter(e => !paidSet.has(e.id)) || [];
          
          const hasAuto = dayExpenses.some(e => e.isAutoDeduct);
          const hasManual = dayExpenses.some(e => !e.isAutoDeduct);

          return (
            <div 
              key={dateStr}
              onClick={() => dayExpenses.length > 0 && setSelectedDate(dateStr)}
              style={{
                padding: '12px 0',
                borderRadius: '8px',
                background: dayExpenses.length > 0 ? 'var(--surface-color-solid)' : 'transparent',
                cursor: dayExpenses.length > 0 ? 'pointer' : 'default',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <span style={{ fontWeight: dayExpenses.length > 0 ? 600 : 400, color: 'var(--text-primary)' }}>{dayNum}</span>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '6px', height: '6px' }}>
                {hasAuto && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--surface-border)' }} />}
                {hasManual && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-primary)' }} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sheet Details */}
      {selectedDate && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} onClick={() => setSelectedDate(null)} />
          <div className="slide-up" style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            background: 'var(--surface-color-solid)',
            padding: '30px 25px 40px',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            zIndex: 100,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{selectedDate}</h3>
              <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }}>Close</button>
            </div>
            
            {expenses[selectedDate].filter(e => !paidSet.has(e.id)).map(exp => (
              <div key={exp.id} style={{ marginBottom: '20px', padding: '15px', background: 'var(--surface-color)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem', margin: '0 0 4px 0' }}>{exp.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {exp.isAutoDeduct ? '自動處理 (Auto)' : '手動確認 (Manual)'}
                    </p>
                  </div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    RM {(exp.amount || exp.amountPerTerm || exp.minimumPayment)?.toFixed(2)}
                  </p>
                </div>

                {!exp.isAutoDeduct && (
                  <button 
                    onClick={() => handleConfirmPaid(exp)}
                    style={{ 
                      width: '100%', padding: '12px', 
                      background: 'var(--text-primary)', color: 'var(--bg-primary)', 
                      borderRadius: '8px', border: 'none', fontWeight: 600,
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    確認已繳
                  </button>
                )}
              </div>
            ))}
            
            {/* Show green tick if something was just paid on this date */}
            {expenses[selectedDate].some(e => paidSet.has(e.id)) && (
              <div className="fade-in" style={{ textAlign: 'center', padding: '15px', color: '#4ade80' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 10px' }} />
                <p style={{ fontWeight: 500, margin: 0 }}>Payment Recorded!</p>
              </div>
            )}
          </div>
        </>
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
