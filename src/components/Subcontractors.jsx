import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { HardHat, Phone, Mail, Star, Plus, X, Trash2, Edit2 } from 'lucide-react';

const Subcontractors = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    trade: '',
    rating: 5.0,
    phone: '',
    email: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchSubcontractors();
  }, []);

  const fetchSubcontractors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subcontractors')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setSubs(data || []);
    } catch (error) {
      console.error('Error fetching subcontractors:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSub(null);
    setFormData({
      name: '',
      trade: '',
      rating: 5.0,
      phone: '',
      email: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub) => {
    setEditingSub(sub);
    setFormData({
      name: sub.name,
      trade: sub.trade,
      rating: sub.rating || 5.0,
      phone: sub.phone || '',
      email: sub.email || '',
      status: sub.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSub) {
        // Update
        const { error } = await supabase
          .from('subcontractors')
          .update({
            name: formData.name,
            trade: formData.trade,
            rating: parseFloat(formData.rating) || 5.0,
            phone: formData.phone,
            email: formData.email,
            status: formData.status
          })
          .eq('id', editingSub.id);
        
        if (error) throw error;
        alert('Subcontractor updated successfully!');
      } else {
        // Insert
        const { error } = await supabase
          .from('subcontractors')
          .insert([
            {
              name: formData.name,
              trade: formData.trade,
              rating: parseFloat(formData.rating) || 5.0,
              phone: formData.phone,
              email: formData.email,
              status: formData.status
            }
          ]);
        
        if (error) throw error;
        alert('Subcontractor registered successfully!');
      }
      setIsModalOpen(false);
      fetchSubcontractors();
    } catch (error) {
      alert('Error saving subcontractor: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this subcontractor?')) return;
    try {
      const { error } = await supabase.from('subcontractors').delete().eq('id', id);
      if (error) throw error;
      fetchSubcontractors();
    } catch (error) {
      alert('Error deleting subcontractor: ' + error.message);
    }
  };

  return (
    <div className="subcontractors-container">
      <div className="content-card glass">
        <div className="card-header">
          <h2>Subcontractors Directory</h2>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={18} /> Add Subcontractor
          </button>
        </div>
        
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading subcontractors...</div>
        ) : subs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No subcontractors found. Click 'Add Subcontractor' to register one.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Trade / Specialty</th>
                <th>Rating</th>
                <th>Contact</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(sub => (
                <tr key={sub.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ padding: '0.5rem', backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: '0.5rem' }}>
                        <HardHat size={20} color="var(--primary-color)" />
                      </div>
                      <span style={{ fontWeight: 600 }}>{sub.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-info">{sub.trade}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                      <Star size={16} fill="currentColor" />
                      <span style={{ color: 'var(--text-main)' }}>{sub.rating}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {sub.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={14} /> {sub.phone}</span>}
                      {sub.email && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={14} /> {sub.email}</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${sub.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{sub.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleOpenEditModal(sub)}>
                        <Edit2 size={12} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger-color)' }} onClick={() => handleDelete(sub.id)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Subcontractor Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '450px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{editingSub ? 'Edit Subcontractor' : 'Add New Subcontractor'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input type="text" className="form-input" required placeholder="e.g. Apex Framing LLC" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Trade / Specialty</label>
                <input type="text" className="form-input" required placeholder="e.g. Electrical, Plumbing" value={formData.trade} onChange={e => setFormData({...formData, trade: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Rating (1.0 - 5.0)</label>
                  <input type="number" className="form-input" min="1" max="5" step="0.1" required value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Status</label>
                  <select 
                    className="form-input" 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="On-Hold">On-Hold</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-input" placeholder="(555) 123-4567" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="contact@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {editingSub ? 'Save Changes' : 'Add Subcontractor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subcontractors;
