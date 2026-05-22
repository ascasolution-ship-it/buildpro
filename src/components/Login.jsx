import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, Building2, Hammer, AlertCircle, ArrowRight, Check } from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isRegister) {
        // Registering a new subscriber
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              company_name: companyName || 'ASCA Solutions Builder'
            }
          }
        });

        if (signUpErr) throw signUpErr;

        if (data?.user?.identities?.length === 0) {
          setError('The email entered is already registered.');
        } else {
          setMessage('Registration successful! Please check your email to confirm your account.');
          // Auto transition to login or clear form
          setEmail('');
          setPassword('');
          setCompanyName('');
        }
      } else {
        // Signing in existing subscriber
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInErr) throw signInErr;
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 1) 90.2%)',
      padding: '2rem',
      boxSizing: 'border-box',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Dynamic Background Blur Spheres */}
      <div style={{
        position: 'absolute', width: '300px', height: '300px',
        background: 'rgba(99, 102, 241, 0.12)', filter: 'blur(100px)',
        top: '20%', left: '25%', borderRadius: '50%', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', width: '250px', height: '250px',
        background: 'rgba(16, 185, 129, 0.08)', filter: 'blur(100px)',
        bottom: '25%', right: '25%', borderRadius: '50%', zIndex: 0
      }} />

      {/* Main Glassmorphic Container */}
      <div className="content-card glass fade-in" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '2.5rem',
        position: 'relative',
        zIndex: 1,
        borderRadius: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        backgroundColor: 'rgba(255, 255, 255, 0.015)'
      }}>
        {/* Brand/Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)'
          }}>
            <Hammer size={26} />
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            fontFamily: 'Outfit, sans-serif',
            color: '#fff',
            letterSpacing: '-0.025em',
            marginBottom: '0.25rem'
          }}>
            BuildPro <span style={{ color: '#818cf8', fontWeight: '400', fontSize: '1rem' }}>SaaS</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isRegister 
              ? 'Join the leading platform for builders by ASCA Solutions' 
              : 'Real-time project management and construction control'}
          </p>
        </div>

        {/* Error and Info Alerts */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
            padding: '0.85rem 1rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#34d399',
            padding: '0.85rem 1rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            <Check size={18} style={{ flexShrink: 0 }} />
            <span>{message}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>Company / Construction Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input glass"
                  style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
                  placeholder="e.g. ASCA Solutions Builder"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required={isRegister}
                />
                <Building2 size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input glass"
                style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
                placeholder="builder@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input glass"
                style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.85rem',
              marginTop: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
            }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isRegister ? 'Create My Builder Account' : 'Sign In'}
            {!loading && <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />}
          </button>
        </form>

        {/* Form Toggle Links */}
        <div style={{
          marginTop: '1.75rem',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1.25rem'
        }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            {isRegister ? 'Already have an account?' : 'Are you a new builder?'}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
                setMessage(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#818cf8',
                fontWeight: '600',
                marginLeft: '0.5rem',
                cursor: 'pointer',
                outline: 'none',
                textDecoration: 'underline'
              }}
            >
              {isRegister ? 'Sign In here' : 'Register here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
