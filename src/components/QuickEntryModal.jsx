import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { addTransaction } from '../services/db';

const accounts = [
  { id: 'maybank', name: 'Maybank', color: '#ffcc00' },
  { id: 'uob', name: 'UOB', color: '#003399' },
  { id: 'cimb', name: 'CIMB', color: '#cc0000' },
  { id: 'tng', name: 'TnG eWallet', color: '#0055ff' },
  { id: 'cash', name: 'Cash', color: '#00cc66' }
];

function QuickEntryModal({ onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(accounts[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (e) => {
    // allow numbers and one decimal point
    const val = e.target.value.replace(/[^0-9.]/g, '');
    if (val.split('.').length <= 2) {
      setAmount(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        amount: parseFloat(amount),
        note,
        accountId: selectedAccount,
        date: new Date().toISOString().split('T')[0],
        status: 'pending_ai_categorization' // AI will process this in background
      });
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="glass-panel slide-up" style={{
        width: '100%',
        maxWidth: '600px',
        padding: '25px',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        backgroundColor: 'var(--surface-color-solid)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Quick Entry</h3>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginRight: '5px' }}>RM</span>
            <input 
              type="text" 
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              autoFocus
              style={{
                fontSize: '3rem',
                fontWeight: 700,
                background: 'transparent',
                border: 'none',
                color: 'white',
                width: '60%',
                outline: 'none',
                textAlign: 'center'
              }}
            />
          </div>

          {/* Note Input */}
          <div style={{ marginBottom: '20px' }}>
            <input 
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Brief note (e.g., 'tea', 'lunch')"
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--surface-border)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Account Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
            {accounts.map(acc => (
              <button
                type="button"
                key={acc.id}
                onClick={() => setSelectedAccount(acc.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: selectedAccount === acc.id ? acc.color : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedAccount === acc.id ? acc.color : 'var(--surface-border)'}`,
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: selectedAccount === acc.id ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                {acc.name}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isSubmitting || !amount}
            style={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '10px',
              padding: '16px',
              opacity: (!amount || isSubmitting) ? 0.5 : 1
            }}
          >
            {isSubmitting ? 'Saving...' : <><Check size={20} /> Save Transaction</>}
          </button>
        </form>
      </div>

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

export default QuickEntryModal;
