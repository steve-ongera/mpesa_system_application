import { transactionAPI } from './api';

// ─────────────────────────────────────────────────────────────
// Fee tables  (mirror of backend TransactionCharge fixtures)
// ─────────────────────────────────────────────────────────────

const SEND_FEES = [
  { min: 1,      max: 100,    fee: 0   },
  { min: 101,    max: 500,    fee: 5   },
  { min: 501,    max: 1000,   fee: 10  },
  { min: 1001,   max: 2500,   fee: 15  },
  { min: 2501,   max: 5000,   fee: 25  },
  { min: 5001,   max: 10000,  fee: 45  },
  { min: 10001,  max: 20000,  fee: 70  },
  { min: 20001,  max: 150000, fee: 105 },
];

const WITHDRAW_FEES = [
  { min: 10,    max: 500,    fee: 10  },
  { min: 501,   max: 1000,   fee: 25  },
  { min: 1001,  max: 2500,   fee: 50  },
  { min: 2501,  max: 5000,   fee: 70  },
  { min: 5001,  max: 10000,  fee: 130 },
  { min: 10001, max: 150000, fee: 180 },
];

/**
 * Get the transaction fee for a given type and amount.
 * @param {'SEND'|'WITHDRAW'} type
 * @param {number} amount
 * @returns {number} fee in KES
 */
export const getFee = (type, amount) => {
  const table = type === 'WITHDRAW' ? WITHDRAW_FEES : SEND_FEES;
  const row   = table.find((r) => amount >= r.min && amount <= r.max);
  return row ? row.fee : 0;
};

/**
 * Full fee schedule as an array (useful for displaying a table in the UI).
 */
export const getFeeSchedule = (type = 'SEND') =>
  type === 'WITHDRAW' ? WITHDRAW_FEES : SEND_FEES;

// ─────────────────────────────────────────────────────────────
// Transaction limits
// ─────────────────────────────────────────────────────────────

export const LIMITS = {
  MIN_SEND:          10,
  MAX_SEND:          150_000,
  MIN_DEPOSIT:       10,
  MAX_DEPOSIT:       300_000,
  MIN_WITHDRAW:      10,
  MAX_WITHDRAW:      150_000,
  DAILY_LIMIT:       150_000,
  PER_TRANSACTION:   150_000,
};

// ─────────────────────────────────────────────────────────────
// API wrappers with pre/post processing
// ─────────────────────────────────────────────────────────────

/**
 * Fetch paginated transaction list.
 * @param {{ transaction_type?, status?, start_date?, end_date?, page?, page_size? }} params
 */
export const getTransactions = async (params = {}) => {
  // Strip "ALL" sentinel values before sending to API
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v && v !== 'ALL' && v !== '')
  );
  const res = await transactionAPI.getTransactions(clean);
  return res.data;
};

/**
 * Fetch a single transaction by ID.
 */
export const getTransaction = async (id) => {
  const res = await transactionAPI.getTransaction(id);
  return res.data.data || res.data;
};

/**
 * Send money to another user.
 * Returns the created transaction object.
 */
export const sendMoney = async ({ receiver_phone, amount, pin, description = '' }) => {
  const res = await transactionAPI.sendMoney({ receiver_phone, amount, pin, description });
  return res.data.data || res.data;
};

/**
 * Deposit money at an agent.
 */
export const deposit = async ({ amount, agent_number }) => {
  const res = await transactionAPI.deposit({ amount, agent_number });
  return res.data.data || res.data;
};

/**
 * Withdraw money at an agent.
 */
export const withdraw = async ({ amount, agent_number, pin }) => {
  const res = await transactionAPI.withdraw({ amount, agent_number, pin });
  return res.data.data || res.data;
};

/**
 * Fetch last 10 transactions (dashboard widget).
 */
export const getRecentTransactions = async () => {
  const res = await transactionAPI.getRecent();
  return res.data.data || res.data || [];
};

/**
 * Fetch monthly/lifetime statistics.
 * Returns { monthly_sent_count, monthly_received_count, total_sent, total_received, … }
 */
export const getStatistics = async () => {
  const res = await transactionAPI.getStatistics();
  return res.data.data || res.data || {};
};

// ─────────────────────────────────────────────────────────────
// Business-logic helpers
// ─────────────────────────────────────────────────────────────

/**
 * Validate a send-money form.
 * @returns {{ [field]: string }} — empty object means valid.
 */
export const validateSend = ({ receiver_phone, amount, description = '', userPhone, balance }) => {
  const errors = {};

  if (!receiver_phone)
    errors.receiver_phone = 'Recipient phone is required';
  else if (!/^254\d{9}$/.test(receiver_phone))
    errors.receiver_phone = 'Phone must be in format 254XXXXXXXXX';
  else if (receiver_phone === userPhone)
    errors.receiver_phone = 'You cannot send money to yourself';

  const amt = parseFloat(amount);
  if (!amount || isNaN(amt) || amt <= 0)
    errors.amount = 'Please enter a valid amount';
  else if (amt < LIMITS.MIN_SEND)
    errors.amount = `Minimum send amount is KES ${LIMITS.MIN_SEND}`;
  else if (amt > LIMITS.MAX_SEND)
    errors.amount = `Maximum send amount is KES ${LIMITS.MAX_SEND.toLocaleString()}`;
  else {
    const fee   = getFee('SEND', amt);
    const total = amt + fee;
    if (total > balance)
      errors.amount = `Insufficient balance — need KES ${total.toLocaleString()}, have KES ${balance.toLocaleString()}`;
  }

  if (description && description.length > 100)
    errors.description = 'Description must be under 100 characters';

  return errors;
};

/**
 * Returns the net amount shown for a transaction (negative for debits).
 */
export const netAmount = (txn) => {
  const isDebit = ['SEND', 'WITHDRAW'].includes(txn.transaction_type);
  return isDebit ? -Math.abs(txn.amount) : Math.abs(txn.amount);
};

/**
 * Group an array of transactions by calendar date.
 * Returns an object keyed by label ('Today', 'Yesterday', or formatted date).
 */
export const groupByDate = (transactions) => {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();

  return transactions.reduce((acc, txn) => {
    const d   = new Date(txn.created_at).toDateString();
    let label = d === today ? 'Today' : d === yesterday ? 'Yesterday' :
      new Date(txn.created_at).toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric',
      });
    if (!acc[label]) acc[label] = [];
    acc[label].push(txn);
    return acc;
  }, {});
};

export const transactionService = {
  getFee,
  getFeeSchedule,
  getTransactions,
  getTransaction,
  sendMoney,
  deposit,
  withdraw,
  getRecentTransactions,
  getStatistics,
  validateSend,
  netAmount,
  groupByDate,
  LIMITS,
};

export default transactionService;