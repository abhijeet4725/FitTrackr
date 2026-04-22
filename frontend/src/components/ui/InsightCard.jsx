import { Lightbulb } from 'lucide-react'

const SEVERITY_MAP = {
  info:     { cls: 'insight-info',     badge: 'badge-info',    label: 'Info' },
  warning:  { cls: 'insight-warning',  badge: 'badge-warning', label: 'Warning' },
  critical: { cls: 'insight-critical', badge: 'badge-critical',label: 'Critical' },
}

export default function InsightCard({ insight, onRead }) {
  const cfg = SEVERITY_MAP[insight.severity] || SEVERITY_MAP.info
  return (
    <div
      className={`card card-sm ${cfg.cls} ${insight.is_read ? '' : 'insight-unread'}`}
      style={{ cursor: onRead && !insight.is_read ? 'pointer' : 'default', opacity: insight.is_read ? 0.7 : 1 }}
      onClick={() => onRead && !insight.is_read && onRead(insight.id)}
      role={onRead && !insight.is_read ? 'button' : undefined}
      tabIndex={onRead && !insight.is_read ? 0 : undefined}
      onKeyDown={e => e.key === 'Enter' && onRead && !insight.is_read && onRead(insight.id)}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Lightbulb size={15} style={{ flexShrink: 0, marginTop: 2, color: 'var(--color-warning)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span className={`badge ${cfg.badge}`} style={{ fontSize: 10 }}>{cfg.label}</span>
            {!insight.is_read && (
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-warning)', flexShrink: 0 }} />
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>{insight.message}</p>
          {!insight.is_read && onRead && (
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>Click to mark as read</p>
          )}
        </div>
      </div>
    </div>
  )
}
