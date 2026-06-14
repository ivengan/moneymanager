import React, { useState } from 'react';
import { Inbox, Check, Trash2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { parseTransactionText } from '../services/bot';

function BotInbox() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [idCounter, setIdCounter] = useState(1);

  const handleParse = async () => {
    if (!inputText.trim()) return;
    
    // Call our offline bot!
    const parsedData = await parseTransactionText(inputText);
    
    setTransactions([{
      id: idCounter,
      raw: inputText,
      ...parsedData,
      account: 'Unknown' // Default
    }, ...transactions]);
    
    setIdCounter(prev => prev + 1);
    setInputText('');
  };

  const handleApprove = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    // In real app: save to IndexedDB ledger
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', paddingBottom: '80px' }} className="fade-in">
      <header style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', border: 'none', cursor: 'pointer' }}>←</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Inbox size={24} color="var(--primary-color)" />
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '1.8rem', margin: 0 }}>Bot Inbox</h2>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '15px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Paste SMS / Receipt</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. RM 15.50 at Starbucks"
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
          <button onClick={handleParse} style={{ background: 'var(--primary-gradient)', color: 'white', padding: '10px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', border: 'none', cursor: 'pointer' }}>
            <Send size={16} /> Parse
          </button>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
        {transactions.length === 0 ? "No pending bot parses." : "Pending offline parsed transactions."}
      </p>

      {transactions.map(t => (
        <div key={t.id} className="glass-panel fade-in" style={{ padding: '15px', marginBottom: '15px', position: 'relative', overflow: 'hidden' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', fontStyle: 'italic' }}>Raw: "{t.raw}"</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 600 }}>{t.merchant}</span>
            <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>RM {t.amount.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>{t.category}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleDelete(t.id)} style={{ flex: 1, padding: '10px', background: 'rgba(255,61,113,0.1)', color: 'var(--danger-color)', borderRadius: '8px', display: 'flex', justifyContent: 'center', gap: '5px', border: 'none', cursor: 'pointer' }}>
              <Trash2 size={16} /> Discard
            </button>
            <button onClick={() => handleApprove(t.id)} style={{ flex: 1, padding: '10px', background: 'var(--primary-gradient)', color: 'white', borderRadius: '8px', display: 'flex', justifyContent: 'center', gap: '5px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              <Check size={16} /> Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BotInbox;
