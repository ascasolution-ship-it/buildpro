import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CloudRain, Sun, Wind, Plus, Filter, Trash2, Edit2, X, ClipboardList, CheckCircle, Clock } from 'lucide-react';

const DailyLogs = ({ activeProjectId, onSelectProject }) => {
  const [logs, setLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  
  const [formData, setFormData] = useState({
    project_id: '',
    date: new Date().toISOString().split('T')[0],
    weather: 'Sunny',
    temperature: '75°F',
    wind: '5 mph',
    notes: '',
    reported_by: '',
    status: 'Pending Review',
    attachments: 0
  });

  useEffect(() => {
    fetchProjects();
    fetchLogs();
  }, [activeProjectId]);

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('id, name');
    if (data) setProjects(data);
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('daily_logs')
        .select(`
          *,
          projects ( name )
        `)
        .order('date', { ascending: false });

      if (activeProjectId && activeProjectId !== 'all') {
        query = query.eq('project_id', activeProjectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching daily logs:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingLog(null);
    setFormData({
      project_id: (!activeProjectId || activeProjectId === 'all') ? (projects[0]?.id || '') : activeProjectId,
      date: new Date().toISOString().split('T')[0],
      weather: 'Sunny',
      temperature: '75°F',
      wind: '5 mph',
      notes: '',
      reported_by: '',
      status: 'Pending Review',
      attachments: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (log) => {
    setEditingLog(log);
    setFormData({
      project_id: log.project_id,
      date: log.date,
      weather: log.weather || 'Sunny',
      temperature: log.temperature || '',
      wind: log.wind || '',
      notes: log.notes,
      reported_by: log.reported_by,
      status: log.status || 'Pending Review',
      attachments: log.attachments || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLog) {
        // Update
        const { error } = await supabase
          .from('daily_logs')
          .update({
            project_id: formData.project_id,
            date: formData.date,
            weather: formData.weather,
            temperature: formData.temperature,
            wind: formData.wind,
            notes: formData.notes,
            reported_by: formData.reported_by,
            status: formData.status,
            attachments: parseInt(formData.attachments) || 0
          })
          .eq('id', editingLog.id);
        
        if (error) throw error;
        alert('Daily log updated successfully!');
      } else {
        // Insert
        const { error } = await supabase
          .from('daily_logs')
          .insert([
            {
              project_id: formData.project_id,
              date: formData.date,
              weather: formData.weather,
              temperature: formData.temperature,
              wind: formData.wind,
              notes: formData.notes,
              reported_by: formData.reported_by,
              status: formData.status,
              attachments: parseInt(formData.attachments) || 0
            }
          ]);
        
        if (error) throw error;
        alert('Daily log created successfully!');
      }
      setIsModalOpen(false);
      fetchLogs();
    } catch (error) {
      alert('Error saving log entry: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log entry?')) return;
    try {
      const { error } = await supabase.from('daily_logs').delete().eq('id', id);
      if (error) throw error;
      fetchLogs();
    } catch (error) {
      alert('Error deleting log entry: ' + error.message);
    }
  };

  const getWeatherIcon = (weather) => {
    switch (weather?.toLowerCase()) {
      case 'sunny': return <Sun size={18} color="#fbbf24" />;
      case 'heavy rain':
      case 'rainy': return <CloudRain size={18} color="#60a5fa" />;
      default: return <Wind size={18} color="#9ca3af" />;
    }
  };

  return (
    <div className="daily-logs-container" style={{ position: 'relative' }}>
      <div className="content-card glass">
        <div className="card-header">
          <h2>Daily Site Logs</h2>
          <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} color="var(--text-muted)" />
              <select 
                className="form-input" 
                style={{ padding: '0.5rem', width: 'auto', marginBottom: 0 }}
                value={activeProjectId || 'all'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'all') {
                    onSelectProject('all', 'Todos los Proyectos');
                  } else {
                    const p = projects.find(proj => proj.id === val);
                    onSelectProject(val, p ? p.name : 'Proyecto');
                  }
                }}
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={18} />
              <span>New Log Entry</span>
            </button>
          </div>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading site logs...</div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No logs found for this project. Click 'New Log Entry' to add one.</div>
          ) : (
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
              {logs.map((log) => (
                <div key={log.id} className="stat-card glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{log.date}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Project: {log.projects?.name || 'Unknown'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`badge ${
                        log.status === 'Approved' ? 'badge-success' : 
                        log.status === 'Rejected' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {log.status === 'Approved' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={12} /> Approved</span> : 
                         log.status === 'Pending Review' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> Pending</span> : log.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    {log.weather && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {getWeatherIcon(log.weather)} {log.weather}
                      </span>
                    )}
                    {log.temperature && <span>Temp: {log.temperature}</span>}
                    {log.wind && <span>Wind: {log.wind}</span>}
                  </div>

                  <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: '1.5', flex: 1 }}>
                    {log.notes}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <span>By: {log.reported_by}</span>
                    <span>{log.attachments || 0} Attachments</span>
                  </div>

                  {/* Actions overlay/footer */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-end', marginTop: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleOpenEditModal(log)}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger-color)' }} onClick={() => handleDelete(log.id)}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Log Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{editingLog ? 'Edit Daily Log' : 'New Daily Log Entry'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project</label>
                <select 
                  className="form-input" 
                  required 
                  value={formData.project_id} 
                  onChange={e => setFormData({...formData, project_id: e.target.value})}
                >
                  <option value="">Select project...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Reported By</label>
                  <input type="text" className="form-input" required placeholder="Name" value={formData.reported_by} onChange={e => setFormData({...formData, reported_by: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Weather Condition</label>
                  <select 
                    className="form-input" 
                    value={formData.weather} 
                    onChange={e => setFormData({...formData, weather: e.target.value})}
                  >
                    <option value="Sunny">Sunny</option>
                    <option value="Cloudy">Cloudy</option>
                    <option value="Heavy Rain">Heavy Rain</option>
                    <option value="Windy">Windy</option>
                    <option value="Snowy">Snowy</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Temperature (e.g. 75°F)</label>
                  <input type="text" className="form-input" value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Wind Speed (e.g. 5 mph)</label>
                  <input type="text" className="form-input" value={formData.wind} onChange={e => setFormData({...formData, wind: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Attachments Count</label>
                  <input type="number" className="form-input" min="0" value={formData.attachments} onChange={e => setFormData({...formData, attachments: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-input" 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Pending Review">Pending Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Work Notes / Incidents</label>
                <textarea 
                  className="form-input" 
                  style={{ height: '100px', resize: 'vertical' }}
                  required 
                  placeholder="Describe operations, progress, safety issues, etc."
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {editingLog ? 'Save Changes' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyLogs;
