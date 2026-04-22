import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { User, Lock, Info, Sun } from 'lucide-react'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import ThemeToggle from '../components/ui/ThemeToggle'
import { useTheme } from '../context/ThemeContext'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const { isDark } = useTheme()
  const [profile, setProfile] = useState({
    name: user?.name || '',
    currency: user?.currency || 'INR',
    monthly_income_target: user?.monthly_income_target || '',
    monthly_savings_target: user?.monthly_savings_target || ''
  })
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const handleProfileSave = async e => {
    e.preventDefault(); setSavingProfile(true)
    try {
      const res = await authApi.updateMe(profile)
      setUser(res.data.data.user)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSavingProfile(false) }
  }

  const handlePwSave = async e => {
    e.preventDefault(); setSavingPw(true)
    try {
      await authApi.changePassword(pwForm)
      toast.success('Password changed!')
      setPwForm({ current_password: '', new_password: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSavingPw(false) }
  }

  const initial = user?.name?.charAt(0).toUpperCase() || '?'

  return (
    <div>
      <PageHeader title="Profile & Settings" subtitle="Manage your account and preferences" />

      {/* Avatar section */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 72, height: 72,
          background: 'linear-gradient(135deg, #10B981, #059669)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0,
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
        }}>
          {initial}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
            Member since {new Date(user?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Profile form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <User size={16} style={{ color: 'var(--color-primary)' }} />
            <h3>Edit Profile</h3>
          </div>
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select className="form-control" value={profile.currency}
                onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}>
                <option value="INR">₹ INR — Indian Rupee</option>
                <option value="USD">$ USD — US Dollar</option>
                <option value="EUR">€ EUR — Euro</option>
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Monthly Income Target (₹)</label>
                <input type="number" className="form-control" min="0" value={profile.monthly_income_target}
                  onChange={e => setProfile(p => ({ ...p, monthly_income_target: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Savings Target (₹)</label>
                <input type="number" className="form-control" min="0" value={profile.monthly_savings_target}
                  onChange={e => setProfile(p => ({ ...p, monthly_savings_target: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Theme toggle */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sun size={16} style={{ color: 'var(--color-primary)' }} />
              <h3>Appearance</h3>
            </div>
            <div className="flex-between">
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Switch between dark and light theme
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Password */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Lock size={16} style={{ color: 'var(--color-primary)' }} />
              <h3>Change Password</h3>
            </div>
            <form onSubmit={handlePwSave}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-control" value={pwForm.current_password}
                  onChange={e => setPwForm(p => ({ ...p, current_password: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password (min 6 chars)</label>
                <input type="password" className="form-control" value={pwForm.new_password}
                  onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingPw}>
                {savingPw ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Account info */}
          <div className="card" style={{ background: 'var(--surface2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Info size={15} style={{ color: 'var(--text-muted)' }} />
              <h4 style={{ color: 'var(--text-muted)' }}>Account Info</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Email</span>
                <span style={{ fontWeight: 500 }}>{user?.email}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Member since</span>
                <span>{new Date(user?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Currency</span>
                <span>{user?.currency || 'INR'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
