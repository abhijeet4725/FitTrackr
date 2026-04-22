import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate, PAYMENT_MODE_LABELS } from '../../utils/constants'

export default function TransactionRow({ tx, onEdit, onDelete }) {
  const isIncome = tx.type === 'income'
  return (
    <tr>
      {/* Category */}
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: `${tx.category_color || '#10B981'}1A`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>
            {tx.category_icon || '💳'}
          </span>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>
              {tx.category_name}
            </div>
            {tx.note && (
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 1 }}>
                {tx.note}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Type badge */}
      <td>
        <span className={`badge ${isIncome ? 'badge-income' : 'badge-expense'}`}>
          {isIncome ? 'Income' : 'Expense'}
        </span>
      </td>

      {/* Date */}
      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        {formatDate(tx.date)}
      </td>

      {/* Payment mode */}
      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        {PAYMENT_MODE_LABELS[tx.payment_mode] || tx.payment_mode}
      </td>

      {/* Amount */}
      <td style={{ textAlign: 'right' }}>
        <span className={isIncome ? 'text-income' : 'text-expense'}>
          {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
        </span>
      </td>

      {/* Actions */}
      <td style={{ textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          {onEdit && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onEdit(tx)}
              aria-label="Edit transaction"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onDelete(tx)}
              aria-label="Delete transaction"
              title="Delete"
              style={{ color: 'var(--color-danger)' }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
