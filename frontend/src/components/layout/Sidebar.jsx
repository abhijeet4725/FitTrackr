import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, Target, PiggyBank,
  BarChart2, UserCircle, LogOut, TrendingUp, X, Menu
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

const NAV_ITEMS = [
  { path: '/dashboard',    icon: LayoutDashboard,  label: 'Dashboard' },
  { path: '/transactions', icon: ArrowLeftRight,   label: 'Transactions' },
  { path: '/budgets',      icon: Target,           label: 'Budgets' },
  { path: '/savings',      icon: PiggyBank,        label: 'Savings Goals' },
  { path: '/reports',      icon: BarChart2,        label: 'Reports' },
  { path: '/profile',      icon: UserCircle,       label: 'Profile' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    onClose?.()
  }

  const initial = user?.name?.charAt(0).toUpperCase() || '?'

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <TrendingUp size={18} strokeWidth={2.5} />
          </div>
          <span className="sidebar-logo-text">FinTrackr</span>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* User section */}
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initial}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="sidebar-divider" />

        {/* Navigation */}
        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
          <div className="sidebar-nav-label">Menu</div>
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.75} className="nav-icon" />
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.75} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
