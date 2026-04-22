import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: 8, justifyContent: 'space-between', marginBottom: 2 }}>
          <span>{p.name}</span>
          <span style={{ fontWeight: 600 }}>
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function IncomeExpenseTrend({ data = [] }) {
  if (!data.length) return (
    <div className="flex-center" style={{ height: 240, color: 'var(--text-dim)', fontSize: 13 }}>
      No trend data available
    </div>
  )

  const chartData = data.map(d => ({
    month: d.month_label || d.month,
    Income: parseFloat(d.income || d.total_income || 0),
    Expense: parseFloat(d.expense || d.total_expense || 0),
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} barGap={4} barCategoryGap="30%">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'var(--text-dim)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--text-dim)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface2)', radius: 4 }} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v}</span>}
        />
        <Bar dataKey="Income"  fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
