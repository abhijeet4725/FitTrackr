// FilterBar — Reusable horizontal filter bar for tables/lists
export default function FilterBar({ filters, onFilterChange, onClear, categories = [], showCategory = true, children }) {
  const set = (key, val) => onFilterChange({ ...filters, [key]: val })

  return (
    <div className="card card-sm" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>

        {/* Type */}
        <div className="form-group" style={{ marginBottom: 0, minWidth: 120 }}>
          <label className="form-label">Type</label>
          <select className="form-control" value={filters.type || ''} onChange={e => set('type', e.target.value)}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Category */}
        {showCategory && (
          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label className="form-label">Category</label>
            <select className="form-control" value={filters.category_id || ''} onChange={e => set('category_id', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Date from */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">From</label>
          <input
            type="date" className="form-control"
            value={filters.date_from || ''}
            onChange={e => set('date_from', e.target.value)}
          />
        </div>

        {/* Date to */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">To</label>
          <input
            type="date" className="form-control"
            value={filters.date_to || ''}
            onChange={e => set('date_to', e.target.value)}
          />
        </div>

        {/* Extra slots */}
        {children}

        {/* Clear */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={onClear}
          style={{ alignSelf: 'flex-end', marginBottom: 1 }}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
