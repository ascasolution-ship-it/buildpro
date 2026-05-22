import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Home, 
  Plus, 
  Edit2, 
  Trash2, 
  DollarSign, 
  Layers, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Map, 
  X 
} from 'lucide-react';

const UnitMap = ({ activeProjectId, onSelectProject }) => {
  const [units, setUnits] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [localActiveProjectId, setLocalActiveProjectId] = useState(activeProjectId || 'all');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  
  const [formData, setFormData] = useState({
    project_id: '',
    unit_name: '',
    status: 'Available',
    price: '',
    sq_ft: '',
    notes: ''
  });

  // Keep local project ID in sync with prop
  useEffect(() => {
    if (activeProjectId) {
      setLocalActiveProjectId(activeProjectId);
    }
  }, [activeProjectId]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [localActiveProjectId]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      if (error) throw error;
      setProjectsList(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err.message);
    }
  };

  const fetchUnits = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('project_units')
        .select(`
          *,
          projects:project_id (name)
        `)
        .order('unit_name', { ascending: true });

      if (localActiveProjectId !== 'all') {
        query = query.eq('project_id', localActiveProjectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setUnits(data || []);
    } catch (err) {
      console.error('Error fetching project units:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUnit(null);
    setFormData({
      project_id: localActiveProjectId !== 'all' ? localActiveProjectId : (projectsList[0]?.id || ''),
      unit_name: '',
      status: 'Available',
      price: '',
      sq_ft: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (unit) => {
    setEditingUnit(unit);
    setFormData({
      project_id: unit.project_id,
      unit_name: unit.unit_name,
      status: unit.status,
      price: unit.price || '',
      sq_ft: unit.sq_ft || '',
      notes: unit.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project_id) {
      alert('Please select a valid project.');
      return;
    }

    try {
      const payload = {
        project_id: formData.project_id,
        unit_name: formData.unit_name,
        status: formData.status,
        price: formData.price ? parseFloat(formData.price) : null,
        sq_ft: formData.sq_ft ? parseInt(formData.sq_ft) : null,
        notes: formData.notes
      };

      if (editingUnit) {
        // Update
        const { error } = await supabase
          .from('project_units')
          .update(payload)
          .eq('id', editingUnit.id);
        
        if (error) throw error;
        alert('Unit updated successfully!');
      } else {
        // Insert
        const { error } = await supabase
          .from('project_units')
          .insert([payload]);
        
        if (error) throw error;
        alert('Unit registered successfully!');
      }
      setIsModalOpen(false);
      fetchUnits();
    } catch (err) {
      alert('Error saving unit: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this unit/lot?')) return;
    try {
      const { error } = await supabase
        .from('project_units')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchUnits();
    } catch (err) {
      alert('Error deleting unit: ' + err.message);
    }
  };

  // Status helper styling
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Available':
        return { color: '#10b981', label: 'Available', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Under Contract':
        return { color: '#3b82f6', label: 'Under Contract', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' };
      case 'Sold':
        return { color: '#8b5cf6', label: 'Sold', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)' };
      case 'In Construction':
        return { color: '#f59e0b', label: 'Under Construction', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
      default:
        return { color: '#a1a1aa', label: status, bg: 'rgba(161, 161, 170, 0.15)', border: 'rgba(161, 161, 170, 0.3)' };
    }
  };

  // Filter units
  const filteredUnits = units.filter(unit => {
    if (filterStatus === 'All') return true;
    return unit.status === filterStatus;
  });

  // Compute stats
  const totalCount = units.length;
  const availableCount = units.filter(u => u.status === 'Available').length;
  const contractCount = units.filter(u => u.status === 'Under Contract').length;
  const soldCount = units.filter(u => u.status === 'Sold').length;
  const constructionCount = units.filter(u => u.status === 'In Construction').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Filter and Selectors */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        padding: '1.5rem',
        borderRadius: '1rem',
        background: 'rgba(15, 20, 30, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)'
      }}>
        
        {/* Project Context selector inside tab */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.6rem', backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: '0.75rem' }}>
            <Map size={24} color="var(--primary-color)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Interactive Unit Map</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {localActiveProjectId === 'all' ? 'Showing all projects' : 'Filtered by active project'}
            </span>
          </div>
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', 'Available', 'In Construction', 'Under Contract', 'Sold'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className="btn"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                background: filterStatus === st ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {st === 'All' ? 'All' : getStatusConfig(st).label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={18} /> Add Unit/Lot
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        <div className="content-card glass" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Units</span>
          <span style={{ fontSize: '1.75rem', fontWeight: '800' }}>{totalCount}</span>
        </div>
        <div className="content-card glass" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '3px solid #10b981' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Available</span>
          <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981' }}>{availableCount}</span>
        </div>
        <div className="content-card glass" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '3px solid #f59e0b' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Under Construction</span>
          <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f59e0b' }}>{constructionCount}</span>
        </div>
        <div className="content-card glass" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '3px solid #3b82f6' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Under Contract</span>
          <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#3b82f6' }}>{contractCount}</span>
        </div>
        <div className="content-card glass" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '3px solid #8b5cf6' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sold</span>
          <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#8b5cf6' }}>{soldCount}</span>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="content-card glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading unit map...
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="content-card glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Info size={36} style={{ opacity: 0.5 }} />
          <span>No units found for this project with the selected filter.</span>
          <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={handleOpenCreateModal}>
            Create First Unit
          </button>
        </div>
      ) : (
        <div>
          {/* Visual Grid representing the lot map */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {filteredUnits.map(unit => {
              const config = getStatusConfig(unit.status);
              return (
                <div
                  key={unit.id}
                  className="content-card glass"
                  style={{
                    padding: '1.5rem',
                    position: 'relative',
                    border: `1px solid ${config.border}`,
                    background: `linear-gradient(135deg, rgba(20, 25, 35, 0.6) 0%, ${config.bg} 100%)`,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 10px 20px rgba(0,0,0,0.3), 0 0 12px ${config.border}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Card Header */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ padding: '0.4rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.375rem' }}>
                          <Home size={16} color={config.color} />
                        </div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{unit.unit_name}</h4>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '100px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: config.bg,
                        color: config.color,
                        border: `1px solid ${config.border}`
                      }}>
                        {config.label}
                      </span>
                    </div>

                    {/* Project Label (only in global view) */}
                    {localActiveProjectId === 'all' && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontWeight: '500' }}>Project:</span>
                        <span style={{ color: '#fff' }}>{unit.projects?.name}</span>
                      </div>
                    )}

                    {/* Spec features */}
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {unit.price && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <DollarSign size={14} color="#10b981" />
                          <span style={{ color: '#fff', fontWeight: '600' }}>
                            {unit.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      )}
                      {unit.sq_ft && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Layers size={14} />
                          <span>{unit.sq_ft} sq ft</span>
                        </div>
                      )}
                    </div>

                    {unit.notes && (
                      <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        background: 'rgba(0,0,0,0.15)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.375rem',
                        marginTop: '0.75rem',
                        lineHeight: '1.3',
                        minHeight: '40px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {unit.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.5rem',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.75rem',
                    marginTop: '0.5rem'
                  }}>
                    <button
                      onClick={() => handleOpenEditModal(unit)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(unit.id)}
                      className="btn btn-danger"
                      style={{
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--danger-color)',
                        display: 'flex',
                        gap: '0.25rem',
                        alignItems: 'center'
                      }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Unit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '450px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{editingUnit ? 'Edit Unit/Lot' : 'Add New Unit'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              
              {/* Project select */}
              <div className="form-group">
                <label className="form-label">Associated Project</label>
                <select
                  className="form-input"
                  required
                  value={formData.project_id}
                  disabled={localActiveProjectId !== 'all'}
                  onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                >
                  <option value="" disabled>Select a project</option>
                  {projectsList.map(proj => (
                    <option key={proj.id} value={proj.id}>{proj.name}</option>
                  ))}
                </select>
              </div>

              {/* Unit Name / Lot */}
              <div className="form-group">
                <label className="form-label">Unit / Lot Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Unit A, Lot 14"
                  value={formData.unit_name}
                  onChange={e => setFormData({ ...formData, unit_name: e.target.value })}
                />
              </div>

              {/* Status & sq_ft row */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Sales/Work Status</label>
                  <select
                    className="form-input"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="In Construction">Under Construction</option>
                    <option value="Under Contract">Under Contract</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Area (sq ft)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 1500"
                    value={formData.sq_ft}
                    onChange={e => setFormData({ ...formData, sq_ft: e.target.value })}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="form-group">
                <label className="form-label">Sale Price ($)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 250000"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Notes and Construction Progress</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical', paddingTop: '0.5rem' }}
                  placeholder="Describe construction phase, concrete permits, or buyer details..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {editingUnit ? 'Save Changes' : 'Register Unit'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UnitMap;
