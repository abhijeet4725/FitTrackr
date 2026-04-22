import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { TrendingUp, TrendingDown, Wallet, Target, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/ui/StatCard'
import ExpensePieChart from '../components/charts/ExpensePieChart'
import IncomeExpenseTrend from '../components/charts/IncomeExpenseTrend'
import BudgetProgressBar from '../components/ui/BudgetProgressBar'
import InsightCard from '../components/ui/InsightCard'
import TransactionRow from '../components/ui/TransactionRow'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import { dashboardApi, insightsApi } from '../api'
import { ArrowLeftRight, PiggyBank, BarChart2 } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [summary,    setSummary]    = useState(null)
  const [recent,     setRecent]     = useState([])
  const [breakdown,  setBreakdown]  = useState([])
  const [trend,      setTrend]      = useState([])
  const [budgetCards,setBudgetCards]= useState([])
  const [insights,   setInsights]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(false)

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const [s, r, b, t, bc, ins] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getRecent(),
        dashboardApi.getBreakdown(),
        dashboardApi.getTrend(),
        dashboardApi.getBudgetCards(),
        insightsApi.getAll(),
      ])
      setSummary(s.data.data)
      setRecent(r.data.data.transactions)
      setBreakdown(b.data.data.breakdown)
      setTrend(t.data.data.trend)
      setBudgetCards(bc.data.data.budget_cards)
      setInsights(ins.data.data.insights)
    } catch {
      setError(true)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
    // Auto-generate insights (fire-and-forget)
    insightsApi.generate().catch(() => {})
  }

  useEffect(() => { load() }, [])

  const handleMarkRead = async (id) => {
    await insightsApi.markRead(id)
    setInsights(prev => prev.map(i => i.id === id ? { ...i, is_read: true } : i))
  }

  if (loading) return <LoadingSpinner height={400} />

  if (error) return (
    <div className="flex-center" style={{ height: 300, flexDirection: 'column', gap: 12 }}>
      <p style={{ color: 'var(--text-muted)' }}>Failed to load dashboard.</p>
      <button className="btn btn-secondary" onClick={load}>Retry</button>
    </div>
  )

  const unreadInsights = insights.filter(i => !i.is_read)
  const exceeded = budgetCards.filter(b => b.exceeded).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Greeting */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 2 }}>
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Here's your financial overview for this month.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid-4">
        <StatCard title="Monthly Income"  value={summary?.total_income}  icon={TrendingUp}   color="#10B981" sub="This month" />
        <StatCard title="Monthly Expense" value={summary?.total_expense} icon={TrendingDown}  color="#EF4444" sub="This month" />
        <StatCard title="Net Savings"     value={summary?.net_savings}   icon={Wallet}        color="#6366F1" sub="Income − Expense" />
        {/* Budgets exceeded — custom count card */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Budgets Exceeded
            </span>
            <span className="stat-icon-wrap" style={{ background: exceeded > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: exceeded > 0 ? '#EF4444' : '#10B981', width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={18} strokeWidth={1.75} />
            </span>
          </div>
          <div className="stat-value">{exceeded}</div>
          <div className="stat-sub">{exceeded > 0 ? 'Action needed' : 'All on track'}</div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid-2">
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h3>Expense by Category</h3>
          </div>
          <ExpensePieChart data={breakdown} />
        </div>
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h3>6-Month Trend</h3>
          </div>
          <IncomeExpenseTrend data={trend} />
        </div>
      </div>

      {/* ── Budget Progress + Insights ── */}
      <div className="grid-2">
        {/* Budget Progress */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 4 }}>
            <h3>Budget Progress</h3>
            <Link to="/budgets" className="btn btn-ghost btn-sm">
              <Plus size={13} /> Add
            </Link>
          </div>
          {budgetCards.length === 0 ? (
            <EmptyState icon={Target} title="No budgets set" subtitle="Set budgets to track your monthly spending limits." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {budgetCards.slice(0, 5).map(b => (
                <BudgetProgressBar
                  key={b.budget_id}
                  category={b.category_name}
                  icon={b.category_icon}
                  color={b.category_color}
                  limit={b.limit}
                  spent={b.spent}
                  percent={b.percent}
                  exceeded={b.exceeded}
                />
              ))}
            </div>
          )}
        </div>

        {/* Smart Insights */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <h3>Smart Insights</h3>
            {unreadInsights.length > 0 && (
              <span className="badge badge-warning">{unreadInsights.length} new</span>
            )}
          </div>
          {insights.length === 0 ? (
            <EmptyState icon={BarChart2} title="No insights yet" subtitle="Add transactions to generate personalized insights." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {insights.slice(0, 5).map(i => (
                <InsightCard key={i.id} insight={i} onRead={handleMarkRead} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <h3>Recent Transactions</h3>
          <Link to="/transactions" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions yet"
            subtitle="Start by adding your first income or expense."
            action={
              <Link to="/transactions" className="btn btn-primary btn-sm">
                <Plus size={14} /> Add Transaction
              </Link>
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
                {recent.map(tx => (
                  <TransactionRow key={tx.id} tx={tx} onEdit={null} onDelete={null} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}
