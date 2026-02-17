// ──────────────────────────────────────────────
// API
// ──────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// ──────────────────────────────────────────────
// Transactions
// ──────────────────────────────────────────────
export const TRANSACTION_TYPES = {
  ALL:      'All Types',
  SEND:     'Send Money',
  RECEIVE:  'Receive Money',
  DEPOSIT:  'Deposit',
  WITHDRAW: 'Withdraw',
};

export const TRANSACTION_TYPE_OPTIONS = Object.entries(TRANSACTION_TYPES).map(
  ([value, label]) => ({ value, label })
);

export const TRANSACTION_STATUSES = {
  ALL:      'All Status',
  PENDING:  'Pending',
  COMPLETED:'Completed',
  FAILED:   'Failed',
  REVERSED: 'Reversed',
};

export const TRANSACTION_STATUS_OPTIONS = Object.entries(TRANSACTION_STATUSES).map(
  ([value, label]) => ({ value, label })
);

// ──────────────────────────────────────────────
// Transaction Limits
// ──────────────────────────────────────────────
export const TRANSACTION_LIMITS = {
  MIN_SEND:     10,
  MAX_SEND:     150_000,
  MIN_DEPOSIT:  10,
  MAX_DEPOSIT:  300_000,
  MIN_WITHDRAW: 10,
  MAX_WITHDRAW: 150_000,
  DAILY_LIMIT:  150_000,
};

// ──────────────────────────────────────────────
// Transaction Fees (send)
// ──────────────────────────────────────────────
export const SEND_CHARGES = [
  { min: 1,      max: 100,    charge: 0 },
  { min: 101,    max: 500,    charge: 5 },
  { min: 501,    max: 1000,   charge: 10 },
  { min: 1001,   max: 2500,   charge: 15 },
  { min: 2501,   max: 5000,   charge: 25 },
  { min: 5001,   max: 10000,  charge: 45 },
  { min: 10001,  max: 20000,  charge: 70 },
  { min: 20001,  max: 150000, charge: 105 },
];

export const WITHDRAW_CHARGES = [
  { min: 10,    max: 500,    charge: 10 },
  { min: 501,   max: 1000,   charge: 25 },
  { min: 1001,  max: 2500,   charge: 50 },
  { min: 2501,  max: 5000,   charge: 70 },
  { min: 5001,  max: 10000,  charge: 130 },
  { min: 10001, max: 150000, charge: 180 },
];

/**
 * Get the fee for a given amount and type.
 * @param {'SEND'|'WITHDRAW'} type
 * @param {number} amount
 * @returns {number}
 */
export const getTransactionFee = (type, amount) => {
  const table = type === 'WITHDRAW' ? WITHDRAW_CHARGES : SEND_CHARGES;
  const row = table.find((r) => amount >= r.min && amount <= r.max);
  return row ? row.charge : 0;
};

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
export const ROUTES = {
  HOME:          '/',
  LOGIN:         '/login',
  REGISTER:      '/register',
  FORGOT_PIN:    '/forgot-pin',
  DASHBOARD:     '/dashboard',
  SEND_MONEY:    '/send-money',
  DEPOSIT:       '/deposit',
  WITHDRAW:      '/withdraw',
  TRANSACTIONS:  '/transactions',
  TRANSACTION:   (id) => `/transactions/${id}`,
  WALLET:        '/wallet',
  AGENTS:        '/agents',
  AGENT:         (id) => `/agents/${id}`,
  NOTIFICATIONS: '/notifications',
  PROFILE:       '/profile',
  EDIT_PROFILE:  '/profile/edit',
  CHANGE_PIN:    '/change-pin',
  SETTINGS:      '/settings',
};

// ──────────────────────────────────────────────
// Notification Types
// ──────────────────────────────────────────────
export const NOTIFICATION_TYPES = {
  TRANSACTION:  'Transaction',
  SECURITY:     'Security',
  PROMOTIONAL:  'Promotional',
  SYSTEM:       'System',
};

// ──────────────────────────────────────────────
// Pagination
// ──────────────────────────────────────────────
export const PAGE_SIZE = 20;

// ──────────────────────────────────────────────
// Misc
// ──────────────────────────────────────────────
export const APP_NAME    = 'M-Pesa System';
export const APP_VERSION = '1.0.0';
export const CURRENCY    = 'KES';
export const CURRENCY_SYMBOL = 'KES ';