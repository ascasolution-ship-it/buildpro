import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Projects = ({ activeProjectId, onSelectProject, setActiveTab, onProjectsChange }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All statuses');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? All related tasks, documents, and budgets will be permanently deleted.')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      alert('Project deleted successfully.');
      fetchProjects();
      if (onProjectsChange) onProjectsChange();
    } catch (error) {
      alert('Error deleting project: ' + error.message);
    }
  };

  const handleOpenEditModal = (project) => {
    setEditingProject({
      ...project,
      owner: project.owner || '',
      description: project.description || '',
      deadline: project.deadline || '',
      budget: project.budget ? parseFloat(project.budget) : 0,
      progress: project.progress || 0
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: editingProject.name,
          owner: editingProject.owner,
          description: editingProject.description,
          location: editingProject.location,
          budget: editingProject.budget ? parseFloat(editingProject.budget) : 0,
          deadline: editingProject.deadline || null,
          status: editingProject.status,
          progress: parseInt(editingProject.progress) || 0,
          color: editingProject.color || 'var(--primary-color)'
        })
        .eq('id', editingProject.id);

      if (error) throw error;

      alert('Project updated successfully!');
      setIsEditModalOpen(false);
      fetchProjects();
      if (onProjectsChange) onProjectsChange();
    } catch (err) {
      alert('Error updating project: ' + err.message);
    }
  };

  const filteredProjects = filterStatus === 'All statuses' 
    ? projects 
    : projects.filter(p => p.status === filterStatus);

  return (
    <div className="projects-container">
      <div className="content-card glass">
        <div className="card-header">
          <h2>All Projects</h2>
          <div className="header-actions">
             <select 
               className="form-input" 
               style={{ width: 'auto', padding: '0.5rem 1rem' }}
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
             >
               <option value="All statuses">All Statuses</option>
               <option value="In Progress">In Progress</option>
               <option value="Completed">Completed</option>
               <option value="Planning">Planning</option>
               <option value="Delayed">Delayed</option>
             </select>
          </div>
        </div>
        
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading projects...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Owner / Client</th>
                  <th>Description / Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Deadline</th>
                  <th>Budget</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No projects found.</td>
                  </tr>
                ) : (
                  filteredProjects.map(p => (
                    <tr 
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p.id, p.name);
                        setActiveTab('dashboard');
                      }}
                      style={{ 
                        cursor: 'pointer',
                        background: activeProjectId === p.id ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                        borderLeft: activeProjectId === p.id ? '3px solid var(--primary-color)' : 'none'
                      }}
                    >
                      <td style={{ fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {activeProjectId === p.id && <span style={{ color: 'var(--primary-color)' }}>▶</span>}
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#fff', fontSize: '0.9rem' }}>{p.owner || '—'}</span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.description || '—'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                          <MapPin size={16} />
                          <span>{p.location}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${
                          p.status === 'Completed' ? 'success' : 
                          p.status === 'Delayed' ? 'warning' : 
                          p.status === 'In Progress' ? 'info' : 'secondary'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ minWidth: '150px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div className="progress-container" style={{ flex: 1, margin: 0 }}>
                            <div className="progress-bar" style={{ width: `${p.progress}%`, backgroundColor: p.color || 'var(--primary-color)' }}></div>
                          </div>
                          <span style={{ fontSize: '0.875rem' }}>{p.progress}%</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                          <Calendar size={16} />
                          <span>{p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>${Number(p.budget).toLocaleString()}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                            onClick={() => handleOpenEditModal(p)}
                            title="Edit Project"
                          >
                            <Edit size={14} />
                            <span>Edit</span>
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem 0.6rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                            onClick={() => handleDeleteProject(p.id)}
                            title="Delete Project"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      {isEditModalOpen && editingProject && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Edit Project: {editingProject.name}</h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>&times;</span>
              </button>
            </div>
            <form onSubmit={handleUpdateProject}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input type="text" className="form-input" required value={editingProject.name} onChange={e => setEditingProject({...editingProject, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Owner / Client</label>
                <input type="text" className="form-input" value={editingProject.owner} onChange={e => setEditingProject({...editingProject, owner: e.target.value})} placeholder="e.g. Sonia Homes LLC or Client Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Description / Work Type</label>
                <input type="text" className="form-input" value={editingProject.description} onChange={e => setEditingProject({...editingProject, description: e.target.value})} placeholder="e.g. House construction, Remodeling" />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" className="form-input" required value={editingProject.location} onChange={e => setEditingProject({...editingProject, location: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Budget ($) (Auto-calculated)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    readOnly 
                    disabled 
                    value={editingProject.budget} 
                    style={{ opacity: 0.75, cursor: 'not-allowed', backgroundColor: 'rgba(255,255,255,0.05)' }} 
                  />
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Calculated from compiled estimates in the Budgets tab.
                  </p>
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input type="date" className="form-input" value={editingProject.deadline} onChange={e => setEditingProject({...editingProject, deadline: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={editingProject.status} onChange={e => setEditingProject({...editingProject, status: e.target.value})}>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Progress (%)</label>
                  <input type="number" min="0" max="100" className="form-input" required value={editingProject.progress} onChange={e => setEditingProject({...editingProject, progress: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Project Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="color" className="form-input" style={{ width: '50px', height: '40px', padding: '0.2rem', cursor: 'pointer' }} value={editingProject.color || '#3b82f6'} onChange={e => setEditingProject({...editingProject, color: e.target.value})} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{editingProject.color || '#3b82f6'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
