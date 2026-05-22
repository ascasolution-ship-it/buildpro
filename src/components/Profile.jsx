import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Building, Shield, Lock, Send, Clock, Check, AlertCircle } from 'lucide-react';

const getRequestTypeLabel = (type) => {
  switch (type) {
    case 'Modificación de Obra':
    case 'Work Modification':
      return 'Work Modification / Views';
    case 'Cambio de Contraseña Administrativa':
    case 'Administrative Password Change':
      return 'Administrative Password Change';
    case 'Ajuste de Base de Datos / Supabase':
    case 'Database Adjustment':
      return 'Database / Supabase Adjustment';
    case 'Añadir Nueva Funcionalidad':
    case 'Add New Feature':
      return 'Add New Feature';
    case 'Reportar un Bug / Error':
    case 'Report a Bug':
      return 'Report a Bug / Error';
    default:
      return type;
  }
};

const Profile = () => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState({ company_name: '', plan_type: '', subscription_status: '' });
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Form States
  const [companyName, setCompanyName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Support Request States
  const [requestType, setRequestType] = useState('Work Modification');
  const [description, setDescription] = useState('');
  const [requestList, setRequestList] = useState([]);
  
  // Notification states
  const [infoMsg, setInfoMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        fetchChangeRequests(session.user.id);
      }
    });
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setCompanyName(data.company_name || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeRequests = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('change_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setRequestList(data);
    } catch (err) {
      console.error('Error fetching requests:', err.message);
    }
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    setInfoMsg(null);
    setErrorMsg(null);
    setUpdateLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ company_name: companyName })
        .eq('id', session.user.id);

      if (error) throw error;
      
      setProfile(prev => ({ ...prev, company_name: companyName }));
      setInfoMsg('Builder name updated successfully!');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setInfoMsg(null);
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setUpdateLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setInfoMsg('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setInfoMsg(null);
    setErrorMsg(null);

    if (!description.trim()) {
      setErrorMsg('Please describe your request');
      return;
    }

    setUpdateLoading(true);
    try {
      const { error } = await supabase
        .from('change_requests')
        .insert([{
          user_id: session.user.id,
          request_type: requestType,
          description: description
        }]);

      if (error) throw error;

      setInfoMsg('Request sent successfully! Our technical team at ASCA Solutions will review it.');
      setDescription('');
      fetchChangeRequests(session.user.id);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* Messages */}
      {infoMsg && (
        <div className="glass" style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#34d399', padding: '0.85rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.9rem'
        }}>
          <Check size={18} />
          <span>{infoMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="glass" style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#f87171', padding: '0.85rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Left Card: Account Info */}
        <div className="content-card glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <User size={22} style={{ color: 'var(--primary-color)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>Account Information</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Builder's Email</span>
              <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: '500' }}>{session?.user?.email}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Plan Type</span>
              <span style={{ 
                fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', 
                color: profile.plan_type === 'pro' ? '#a5b4fc' : '#fff',
                backgroundColor: profile.plan_type === 'pro' ? 'rgba(88, 80, 236, 0.15)' : 'rgba(255,255,255,0.05)',
                padding: '0.2rem 0.6rem', borderRadius: '0.375rem', border: profile.plan_type === 'pro' ? '1px solid rgba(88, 80, 236, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                display: 'inline-block', marginTop: '0.25rem'
              }}>
                {profile.plan_type === 'pro' ? 'Pro Builder' : profile.plan_type === 'enterprise' ? 'Enterprise' : 'Contractor Plan'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Subscription Status</span>
              <span style={{ 
                fontSize: '0.85rem', fontWeight: '600', 
                color: profile.subscription_status === 'active' ? '#34d399' : '#f87171',
                backgroundColor: profile.subscription_status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                padding: '0.2rem 0.6rem', borderRadius: '0.375rem', border: profile.subscription_status === 'active' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                display: 'inline-block', marginTop: '0.25rem'
              }}>
                {profile.subscription_status === 'active' ? 'Active (Free Trial/Paid)' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Form to Update Constructora Name */}
          <form onSubmit={handleUpdateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={16} /><span>Builder / Company Name</span>
              </label>
              <input 
                type="text" 
                className="form-input glass" 
                required 
                value={companyName} 
                onChange={e => setCompanyName(e.target.value)} 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={updateLoading}>
              Save Changes
            </button>
          </form>
        </div>

        {/* Right Card: Security & Password */}
        <div className="content-card glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <Lock size={22} style={{ color: 'var(--secondary-color)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>Security and Password</h3>
          </div>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input 
                type="password" 
                className="form-input glass" 
                required 
                placeholder="Minimum 6 characters"
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                className="form-input glass" 
                required 
                placeholder="Repeat password"
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={updateLoading}>
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Row 2: Change Requests (Support and Custom Feature Requests) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Form to submit change request */}
        <div className="content-card glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <Send size={22} style={{ color: '#818cf8' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>Request Changes and Support</h3>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.4' }}>
            Need custom changes to your passwords, databases, or construction features? Describe your request and ASCA Solutions will implement it.
          </p>

          <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Request Type</label>
              <select 
                className="form-input glass" 
                style={{ backgroundColor: '#050505', color: '#fff' }}
                value={requestType} 
                onChange={e => setRequestType(e.target.value)}
              >
                <option value="Work Modification">Work Modification / Views</option>
                <option value="Administrative Password Change">Administrative Password Change</option>
                <option value="Database Adjustment">Database / Supabase Adjustment</option>
                <option value="Add New Feature">Add New Feature</option>
                <option value="Report a Bug">Report a Bug / Error</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Details and Description</label>
              <textarea 
                className="form-input glass" 
                rows="4"
                style={{ resize: 'none' }}
                placeholder="Write here in detail what changes you need..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={updateLoading}>
              Submit Request
            </button>
          </form>
        </div>

        {/* History of Requests */}
        <div className="content-card glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <Clock size={22} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>Request History</h3>
          </div>

          {requestList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              You have not submitted any change requests yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {requestList.map((req) => (
                <div key={req.id} style={{
                  padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)',
                  backgroundColor: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#fff', fontSize: '0.9rem' }}>{getRequestTypeLabel(req.request_type)}</span>
                    <span className="badge" style={{
                      backgroundColor: req.status === 'pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: req.status === 'pending' ? '#f59e0b' : '#34d399',
                      border: req.status === 'pending' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                      fontSize: '0.75rem', padding: '0.15rem 0.5rem'
                    }}>
                      {req.status === 'pending' ? 'Pending' : 'Completed'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{req.description}</p>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{new Date(req.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
