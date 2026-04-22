import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FileText, Download } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import { reportsApi } from '../api'
import { formatCurrency, MONTHS } from '../utils/constants'

const now = new Date()

export default function ReportsPage() {
  const [reports,    setReports]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [month,      setMonth]      = useState(now.getMonth() + 1)
  const [year,       setYear]       = useState(now.getFullYear())
  const [generating, setGenerating] = useState(false)
  const [detail,     setDetail]     = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await reportsApi.getAll()
      setReports(res.data.data.reports)
    } catch { toast.error('Failed to load reports') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const generate = async () => {
    setGenerating(true)
    try {
      const res = await reportsApi.generate({ month, year })
      toast.success('Report generated!')
      await load()
      viewReport(res.data.data.report.id)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to generate report') }
    finally { setGenerating(false) }
  }

  const viewReport = async (id) => {
    try {
      const res = await reportsApi.getOne(id)
      setDetail(res.data.data)
    } catch { toast.error('Failed to load report detail') }
  }

  const exportCsv = async (id) => {
    try {
      const res = await reportsApi.exportCsv(id)
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url; a.download = `fintrackr_report_${id}.csv`; a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV downloaded!')
    } catch { toast.error('Export failed') }
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and download monthly financial summaries" />

      {/* Generate card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Generate Monthly Report</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Month</label>
            <select className="form-control" style={{ width: 150 }} value={month} onChange={e => setMonth(+e.target.value)}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Year</label>
            <select className="form-control" style={{ width: 100 }} value={year} onChange={e => setYear(+e.target.value)}>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={generating}>
            <FileText size={15} />
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Reports List */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Past Reports</h3>
          {loading ? (
            <LoadingSpinner height={100} size="sm" />
          ) : reports.length === 0 ? (
            <EmptyState icon={FileText} title="No reports yet" subtitle="Generate your first monthly report above." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reports.map(r => (
                <div
                  key={r.id}
                  className="card card-xs"
                  style={{ cursor: 'pointer', borderColor: detail?.report?.id === r.id ? 'var(--color-primary)' : undefined }}
                  onClick={() => viewReport(r.id)}
                >
                  <div className="flex-between">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{MONTHS[r.month - 1]} {r.year}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                        Net: <span style={{ color: r.net_savings >= 0 ? 'var(--color-income)' : 'var(--color-expense)', fontWeight: 600 }}>
                          {formatCurrency(r.net_savings)}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={e => { e.stopPropagation(); exportCsv(r.id) }}
                      title="Download CSV"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Detail */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Report Detail</h3>
          {!detail ? (
            <EmptyState icon={FileText} title="No report selected" subtitle="Click a report on the left to view its details." />
          ) : (
            <>
              <h2 style={{ marginBottom: 16 }}>{MONTHS[detail.report.month - 1]} {detail.report.year}</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
                {[
                  { label: 'Total Income',  value: detail.report.total_income,  color: 'var(--color-income)' },
                  { label: 'Total Expense', value: detail.report.total_expense, color: 'var(--color-expense)' },
                  { label: 'Net Savings',   value: detail.report.net_savings,   color: 'var(--color-primary)' },
                ].map(row => (
                  <div key={row.label} className="flex-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{row.label}</span>
                    <span style={{ fontWeight: 700, color: row.color, fontSize: 15 }}>{formatCurrency(row.value)}</span>
                  </div>
                ))}
                {detail.report.top_category && (
                  <div className="flex-between" style={{ padding: '12px 0' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Top Expense Category</span>
                    <span className="badge badge-info">{detail.report.top_category}</span>
                  </div>
                )}
              </div>

              {detail.breakdown.length > 0 && (
                <>
                  <h4 style={{ marginBottom: 10 }}>Category Breakdown</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {detail.breakdown.map((b, i) => (
                      <div key={i} className="flex-between" style={{ fontSize: 14, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{b.category}</span>
                        <span className={b.type === 'income' ? 'text-income' : 'text-expense'}>{formatCurrency(b.total)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button
                className="btn btn-secondary"
                style={{ marginTop: 20, width: '100%' }}
                onClick={() => exportCsv(detail.report.id)}
              >
                <Download size={15} /> Download CSV
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
