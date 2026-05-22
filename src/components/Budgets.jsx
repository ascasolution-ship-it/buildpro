import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, Plus, X, Edit, Trash2, Tag, Layers, Landmark, Upload } from 'lucide-react';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';

const ESTIMATE_CATEGORIES = [
  'Permits & Engineering',
  'Site Work & Foundation',
  'Structural & Framing',
  'Roofing & Siding',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Interior Finishes',
  'Cabinets & Countertops',
  'Appliances & Hardware',
  'Landscaping & Cleanup',
  'Other'
];

const categorizeItem = (name) => {
  const n = name.toLowerCase();
  if (n.includes('permit') || n.includes('engineer') || n.includes('survey') || n.includes('design') || n.includes('architect')) return 'Permits & Engineering';
  if (n.includes('site') || n.includes('excavat') || n.includes('foundation') || n.includes('concrete') || n.includes('masonry')) return 'Site Work & Foundation';
  if (n.includes('frame') || n.includes('carpentry') || n.includes('structural') || n.includes('metal') || n.includes('wood')) return 'Structural & Framing';
  if (n.includes('roof') || n.includes('siding') || n.includes('gutter')) return 'Roofing & Siding';
  if (n.includes('plumb')) return 'Plumbing';
  if (n.includes('electr')) return 'Electrical';
  if (n.includes('hvac') || n.includes('heat') || n.includes('air') || n.includes('vent') || n.includes('mechanic')) return 'HVAC';
  if (n.includes('finish') || n.includes('paint') || n.includes('drywall') || n.includes('floor') || n.includes('tile') || n.includes('carpet') || n.includes('trim') || n.includes('sheetrock')) return 'Interior Finishes';
  if (n.includes('cabinet') || n.includes('counter') || n.includes('granite') || n.includes('vanity')) return 'Cabinets & Countertops';
  if (n.includes('appliance') || n.includes('hardw') || n.includes('fixture')) return 'Appliances & Hardware';
  if (n.includes('landscap') || n.includes('cleanup') || n.includes('trash') || n.includes('clean')) return 'Landscaping & Cleanup';
  return 'Other';
};

const Budgets = ({ activeProjectId }) => {
  const [budgets, setBudgets] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ allocated: 0, spent: 0, alerts: 0, activeProjects: 0 });
  
  // Expense Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ project_id: '', amount: '' });
  const [projectsList, setProjectsList] = useState([]);

  // Estimate Modal States
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);
  const [newEstimate, setNewEstimate] = useState({
    id: '',
    category: 'Permits & Engineering',
    item_name: '',
    cost: ''
  });

  useEffect(() => {
    fetchBudgets();
    fetchEstimates();
  }, [activeProjectId]);

  const fetchEstimates = async () => {
    if (!activeProjectId || activeProjectId === 'all') {
      setEstimates([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('project_id', activeProjectId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setEstimates(data || []);
    } catch (err) {
      console.error('Error fetching estimates:', err.message);
    }
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      
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

      const combinedData = (projectData || [])
        .filter(p => !activeProjectId || activeProjectId === 'all' || p.id === activeProjectId)
        .map(p => {
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

  const syncProjectBudget = async (projId) => {
    try {
      // Fetch all estimate costs for this project
      const { data: ests, error: estsErr } = await supabase
        .from('estimates')
        .select('cost')
        .eq('project_id', projId);
      
      if (estsErr) throw estsErr;

      const totalCost = (ests || []).reduce((sum, item) => sum + Number(item.cost || 0), 0);

      // Save to projects table budget field
      const { error: projErr } = await supabase
        .from('projects')
        .update({ budget: totalCost })
        .eq('id', projId);

      if (projErr) throw projErr;
    } catch (err) {
      console.error('Error syncing project budget:', err.message);
    }
  };

  const handleSaveEstimate = async (e) => {
    e.preventDefault();
    if (!newEstimate.category || !newEstimate.item_name || !newEstimate.cost) return;

    try {
      const costVal = parseFloat(newEstimate.cost) || 0;
      
      if (newEstimate.id) {
        // Edit mode
        const { error } = await supabase
          .from('estimates')
          .update({
            category: newEstimate.category,
            item_name: newEstimate.item_name,
            cost: costVal
          })
          .eq('id', newEstimate.id);
        if (error) throw error;
      } else {
        // Add mode
        const { error } = await supabase
          .from('estimates')
          .insert([{
            project_id: activeProjectId,
            category: newEstimate.category,
            item_name: newEstimate.item_name,
            cost: costVal
          }]);
        if (error) throw error;
      }

      setIsEstimateModalOpen(false);
      setNewEstimate({ id: '', category: 'Permits & Engineering', item_name: '', cost: '' });
      
      await syncProjectBudget(activeProjectId);
      await fetchBudgets();
      await fetchEstimates();
    } catch (error) {
      alert('Error saving estimate: ' + error.message);
    }
  };

  const handleOpenEditEstimate = (est) => {
    setNewEstimate({
      id: est.id,
      category: est.category,
      item_name: est.item_name,
      cost: String(est.cost)
    });
    setIsEstimateModalOpen(true);
  };

  const handleDeleteEstimate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this estimate item? The project total budget will be recalculated.')) return;
    try {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', id);
      if (error) throw error;

      await syncProjectBudget(activeProjectId);
      await fetchBudgets();
      await fetchEstimates();
    } catch (error) {
      alert('Error deleting estimate: ' + error.message);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const targetProjId = newExpense.project_id || activeProjectId;
    if (!targetProjId || !newExpense.amount) return;

    try {
      // Get current budgets record
      const { data: existing } = await supabase
        .from('budgets')
        .select('*')
        .eq('project_id', targetProjId)
        .maybeSingle();

      const expenseAmount = parseFloat(newExpense.amount);

      if (existing) {
        const { error } = await supabase
          .from('budgets')
          .update({ spent: parseFloat(existing.spent || 0) + expenseAmount })
          .eq('project_id', targetProjId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert([{ project_id: targetProjId, spent: expenseAmount, initial_budget: 0 }]);
        if (error) throw error;
      }

      alert('Expense logged successfully!');
      setIsExpenseModalOpen(false);
      setNewExpense({ project_id: '', amount: '' });
      await fetchBudgets();
    } catch (error) {
      alert('Error logging expense: ' + error.message);
    }
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        let sheetName = workbook.SheetNames.find(name => 
          name.toLowerCase() === 'summary' || 
          name.toLowerCase() === 'budget' || 
          name.toLowerCase() === 'estimates'
        ) || workbook.SheetNames[0];

        if (!sheetName) {
          alert("No sheets found in the Excel file.");
          return;
        }

        const ws = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const newEstimatesToInsert = [];
        
        for (const row of rows) {
          if (!row || row.length === 0) continue;
          
          let itemName = "";
          let cost = 0;

          const strings = [];
          const numbers = [];
          
          row.forEach((cell, idx) => {
            if (typeof cell === 'string') {
              const cleaned = cell.trim();
              if (cleaned) strings.push({ val: cleaned, idx });
            } else if (typeof cell === 'number') {
              numbers.push({ val: cell, idx });
            }
          });

          if (strings.some(s => s.val.toLowerCase() === 'code' || s.val.toLowerCase() === 'description' || s.val.toLowerCase() === 'amount' || s.val.toLowerCase() === 'budget')) {
            continue;
          }

          const hasSummaryKeywords = strings.some(s => {
            const valLower = s.val.toLowerCase();
            return valLower.includes('subtotal') || 
                   valLower.includes('total project') || 
                   valLower.includes('overhead') || 
                   valLower.includes('profit') ||
                   valLower.includes('contract sum') ||
                   valLower.includes('grand total');
          });

          if (hasSummaryKeywords) continue;

          if (row.length >= 3) {
            if (typeof row[2] === 'string' && typeof row[4] === 'number') {
              itemName = row[2].trim();
              cost = row[4];
            } else if (typeof row[1] === 'string' && typeof row[2] === 'number') {
              itemName = row[1].trim();
              cost = row[2];
            } else if (typeof row[0] === 'string' && typeof row[1] === 'number') {
              itemName = row[0].trim();
              cost = row[1];
            } else {
              if (strings.length > 0 && numbers.length > 0) {
                const lastNum = numbers[numbers.length - 1];
                const firstStr = strings.find(s => s.val.length > 2);
                if (firstStr && lastNum && lastNum.idx > firstStr.idx) {
                  itemName = firstStr.val;
                  cost = lastNum.val;
                }
              }
            }
          } else if (row.length === 2) {
            if (typeof row[0] === 'string' && typeof row[1] === 'number') {
              itemName = row[0].trim();
              cost = row[1];
            }
          }

          if (itemName && cost > 0) {
            newEstimatesToInsert.push({
              project_id: activeProjectId,
              category: categorizeItem(itemName),
              item_name: itemName,
              cost: cost
            });
          }
        }

        if (newEstimatesToInsert.length === 0) {
          alert(`Could not extract any valid estimate items from sheet '${sheetName}'. Please check the columns layout.`);
          return;
        }

        let shouldClear = false;
        if (estimates.length > 0) {
          const res = window.confirm(`Found ${newEstimatesToInsert.length} estimate items in sheet '${sheetName}'.\n\nClick OK to CLEAR existing estimates before importing.\nClick Cancel to APPEND to existing estimates.`);
          shouldClear = res;
        } else {
          const res = window.confirm(`Import ${newEstimatesToInsert.length} estimate items from sheet '${sheetName}'?`);
          if (!res) return;
        }

        if (shouldClear) {
          const { error: delErr } = await supabase
            .from('estimates')
            .delete()
            .eq('project_id', activeProjectId);
          if (delErr) throw delErr;
        }

        const { error: insErr } = await supabase
          .from('estimates')
          .insert(newEstimatesToInsert);
        if (insErr) throw insErr;

        alert(`Successfully imported ${newEstimatesToInsert.length} items!`);
        
        await syncProjectBudget(activeProjectId);
        await fetchBudgets();
        await fetchEstimates();
      } catch (err) {
        alert("Error parsing Excel: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  // Find info of the currently selected project
  const currentProjectBudgetInfo = budgets.find(b => b.id === activeProjectId);

  return (
    <div className="budgets-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Upper Summary Statistics Row */}
      <div className="dashboard-grid">
        <div className="stat-card glass">
          <div className="stat-header">
            <span>{activeProjectId === 'all' ? 'Total Allocated Budget' : 'Project Cost Estimate'}</span>
            <DollarSign size={20} color="var(--primary-color)" />
          </div>
          <div className="stat-value">{formatCurrency(totals.allocated)}</div>
          <div className="stat-trend trend-up">
            <span>{activeProjectId === 'all' ? `Across ${totals.activeProjects} active projects` : 'Compiled from estimates'}</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-header">
            <span>Current Spend</span>
            <TrendingUp size={20} color="var(--warning-color)" />
          </div>
          <div className="stat-value">{formatCurrency(totals.spent)}</div>
          <div className="stat-trend">
            <span>{totals.allocated > 0 ? Math.round((totals.spent / totals.allocated) * 100) : 0}% of budget spent</span>
          </div>
        </div>

        <div className="stat-card glass" style={{ borderColor: totals.alerts > 0 ? 'var(--danger-color)' : 'var(--border-color)' }}>
          <div className="stat-header">
            <span style={{ color: totals.alerts > 0 ? 'var(--danger-color)' : 'var(--text-main)' }}>Deviation Status</span>
            <AlertTriangle size={20} color={totals.alerts > 0 ? 'var(--danger-color)' : 'var(--text-muted)'} />
          </div>
          <div className="stat-value">
            {activeProjectId === 'all' ? totals.alerts : (currentProjectBudgetInfo?.remaining < 0 ? 'OVER' : 'OK')}
          </div>
          <div className="stat-trend trend-down">
            <span>
              {activeProjectId === 'all' 
                ? 'Projects exceeding margin' 
                : (currentProjectBudgetInfo?.remaining < 0 ? 'Expenses exceed budget' : 'Spending is within limits')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      {(!activeProjectId || activeProjectId === 'all') ? (
        /* Global View of All Projects */
        <div className="content-card glass">
          <div className="card-header">
            <h2>Financial Breakdown by Project</h2>
            <div className="header-actions">
              <button className="btn btn-primary" onClick={() => {
                setNewExpense({ project_id: '', amount: '' });
                setIsExpenseModalOpen(true);
              }}>
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
                  <th>Compiled Budget</th>
                  <th>Spent (Current)</th>
                  <th>Remaining</th>
                  <th>Financial Status</th>
                </tr>
              </thead>
              <tbody>
                {budgets.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No projects found.</td></tr>
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
                          <span className="badge badge-warning">Risk / Near Limit</span>
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
      ) : (
        /* Detailed Breakdown for a Single Selected Project */
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
          
          {/* Left Panel: Construction Estimates compilation */}
          <div className="content-card glass">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2>Construction Estimates</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Compile materials, labor, and subcontractor costs to auto-generate construction budget.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Upload size={18} />
                  <span>Import Excel</span>
                  <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    onChange={handleExcelImport} 
                    style={{ display: 'none' }} 
                  />
                </label>
                <button className="btn btn-primary" onClick={() => {
                  setNewEstimate({ id: '', category: 'Permits & Engineering', item_name: '', cost: '' });
                  setIsEstimateModalOpen(true);
                }}>
                  <Plus size={18} />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
            
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading estimates...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Estimate Item</th>
                      <th>Category</th>
                      <th>Estimated Cost</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimates.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          <Landmark size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                          <p style={{ margin: 0 }}>No estimates compiled yet.</p>
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem' }}>Click "+ Add Item" to compile your first category cost.</p>
                        </td>
                      </tr>
                    ) : (
                      <>
                        {estimates.map(e => (
                          <tr key={e.id}>
                            <td style={{ fontWeight: 500 }}>{e.item_name}</td>
                            <td>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <Layers size={14} style={{ color: 'var(--primary-color)' }} />
                                {e.category}
                              </span>
                            </td>
                            <td style={{ fontWeight: '600' }}>{formatCurrency(e.cost)}</td>
                            <td>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button className="btn btn-secondary" style={{ padding: '0.35rem' }} onClick={() => handleOpenEditEstimate(e)} title="Edit Estimate">
                                  <Edit size={14} />
                                </button>
                                <button className="btn btn-secondary" style={{ padding: '0.35rem', color: 'var(--danger-color)' }} onClick={() => handleDeleteEstimate(e.id)} title="Delete Estimate">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {/* Summary Row */}
                        <tr style={{ background: 'rgba(255,255,255,0.03)', fontWeight: 'bold' }}>
                          <td colSpan="2">Total Project Estimate (Allocated Budget)</td>
                          <td style={{ color: 'var(--primary-color)', fontSize: '1.05rem' }}>
                            {formatCurrency(estimates.reduce((sum, i) => sum + Number(i.cost || 0), 0))}
                          </td>
                          <td></td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Right Panel: Expense Tracking & Margins */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="content-card glass">
              <div className="card-header">
                <h2>Project Financial Summary</h2>
              </div>
              
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Compiled Cost:</span>
                  <span style={{ fontWeight: '600', color: '#fff' }}>{formatCurrency(currentProjectBudgetInfo?.allocated || 0)}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Spent to Date:</span>
                  <span style={{ fontWeight: '600', color: '#fff' }}>{formatCurrency(currentProjectBudgetInfo?.spent || 0)}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Remaining Margin:</span>
                  <span style={{ 
                    fontWeight: '700', 
                    color: (currentProjectBudgetInfo?.remaining || 0) < 0 ? 'var(--danger-color)' : '#34d399'
                  }}>
                    {formatCurrency(currentProjectBudgetInfo?.remaining || 0)}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    <span>Budget Utilized</span>
                    <span>
                      {currentProjectBudgetInfo?.allocated > 0 
                        ? Math.round((currentProjectBudgetInfo.spent / currentProjectBudgetInfo.allocated) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="progress-container" style={{ margin: 0, height: '8px' }}>
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${Math.min(100, currentProjectBudgetInfo?.allocated > 0 ? (currentProjectBudgetInfo.spent / currentProjectBudgetInfo.allocated) * 100 : 0)}%`,
                        backgroundColor: (currentProjectBudgetInfo?.remaining || 0) < 0 ? 'var(--danger-color)' : 'var(--primary-color)'
                      }}
                    ></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                    setNewExpense({ project_id: activeProjectId, amount: '' });
                    setIsExpenseModalOpen(true);
                  }}>
                    Log Current Expense
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      )}

      {/* Add/Edit Estimate Modal */}
      {isEstimateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '420px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{newEstimate.id ? 'Edit Estimate Item' : 'Add Estimate Item'}</h2>
              <button onClick={() => setIsEstimateModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveEstimate}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-input" 
                  required 
                  value={newEstimate.category} 
                  onChange={e => setNewEstimate({...newEstimate, category: e.target.value})}
                >
                  {ESTIMATE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Estimate Item / Work Detail</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={newEstimate.item_name} 
                  onChange={e => setNewEstimate({...newEstimate, item_name: e.target.value})} 
                  placeholder="e.g. Concrete Footings, Framing Labor, Permits Fee"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Cost ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required 
                  min="0" 
                  step="0.01" 
                  value={newEstimate.cost} 
                  onChange={e => setNewEstimate({...newEstimate, cost: e.target.value})} 
                  placeholder="0.00"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsEstimateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Expense Modal */}
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
              {(!activeProjectId || activeProjectId === 'all') && (
                <div className="form-group">
                  <label className="form-label">Project</label>
                  <select className="form-input" required value={newExpense.project_id} onChange={e => setNewExpense({...newExpense, project_id: e.target.value})}>
                    <option value="">Select project...</option>
                    {projectsList.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Expense Amount ($)</label>
                <input type="number" className="form-input" required min="0" step="0.01" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} placeholder="0.00" />
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
