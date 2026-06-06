import React, { useState } from 'react';
import { Inbox, Check, Trash2 } from 'lucide-react';

function AiInbox() {
  const [transactions, setTransactions] = useState([
    { id: 1, raw: 'UOB / Tealive / RM 15.50 / Food', amount: 15.50, merchant: 'Tealive', account: 'UOB', category: 'Food & Beverage' },
    { id: 2, raw: 'SMS: RM 150 transfer to John', amount: 150.00, merchant: 'John', account: 'Maybank', category: 'Transfer' }
  ]);

  const handleApprove = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    // In real app: save to IndexedDB ledger
  };

  const handleApproveAll = () => {
    setTransactions([]);
    alert("All transactions approved and ledger updated!");
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh' }} className="fade-in">
      <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Inbox size={24} color="var(--primary-color)" />
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '1.8rem' }}>AI Inbox</h2>
        </div>
        {transactions.length > 0 && (
          <button 
            onClick={handleApproveAll}
            style={{ padding: '8px 16px', background: 'rgba(0,230,118,0.2)', color: 'var(--success-color)', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem' }}
          >
            Bulk Approve
          </button>
        )}
      </header>

      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
        {transactions.length === 0 ? "You're all caught up! No pending AI parses." : "Pending transactions from receipts and SMS."}
      </p>

      {transactions.map(t => (
        <div key={t.id} className="glass-panel" style={{ padding: '15px', marginBottom: '15px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 600 }}>{t.merchant}</span>
            <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>RM {t.amount.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>{t.account}</span>
            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>{t.category}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleDelete(t.id)} style={{ flex: 1, padding: '10px', background: 'rgba(255,61,113,0.1)', color: 'var(--danger-color)', borderRadius: '8px', display: 'flex', justifyContent: 'center', gap: '5px' }}>
              <Trash2 size={16} /> Delete
            </button>
            <button onClick={() => handleApprove(t.id)} style={{ flex: 1, padding: '10px', background: 'var(--primary-gradient)', color: 'white', borderRadius: '8px', display: 'flex', justifyContent: 'center', gap: '5px', fontWeight: 600 }}>
              <Check size={16} /> Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AiInbox;
