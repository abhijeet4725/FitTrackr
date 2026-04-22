// PageHeader — Reusable page title + subtitle + optional action button
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex-between page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
