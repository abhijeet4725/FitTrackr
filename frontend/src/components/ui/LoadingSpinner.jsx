// LoadingSpinner — Centered spinner with configurable height
export default function LoadingSpinner({ height = 240, size = '' }) {
  return (
    <div className="flex-center" style={{ height, width: '100%' }}>
      <div className={`spinner ${size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : ''}`} />
    </div>
  )
}
