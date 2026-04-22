import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, ArrowLeftRight } from 'lucide-react'
import Modal from '../components/ui/Modal'
import TransactionRow from '../components/ui/TransactionRow'
import FilterBar from '../components/ui/FilterBar'
import PageHeader from '../components/ui/PageHeader'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import { transactionsApi, categoriesApi } from '../api'
import { PAYMENT_MODES, PAYMENT_MODE_LABELS } from '../utils/constants'

const EMPTY_FORM = {
  type: 'expense', category_id: '', amount: '',
  date: new Date().toISOString().slice(0, 10), note: '', payment_mode: 'cash'
}
const EMPTY_FILTERS = { type: '', category_id: '', date_from: '', date_to: '' }

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [categories,   setCategories]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showModal,    setShowModal]    = useState(false)
  const [editItem,     setEditItem]     = useState(null)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [delItem,      setDelItem]      = useState(null)
  const [filters,      setFilters]      = useState(EMPTY_FILTERS)
  const [saving,       setSaving]       = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      const [tx, cats] = await Promise.all([
        transactionsApi.getAll({ ...params, per_page: 50 }),
        categoriesApi.getAll()
      ])
      setTransactions(tx.data.data.transactions)
      setCategories(cats.data.data.categories)
    } catch { toast.error('Failed to load transactions') }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { loadData() }, [loadData])

  const filteredCats = categories.filter(c => !form.type || c.type === form.type)

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = tx => {
    setEditItem(tx)
    setForm({ type: tx.type, category_id: tx.category_id, amount: tx.amount, date: tx.date, note: tx.note || '', payment_mode: tx.payment_mode })
    setShowModal(true)
  }

  const handleSave = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (editItem) {
        await transactionsApi.update(editItem.id, { ...form, amount: parseFloat(form.amount) })
        toast.success('Transaction updated')
      } else {
        await transactionsApi.create({ ...form, amount: parseFloat(form.amount) })
        toast.success('Transaction added')
      }
      setShowModal(false)
      loadData()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await transactionsApi.delete(delItem.id)
      toast.success('Transaction deleted')
      setDelItem(null); loadData()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle={`${transactions.length} record${transactions.length !== 1 ? 's' : ''}`}
        action={
          <button id="add-transaction-btn" className="btn btn-primary" onClick={openAdd}>
            <Plus size={15} /> Add Transaction
          </button>
        }
      />

      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
        categories={categories}
      />

      {/* Table Card */}
      <div className="card">
        {loading ? (
          <LoadingSpinner height={200} />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions found"
            subtitle={Object.values(filters).some(Boolean) ? 'Try clearing filters to see all transactions.' : 'Add your first transaction to get started.'}
            action={
              !Object.values(filters).some(Boolean) && (
                <button className="btn btn-primary" onClick={openAdd}>
                  <Plus size={14} /> Add Transaction
                </button>
              )
            }
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category / Note</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Mode</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <TransactionRow key={tx.id} tx={tx} onEdit={openEdit} onDelete={setDelItem} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Transaction' : 'Add Transaction'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Type *</label>
            <select className="form-control" value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value, category_id: '' }))} required>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-control" value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} required>
              <option value="">Select category</option>
              {filteredCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input type="number" className="form-control" min="0.01" step="0.01"
                value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-control" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Payment Mode</label>
            <select className="form-control" value={form.payment_mode}
              onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))}>
              {PAYMENT_MODES.map(m => <option key={m} value={m}>{PAYMENT_MODE_LABELS[m]}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <input type="text" className="form-control" placeholder="e.g. Grocery shopping"
              value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
              {saving ? 'Saving...' : editItem ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!delItem} onClose={() => setDelItem(null)} title="Delete Transaction">
        <p style={{ marginBottom: 20 }}>Are you sure you want to delete this transaction? This cannot be undone.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDelItem(null)}>Cancel</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  )
}
