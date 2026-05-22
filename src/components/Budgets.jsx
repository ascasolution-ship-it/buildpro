import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, Plus, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ allocated: 0, spent: 0, alerts: 0, activeProjects: 0 });
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ project_id: '', amount: '' });
  const [projectsList, setProjectsList] = useState([]);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      // Fetch projects to use their budget if budgets table is empty, or fetch budgets directly
      // For simplicity, we will assume projects table is the source of truth for allocated budget,
      // and we just display it. We don't have a way to input spending yet, so we will show 0 or mock data if missing.
      
      const { data: projectData, error: projError } = await supabase
        .from('projects')
        .select('id, name, budget, status');

      if (projError) throw projError;
      setProjectsList(projectData || []);

      const { data: budgetData, error: budgError } = await supabase
        .from('budgets')
        .select('*');

      if (budgError) throw budgError;

      let totalAllocated = 0;
      let totalSpent = 0;
      let alerts = 0;
      let active = 0;

      const combinedData = (projectData || []).map(p => {
        const b = budgetData?.find(b => b.project_id === p.id) || { spent: 0 };
        const allocated = Number(p.budget || 0);
        const spent = Number(b.spent || 0);
        const remaining = allocated - spent;
        
        totalAllocated += allocated;
        totalSpent += spent;
        
        if (p.status !== 'Completed') active++;
        if (remaining < 0 || (allocated > 0 && spent / allocated > 0.9)) alerts++;

        return {
          id: p.id,
          name: p.name,
          allocated,
          spent,
          remaining
        };
      });

      setBudgets(combinedData);
      setTotals({ allocated: totalAllocated, spent: totalSpent, alerts, activeProjects: active });
    } catch (error) {
      console.error('Error fetching budgets:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.project_id || !newExpense.amount) return;

    try {
      // Fetch current budget record if it exists
      const { data: existing } = await supabase
        .from('budgets')
        .select('*')
        .eq('project_id', newExpense.project_id)
        .single();

      const expenseAmount = parseFloat(newExpense.amount);

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('budgets')
          .update({ spent: parseFloat(existing.spent || 0) + expenseAmount })
          .eq('project_id', newExpense.project_id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('budgets')
          .insert([{ project_id: newExpense.project_id, spent: expenseAmount }]);
        if (error) throw error;
      }

      alert('Expense logged successfully!');
      setIsExpenseModalOpen(false);
      setNewExpense({ project_id: '', amount: '' });
      fetchBudgets();
    } catch (error) {
      alert('Error logging expense: ' + error.message);
    }
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="budgets-container">
      <div className="dashboard-grid">
        <div className="stat-card glass">
          <div className="stat-header">
            <span>Total Allocated Budget</span>
            <DollarSign size={20} color="var(--primary-color)" />
          </div>
          <div className="stat-value">{formatCurrency(totals.allocated)}</div>
          <div className="stat-trend trend-up">
            <span>Across {totals.activeProjects} active projects</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-header">
            <span>Current Spend</span>
            <TrendingUp size={20} color="var(--warning-color)" />
          </div>
          <div className="stat-value">{formatCurrency(totals.spent)}</div>
          <div className="stat-trend">
            <span>{totals.allocated > 0 ? Math.round((totals.spent / totals.allocated) * 100) : 0}% of total budget</span>
          </div>
        </div>

        <div className="stat-card glass" style={{ borderColor: totals.alerts > 0 ? 'var(--danger-color)' : 'var(--border-color)' }}>
          <div className="stat-header">
            <span style={{ color: totals.alerts > 0 ? 'var(--danger-color)' : 'var(--text-main)' }}>Deviation Alerts</span>
            <AlertTriangle size={20} color={totals.alerts > 0 ? 'var(--danger-color)' : 'var(--text-muted)'} />
          </div>
          <div className="stat-value">{totals.alerts}</div>
          <div className="stat-trend trend-down">
            <span>Projects exceeding margin</span>
          </div>
        </div>
      </div>

      <div className="content-card glass">
        <div className="card-header">
          <h2>Financial Breakdown by Project</h2>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setIsExpenseModalOpen(true)}>
              <Plus size={18} />
              <span>Log Expense</span>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading financial data...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Initial Budget</th>
                <th>Spent (Current)</th>
                <th>Remaining</th>
                <th>Financial Status</th>
              </tr>
            </thead>
            <tbody>
              {budgets.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No budget data found.</td></tr>
              ) : (
                budgets.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 500 }}>{b.name}</td>
                    <td>{formatCurrency(b.allocated)}</td>
                    <td>{formatCurrency(b.spent)}</td>
                    <td style={{ color: b.remaining < 0 ? 'var(--danger-color)' : b.remaining < b.allocated * 0.1 ? 'var(--warning-color)' : 'inherit' }}>
                      {formatCurrency(b.remaining)}
                    </td>
                    <td>
                      {b.remaining < 0 ? (
                        <span className="badge badge-danger">Over-budget</span>
                      ) : b.remaining < b.allocated * 0.1 ? (
                        <span className="badge badge-warning">Risk of over-budget</span>
                      ) : b.spent === 0 ? (
                        <span className="badge badge-info">Initial phase</span>
                      ) : (
                        <span className="badge badge-success">Within margin</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isExpenseModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '400px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Log New Expense</h2>
              <button onClick={() => setIsExpenseModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddExpense}>
              <div className="form-group">
                <label className="form-label">Project</label>
                <select className="form-input" required value={newExpense.project_id} onChange={e => setNewExpense({...newExpense, project_id: e.target.value})}>
                  <option value="">Select project...</option>
                  {projectsList.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input type="number" className="form-input" required min="0" step="0.01" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsExpenseModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
