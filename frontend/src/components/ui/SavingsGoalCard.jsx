import { Pencil, Trash2, Plus, CheckCircle2, Clock } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/constants'

// SVG circular progress ring
function RingProgress({ percent, size = 72, stroke = 5, color = '#10B981' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(percent, 100) / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface2)" strokeWidth={stroke} />
      {/* Fill */}
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
      />
      {/* Center text */}
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif">
        {Math.min(percent, 100).toFixed(0)}%
      </text>
    </svg>
  )
}

export default function SavingsGoalCard({ goal, onEdit, onDelete, onContribute }) {
  const { name, target_amount, saved_amount, progress_percent, deadline, status } = goal
  const isCompleted = status === 'completed'
  const isActive = status === 'active'
  const ringColor = isCompleted ? '#10B981' : status === 'cancelled' ? '#64748B' : '#10B981'

  const statusConfig = {
    active:    { cls: 'badge-info',    label: 'Active' },
    completed: { cls: 'badge-income',  label: 'Completed' },
    cancelled: { cls: 'badge-neutral', label: 'Cancelled' },
  }
  const sc = statusConfig[status] || statusConfig.active

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top row — ring + info */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <RingProgress percent={progress_percent || 0} color={ringColor} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{name}</h3>
            <span className={`badge ${sc.cls}`}>{sc.label}</span>
          </div>

          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
            {formatCurrency(saved_amount)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
            of {formatCurrency(target_amount)}
          </div>

          {deadline && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} />
              Due {formatDate(deadline)}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ height: 6 }}>
        <div className="progress-fill" style={{ width: `${Math.min(progress_percent || 0, 100)}%`, background: ringColor }} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        {isActive && onContribute && (
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onContribute(goal)}>
            <Plus size={14} /> Contribute
          </button>
        )}
        {isCompleted && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-income)', fontWeight: 600 }}>
            <CheckCircle2 size={15} /> Goal reached!
          </div>
        )}
        <button className="btn btn-secondary btn-icon btn-sm" onClick={() => onEdit(goal)} title="Edit">
          <Pencil size={14} />
        </button>
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={() => onDelete(goal.id)}
          style={{ color: 'var(--color-danger)' }}
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
