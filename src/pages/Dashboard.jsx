import React, { useState, useEffect } from 'react';
import { PlusCircle, Bell, Inbox, Calendar as CalendarIcon, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuickEntryModal from '../components/QuickEntryModal';
import { getTransactions, getObligations, getAccounts } from '../services/db';

function Dashboard() {
  const [netWorth, setNetWorth] = useState(0);
  const [accountsList, setAccountsList] = useState([]);
  const [budget, setBudget] = useState({ total: 3000, spent: 0 });
  const [lockedExpenses, setLockedExpenses] = useState(0);
  const [urgentItems, setUrgentItems] = useState([]);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);

  const loadData = async () => {
    try {
      // 1. Calculate Real Net Worth from Accounts
      const accs = await getAccounts();
      setAccountsList(accs);
      const currentNetWorth = accs.reduce((sum, a) => sum + (a.balance || 0), 0);
      setNetWorth(currentNetWorth);

      // 2. Calculate Monthly Spent for Budget
      const txs = await getTransactions();
      const thisMonth = new Date().toISOString().substring(0, 7); // e.g. "2026-06"
      const monthlySpent = txs
        .filter(t => t.date && t.date.startsWith(thisMonth))
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      setBudget(prev => ({ ...prev, spent: monthlySpent }));

      // 3. Obligations Logic
      const obs = await getObligations();
      let locked = 0;
      let urgents = [];
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      obs.forEach(ob => {
        if (ob.type === 'subscription') locked += (ob.amount || 0);
        if (ob.type === 'installment' && ob.termsCompleted < ob.totalTerms) locked += (ob.amountPerTerm || 0);
        
        // ONLY manual tasks get added to Upcoming Actions
        if (!ob.isAutoDeduct) {
          if (ob.type === 'strategic_debt' && ob.gracePeriodEndDate) {
            const graceDate = new Date(ob.gracePeriodEndDate);
            if (graceDate <= thirtyDaysFromNow) {
              urgents.push({
                id: ob.id,
                title: `ACTION REQ: ${ob.name}`,
                amount: ob.remainingDebt,
                due: ob.gracePeriodEndDate,
                isCritical: true
              });
            }
          }
          
          if (ob.nextDueDate) {
            const dueDate = new Date(ob.nextDueDate);
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 5) {
              urgents.push({
                id: `due_${ob.id}`,
                title: `${ob.name}`,
                amount: ob.type === 'installment' ? ob.amountPerTerm : ob.minimumPayment,
                due: diffDays === 0 ? 'Today' : `In ${diffDays} days`,
                isCritical: false
              });
            }
          }
        }
      });
      
      setLockedExpenses(locked);
      setUrgentItems(urgents);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const remainingBudget = budget.total - budget.spent - lockedExpenses;
  const budgetPercentage = ((budget.total - remainingBudget) / budget.total) * 100;
  const isWarning = remainingBudget / budget.total < 0.2;

  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', paddingBottom: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }} className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '1.8rem', margin: 0, color: 'var(--text-primary)' }}>Overview</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => navigate('/bot-inbox')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Inbox size={22} />
          </button>
          <button onClick={() => navigate('/calendar')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <CalendarIcon size={22} />
          </button>
          <button onClick={() => navigate('/obligations')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Bell size={22} />
          </button>
        </div>
      </header>

      {/* Net Worth & Asset Breakdown */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '5px' }}>Net Worth</p>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              RM {netWorth.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
            </h1>
          </div>
          <button onClick={() => navigate('/accounts')} style={{ background: 'var(--surface-color)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Edit2 size={16} />
          </button>
        </div>

        {/* Dynamic Asset Cards */}
        {accountsList.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '25px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {accountsList.map(acc => (
              <div key={acc.id} style={{ padding: '15px', background: 'var(--surface-color)', borderRadius: '12px', minWidth: '130px', flexShrink: 0 }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 5px 0' }}>{acc.name}</p>
                <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>
                  RM {acc.balance?.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        )}

      {/* Minimalist Core Metric */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '5px' }}>本月剩餘自由額度</p>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 15px 0' }}>
          RM {remainingBudget.toLocaleString('en-MY', { minimumFractionDigits: 2 })} <span style={{fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400}}>/ RM {budget.total.toLocaleString()}</span>
        </h2>
        
        {/* Minimalist Progress Bar */}
        <div style={{ height: '8px', background: 'var(--surface-border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${Math.max(0, Math.min(100, budgetPercentage))}%`,
            background: isWarning ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderRadius: '4px',
            transition: 'width 0.5s ease-out, background 0.3s'
          }} />
        </div>
      </section>

      {/* Upcoming Action - Only Manual Items */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '15px', color: 'var(--text-primary)' }}>Upcoming Actions</h3>
        {urgentItems.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', background: 'var(--surface-color)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No manual actions required.</p>
          </div>
        ) : (
          urgentItems.map(item => (
            <div key={item.id} style={{ padding: '15px 20px', marginBottom: '10px', background: 'var(--surface-color)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.title}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Due: {item.due}</p>
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>RM {item.amount?.toFixed(2)}</p>
            </div>
          ))
        )}
      </section>

      {/* Floating Action Button */}
      <button style={{
        position: 'fixed', bottom: '30px', right: '30px', background: 'var(--text-primary)',
        color: 'var(--bg-primary)', borderRadius: '50%', width: '60px', height: '60px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 100,
        border: 'none', cursor: 'pointer'
      }} onClick={() => setIsQuickEntryOpen(true)}>
        <PlusCircle size={30} />
      </button>

      {isQuickEntryOpen && (
        <QuickEntryModal 
          onClose={() => setIsQuickEntryOpen(false)} 
          onSuccess={() => { setIsQuickEntryOpen(false); loadData(); }}
        />
      )}
    </div>
  );
}

export default Dashboard;
