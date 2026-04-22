// Shared currency formatter — INR
export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num)
}

export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const PAYMENT_MODES = ['cash', 'card', 'upi', 'bank_transfer', 'other']
export const PAYMENT_MODE_LABELS = { cash: 'Cash', card: 'Card', upi: 'UPI', bank_transfer: 'Bank Transfer', other: 'Other' }

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]
