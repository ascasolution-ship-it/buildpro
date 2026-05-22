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
    if (!window.confirm('¿Está seguro de que desea eliminar este proyecto? Se eliminarán de forma permanente todas las tareas, documentos y presupuestos relacionados.')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      alert('Proyecto eliminado exitosamente.');
      fetchProjects();
      if (onProjectsChange) onProjectsChange();
    } catch (error) {
      alert('Error eliminando proyecto: ' + error.message);
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

      alert('¡Proyecto actualizado exitosamente!');
      setIsEditModalOpen(false);
      fetchProjects();
      if (onProjectsChange) onProjectsChange();
    } catch (err) {
      alert('Error actualizando proyecto: ' + err.message);
    }
  };

  const filteredProjects = filterStatus === 'All statuses' 
    ? projects 
    : projects.filter(p => p.status === filterStatus);

  return (
    <div className="projects-container">
      <div className="content-card glass">
        <div className="card-header">
          <h2>Todos los Proyectos</h2>
          <div className="header-actions">
             <select 
               className="form-input" 
               style={{ width: 'auto', padding: '0.5rem 1rem' }}
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
             >
               <option value="All statuses">Todos los estados</option>
               <option value="In Progress">In Progress (En curso)</option>
               <option value="Completed">Completed (Completado)</option>
               <option value="Planning">Planning (Planificación)</option>
               <option value="Delayed">Delayed (Retrasado)</option>
             </select>
          </div>
        </div>
        
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando proyectos...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre del Proyecto</th>
                  <th>Propietario / Cliente</th>
                  <th>Descripción / Tipo</th>
                  <th>Localización</th>
                  <th>Estado</th>
                  <th>Progreso</th>
                  <th>Fecha Límite</th>
                  <th>Presupuesto</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No se encontraron proyectos.</td>
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
                            title="Editar Proyecto"
                          >
                            <Edit size={14} />
                            <span>Editar</span>
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem 0.6rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                            onClick={() => handleDeleteProject(p.id)}
                            title="Eliminar Proyecto"
                          >
                            <Trash2 size={14} />
                            <span>Eliminar</span>
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

      {/* Modal de Edición de Proyecto */}
      {isEditModalOpen && editingProject && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Editar Proyecto: {editingProject.name}</h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>&times;</span>
              </button>
            </div>
            <form onSubmit={handleUpdateProject}>
              <div className="form-group">
                <label className="form-label">Nombre del Proyecto</label>
                <input type="text" className="form-input" required value={editingProject.name} onChange={e => setEditingProject({...editingProject, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Propietario / Cliente</label>
                <input type="text" className="form-input" value={editingProject.owner} onChange={e => setEditingProject({...editingProject, owner: e.target.value})} placeholder="Ej: Sonia Homes LLC o Nombre de Cliente" />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción / Tipo de Obra</label>
                <input type="text" className="form-input" value={editingProject.description} onChange={e => setEditingProject({...editingProject, description: e.target.value})} placeholder="Ej: Construcción casa, Remodelación" />
              </div>
              <div className="form-group">
                <label className="form-label">Localización</label>
                <input type="text" className="form-input" required value={editingProject.location} onChange={e => setEditingProject({...editingProject, location: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Presupuesto ($)</label>
                  <input type="number" step="any" className="form-input" required value={editingProject.budget} onChange={e => setEditingProject({...editingProject, budget: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha Límite</label>
                  <input type="date" className="form-input" value={editingProject.deadline} onChange={e => setEditingProject({...editingProject, deadline: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-input" value={editingProject.status} onChange={e => setEditingProject({...editingProject, status: e.target.value})}>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Progreso (%)</label>
                  <input type="number" min="0" max="100" className="form-input" required value={editingProject.progress} onChange={e => setEditingProject({...editingProject, progress: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Color del Proyecto</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="color" className="form-input" style={{ width: '50px', height: '40px', padding: '0.2rem', cursor: 'pointer' }} value={editingProject.color || '#3b82f6'} onChange={e => setEditingProject({...editingProject, color: e.target.value})} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{editingProject.color || '#3b82f6'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
