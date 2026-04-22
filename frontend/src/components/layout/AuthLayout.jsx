import { TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import '../../pages/AuthPage.css'

const FEATURES = [
  { icon: '📊', text: 'Track income & expenses' },
  { icon: '🎯', text: 'Set smart budgets' },
  { icon: '🏦', text: 'Reach your savings goals' },
  { icon: '💡', text: 'Get AI-powered insights' },
]

function AuthIllustration() {
  return (
    <div className="auth-illustration">
      {/* Animated background blobs */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      {/* Content */}
      <div className="auth-illustration-content">
        <div className="auth-illustration-logo">
          <TrendingUp size={28} strokeWidth={2.5} />
        </div>
        <h2 className="auth-illustration-title">
          Master Your Wealth<br />With Precision
        </h2>
        <p className="auth-illustration-sub">
          FinTrackr gives you complete visibility over your finances — from daily expenses to long-term savings goals.
        </p>

        <div className="auth-features-list">
          {FEATURES.map((f, i) => (
            <div key={i} className="auth-feature-item">
              <span className="auth-feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Mock dashboard card */}
        <div className="auth-mock-card">
          <div className="auth-mock-header">
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Monthly Overview</span>
            <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>● Live</span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>INCOME</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>₹85,000</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>EXPENSE</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#EF4444' }}>₹52,400</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>SAVED</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>₹32,600</div>
            </div>
          </div>
          {/* Mini bar chart */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', marginTop: 14, height: 32 }}>
            {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                <div style={{ width: '100%', height: `${h * 0.32}px`, background: i % 2 === 0 ? '#10B981' : '#EF4444', borderRadius: '2px 2px 0 0', opacity: 0.8 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// AuthLayout wraps Login and Register with the split-panel design
export default function AuthLayout({ children, title, subtitle, switchText, switchLink, switchLabel }) {
  return (
    <div className="auth-root">
      <AuthIllustration />

      <div className="auth-panel">
        {/* Logo for mobile */}
        <Link to="/" className="auth-mobile-logo">
          <div className="auth-mobile-logo-icon"><TrendingUp size={16} strokeWidth={2.5} /></div>
          <span>FinTrackr</span>
        </Link>

        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1 className="auth-form-title">{title}</h1>
            {subtitle && <p className="auth-form-sub">{subtitle}</p>}
          </div>

          {children}

          {switchText && (
            <p className="auth-switch">
              {switchText} <Link to={switchLink}>{switchLabel}</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
