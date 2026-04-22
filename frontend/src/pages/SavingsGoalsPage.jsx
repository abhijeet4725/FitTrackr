import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, PiggyBank } from 'lucide-react'
import Modal from '../components/ui/Modal'
import SavingsGoalCard from '../components/ui/SavingsGoalCard'
import PageHeader from '../components/ui/PageHeader'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import { savingsApi } from '../api'
import { formatCurrency } from '../utils/constants'

const EMPTY_FORM = { name: '', target_amount: '', saved_amount: '', deadline: '' }

export default function SavingsGoalsPage() {
  const [goals,          setGoals]          = useState([])
  const [loading,        setLoading]        = useState(true)
  const [showModal,      setShowModal]      = useState(false)
  const [editItem,       setEditItem]       = useState(null)
  const [form,           setForm]           = useState(EMPTY_FORM)
  const [saving,         setSaving]         = useState(false)
  const [contributeGoal, setContributeGoal] = useState(null)
  const [contributeAmt,  setContributeAmt]  = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await savingsApi.getAll()
      setGoals(res.data.data.goals)
    } catch { toast.error('Failed to load goals') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = g => {
    setEditItem(g)
    setForm({ name: g.name, target_amount: g.target_amount, saved_amount: g.saved_amount, deadline: g.deadline || '' })
    setShowModal(true)
  }

  const handleSave = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (editItem) await savingsApi.update(editItem.id, form)
      else await savingsApi.create(form)
      toast.success(editItem ? 'Goal updated' : 'Goal created!')
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await savingsApi.delete(id); toast.success('Goal deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  const handleContribute = async () => {
    if (!contributeAmt || isNaN(contributeAmt)) { toast.error('Enter a valid amount'); return }
    try {
      await savingsApi.contribute(contributeGoal.id, { amount: parseFloat(contributeAmt) })
      toast.success('Contribution added! 🎉')
      setContributeGoal(null); setContributeAmt(''); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const activeGoals = goals.filter(g => g.status === 'active').length
  const completedGoals = goals.filter(g => g.status === 'completed').length

  return (
    <div>
      <PageHeader
        title="Savings Goals"
        subtitle={`${activeGoals} active · ${completedGoals} completed`}
        action={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={15} /> New Goal
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner height={200} />
      ) : goals.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={PiggyBank}
            title="No savings goals yet"
            subtitle="Create a goal with a target amount and deadline to start tracking your progress."
            action={
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={14} /> Create Your First Goal
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid-2" style={{ gap: 16 }}>
          {goals.map(g => (
            <SavingsGoalCard
              key={g.id}
              goal={g}
              onEdit={openEdit}
              onDelete={handleDelete}
              onContribute={setContributeGoal}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Goal' : 'New Savings Goal'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Goal Name *</label>
            <input type="text" className="form-control" placeholder="e.g. Emergency Fund"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Target Amount (₹) *</label>
              <input type="number" className="form-control" min="1"
                value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Already Saved (₹)</label>
              <input type="number" className="form-control" min="0"
                value={form.saved_amount} onChange={e => setForm(f => ({ ...f, saved_amount: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Deadline (optional)</label>
            <input type="date" className="form-control" value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
              {saving ? 'Saving...' : editItem ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Contribute Modal */}
      <Modal isOpen={!!contributeGoal} onClose={() => setContributeGoal(null)} title={`Contribute to: ${contributeGoal?.name}`}>
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Current Progress</div>
          <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: 18 }}>
            {formatCurrency(contributeGoal?.saved_amount)} <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: 14 }}>/ {formatCurrency(contributeGoal?.target_amount)}</span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Amount to Add (₹)</label>
          <input type="number" className="form-control" min="1" value={contributeAmt}
            onChange={e => setContributeAmt(e.target.value)} autoFocus placeholder="e.g. 5000" />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setContributeGoal(null)}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleContribute}>Add Contribution</button>
        </div>
      </Modal>
    </div>
  )
}
