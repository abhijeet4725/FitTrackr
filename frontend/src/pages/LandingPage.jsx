import { Link } from 'react-router-dom'
import { TrendingUp, ArrowRight, BarChart2, Target, PiggyBank, Lightbulb, FileText, ArrowLeftRight } from 'lucide-react'
import ThemeToggle from '../components/ui/ThemeToggle'
import './LandingPage.css'

const FEATURES = [
  { icon: ArrowLeftRight, title: 'Track Transactions',  desc: 'Log income and expenses with categories, dates, and payment modes.' },
  { icon: Target,         title: 'Smart Budgets',       desc: 'Set monthly category-wise budgets and get alerts when you overspend.' },
  { icon: PiggyBank,      title: 'Savings Goals',       desc: 'Define goals with target amounts and deadlines, track progress visually.' },
  { icon: BarChart2,      title: 'Visual Dashboard',    desc: 'See where your money goes with interactive charts and trend analysis.' },
  { icon: Lightbulb,      title: 'Smart Insights',      desc: 'Get rule-based tips tailored to your personal spending patterns.' },
  { icon: FileText,       title: 'Monthly Reports',     desc: 'Generate and export detailed monthly financial summaries as CSV.' },
]

const STATS = [
  { num: '₹50K+', label: 'Transactions Tracked' },
  { num: '7',     label: 'Smart Insight Rules' },
  { num: '16+',   label: 'Categories' },
]

export default function LandingPage() {
  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <Link to="/" className="landing-logo">
          <div className="landing-logo-icon">
            <TrendingUp size={18} strokeWidth={2.5} />
          </div>
          <span>FinTrackr</span>
        </Link>

        <div className="landing-nav-actions">
          <ThemeToggle />
          <Link to="/login"    className="btn btn-ghost btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        {/* Background glows */}
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Smart Personal Finance
          </div>

          <h1 className="hero-title">
            Master Your Wealth<br />
            <span className="hero-gradient">With Precision</span>
          </h1>

          <p className="hero-sub">
            Track expenses, set budgets, and hit your savings goals with intelligent
            financial insights — all in one beautiful dashboard.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
              Start for Free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: 15 }}>
              Sign In
            </Link>
          </div>

          {/* Stats row */}
          <div className="hero-stats">
            {STATS.map((s, i) => (
              <div key={i} className="hero-stat">
                <span className="hero-stat-num">{s.num}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mock dashboard preview */}
        <div className="hero-preview">
          <div className="hero-preview-card">
            <div className="hero-preview-bar" />
            <div className="hero-preview-metrics">
              <div className="hero-preview-metric">
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>INCOME</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#10B981' }}>₹85,000</span>
              </div>
              <div className="hero-preview-metric">
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>EXPENSE</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#EF4444' }}>₹52,400</span>
              </div>
              <div className="hero-preview-metric">
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>SAVED</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>₹32,600</span>
              </div>
            </div>
            {/* Mini bars */}
            <div className="hero-mini-bars">
              {[55, 80, 45, 90, 65, 75, 85, 50, 70, 95].map((h, i) => (
                <div key={i} className="hero-mini-bar-wrap">
                  <div className="hero-mini-bar" style={{
                    height: `${h * 0.55}px`,
                    background: i % 3 === 0 ? '#EF4444' : '#10B981',
                    opacity: 0.75 + (i % 3) * 0.08,
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-features">
        <div className="features-container">
          <div className="features-header">
            <h2>Everything you need to manage your finances</h2>
            <p>A complete financial toolkit built for clarity, not complexity.</p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon-wrap">
                  <f.icon size={22} strokeWidth={1.75} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta">
        <div className="cta-glow" />
        <div className="cta-content">
          <h2>Ready to track smarter?</h2>
          <p>Join users managing their finances with clarity and confidence.</p>
          <Link to="/register" className="btn btn-primary" style={{ padding: '13px 32px', fontSize: 15 }}>
            Create Free Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-logo">
          <div className="landing-logo-icon" style={{ width: 26, height: 26 }}>
            <TrendingUp size={14} strokeWidth={2.5} />
          </div>
          <span>FinTrackr</span>
        </div>
        <p>© 2026 FinTrackr. Built with React + Flask + PostgreSQL.</p>
      </footer>
    </div>
  )
}
