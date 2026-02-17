// ──────────────────────────────────────────────
// Currency
// ──────────────────────────────────────────────

/**
 * Format a number as KES currency.
 * @param {number|string} amount
 * @param {boolean} compact  – use shorthand (1.2K, 3.5M)
 */
export const formatCurrency = (amount, compact = false) => {
  const num = parseFloat(amount) || 0;

  if (compact) {
    if (num >= 1_000_000)
      return `KES ${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000)
      return `KES ${(num / 1_000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(num);
};

/**
 * Format a number with thousand separators only (no symbol).
 */
export const formatNumber = (amount) =>
  new Intl.NumberFormat('en-KE').format(parseFloat(amount) || 0);

// ──────────────────────────────────────────────
// Date & Time
// ──────────────────────────────────────────────

/**
 * Full readable date-time: "May 3, 2024 at 10:45 AM"
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Short date: "May 3"
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Long date: "May 3, 2024"
 */
export const formatDateLong = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Relative time: "2m ago", "3h ago", "5d ago", or "May 3"
 */
export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '—';
  const now  = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDateShort(dateStr);
};

// ──────────────────────────────────────────────
// Phone Number
// ──────────────────────────────────────────────

/**
 * Format 254712345678 → +254 712 345 678
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '—';
  const p = phone.toString().replace(/\D/g, '');
  if (p.length === 12 && p.startsWith('254')) {
    return `+${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6, 9)} ${p.slice(9)}`;
  }
  return phone;
};

/**
 * Mask phone number: 254712***678
 */
export const maskPhoneNumber = (phone) => {
  if (!phone) return '—';
  const p = phone.toString();
  return p.slice(0, 6) + '***' + p.slice(-3);
};

// ──────────────────────────────────────────────
// Transaction
// ──────────────────────────────────────────────

/**
 * Transaction type → human label
 */
export const formatTransactionType = (type) => {
  const map = {
    SEND:     'Send Money',
    RECEIVE:  'Receive Money',
    DEPOSIT:  'Deposit',
    WITHDRAW: 'Withdraw',
  };
  return map[type] || type;
};

/**
 * Status → color class
 */
export const getStatusColor = (status) => {
  const map = {
    COMPLETED: 'text-green-600',
    PENDING:   'text-yellow-600',
    FAILED:    'text-red-600',
    REVERSED:  'text-gray-600',
  };
  return map[status] || 'text-gray-600';
};

/**
 * Determine if a transaction amount should show negative sign.
 */
export const isDebit = (type) => ['SEND', 'WITHDRAW'].includes(type);

/**
 * Return formatted amount with sign prefix.
 */
export const formatTransactionAmount = (amount, type) => {
  const sign = isDebit(type) ? '-' : '+';
  return `${sign}${formatCurrency(amount)}`;
};