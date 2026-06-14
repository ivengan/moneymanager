import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, PlusCircle, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { getAccounts, addAccount, updateAccount, deleteAccount } from '../services/db';

function Accounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', balance: '', type: 'bank' });

  const loadData = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    await addAccount({
      name: formData.name,
      balance: parseFloat(formData.balance) || 0,
      type: formData.type
    });
    
    setIsAddOpen(false);
    setFormData({ name: '', balance: '', type: 'bank' });
    loadData();
  };

  const handleEditBalance = async (acc) => {
    const newBalanceStr = prompt(`Enter new balance for ${acc.name}:`, acc.balance);
    if (newBalanceStr === null) return;
    
    const newBalance = parseFloat(newBalanceStr);
    if (!isNaN(newBalance)) {
      await updateAccount({ ...acc, balance: newBalance });
      loadData();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this account?')) {
      await deleteAccount(id);
      loadData();
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }} className="fade-in">
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Wallet size={24} color="var(--text-primary)" />
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '1.8rem', margin: 0, color: 'var(--text-primary)' }}>Assets</h2>
        </div>
      </header>

      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '5px' }}>Total Assets</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          RM {totalBalance.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
        </h1>
      </div>

      <div style={{ flex: 1 }}>
        {accounts.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', background: 'var(--surface-color)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No accounts linked yet. Add your cash wallet or bank accounts below.</p>
          </div>
        ) : (
          accounts.map(acc => (
            <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', marginBottom: '15px', background: 'var(--surface-color)', borderRadius: '12px' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 5px 0' }}>{acc.name}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, textTransform: 'capitalize' }}>{acc.type}</p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>
                  RM {acc.balance.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleEditBalance(acc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(acc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button style={{
        position: 'fixed', bottom: '30px', right: '30px', background: 'var(--text-primary)',
        color: 'var(--bg-primary)', borderRadius: '50%', width: '60px', height: '60px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 100,
        border: 'none', cursor: 'pointer'
      }} onClick={() => setIsAddOpen(true)}>
        <PlusCircle size={30} />
      </button>

      {isAddOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsAddOpen(false)}>
          <div className="slide-up" style={{ width: '100%', maxWidth: '600px', padding: '25px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', background: 'var(--surface-color-solid)', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Add Asset Account</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Account Name (e.g. Maybank)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} required />
              <input type="number" placeholder="Current Balance (RM)" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} required />
              
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                <option value="bank">Bank Account</option>
                <option value="cash">Cash Wallet</option>
                <option value="e-wallet">E-Wallet (TNG, Boost)</option>
                <option value="investment">Investment / Brokerage</option>
              </select>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAddOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: 'none', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontWeight: 600 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Accounts;
