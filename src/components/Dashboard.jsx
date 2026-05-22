import React, { useState, useEffect } from 'react';
import { Activity, Clock, FileCheck, Users } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Dashboard = ({ activeProjectId, setActiveTab, onSelectProject }) => {
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalTasks: 0,
    totalDocs: 0,
    totalTeam: 0,
    progress: 0,
    status: '',
    location: '',
    budget: 0,
    deadline: null,
    color: 'var(--primary-color)'
  });
  const [projects, setProjects] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [activeProjectId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!activeProjectId || activeProjectId === 'all') {
        const { data: pData } = await supabase.from('projects').select('*').neq('status', 'Completed');
        const { data: tData } = await supabase.from('tasks').select('id');
        const { data: dData } = await supabase.from('documents').select('id');
        const { data: uData } = await supabase.from('user_profiles').select('id');

        setStats({
          activeProjects: pData ? pData.length : 0,
          totalTasks: tData ? tData.length : 0,
          totalDocs: dData ? dData.length : 0,
          totalTeam: uData ? uData.length : 0,
          progress: 0,
          status: '',
          location: '',
          budget: 0,
          deadline: null,
          color: 'var(--primary-color)'
        });

        if (pData) {
          setProjects(pData.sort((a, b) => b.progress - a.progress).slice(0, 3)); // Top 3 projects
        }

        // Just grab some tasks for upcoming deliveries (mocking deadline mapping)
        const { data: tasksData } = await supabase.from('tasks').select('name, projects(name)').limit(3);
        if (tasksData) {
          setUpcoming(tasksData.map(t => ({
            name: t.name,
            project: t.projects?.name,
            date: 'Soon'
          })));
        }
      } else {
        // Fetch specific project details
        const { data: currentProj, error: cpErr } = await supabase
          .from('projects')
          .select('*')
          .eq('id', activeProjectId)
          .single();
        
        if (cpErr) throw cpErr;

        // Fetch counts for this project
        const { data: tData } = await supabase.from('tasks').select('id, name, progress').eq('project_id', activeProjectId);
        const { data: dData } = await supabase.from('documents').select('id').eq('project_id', activeProjectId);
        const { data: uData } = await supabase.from('user_profiles').select('id'); // global user list

        setStats({
          activeProjects: currentProj ? 1 : 0,
          totalTasks: tData ? tData.length : 0,
          totalDocs: dData ? dData.length : 0,
          totalTeam: uData ? uData.length : 0,
          progress: currentProj ? currentProj.progress : 0,
          status: currentProj ? currentProj.status : '',
          location: currentProj ? currentProj.location : '',
          budget: currentProj ? currentProj.budget : 0,
          deadline: currentProj ? currentProj.deadline : null,
          color: currentProj ? currentProj.color : 'var(--primary-color)'
        });

        if (currentProj) {
          setProjects([currentProj]);
        }

        // Fetch upcoming tasks for this specific project (not yet finished)
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('name')
          .eq('project_id', activeProjectId)
          .neq('progress', 100)
          .limit(3);

        if (tasksData) {
          setUpcoming(tasksData.map(t => ({
            name: t.name,
            project: currentProj.name,
            date: 'Soon'
          })));
        } else {
          setUpcoming([]);
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="stat-card glass">
          <div className="stat-header">
            <span>{!activeProjectId || activeProjectId === 'all' ? 'Active Projects' : 'Project Progress'}</span>
            <Activity size={20} color="var(--primary-color)" />
          </div>
          <div className="stat-value">
            {!activeProjectId || activeProjectId === 'all' ? stats.activeProjects : `${stats.progress}%`}
          </div>
          <div className="stat-trend trend-up">
            <span>{!activeProjectId || activeProjectId === 'all' ? 'Currently running' : `Status: ${stats.status}`}</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-header">
            <span>{!activeProjectId || activeProjectId === 'all' ? 'Total Tasks' : 'Project Tasks'}</span>
            <Clock size={20} color="var(--warning-color)" />
          </div>
          <div className="stat-value">{stats.totalTasks}</div>
          <div className="stat-trend trend-down">
            <span>In Schedule</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-header">
            <span>{!activeProjectId || activeProjectId === 'all' ? 'Uploaded Documents' : 'Project Documents'}</span>
            <FileCheck size={20} color="var(--secondary-color)" />
          </div>
          <div className="stat-value">{stats.totalDocs}</div>
          <div className="stat-trend trend-up">
            <span>{!activeProjectId || activeProjectId === 'all' ? 'Across all categories' : 'For this project'}</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-header">
            <span>Field Team</span>
            <Users size={20} color="var(--info-color)" />
          </div>
          <div className="stat-value">{stats.totalTeam}</div>
          <div className="stat-trend">
            <span>Registered users</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="content-card glass">
          <div className="card-header">
            <h2>{!activeProjectId || activeProjectId === 'all' ? 'Main Projects Progress' : 'Project Details'}</h2>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {!activeProjectId || activeProjectId === 'all' ? (
              projects.length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>No active projects.</div>
              ) : (
                projects.map(p => (
                  <div key={p.id} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 500 }}>{p.name} ({p.status})</span>
                      <span>{p.progress}%</span>
                    </div>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${p.progress}%`, backgroundColor: p.color || 'var(--primary-color)' }}></div>
                    </div>
                  </div>
                ))
              )
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Location</span>
                    <span style={{ fontWeight: 500, color: '#fff' }}>{stats.location || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Budget</span>
                    <span style={{ fontWeight: 500, color: '#fff' }}>${Number(stats.budget || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Deadline</span>
                    <span style={{ fontWeight: 500, color: '#fff' }}>{stats.deadline ? new Date(stats.deadline).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Current Phase</span>
                    <div>
                      <span className={`badge badge-${
                        stats.status === 'Completed' ? 'success' : 
                        stats.status === 'Delayed' ? 'warning' : 
                        stats.status === 'In Progress' ? 'info' : 'secondary'
                      }`} style={{ display: 'inline-block', marginTop: '0.25rem' }}>
                        {stats.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setActiveTab('schedule')}
                  >
                    Ver Cronograma (Gantt)
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setActiveTab('documents')}
                  >
                    Ver Documentos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="content-card glass">
          <div className="card-header">
            <h2>Upcoming Tasks</h2>
          </div>
          <div style={{ padding: '1rem' }}>
            {upcoming.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No upcoming tasks.</div>
            ) : (
              upcoming.map((u, i) => (
                <div key={i} style={{ padding: '1rem', borderBottom: i < upcoming.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{u.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{u.project} • {u.date}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
