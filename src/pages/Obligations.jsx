import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, CreditCard, Repeat, AlertTriangle, ArrowLeft } from 'lucide-react';
import { getObligations, addObligation, updateObligation, addTransaction } from '../services/db';

function Obligations() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subscription');
  const [obligations, setObligations] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'subscription',
    name: '',
    amount: '',
    cycle: 'monthly',
    nextDueDate: '',
    totalTerms: '',
    gracePeriodEndDate: '',
    highInterestRate: ''
  });

  const loadData = async () => {
    try {
      const data = await getObligations();
      setObligations(data);
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

    let payload = {
      type: formData.type,
      name: formData.name,
      nextDueDate: formData.nextDueDate,
    };

    if (formData.type === 'subscription') {
      payload.amount = parseFloat(formData.amount);
      payload.cycle = formData.cycle;
    } else if (formData.type === 'installment') {
      payload.amountPerTerm = parseFloat(formData.amount);
      payload.totalTerms = parseInt(formData.totalTerms);
      payload.termsCompleted = 0;
      payload.remainingPrincipal = payload.amountPerTerm * payload.totalTerms;
    } else if (formData.type === 'strategic_debt') {
      payload.remainingDebt = parseFloat(formData.amount); // amount is total debt here
      payload.gracePeriodEndDate = formData.gracePeriodEndDate;
      payload.highInterestRate = parseFloat(formData.highInterestRate);
      payload.minimumPayment = payload.remainingDebt * 0.05; // 5% mock min payment
    }

    await addObligation(payload);
    setIsAddOpen(false);
    setFormData({ type: activeTab, name: '', amount: '', cycle: 'monthly', nextDueDate: '', totalTerms: '', gracePeriodEndDate: '', highInterestRate: '' });
    loadData();
  };

  const handlePayment = async (ob) => {
    if (ob.type === 'installment') {
      if (ob.termsCompleted >= ob.totalTerms) return;
      const updated = {
        ...ob,
        termsCompleted: ob.termsCompleted + 1,
        remainingPrincipal: ob.remainingPrincipal - ob.amountPerTerm
      };
      
      // Calculate next due date (approx +1 month)
      const date = new Date(ob.nextDueDate);
      date.setMonth(date.getMonth() + 1);
      updated.nextDueDate = date.toISOString().split('T')[0];

      await updateObligation(updated);
      await addTransaction({
        amount: ob.amountPerTerm,
        note: `Paid ${ob.name} (${updated.termsCompleted}/${ob.totalTerms})`,
        accountId: 'cash',
        date: new Date().toISOString().split('T')[0],
        category: 'Liability'
      });
      loadData();
      alert(`Paid installment ${updated.termsCompleted}/${ob.totalTerms} and logged transaction!`);
    } else if (ob.type === 'strategic_debt') {
      // Prompt for payment amount
      const amountStr = prompt(`Enter payment amount for ${ob.name} (Remaining: RM ${ob.remainingDebt.toFixed(2)})`);
      if (!amountStr) return;
      const amount = parseFloat(amountStr);
      if (isNaN(amount) || amount <= 0) return;

      const updated = { ...ob, remainingDebt: Math.max(0, ob.remainingDebt - amount) };
      await updateObligation(updated);
      await addTransaction({
        amount: amount,
        note: `Payment for ${ob.name}`,
        accountId: 'cash',
        date: new Date().toISOString().split('T')[0],
        category: 'Liability'
      });
      loadData();
      alert(`Payment of RM ${amount.toFixed(2)} applied and logged transaction!`);
    } else if (ob.type === 'subscription') {
      // Just log the transaction
      await addTransaction({
        amount: ob.amount,
        note: `${ob.name} Subscription`,
        accountId: 'cash',
        date: new Date().toISOString().split('T')[0],
        category: 'Subscription'
      });
      alert(`Logged ${ob.name} subscription payment!`);
    }
  };

  const filteredObligations = obligations.filter(o => o.type === activeTab);

  return (
    <div style={{ padding: '20px', paddingBottom: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="fade-in">
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '1.8rem', margin: 0 }}>Liabilities</h2>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
        <button onClick={() => { setActiveTab('subscription'); setFormData(p => ({...p, type: 'subscription'})); }} style={{ padding: '10px 15px', borderRadius: '20px', background: activeTab === 'subscription' ? 'var(--primary-color)' : 'var(--surface-color)', color: 'white', whiteSpace: 'nowrap', fontWeight: activeTab === 'subscription' ? 600 : 400 }}>
          <Repeat size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} /> Subscriptions
        </button>
        <button onClick={() => { setActiveTab('installment'); setFormData(p => ({...p, type: 'installment'})); }} style={{ padding: '10px 15px', borderRadius: '20px', background: activeTab === 'installment' ? 'var(--primary-color)' : 'var(--surface-color)', color: 'white', whiteSpace: 'nowrap', fontWeight: activeTab === 'installment' ? 600 : 400 }}>
          <CreditCard size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} /> Installments (BNPL)
        </button>
        <button onClick={() => { setActiveTab('strategic_debt'); setFormData(p => ({...p, type: 'strategic_debt'})); }} style={{ padding: '10px 15px', borderRadius: '20px', background: activeTab === 'strategic_debt' ? 'var(--danger-color)' : 'var(--surface-color)', color: 'white', whiteSpace: 'nowrap', fontWeight: activeTab === 'strategic_debt' ? 600 : 400 }}>
          <AlertTriangle size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} /> Strategic Debt
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1 }}>
        {filteredObligations.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No {activeTab.replace('_', ' ')}s found. Add one below.</p>
        ) : (
          filteredObligations.map(ob => (
            <div key={ob.id} className="glass-panel" style={{ padding: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{ob.name}</span>
                {ob.type === 'subscription' && <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>RM {ob.amount?.toFixed(2)} / {ob.cycle}</span>}
                {ob.type === 'installment' && <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>RM {ob.amountPerTerm?.toFixed(2)} / term</span>}
                {ob.type === 'strategic_debt' && <span style={{ fontWeight: 600, color: 'var(--danger-color)' }}>RM {ob.remainingDebt?.toFixed(2)}</span>}
              </div>
              
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span>Due Date: {ob.nextDueDate || 'N/A'}</span>
                
                {ob.type === 'installment' && (
                  <>
                    <span>Progress: {ob.termsCompleted} / {ob.totalTerms} terms</span>
                    <span>Remaining Principal: RM {ob.remainingPrincipal?.toFixed(2)}</span>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginTop: '5px' }}>
                      <div style={{ height: '100%', width: `${(ob.termsCompleted / ob.totalTerms) * 100}%`, background: 'var(--primary-color)' }} />
                    </div>
                  </>
                )}
                
                {ob.type === 'strategic_debt' && (
                  <>
                    <span style={{ color: 'var(--warning-color)' }}>Grace Period Ends: {ob.gracePeriodEndDate}</span>
                    <span>Rate After Grace: {ob.highInterestRate}%</span>
                  </>
                )}
              </div>

              <button onClick={() => handlePayment(ob)} className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                Record Payment
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Button */}
      <button style={{
        position: 'fixed', bottom: '30px', right: '30px', background: 'var(--primary-gradient)',
        color: 'white', borderRadius: '50%', width: '60px', height: '60px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(123, 97, 255, 0.5)', zIndex: 100
      }} onClick={() => setIsAddOpen(true)}>
        <PlusCircle size={30} />
      </button>

      {/* Add Modal */}
      {isAddOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel slide-up" style={{ width: '100%', maxWidth: '600px', padding: '25px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, backgroundColor: 'var(--surface-color-solid)' }}>
            <h3 style={{ marginBottom: '20px' }}>Add {activeTab.replace('_', ' ')}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Name (e.g. Netflix, Car Loan)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }} required />
              
              {activeTab === 'subscription' && (
                <>
                  <input type="number" placeholder="Amount (RM)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }} required />
                  <select value={formData.cycle} onChange={e => setFormData({...formData, cycle: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </>
              )}

              {activeTab === 'installment' && (
                <>
                  <input type="number" placeholder="Amount per term (RM)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }} required />
                  <input type="number" placeholder="Total Terms (e.g. 12)" value={formData.totalTerms} onChange={e => setFormData({...formData, totalTerms: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }} required />
                </>
              )}

              {activeTab === 'strategic_debt' && (
                <>
                  <input type="number" placeholder="Total Debt Amount (RM)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }} required />
                  <input type="number" placeholder="High Interest Rate (%)" value={formData.highInterestRate} onChange={e => setFormData({...formData, highInterestRate: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }} required />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Grace Period End Date</label>
                    <input type="date" value={formData.gracePeriodEndDate} onChange={e => setFormData({...formData, gracePeriodEndDate: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }} required />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Next Due Date</label>
                <input type="date" value={formData.nextDueDate} onChange={e => setFormData({...formData, nextDueDate: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }} required />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAddOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Obligations;
