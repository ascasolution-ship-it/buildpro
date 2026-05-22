import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  LayoutDashboard, 
  Briefcase, 
  CalendarDays, 
  FileText, 
  CircleDollarSign,
  CreditCard,
  Plus,
  Bell,
  Search,
  Hammer,
  Users,
  X,
  ClipboardList,
  HardHat,
  Truck,
  LogOut,
  User
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Schedule from './components/Schedule';
import Documents from './components/Documents';
import Budgets from './components/Budgets';
import Team from './components/Team';
import DailyLogs from './components/DailyLogs';
import Subcontractors from './components/Subcontractors';
import Equipment from './components/Equipment';
import Billing from './components/Billing';
import Login from './components/Login';
import Profile from './components/Profile';

import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', location: '', deadline: '', budget: '' });

  // Active Project Global State
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(() => {
    return localStorage.getItem('activeProjectId') || 'all';
  });
  const [activeProjectName, setActiveProjectName] = useState(() => {
    return localStorage.getItem('activeProjectName') || 'Todos los Proyectos';
  });

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      if (error) throw error;
      if (data) {
        setProjects(data);
        // Verify saved active project still exists
        const savedId = localStorage.getItem('activeProjectId') || 'all';
        if (savedId !== 'all' && !data.some(p => p.id === savedId)) {
          handleSelectProject('all', 'Todos los Proyectos');
        }
      }
    } catch (err) {
      console.error('Error fetching projects list:', err.message);
    }
  };

  const handleSelectProject = (id, name) => {
    setActiveProjectId(id);
    setActiveProjectName(name);
    localStorage.setItem('activeProjectId', id);
    localStorage.setItem('activeProjectName', name);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch projects when user session is active
  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session]);

  if (!session) {
    return <Login />;
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard activeProjectId={activeProjectId} setActiveTab={setActiveTab} onSelectProject={handleSelectProject} />;
      case 'projects': return <Projects activeProjectId={activeProjectId} onSelectProject={handleSelectProject} setActiveTab={setActiveTab} />;
      case 'schedule': return <Schedule activeProjectId={activeProjectId} onSelectProject={handleSelectProject} />;
      case 'documents': return <Documents activeProjectId={activeProjectId} onSelectProject={handleSelectProject} />;
      case 'budgets': return <Budgets activeProjectId={activeProjectId} onSelectProject={handleSelectProject} />;
      case 'team': return <Team activeProjectId={activeProjectId} />;
      case 'dailylogs': return <DailyLogs activeProjectId={activeProjectId} onSelectProject={handleSelectProject} />;
      case 'subcontractors': return <Subcontractors />;
      case 'equipment': return <Equipment />;
      case 'billing': return <Billing />;
      case 'profile': return <Profile />;
      default: return <Dashboard activeProjectId={activeProjectId} setActiveTab={setActiveTab} onSelectProject={handleSelectProject} />;
    }
  };

  const getPageTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'projects': return 'My Projects';
      case 'schedule': return 'Schedule';
      case 'documents': return 'Documents';
      case 'budgets': return 'Budgets';
      case 'team': return 'Team Management';
      case 'dailylogs': return 'Daily Site Logs';
      case 'subcontractors': return 'Subcontractors Directory';
      case 'equipment': return 'Fleet & Equipment';
      case 'billing': return 'Planes y Facturación';
      case 'profile': return 'Mi Perfil';
      default: return 'Dashboard';
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('projects').insert([{
        name: newProject.name,
        location: newProject.location,
        deadline: newProject.deadline || null,
        budget: newProject.budget ? parseFloat(newProject.budget) : 0,
        status: 'Planning',
        progress: 0
      }]).select();
      
      if (error) throw error;
      
      alert('Project created successfully!');
      setIsNewProjectModalOpen(false);
      setNewProject({ name: '', location: '', deadline: '', budget: '' });
      
      // Refresh projects list in App
      fetchProjects();
      
      // Auto-select the newly created project
      if (data && data.length > 0) {
        handleSelectProject(data[0].id, data[0].name);
      }

      // Force refresh by toggling tab if on projects
      if (activeTab === 'projects') {
        setActiveTab('dashboard');
        setTimeout(() => setActiveTab('projects'), 10);
      }
    } catch (err) {
      alert('Error creating project: ' + err.message);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Hammer size={28} />
          <span>BuildPro</span>
        </div>
        
        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /><span>Dashboard</span>
          </div>
          <div className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
            <Briefcase size={20} /><span>Projects</span>
          </div>
          <div className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
            <CalendarDays size={20} /><span>Schedule</span>
          </div>
          <div className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
            <FileText size={20} /><span>Documents</span>
          </div>
          <div className={`nav-item ${activeTab === 'budgets' ? 'active' : ''}`} onClick={() => setActiveTab('budgets')}>
            <CircleDollarSign size={20} /><span>Budgets</span>
          </div>
          <div className={`nav-item ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>
            <Users size={20} /><span>Team</span>
          </div>
          <div className={`nav-item ${activeTab === 'dailylogs' ? 'active' : ''}`} onClick={() => setActiveTab('dailylogs')}>
            <ClipboardList size={20} /><span>Daily Logs</span>
          </div>
          <div className={`nav-item ${activeTab === 'subcontractors' ? 'active' : ''}`} onClick={() => setActiveTab('subcontractors')}>
            <HardHat size={20} /><span>Subcontractors</span>
          </div>
          <div className={`nav-item ${activeTab === 'equipment' ? 'active' : ''}`} onClick={() => setActiveTab('equipment')}>
            <Truck size={20} /><span>Equipment</span>
          </div>
          <div className={`nav-item ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTab('billing')}>
            <CreditCard size={20} /><span>Planes y Facturación</span>
          </div>
          <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <User size={20} /><span>Mi Perfil</span>
          </div>
        </nav>

        {/* User Info & Logout */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conectado como:</span>
            <span style={{ 
              fontSize: '0.85rem', 
              color: '#fff', 
              fontWeight: '600', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap'
            }}>
              {session.user.email}
            </span>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="btn btn-secondary" 
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '0.6rem', 
              borderRadius: '0.5rem', 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1>{getPageTitle()}</h1>
            
            {/* Premium Project Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Proyecto:</span>
              <select
                className="form-input glass"
                style={{
                  width: 'auto',
                  padding: '0.4rem 2.2rem 0.4rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(20, 25, 35, 0.6)',
                  cursor: 'pointer',
                  color: '#fff',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                value={activeProjectId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'all') {
                    handleSelectProject('all', 'Todos los Proyectos');
                  } else {
                    const p = projects.find(proj => proj.id === val);
                    handleSelectProject(val, p ? p.name : 'Proyecto');
                  }
                }}
              >
                <option value="all">📁 Todos los Proyectos</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>🚧 {p.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
              <input type="text" className="form-input glass" placeholder="Search..." style={{ paddingLeft: '2.5rem', width: '250px' }} />
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            
            <button className="btn btn-secondary" style={{ padding: '0.75rem' }}>
              <Bell size={20} />
            </button>
            
            <button className="btn btn-primary" onClick={() => setIsNewProjectModalOpen(true)}>
              <Plus size={20} />
              <span>New</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        {renderContent()}
      </main>

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '400px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Create New Project</h2>
              <button onClick={() => setIsNewProjectModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input type="text" className="form-input" required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" className="form-input" required value={newProject.location} onChange={e => setNewProject({...newProject, location: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input type="date" className="form-input" value={newProject.deadline} onChange={e => setNewProject({...newProject, deadline: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Budget ($)</label>
                <input type="number" className="form-input" required value={newProject.budget} onChange={e => setNewProject({...newProject, budget: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsNewProjectModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
