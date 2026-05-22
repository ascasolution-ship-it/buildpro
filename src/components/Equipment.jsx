import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Truck, MapPin, Wrench, Plus, X, Trash2, Edit2, Calendar } from 'lucide-react';

const Equipment = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Heavy Machinery',
    location: 'Warehouse',
    status: 'Available',
    next_service: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0] // 30 days from now
  });

  useEffect(() => {
    fetchEquipment();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('name');
    if (data) setProjects(data);
  };

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setEquipmentList(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Dynamically calculate stats based on fetched data
  const totalHeavyMachinery = equipmentList.filter(item => item.category === 'Heavy Machinery' && item.status === 'In Use').length;
  const totalMaintenance = equipmentList.filter(item => item.status === 'Maintenance').length;

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Heavy Machinery',
      location: 'Warehouse',
      status: 'Available',
      next_service: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      location: item.location || 'Warehouse',
      status: item.status || 'Available',
      next_service: item.next_service || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Update
        const { error } = await supabase
          .from('equipment')
          .update({
            name: formData.name,
            category: formData.category,
            location: formData.location,
            status: formData.status,
            next_service: formData.next_service || null
          })
          .eq('id', editingItem.id);
        
        if (error) throw error;
        alert('Equipment updated successfully!');
      } else {
        // Insert
        const { error } = await supabase
          .from('equipment')
          .insert([
            {
              name: formData.name,
              category: formData.category,
              location: formData.location,
              status: formData.status,
              next_service: formData.next_service || null
            }
          ]);
        
        if (error) throw error;
        alert('Equipment added successfully!');
      }
      setIsModalOpen(false);
      fetchEquipment();
    } catch (error) {
      alert('Error saving equipment: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this equipment?')) return;
    try {
      const { error } = await supabase.from('equipment').delete().eq('id', id);
      if (error) throw error;
      fetchEquipment();
    } catch (error) {
      alert('Error deleting equipment: ' + error.message);
    }
  };

  return (
    <div className="equipment-container">
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card glass">
          <div className="stat-header">
            <span>Heavy Machinery in Use</span>
            <Truck size={20} color="var(--primary-color)" />
          </div>
          <div className="stat-value">{loading ? '...' : totalHeavyMachinery}</div>
          <div className="stat-trend trend-up">Active on sites</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-header">
            <span>Under Maintenance</span>
            <Wrench size={20} color="var(--danger-color)" />
          </div>
          <div className="stat-value">{loading ? '...' : totalMaintenance}</div>
          <div className="stat-trend trend-down">Service active/due</div>
        </div>
      </div>

      <div className="content-card glass">
        <div className="card-header">
          <h2>Equipment & Fleet Inventory</h2>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={18} /> Add Equipment
          </button>
        </div>
        
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading equipment...</div>
        ) : equipmentList.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No equipment found. Click 'Add Equipment' to register one.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th>Category</th>
                <th>Current Location</th>
                <th>Status</th>
                <th>Next Service</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map(item => (
                <tr key={item.id}>
                  <td>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                  </td>
                  <td>
                    <span className="badge badge-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                      {item.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                      <MapPin size={14} /> {item.location}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      item.status === 'In Use' ? 'badge-success' : 
                      item.status === 'Available' ? 'badge-info' : 'badge-danger'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} /> {item.next_service || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleOpenEditModal(item)}>
                        <Edit2 size={12} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger-color)' }} onClick={() => handleDelete(item.id)}>
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

      {/* Equipment Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '450px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{editingItem ? 'Edit Equipment Info' : 'Register New Equipment'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Equipment Name</label>
                <input type="text" className="form-input" required placeholder="e.g. CAT 320 Excavator" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <select 
                    className="form-input" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Heavy Machinery">Heavy Machinery</option>
                    <option value="Compact">Compact</option>
                    <option value="Lifts">Lifts</option>
                    <option value="Power">Power Tools / Generators</option>
                    <option value="Transport">Transport / Trucks</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Status</label>
                  <select 
                    className="form-input" 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Current Location</label>
                <select 
                  className="form-input"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                >
                  <option value="Warehouse">Warehouse (Storage)</option>
                  {projects.map((p, idx) => (
                    <option key={idx} value={p.name}>{p.name}</option>
                  ))}
                  <option value="Other">Other Site / Transition</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Next Service Date</label>
                <input type="date" className="form-input" value={formData.next_service} onChange={e => setFormData({...formData, next_service: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {editingItem ? 'Save Changes' : 'Register Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipment;
