import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

const Schedule = ({ activeProjectId, onSelectProject }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(ViewMode.Day);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [editTask, setEditTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    project_id: '',
    start_day: 0,
    duration_days: 3,
    color: '#3b82f6'
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('id, name');
    if (data) setProjects(data);
  };

  // Helper to get Monday of the current week
  const getStartOfWeek = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects ( name )
        `)
        .order('start_day', { ascending: true });

      if (error) throw error;
      
      const startOfWeek = getStartOfWeek();

      // Build map to resolve dependencies and parents per project
      const wbsMap = {};
      (data || []).forEach(t => {
        if (t.wbs && t.project_id) {
          wbsMap[`${t.project_id}_${t.wbs}`] = t.id;
        }
      });

      // Sort data naturally by WBS to ensure parents appear before children and hierarchy is preserved
      const sortedData = [...(data || [])].sort((a, b) => {
        if (!a.wbs && !b.wbs) return 0;
        if (!a.wbs) return 1;
        if (!b.wbs) return -1;
        
        const aParts = a.wbs.split('.').map(Number);
        const bParts = b.wbs.split('.').map(Number);
        
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aVal = aParts[i] || 0;
          const bVal = bParts[i] || 0;
          if (aVal !== bVal) return aVal - bVal;
        }
        return 0;
      });

      // 1st Pass: Transform basic data
      let tempTasks = sortedData.map((t) => {
        const start = new Date(startOfWeek);
        start.setDate(start.getDate() + t.start_day);
        
        const end = new Date(start);
        end.setDate(end.getDate() + t.duration_days);

        // Resolve dependencies
        let dependencies = [];
        if (t.predecessor && t.project_id) {
          const preds = String(t.predecessor).split(',').map(p => p.trim());
          dependencies = preds.map(p => wbsMap[`${t.project_id}_${p}`]).filter(Boolean);
        }

        // Resolve parent project
        let parentId = undefined;
        if (t.wbs_level > 1 && t.wbs && t.project_id) {
          const parts = t.wbs.split('.');
          parts.pop();
          const parentWbs = parts.join('.');
          const parentKey = `${t.project_id}_${parentWbs}`;
          if (wbsMap[parentKey]) parentId = wbsMap[parentKey];
        }

        return {
          start: start,
          end: end,
          name: t.name,
          id: t.id,
          type: t.wbs_level === 1 ? 'project' : 'task',
          progress: t.progress || 0,
          dependencies: dependencies,
          project: parentId, // Links to parent task
          isDisabled: false,
          hideChildren: false, // Explicitly false so children show
          project_id: t.project_id,
          styles: { 
            backgroundColor: t.color || 'var(--primary-color)',
            backgroundSelectedColor: t.color || 'var(--primary-color)',
            progressColor: 'rgba(0,0,0,0.2)', 
            progressSelectedColor: 'rgba(0,0,0,0.3)' 
          }
        };
      });

      // 2nd Pass: Fix Project task dates to encompass all children
      tempTasks.forEach(pt => {
        if (pt.type === 'project') {
          const children = tempTasks.filter(ct => ct.project === pt.id);
          if (children.length > 0) {
            const minStart = new Date(Math.min(...children.map(c => c.start.getTime())));
            const maxEnd = new Date(Math.max(...children.map(c => c.end.getTime())));
            pt.start = minStart;
            pt.end = maxEnd;
          }
        }
      });

      const ganttTasks = tempTasks;

      setTasks(ganttTasks);
      
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.name || !newTask.project_id) return;
    
    try {
      const { error } = await supabase.from('tasks').insert([{
        name: newTask.name,
        project_id: newTask.project_id,
        start_day: parseInt(newTask.start_day),
        duration_days: parseInt(newTask.duration_days),
        color: newTask.color
      }]);

      if (error) throw error;

      alert('Task created successfully!');
      setIsModalOpen(false);
      setNewTask({ name: '', project_id: '', start_day: 0, duration_days: 3, color: '#3b82f6' });
      fetchTasks();
    } catch (error) {
      alert('Error creating task: ' + error.message);
    }
  };

  const handleTaskChange = async (task) => {
    try {
      const startOfWeek = getStartOfWeek();
      const newStartDay = Math.round((task.start.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
      const newDuration = Math.round((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24));

      let newTasks = tasks.map(t => (t.id === task.id ? task : t));
      let changedTasks = new Map(); // Use Map to avoid duplicate updates of same task
      changedTasks.set(task.id, { id: task.id, start_day: newStartDay, duration_days: newDuration });

      // Auto-Cascade Logic: Push successors if predecessor moved
      let changed = true;
      let iterations = 0;
      while (changed && iterations < 100) {
        changed = false;
        iterations++;
        for (let i = 0; i < newTasks.length; i++) {
          const t = newTasks[i];
          if (t.dependencies && t.dependencies.length > 0) {
            let maxEnd = t.start.getTime();
            let pushed = false;
            
            for (const depId of t.dependencies) {
              const predTask = newTasks.find(pt => pt.id === depId);
              if (predTask && predTask.end.getTime() > maxEnd) {
                maxEnd = predTask.end.getTime();
                pushed = true;
              }
            }

            if (pushed && t.start.getTime() !== maxEnd) {
              const durationMs = t.end.getTime() - t.start.getTime();
              const newStart = new Date(maxEnd);
              const newEnd = new Date(maxEnd + durationMs);
              
              // Mutate the array with a new object reference so React re-renders it!
              newTasks[i] = { ...t, start: newStart, end: newEnd };
              changed = true;
              
              const tStartDay = Math.round((newStart.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
              const tDuration = Math.round((newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24));
              changedTasks.set(t.id, { id: t.id, start_day: tStartDay, duration_days: tDuration });
            }
          }
        }
      }

      setTasks([...newTasks]); // Optimistically update UI with new array reference

      // Batch update Supabase
      const updates = Array.from(changedTasks.values()).map(ct => 
        supabase.from('tasks').update({ 
          start_day: ct.start_day, 
          duration_days: ct.duration_days 
        }).eq('id', ct.id)
      );

      await Promise.all(updates);
      console.log(`Cascade updated ${changedTasks.size} tasks.`);
    } catch (error) {
      console.error('Error updating task dates:', error.message);
      alert('Error updating schedule: ' + error.message);
      fetchTasks(); // Revert on failure
    }
  };

  const handleExpanderClick = (task) => {
    setTasks(tasks.map(t => (t.id === task.id ? { ...task, hideChildren: !task.hideChildren } : t)));
  };

  const handleProgressChange = async (task) => {
    try {
      let newTasks = tasks.map(t => (t.id === task.id ? task : t));
      setTasks(newTasks);

      const { error } = await supabase
        .from('tasks')
        .update({ progress: task.progress })
        .eq('id', task.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task progress:', error.message);
      fetchTasks();
    }
  };

  const handleEditClick = (task) => {
    // Prevent editing summary project tasks for now
    if (task.type === 'project') return;
    setEditTask(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          name: editTask.name,
          progress: editTask.progress 
        })
        .eq('id', editTask.id);

      if (error) throw error;
      
      setIsEditModalOpen(false);
      fetchTasks();
    } catch (error) {
      alert('Error updating task: ' + error.message);
    }
  };

  const handleTaskDelete = async (taskId) => {
    if(!window.confirm(`Are you sure you want to delete this task?`)) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      setIsEditModalOpen(false);
      fetchTasks();
    } catch (error) {
      alert('Error deleting task: ' + error.message);
    }
  };

  // Custom column mapping for the Gantt
  let columnWidth = 60;
  if (viewMode === ViewMode.Month) {
    columnWidth = 300;
  } else if (viewMode === ViewMode.Week) {
    columnWidth = 250;
  }

  const filteredTasks = (!activeProjectId || activeProjectId === 'all') 
    ? tasks 
    : tasks.filter(t => t.project_id === activeProjectId);

  const displayTasks = filteredTasks.length > 0 ? filteredTasks : [{
    start: new Date(),
    end: new Date(new Date().setDate(new Date().getDate() + 3)),
    name: 'No tasks for this project',
    id: 'dummy-1',
    type: 'task',
    progress: 0,
    isDisabled: true,
    project: 'None',
    styles: { backgroundColor: 'var(--border-color)' }
  }];

  return (
    <div className="schedule-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      <div className="content-card glass">
        <div className="card-header">
          <h2>Project Schedule (Gantt)</h2>
          <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select 
              className="form-input" 
              style={{ padding: '0.5rem', width: 'auto' }}
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
            <select 
              className="form-input" 
              style={{ padding: '0.5rem', width: 'auto' }}
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <option value={ViewMode.Day}>Day</option>
              <option value={ViewMode.Week}>Week</option>
              <option value={ViewMode.Month}>Month</option>
            </select>
            <button className="btn btn-primary" onClick={() => {
              setNewTask(prev => ({
                ...prev,
                project_id: (!activeProjectId || activeProjectId === 'all') ? '' : activeProjectId
              }));
              setIsModalOpen(true);
            }}>
              <span>+ Add Task</span>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading schedule...</div>
        ) : (
          <div className="gantt-wrapper" style={{ padding: '1.5rem', overflowX: 'auto', backgroundColor: '#ffffff', color: '#333333', borderRadius: '0 0 1rem 1rem' }}>
            <Gantt
              tasks={displayTasks}
              viewMode={viewMode}
              columnWidth={columnWidth}
              listCellWidth="300px"
              rowHeight={50}
              barCornerRadius={6}
              fontFamily="Inter, sans-serif"
              onDateChange={handleTaskChange}
              onProgressChange={handleProgressChange}
              onDoubleClick={handleEditClick}
              onExpanderClick={handleExpanderClick}
              TaskListHeader={({ headerHeight, fontFamily, fontSize }) => (
                <div style={{ height: headerHeight, fontFamily, fontSize, display: 'flex', alignItems: 'center', borderBottom: '1px solid #d1d5db', paddingLeft: '1rem', fontWeight: 'bold', width: '300px', backgroundColor: '#f9fafb' }}>
                  Task Name
                </div>
              )}
              TaskListTable={({ rowHeight, rowWidth, tasks, fontFamily, fontSize, onExpanderClick }) => (
                <div style={{ fontFamily, fontSize, width: '300px' }}>
                  {tasks.map(t => (
                    <div 
                      key={t.id} 
                      style={{ 
                        height: rowHeight, 
                        display: 'flex', 
                        alignItems: 'center', 
                        borderBottom: '1px solid #e5e7eb', 
                        paddingLeft: t.project ? '2rem' : '1rem',
                        cursor: t.type === 'project' ? 'pointer' : 'default',
                        fontWeight: t.type === 'project' ? '600' : '400'
                      }}
                      onClick={() => t.type === 'project' && onExpanderClick(t)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {t.type === 'project' && (
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {t.hideChildren ? '▶' : '▼'}
                          </span>
                        )}
                        <span title={t.name}>{t.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '400px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Create New Task</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <span style={{ fontSize: '1.5rem' }}>&times;</span>
              </button>
            </div>
            <form onSubmit={handleAddTask}>
              <div className="form-group">
                <label className="form-label">Task Name</label>
                <input type="text" className="form-input" required value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Project</label>
                <select className="form-input" required value={newTask.project_id} onChange={e => setNewTask({...newTask, project_id: e.target.value})}>
                  <option value="">Select project...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Start Day (Offset)</label>
                  <input type="number" className="form-input" required value={newTask.start_day} onChange={e => setNewTask({...newTask, start_day: e.target.value})} min="0" title="Days from the start of the week" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Duration (Days)</label>
                  <input type="number" className="form-input" required value={newTask.duration_days} onChange={e => setNewTask({...newTask, duration_days: e.target.value})} min="1" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input type="color" className="form-input" style={{ height: '40px', padding: '0.25rem' }} value={newTask.color} onChange={e => setNewTask({...newTask, color: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editTask && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '400px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Edit Task</h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <span style={{ fontSize: '1.5rem' }}>&times;</span>
              </button>
            </div>
            <form onSubmit={handleUpdateTask}>
              <div className="form-group">
                <label className="form-label">Task Name</label>
                <input type="text" className="form-input" required value={editTask.name} onChange={e => setEditTask({...editTask, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Progress: {editTask.progress}%</label>
                <input type="range" className="form-input" min="0" max="100" value={editTask.progress} onChange={e => setEditTask({...editTask, progress: parseInt(e.target.value)})} style={{ padding: '0', cursor: 'pointer' }} />
              </div>
              
              <button 
                type="button" 
                className="btn btn-success" 
                style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem', backgroundColor: 'var(--secondary-color)', color: 'white' }}
                onClick={() => setEditTask({...editTask, progress: 100})}
              >
                ✓ Marcar como Terminado (100%)
              </button>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-danger" style={{ flex: 1, justifyContent: 'center', backgroundColor: 'var(--danger-color)' }} onClick={() => handleTaskDelete(editTask.id)}>Delete</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
