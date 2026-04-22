import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { User, Mail, Lock } from 'lucide-react'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/layout/AuthLayout'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
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
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await authApi.register(form)
      login(res.data.data.user, res.data.data.access_token)
      toast.success('Account created! Welcome 🎉')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const iconStyle = { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your finances today — free, forever"
      switchText="Already have an account?"
      switchLink="/login"
      switchLabel="Sign in"
    >
      <form onSubmit={handleSubmit}>
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
          <label className="form-label" htmlFor="reg-name">Full Name</label>
          <div style={{ position: 'relative' }}>
            <User size={15} style={iconStyle} />
            <input
              id="reg-name" name="name" type="text"
              className="form-control" placeholder="Arjun Sharma"
              value={form.name} onChange={handleChange}
              style={{ paddingLeft: 36 }} required autoFocus
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={iconStyle} />
            <input
              id="reg-email" name="email" type="email"
              className="form-control" placeholder="you@example.com"
              value={form.email} onChange={handleChange}
              style={{ paddingLeft: 36 }} required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={iconStyle} />
            <input
              id="reg-password" name="password" type="password"
              className="form-control" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange}
              style={{ paddingLeft: 36 }} required
            />
          </div>
        </div>

        <button
          id="reg-submit"
          className="btn btn-primary btn-full"
          type="submit"
          disabled={loading}
          style={{ marginTop: 8, padding: '11px 20px', fontSize: 15 }}
        >
          {loading ? (
            <><span className="spinner spinner-sm" style={{ borderTopColor: 'rgba(255,255,255,0.6)' }} /> Creating account...</>
          ) : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  )
}
