import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Building, Shield, Lock, Send, Clock, Check, AlertCircle } from 'lucide-react';

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
  const [requestType, setRequestType] = useState('Modificación de Obra');
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
      setInfoMsg('¡Nombre de constructora actualizado correctamente!');
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
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setUpdateLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setInfoMsg('¡Contraseña cambiada con éxito!');
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
      setErrorMsg('Por favor describe tu solicitud');
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

      setInfoMsg('¡Solicitud enviada con éxito! Nuestro equipo técnico de ASCA Solutions la revisará.');
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
        Cargando perfil...
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>Información de la Cuenta</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Email del Builder</span>
              <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: '500' }}>{session?.user?.email}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Tipo de Plan</span>
              <span style={{ 
                fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', 
                color: profile.plan_type === 'pro' ? '#a5b4fc' : '#fff',
                backgroundColor: profile.plan_type === 'pro' ? 'rgba(88, 80, 236, 0.15)' : 'rgba(255,255,255,0.05)',
                padding: '0.2rem 0.6rem', borderRadius: '0.375rem', border: profile.plan_type === 'pro' ? '1px solid rgba(88, 80, 236, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                display: 'inline-block', marginTop: '0.25rem'
              }}>
                {profile.plan_type === 'pro' ? 'Constructor Pro' : profile.plan_type === 'enterprise' ? 'Enterprise / Corporativo' : 'Plan Contratista'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Estado de Suscripción</span>
              <span style={{ 
                fontSize: '0.85rem', fontWeight: '600', 
                color: profile.subscription_status === 'active' ? '#34d399' : '#f87171',
                backgroundColor: profile.subscription_status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                padding: '0.2rem 0.6rem', borderRadius: '0.375rem', border: profile.subscription_status === 'active' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                display: 'inline-block', marginTop: '0.25rem'
              }}>
                {profile.subscription_status === 'active' ? 'Activo (Prueba Gratis/Pago)' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Form to Update Constructora Name */}
          <form onSubmit={handleUpdateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={16} /><span>Nombre de la Constructora</span>
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
              Guardar Cambios
            </button>
          </form>
        </div>

        {/* Right Card: Security & Password */}
        <div className="content-card glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <Lock size={22} style={{ color: 'var(--secondary-color)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>Seguridad y Contraseña</h3>
          </div>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Nueva Contraseña</label>
              <input 
                type="password" 
                className="form-input glass" 
                required 
                placeholder="Mínimo 6 caracteres"
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                className="form-input glass" 
                required 
                placeholder="Repite la contraseña"
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={updateLoading}>
              Actualizar Contraseña
            </button>
          </form>
        </div>
      </div>

      {/* Row 2: Solicitudes de Modificación (Support and Custom Feature Requests) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Form to submit change request */}
        <div className="content-card glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <Send size={22} style={{ color: '#818cf8' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>Solicitar Cambios y Modificaciones</h3>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.4' }}>
            ¿Necesitas cambios personalizados en tus contraseñas, bases de datos o funcionalidades de obra? Describe tu solicitud y ASCA Solutions la implementará.
          </p>

          <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Tipo de Solicitud</label>
              <select 
                className="form-input glass" 
                style={{ backgroundColor: '#050505', color: '#fff' }}
                value={requestType} 
                onChange={e => setRequestType(e.target.value)}
              >
                <option value="Modificación de Obra">Modificación de Obra / Vistas</option>
                <option value="Cambio de Contraseña Administrativa">Cambio de Contraseña Administrativa</option>
                <option value="Ajuste de Base de Datos / Supabase">Ajuste de Base de Datos / Supabase</option>
                <option value="Añadir Nueva Funcionalidad">Añadir Nueva Funcionalidad</option>
                <option value="Reportar un Bug / Error">Reportar un Bug / Error</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Detalle y Descripción</label>
              <textarea 
                className="form-input glass" 
                rows="4"
                style={{ resize: 'none' }}
                placeholder="Escribe aquí con detalle qué cambios necesitas..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={updateLoading}>
              Enviar Solicitud
            </button>
          </form>
        </div>

        {/* History of Requests */}
        <div className="content-card glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <Clock size={22} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>Historial de Solicitudes</h3>
          </div>

          {requestList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No has enviado ninguna solicitud de cambio aún.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {requestList.map((req) => (
                <div key={req.id} style={{
                  padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)',
                  backgroundColor: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#fff', fontSize: '0.9rem' }}>{req.request_type}</span>
                    <span className="badge" style={{
                      backgroundColor: req.status === 'pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: req.status === 'pending' ? '#f59e0b' : '#34d399',
                      border: req.status === 'pending' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                      fontSize: '0.75rem', padding: '0.15rem 0.5rem'
                    }}>
                      {req.status === 'pending' ? 'Pendiente' : 'Completado'}
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
