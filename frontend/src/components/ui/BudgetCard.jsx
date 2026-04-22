import { Trash2 } from 'lucide-react'
import { formatCurrency } from '../../utils/constants'

// BudgetCard — full card used in BudgetsPage
export default function BudgetCard({ budget, onDelete }) {
  const { category_name, category_icon, category_color, limit_amount, spent, percent_used, exceeded } = budget
  const pct = Math.min(percent_used || 0, 100)
  const barColor = exceeded ? 'var(--color-expense)' : (category_color || 'var(--color-primary)')
  const remaining = limit_amount - spent

  return (
    <div className="card budget-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `${barColor}1A`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            {category_icon || '🎯'}
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{category_name}</div>
            {exceeded
              ? <span className="badge badge-expense" style={{ fontSize: 10, marginTop: 2 }}>Over budget</span>
              : <span className="badge badge-success" style={{ fontSize: 10, marginTop: 2 }}>On track</span>
            }
          </div>
        </div>

        {onDelete && (
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => onDelete(budget.id)}
            style={{ color: 'var(--text-dim)' }}
            title="Remove budget"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
          <span style={{ color: 'var(--text-dim)' }}>{pct.toFixed(0)}% used</span>
          <span style={{ color: barColor, fontWeight: 600 }}>{formatCurrency(spent)}</span>
        </div>
        <div className="progress-bar" style={{ height: 10 }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          <div>Limit</div>
          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14, marginTop: 2 }}>{formatCurrency(limit_amount)}</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          <div>Spent</div>
          <div style={{ fontWeight: 600, color: 'var(--color-expense)', fontSize: 14, marginTop: 2 }}>{formatCurrency(spent)}</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
          <div>Remaining</div>
          <div style={{ fontWeight: 600, color: exceeded ? 'var(--color-expense)' : 'var(--color-income)', fontSize: 14, marginTop: 2 }}>
            {exceeded ? '−' : ''}{formatCurrency(Math.abs(remaining))}
          </div>
        </div>
      </div>
    </div>
  )
}
