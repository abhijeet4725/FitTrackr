import { InboxIcon } from 'lucide-react'

// EmptyState — Icon + title + subtitle + optional CTA
export default function EmptyState({ icon: Icon = InboxIcon, title, subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      {title && <h3>{title}</h3>}
      {subtitle && <p>{subtitle}</p>}
      {action && action}
    </div>
  )
}
