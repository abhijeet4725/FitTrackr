import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Target, TrendingDown, AlertTriangle } from 'lucide-react'
import Modal from '../components/ui/Modal'
import BudgetCard from '../components/ui/BudgetCard'
import PageHeader from '../components/ui/PageHeader'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import { budgetsApi, categoriesApi } from '../api'
import { MONTHS } from '../utils/constants'
import { formatCurrency } from '../utils/constants'

const now = new Date()
const EMPTY_FORM = { category_id: '', month: now.getMonth() + 1, year: now.getFullYear(), limit_amount: '' }

export default function BudgetsPage() {
  const [progress,   setProgress]   = useState([])
  const [categories, setCategories] = useState([])
  const [showModal,  setShowModal]  = useState(false)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [month,      setMonth]      = useState(now.getMonth() + 1)
  const [year,       setYear]       = useState(now.getFullYear())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, cats] = await Promise.all([
        budgetsApi.getProgress({ month, year }),
        categoriesApi.getAll({ type: 'expense' })
      ])
      setProgress(p.data.data.progress)
      setCategories(cats.data.data.categories)
    } catch { toast.error('Failed to load budgets') }
    finally { setLoading(false) }
  }, [month, year])

  useEffect(() => { load() }, [load])

  const handleSave = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await budgetsApi.create({ ...form, limit_amount: parseFloat(form.limit_amount) })
      toast.success('Budget saved!')
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await budgetsApi.delete(id); toast.success('Budget removed'); load() }
    catch { toast.error('Failed to delete') }
  }

  const totalBudget = progress.reduce((s, b) => s + b.limit_amount, 0)
  const totalSpent  = progress.reduce((s, b) => s + b.spent, 0)
  const exceeded    = progress.filter(b => b.exceeded).length

  return (
    <div>
      <PageHeader
        title="Budgets"
        subtitle="Set and track monthly spending limits"
        action={
          <button className="btn btn-primary" onClick={() => { setForm({ ...EMPTY_FORM, month, year }); setShowModal(true) }}>
            <Plus size={15} /> Set Budget
          </button>
        }
      />

      {/* Period selector */}
      <div className="card card-sm" style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Period:</span>
        <select className="form-control" style={{ width: 150 }} value={month} onChange={e => setMonth(+e.target.value)}>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className="form-control" style={{ width: 100 }} value={year} onChange={e => setYear(+e.target.value)}>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary row */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card card-sm">
          <div className="text-xs text-muted fw-600" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Total Budgeted</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(totalBudget)}</div>
        </div>
        <div className="card card-sm">
          <div className="text-xs text-muted fw-600" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Total Spent</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-expense)' }}>{formatCurrency(totalSpent)}</div>
        </div>
        <div className="card card-sm">
          <div className="text-xs text-muted fw-600" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Budgets Exceeded</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: exceeded > 0 ? 'var(--color-danger)' : 'var(--color-income)' }}>
            {exceeded}
          </div>
        </div>
      </div>

      {/* Budget cards */}
      {loading ? (
        <LoadingSpinner height={200} />
      ) : progress.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Target}
            title="No budgets for this month"
            subtitle="Set spending limits to stay on track with your finances."
            action={
              <button className="btn btn-primary" onClick={() => { setForm({ ...EMPTY_FORM, month, year }); setShowModal(true) }}>
                <Plus size={14} /> Set First Budget
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid-2" style={{ gap: 16 }}>
          {progress.map(b => (
            <BudgetCard key={b.id} budget={b} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Set Budget">
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-control" value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} required>
              <option value="">Select expense category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Month</label>
              <select className="form-control" value={form.month} onChange={e => setForm(f => ({ ...f, month: +e.target.value }))}>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <select className="form-control" value={form.year} onChange={e => setForm(f => ({ ...f, year: +e.target.value }))}>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Budget Limit (₹) *</label>
            <input type="number" className="form-control" min="1" value={form.limit_amount}
              onChange={e => setForm(f => ({ ...f, limit_amount: e.target.value }))} required />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving...' : 'Save Budget'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
