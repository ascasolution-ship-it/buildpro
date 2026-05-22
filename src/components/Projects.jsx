import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, MoreVertical } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All statuses');

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
    if (!window.confirm('Are you sure you want to delete this project? This will also delete related tasks and documents.')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      alert('Project deleted successfully.');
      fetchProjects();
    } catch (error) {
      alert('Error deleting project: ' + error.message);
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
               <option value="All statuses">All statuses</option>
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
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Deadline</th>
                <th>Budget</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No projects found.</td>
                </tr>
              ) : (
                filteredProjects.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
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
                          <div className="progress-bar" style={{ width: `${p.progress}%`, backgroundColor: p.color }}></div>
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
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem', color: 'var(--danger-color)' }}
                        onClick={() => handleDeleteProject(p.id)}
                        title="Delete Project"
                      >
                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>&times;</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Projects;
