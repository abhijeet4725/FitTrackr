import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import './ThemeToggle.css'

export default function ThemeToggle({ size = 'md' }) {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      id="theme-toggle"
      className={`theme-toggle theme-toggle-${size}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span className={`theme-toggle-track ${isDark ? 'dark' : 'light'}`}>
        <span className="theme-toggle-thumb">
          {isDark
            ? <Moon size={12} strokeWidth={2.5} />
            : <Sun  size={12} strokeWidth={2.5} />
          }
        </span>
      </span>
    </button>
  )
}
