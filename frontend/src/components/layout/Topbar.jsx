import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import './Topbar.css'

const PAGE_TITLES = {
  '/dashboard':    { title: 'Dashboard',     sub: 'Overview of your finances' },
  '/transactions': { title: 'Transactions',  sub: 'Track your income and expenses' },
  '/budgets':      { title: 'Budgets',       sub: 'Set and monitor spending limits' },
  '/savings':      { title: 'Savings Goals', sub: 'Track your financial goals' },
  '/reports':      { title: 'Reports',       sub: 'Generate monthly summaries' },
  '/profile':      { title: 'Profile',       sub: 'Manage your account' },
}

export default function Topbar({ onMenuClick }) {
  const location = useLocation()
  const { user } = useAuth()
  const page = PAGE_TITLES[location.pathname] || { title: 'FinTrackr', sub: '' }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="topbar-menu-btn"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="topbar-title-group">
          <h2 className="topbar-title">{page.title}</h2>
          {page.sub && <p className="topbar-sub">{page.sub}</p>}
        </div>
      </div>

      <div className="topbar-right">
        <ThemeToggle />
        <div className="topbar-avatar" aria-label={`Logged in as ${user?.name}`}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
