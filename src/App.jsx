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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Login />;
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'projects': return <Projects />;
      case 'schedule': return <Schedule />;
      case 'documents': return <Documents />;
      case 'budgets': return <Budgets />;
      case 'team': return <Team />;
      case 'dailylogs': return <DailyLogs />;
      case 'subcontractors': return <Subcontractors />;
      case 'equipment': return <Equipment />;
      case 'billing': return <Billing />;
      case 'profile': return <Profile />;
      default: return <Dashboard />;
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
      const { error } = await supabase.from('projects').insert([{
        name: newProject.name,
        location: newProject.location,
        deadline: newProject.deadline || null,
        budget: newProject.budget ? parseFloat(newProject.budget) : 0,
        status: 'Planning',
        progress: 0
      }]);
      
      if (error) throw error;
      
      alert('Project created successfully!');
      setIsNewProjectModalOpen(false);
      setNewProject({ name: '', location: '', deadline: '', budget: '' });
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
          <h1>{getPageTitle()}</h1>
          
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
