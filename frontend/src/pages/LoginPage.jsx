import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, Lock } from 'lucide-react'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/layout/AuthLayout'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.login(form)
      login(res.data.data.user, res.data.data.access_token)
      toast.success('Welcome back! 👋')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your FinTrackr account"
      switchText="Don't have an account?"
      switchLink="/register"
      switchLabel="Create one"
    >
      <form onSubmit={handleSubmit}>
        {/* Inline error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: 'var(--color-danger)',
          }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              id="login-email"
              name="email"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              style={{ paddingLeft: 36 }}
              required
              autoFocus
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              id="login-password"
              name="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              style={{ paddingLeft: 36 }}
              required
            />
          </div>
        </div>

        <button
          id="login-submit"
          className="btn btn-primary btn-full"
          type="submit"
          disabled={loading}
          style={{ marginTop: 8, padding: '11px 20px', fontSize: 15 }}
        >
          {loading ? (
            <><span className="spinner spinner-sm" style={{ borderTopColor: 'rgba(255,255,255,0.6)' }} /> Signing in...</>
          ) : 'Sign In'}
        </button>
      </form>

      {/* Demo credentials hint */}
      <div className="auth-hint">
        Demo: <strong>demo@fintrackr.com</strong> / <strong>Demo@1234</strong>
      </div>
    </AuthLayout>
  )
}
