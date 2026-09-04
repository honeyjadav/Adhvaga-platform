export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString, options) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', options || { day: 'numeric', month: 'short', year: 'numeric' });
}

export const STATUS_BADGE_STYLES = {
  confirmed: 'bg-lagoon-100 text-lagoon-700',
  pending: 'bg-amber-400/20 text-amber-600',
  cancelled: 'bg-rose-100 text-rose-600',
};

export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
