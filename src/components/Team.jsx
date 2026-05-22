import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, X, Check, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Team = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Site Engineer',
    can_view_documents: false,
    can_view_budgets: false,
    can_view_schedule: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // In a real app, you would call supabase.auth.signUp() here.
      // We will simulate it by inserting a fake profile.
      const mockUUID = crypto.randomUUID();
      const { error } = await supabase
        .from('user_profiles')
        .insert([{
          id: mockUUID,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          can_view_documents: newUser.can_view_documents,
          can_view_budgets: newUser.can_view_budgets,
          can_view_schedule: newUser.can_view_schedule
        }]);

      if (error) throw error;
      
      alert('User invited and saved to database!');
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      alert('Error creating user: ' + error.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    try {
      const { error } = await supabase.from('user_profiles').delete().eq('id', id);
      if (error) throw error;
      alert('Team member removed.');
      fetchUsers();
    } catch (error) {
      alert('Error removing user: ' + error.message);
    }
  };

  return (
    <div className="team-container" style={{ position: 'relative' }}>
      <div className="content-card glass">
        <div className="card-header">
          <h2>Team Members & Access</h2>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <UserPlus size={18} />
              <span>Invite / Add User</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading team...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name & Email</th>
                <th>Role</th>
                <th>View Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No team members found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500 }}>{user.name}</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.email}</span>
                      </div>
                    </td>
                    <td>{user.role}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {user.can_view_documents ? <span className="badge badge-success">Documents</span> : <span className="badge badge-danger" style={{opacity: 0.5}}><strike>Docs</strike></span>}
                        {user.can_view_budgets ? <span className="badge badge-success">Budgets</span> : <span className="badge badge-danger" style={{opacity: 0.5}}><strike>Budgets</strike></span>}
                        {user.can_view_schedule ? <span className="badge badge-success">Schedule</span> : <span className="badge badge-danger" style={{opacity: 0.5}}><strike>Schedule</strike></span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Edit User">
                          <Edit2 size={18} />
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.5rem', color: 'var(--danger-color)' }} 
                          onClick={() => handleDeleteUser(user.id)}
                          title="Remove User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={24} color="var(--primary-color)" />
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Add and Configure Access</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label className="form-label">User Name</label>
                <input type="text" className="form-input" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="e.g. John Doe" />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="john@email.com" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="Site Engineer">Site Engineer</option>
                  <option value="Lead Architect">Lead Architect</option>
                  <option value="Subcontractor">Subcontractor</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>Permissions: What can they see?</label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <span>View Schedules and Tasks</span>
                    <input type="checkbox" checked={newUser.can_view_schedule} onChange={e => setNewUser({...newUser, can_view_schedule: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  </label>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <span>View and Download Documents/Blueprints</span>
                    <input type="checkbox" checked={newUser.can_view_documents} onChange={e => setNewUser({...newUser, can_view_documents: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  </label>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <span>View Budgets and Finances</span>
                    <input type="checkbox" checked={newUser.can_view_budgets} onChange={e => setNewUser({...newUser, can_view_budgets: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  <UserPlus size={18} /> Create User & Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
