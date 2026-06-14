import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getTransactions, getNetWorthHistory } from '../services/db';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'];

function Analytics() {
  const navigate = useNavigate();
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);

  const loadData = async () => {
    try {
      // 1. Flexible Spending Pie Chart Data (Current Month)
      const txs = await getTransactions();
      const thisMonth = new Date().toISOString().substring(0, 7);
      
      const categoryMap = {};
      let total = 0;
      
      txs.forEach(t => {
        if (t.date && t.date.startsWith(thisMonth) && t.amount > 0) {
          const cat = t.category || 'Uncategorized';
          categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
          total += t.amount;
        }
      });

      const pieChartData = Object.keys(categoryMap).map(key => ({
        name: key,
        value: categoryMap[key]
      })).sort((a, b) => b.value - a.value);

      setPieData(pieChartData);
      setTotalSpent(total);

      // 2. Net Worth Growth Line Chart Data
      const history = await getNetWorthHistory();
      // Ensure it's sorted chronologically
      const lineChartData = history.sort((a, b) => a.month.localeCompare(b.month));
      setLineData(lineChartData);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ padding: '20px', paddingBottom: '40px', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }} className="fade-in">
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart2 size={24} color="var(--text-primary)" />
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '1.8rem', margin: 0, color: 'var(--text-primary)' }}>Analytics</h2>
        </div>
      </header>

      {/* Chart 1: Flexible Spending Proportion */}
      <section style={{ marginBottom: '40px', background: 'var(--surface-color)', padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>Spending Breakdown</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Where your flexible budget went this month</p>
        
        {pieData.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No spending recorded this month.</p>
        ) : (
          <>
            <div style={{ height: '250px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `RM ${value.toFixed(2)}`}
                    contentStyle={{ borderRadius: '8px', background: 'var(--surface-color-solid)', border: 'none', color: 'var(--text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              {pieData.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                    <span style={{ color: 'var(--text-primary)' }}>{entry.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>RM {entry.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Chart 2: Net Worth Growth Trend */}
      <section style={{ background: 'var(--surface-color)', padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>Net Worth Growth</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Tracking your financial progress</p>
        
        {lineData.length < 1 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>Not enough data to display trend.</p>
        ) : (
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `RM ${value/1000}k`} />
                <Tooltip 
                  formatter={(value) => [`RM ${value.toFixed(2)}`, 'Net Worth']}
                  labelStyle={{ color: 'var(--text-secondary)' }}
                  contentStyle={{ borderRadius: '8px', background: 'var(--surface-color-solid)', border: 'none', color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="value" stroke="var(--text-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-primary)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}

export default Analytics;
