import { AlertTriangle } from 'lucide-react'

// ErrorState — Error block with retry button
export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>
        <AlertTriangle size={28} strokeWidth={1.5} />
      </div>
      <h3>Oops!</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry} style={{ marginTop: 8 }}>
          Try Again
        </button>
      )}
    </div>
  )
}
