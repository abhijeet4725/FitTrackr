import { formatCurrency } from '../../utils/constants'

// BudgetProgressBar — compact inline version for dashboard
export default function BudgetProgressBar({ category, icon, color = '#10B981', limit, spent, percent, exceeded }) {
  const pct = Math.min(percent || 0, 100)
  const barColor = exceeded ? 'var(--color-expense)' : (color || 'var(--color-primary)')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && (
            <span style={{
              width: 28, height: 28, borderRadius: 7,
              background: `${barColor}1A`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, flexShrink: 0,
            }}>
              {icon}
            </span>
          )}
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{category}</span>
          {exceeded && (
            <span className="badge badge-expense" style={{ fontSize: 10, padding: '2px 6px' }}>Over</span>
          )}
        </div>
        <div style={{ textAlign: 'right', fontSize: 12 }}>
          <span style={{ fontWeight: 600, color: barColor }}>{formatCurrency(spent)}</span>
          <span style={{ color: 'var(--text-dim)' }}> / {formatCurrency(limit)}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      <div style={{ fontSize: 11, color: exceeded ? 'var(--color-expense)' : 'var(--text-dim)', textAlign: 'right' }}>
        {pct.toFixed(0)}% used
      </div>
    </div>
  )
}
