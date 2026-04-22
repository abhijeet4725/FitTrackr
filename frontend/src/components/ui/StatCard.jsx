import { formatCurrency } from '../../utils/constants'
import './StatCard.css'

export default function StatCard({ title, value, icon: Icon, color = '#10B981', sub, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{title}</span>
        <span className="stat-icon-wrap" style={{ background: `${color}1A`, color }}>
          {Icon && <Icon size={18} strokeWidth={1.75} />}
        </span>
      </div>
      <div className="stat-value">{formatCurrency(value)}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      {trend !== undefined && (
        <div className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
          <span>{trend >= 0 ? '↑' : '↓'}</span>
          {Math.abs(trend).toFixed(1)}% vs last month
        </div>
      )}
    </div>
  )
}
