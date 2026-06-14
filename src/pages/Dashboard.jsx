import React, { useState, useEffect } from 'react';
import { PlusCircle, Bell, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuickEntryModal from '../components/QuickEntryModal';

function Dashboard() {
  const [netWorth, setNetWorth] = useState(0);
  const [budget, setBudget] = useState({ total: 3000, spent: 2500 });
  const [urgentItems, setUrgentItems] = useState([
    { id: 1, title: 'UOB Balance Transfer', amount: 500, due: 'Today' }
  ]);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);

  // Mock data fetching
  useEffect(() => {
    // In real app, fetch from IndexedDB
    setNetWorth(15450.50);
  }, []);

  const remainingBudget = budget.total - budget.spent;
  const budgetPercentage = (remainingBudget / budget.total) * 100;
  
  // Warning state if < 20% budget remains
  const isWarning = budgetPercentage < 20;

  const handleQuickEntrySuccess = () => {
    setIsQuickEntryOpen(false);
    // In a real app, we would refresh the data here
    alert("Transaction saved offline! AI will categorize it shortly.");
  };

  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', paddingBottom: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '1.8rem', margin: 0 }}>Dashboard</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="glass-panel" onClick={() => navigate('/bot-inbox')} style={{ padding: '8px', borderRadius: '50%', display: 'flex', border: 'none', cursor: 'pointer' }}>
            <Inbox size={20} color="var(--primary-color)" />
          </button>
          <button className="glass-panel" style={{ padding: '8px', borderRadius: '50%', display: 'flex', border: 'none', cursor: 'pointer' }}>
            <Bell size={20} color="var(--text-primary)" />
          </button>
        </div>
      </header>

      {/* Net Worth Monitor */}
      <section className="glass-panel" style={{ padding: '25px', marginBottom: '20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Net Worth</p>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', margin: 0 }}>
          RM {netWorth.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
        </h1>
      </section>

      {/* Flexible Budget Pool */}
      <section className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontWeight: 500 }}>Budget Pool</span>
          <span style={{ color: isWarning ? 'var(--warning-color)' : 'var(--text-secondary)' }}>
            RM {remainingBudget.toLocaleString()} left
          </span>
        </div>
        
        {/* Progress Bar Container */}
        <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${Math.max(0, Math.min(100, budgetPercentage))}%`,
            background: isWarning ? 'var(--warning-color)' : 'var(--text-primary)',
            borderRadius: '6px',
            transition: 'width 0.5s ease-out, background 0.3s'
          }} />
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'right' }}>
          of RM {budget.total.toLocaleString()}
        </p>
      </section>

      {/* Urgent Action Items */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text-secondary)' }}>Urgent Action Items</h3>
        {urgentItems.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No urgent items.</p>
        ) : (
          urgentItems.map(item => (
            <div key={item.id} className="glass-panel" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--danger-color)' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.title}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--danger-color)', marginTop: '4px' }}>Due: {item.due}</p>
              </div>
              <p style={{ fontWeight: 600 }}>RM {item.amount}</p>
            </div>
          ))
        )}
      </section>

      {/* Floating Action Button for Quick Entry */}
      <button style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: 'var(--primary-gradient)',
        color: 'white',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(123, 97, 255, 0.5)',
        zIndex: 100,
        transition: 'transform 0.2s'
      }}
      onClick={() => setIsQuickEntryOpen(true)}
      >
        <PlusCircle size={30} />
      </button>

      {isQuickEntryOpen && (
        <QuickEntryModal 
          onClose={() => setIsQuickEntryOpen(false)} 
          onSuccess={handleQuickEntrySuccess}
        />
      )}

    </div>
  );
}

export default Dashboard;
