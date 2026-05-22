import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Download, Users, Briefcase, Database, HelpCircle } from 'lucide-react';

const Billing = () => {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  const handlePlanSelect = (plan) => {
    if (plan.id === 'enterprise') {
      window.location.href = 'mailto:sales@ascasolutions.com?subject=Interest in BuildPro Enterprise Plan';
    } else {
      alert(`[Stripe Checkout - ASCA Solutions]\n\nRedirecting to the secure Stripe payment gateway to subscribe to the "${plan.name}" plan (${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}).\n\nPrice: $${plan.price} USD / month\n\n🎁 Your first month is free! A 30-day free trial will be applied before the first charge.`);
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'Contractor Plan',
      price: billingCycle === 'monthly' ? 49 : 39,
      trial: '1 month free',
      description: 'Ideal for independent contractors and small residential projects.',
      features: [
        '30-day free trial',
        'Up to 3 active projects',
        'Interactive Gantt chart',
        'Subcontractor management (max 10)',
        'Daily site log',
        '5 GB blueprint storage',
        'Standard email support'
      ],
      icon: Briefcase,
      color: 'from-blue-600 to-cyan-500'
    },
    {
      id: 'pro',
      name: 'Pro Builder',
      price: billingCycle === 'monthly' ? 149 : 119,
      trial: '1 month free',
      description: 'For medium-sized construction companies that need full control and automated workflows.',
      features: [
        '30-day free trial',
        'Unlimited active projects',
        'Gantt chart with cascade & advanced dependencies',
        'Unlimited subcontractors & fleet control',
        'Exportable daily reports with weather',
        '50 GB storage for blueprints & photos',
        'Priority 24/7 support',
        'Client / owner access'
      ],
      icon: ShieldCheck,
      color: 'from-violet-600 to-indigo-600',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large developers and real estate firms with multiple national work fronts.',
      features: [
        'Everything in Pro Builder',
        'Unlimited cloud storage',
        'Integration API with accounting ERPs',
        'Custom domain & branding (White-Label)',
        'Dedicated account manager',
        'In-person training for site staff',
        '99.9% Service Level Agreements (SLA)'
      ],
      icon: CreditCard,
      color: 'from-emerald-600 to-teal-500'
    }
  ];

  const invoices = [
    { id: 'INV-2026-004', date: '2026-05-15', amount: 149.00, status: 'Paid', plan: 'Pro Builder (Monthly)' },
    { id: 'INV-2026-003', date: '2026-04-15', amount: 149.00, status: 'Paid', plan: 'Pro Builder (Monthly)' },
    { id: 'INV-2026-002', date: '2026-03-15', amount: 149.00, status: 'Paid', plan: 'Pro Builder (Monthly)' },
    { id: 'INV-2026-001', date: '2026-02-15', amount: 149.00, status: 'Paid', plan: 'Pro Builder (Monthly)' }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* Top Banner - Subscription Summary */}
      <div className="content-card glass" style={{ 
        background: 'linear-gradient(135deg, rgba(88, 80, 236, 0.15) 0%, rgba(0, 0, 0, 0) 100%)',
        border: '1px solid rgba(88, 80, 236, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative ambient blur */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px', width: '250px', height: '250px',
          background: 'rgba(88, 80, 236, 0.4)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="badge" style={{ backgroundColor: 'rgba(88, 80, 236, 0.2)', color: '#a5b4fc', border: '1px solid rgba(88, 80, 236, 0.4)', padding: '0.25rem 0.75rem' }}>
                Active Plan
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Next billing date: June 15, 2026</span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#fff', marginBottom: '0.5rem' }}>
              Pro Builder
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', fontSize: '0.95rem' }}>
              Your account is optimized for complex project coordination, with automatic Gantt cascade calculations and comprehensive subcontractor control.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monthly Cost</span>
              <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>$149.00 USD</span>
            </div>
            <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <button className="btn btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
              Manage Method
            </button>
          </div>
        </div>

        {/* Quotas & Limits */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem' }}>
          <div>
            <div style={{ display: 'flex', justifySelf: 'start', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Briefcase size={16} /><span>Active Projects</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>2 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ Unlimited</span></div>
            <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '20%', height: '100%', background: 'linear-gradient(90deg, #5850ec, #6875f5)', borderRadius: '3px' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifySelf: 'start', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Users size={16} /><span>Users on Site / Office</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>4 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ Unlimited</span></div>
            <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '15%', height: '100%', background: 'linear-gradient(90deg, #5850ec, #6875f5)', borderRadius: '3px' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifySelf: 'start', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Database size={16} /><span>Disk Space (Blueprints)</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>0.45 GB <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 50 GB</span></div>
            <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '1%', height: '100%', background: 'linear-gradient(90deg, #5850ec, #6875f5)', borderRadius: '3px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Billing Cycle Selector */}
      <div style={{ display: 'flex', justifySelf: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
        <span style={{ color: billingCycle === 'monthly' ? '#fff' : 'var(--text-muted)', fontWeight: billingCycle === 'monthly' ? '600' : '400', transition: 'all 0.3s' }}>Monthly</span>
        <button 
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          style={{
            width: '56px', height: '28px', borderRadius: '14px', backgroundColor: 'rgba(88, 80, 236, 0.4)',
            border: '1px solid rgba(88, 80, 236, 0.6)', cursor: 'pointer', position: 'relative', outline: 'none'
          }}
        >
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff',
            position: 'absolute', top: '3px', left: billingCycle === 'monthly' ? '4px' : '30px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }} />
        </button>
        <span style={{ color: billingCycle === 'yearly' ? '#fff' : 'var(--text-muted)', fontWeight: billingCycle === 'yearly' ? '600' : '400', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Yearly <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Save 20%</span>
        </span>
      </div>

      {/* Pricing Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {plans.map((plan) => {
          const PlanIcon = plan.icon;
          const isCurrent = plan.id === selectedPlan;

          return (
            <div 
              key={plan.id}
              className={`content-card glass ${plan.popular ? 'popular' : ''}`}
              style={{
                display: 'flex', flexDirection: 'column', height: '100%', position: 'relative',
                border: isCurrent ? '2px solid #5850ec' : '1px solid rgba(255, 255, 255, 0.08)',
                background: plan.popular ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                padding: '2.5rem 2rem',
                transform: plan.popular ? 'scale(1.02)' : 'none',
                boxShadow: plan.popular ? '0 10px 30px -10px rgba(88, 80, 236, 0.2)' : 'none'
              }}
            >
              {plan.popular && (
                <span className="badge" style={{
                  position: 'absolute', top: '1.25rem', right: '1.25rem',
                  backgroundColor: '#5850ec', color: '#fff', fontWeight: 'bold', padding: '0.25rem 0.75rem'
                }}>
                  Most Popular
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.04)', color: '#fff' }}>
                  <PlanIcon size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>{plan.name}</h3>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', minHeight: '42px', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                {plan.description}
              </p>

              <div style={{ marginBottom: '2rem' }}>
                {typeof plan.price === 'number' ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', color: '#fff' }}>
                      <span style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>${plan.price}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '0.25rem' }}>/month</span>
                    </div>
                    {plan.trial && (
                      <span className="badge" style={{
                        marginTop: '0.5rem', display: 'inline-block',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)',
                        fontWeight: '600', padding: '0.25rem 0.5rem', fontSize: '0.75rem'
                      }}>
                        🎁 {plan.trial}
                      </span>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#fff', display: 'block', height: '48px', lineHeight: '48px' }}>
                    {plan.price}
                  </span>
                )}
                {typeof plan.price === 'number' && billingCycle === 'yearly' && (
                  <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'block', marginTop: '0.5rem' }}>Billed annually (save ${(plan.price * 12 * 0.25).toFixed(0)}/year)</span>
                )}
              </div>

              {/* Features List */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1 }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>
                    <CheckCircle2 size={16} style={{ color: '#34d399', marginTop: '0.15rem', flexShrink: 0 }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handlePlanSelect(plan)}
                className={`btn ${isCurrent ? 'btn-secondary' : 'btn-primary'}`} 
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                disabled={isCurrent}
              >
                {isCurrent ? 'Current Plan' : plan.price === 'Custom' ? 'Contact Sales' : 'Switch to this Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Invoice History */}
      <div className="content-card glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>Billing History</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active method: Visa ending in 4242</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Invoice Date</th>
                <th>Concept / Detail</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Download</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: '600', color: '#fff' }}>{inv.id}</td>
                  <td>{inv.date}</td>
                  <td>{inv.plan}</td>
                  <td style={{ color: '#fff' }}>${inv.amount.toFixed(2)} USD</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '0.375rem' }}>
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default Billing;
