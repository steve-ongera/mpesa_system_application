import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter, Download, RefreshCw, Search,
  ArrowUpRight, ArrowDownLeft, ArrowDownToLine, ArrowUpFromLine,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import { transactionAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './history.css'; // Import the CSS file


/* ─── helpers ─────────────────────────────────────────── */
const fmt = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(parseFloat(v) || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatTime = (d) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const isDebit = (type) => ['SEND', 'WITHDRAW'].includes(type);

const TYPE_CONFIG = {
  SEND:     { Icon: ArrowUpRight,    bg: 'icon-bg-send',    color: 'icon-color-send'    },
  RECEIVE:  { Icon: ArrowDownLeft,   bg: 'icon-bg-receive',  color: 'icon-color-receive'  },
  DEPOSIT:  { Icon: ArrowDownToLine, bg: 'icon-bg-deposit', color: 'icon-color-deposit' },
  WITHDRAW: { Icon: ArrowUpFromLine, bg: 'icon-bg-withdraw', color: 'icon-color-withdraw' },
};

const STATUS_VARIANT = {
  COMPLETED: 'badge-success',
  PENDING:   'badge-warning',
  FAILED:    'badge-error',
  REVERSED:  'badge-default',
};

const DEFAULT_FILTERS = {
  transaction_type: 'ALL',
  status:           'ALL',
  start_date:       '',
  end_date:         '',
  search:           '',
};

/* ─── Transaction row ────────────────────────────────── */
const TxnRow = ({ txn, onClick }) => {
  const cfg = TYPE_CONFIG[txn.transaction_type] || TYPE_CONFIG.SEND;
  const { Icon, bg, color } = cfg;
  const debit = isDebit(txn.transaction_type);

  return (
    <div
      className="transaction-row"
      onClick={onClick}
    >
      <div className={`transaction-icon-wrapper ${bg}`}>
        <Icon size={20} className={`transaction-icon ${color}`} />
      </div>

      <div className="transaction-details">
        <p className="transaction-type">
          {txn.transaction_type.charAt(0) + txn.transaction_type.slice(1).toLowerCase().replace('_', ' ')}
        </p>
        <p className="transaction-code">{txn.transaction_code}</p>
        {(txn.sender_name || txn.receiver_name) && (
          <p className="transaction-party">
            {debit
              ? `To: ${txn.receiver_name || txn.receiver_phone || '—'}`
              : `From: ${txn.sender_name || txn.sender_phone || '—'}`}
          </p>
        )}
      </div>

      <div className="transaction-right">
        <p className={`transaction-amount ${debit ? 'amount-debit' : 'amount-credit'}`}>
          {debit ? '−' : '+'}{fmt(txn.amount)}
        </p>
        <p className="transaction-time">{formatTime(txn.created_at)}</p>
        <div className="transaction-badge">
          <Badge variant={STATUS_VARIANT[txn.status] || 'badge-default'} size="sm">
            {txn.status}
          </Badge>
        </div>
      </div>
    </div>
  );
};

/* ─── Date group header ──────────────────────────────── */
const DateHeader = ({ label }) => (
  <div className="date-header">
    <span className="date-label">{label}</span>
  </div>
);

/* ─── Main ────────────────────────────────────────────── */
const History = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [filters, setFilters]           = useState(DEFAULT_FILTERS);
  const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters]   = useState(false);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalCount, setTotalCount]     = useState(0);
  const PAGE_SIZE = 15;

  const fetch = useCallback(async (f = activeFilters, p = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (f.transaction_type !== 'ALL') params.transaction_type = f.transaction_type;
      if (f.status           !== 'ALL') params.status           = f.status;
      if (f.start_date)                 params.start_date        = f.start_date;
      if (f.end_date)                   params.end_date          = f.end_date;
      params.page      = p;
      params.page_size = PAGE_SIZE;

      const res = await transactionAPI.getTransactions(params);
      const data = res.data;
      // Handle both paginated {results, count} and plain array responses
      const list  = Array.isArray(data) ? data : (data.results || data.data || []);
      const count = data.count || list.length;
      setTransactions(list);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / PAGE_SIZE));
      setPage(p);
    } catch {
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => { fetch(activeFilters, 1); }, []);

  const applyFilters = () => {
    setActiveFilters(filters);
    fetch(filters, 1);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setActiveFilters(DEFAULT_FILTERS);
    fetch(DEFAULT_FILTERS, 1);
    setShowFilters(false);
  };

  /* group transactions by date */
  const grouped = transactions.reduce((acc, txn) => {
    const today     = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const txnDate  = new Date(txn.created_at);
    const dateStr  = txnDate.toDateString();
    let label;
    if (dateStr === today.toDateString())     label = 'Today';
    else if (dateStr === yesterday.toDateString()) label = 'Yesterday';
    else                                      label = formatDate(txn.created_at);

    if (!acc[label]) acc[label] = [];
    acc[label].push(txn);
    return acc;
  }, {});

  const hasActiveFilters = Object.entries(activeFilters).some(
    ([k, v]) => v && v !== 'ALL' && v !== ''
  );

  const inputClass = 'filter-input';

  return (
    <div className="history-container">
      {/* Header */}
      <div className="history-header">
        <div>
          <h1 className="history-title">Transaction History</h1>
          <p className="history-subtitle">
            {totalCount > 0 ? `${totalCount} transaction${totalCount !== 1 ? 's' : ''}` : 'All your transactions'}
          </p>
        </div>
        <div className="history-actions">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={15} />}
            onClick={() => fetch(activeFilters, page)}
          >
            Refresh
          </Button>
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            size="sm"
            icon={<Filter size={15} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters {hasActiveFilters && <span className="active-filter-dot"></span>}
          </Button>
          <Button variant="outline" size="sm" icon={<Download size={15} />}>
            Export
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            <div>
              <label className="filter-label">Type</label>
              <select
                value={filters.transaction_type}
                onChange={(e) => setFilters((p) => ({ ...p, transaction_type: e.target.value }))}
                className={inputClass}
              >
                <option value="ALL">All Types</option>
                <option value="SEND">Send</option>
                <option value="RECEIVE">Receive</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAW">Withdraw</option>
              </select>
            </div>
            <div>
              <label className="filter-label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                className={inputClass}
              >
                <option value="ALL">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REVERSED">Reversed</option>
              </select>
            </div>
            <div>
              <label className="filter-label">From Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters((p) => ({ ...p, start_date: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="filter-label">To Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters((p) => ({ ...p, end_date: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div className="filter-actions">
            <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
            <Button variant="primary" size="sm" onClick={applyFilters}>Apply Filters</Button>
          </div>
        </div>
      )}

      {error && (
        <div className="alert-wrapper">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Transaction list */}
      <div className="transactions-card">
        {loading ? (
          <div className="loading-container">
            <Spinner size="lg" text="Loading transactions…" />
          </div>
        ) : Object.keys(grouped).length > 0 ? (
          <div>
            {Object.entries(grouped).map(([dateLabel, txns]) => (
              <React.Fragment key={dateLabel}>
                <DateHeader label={dateLabel} />
                {txns.map((txn) => (
                  <TxnRow
                    key={txn.id}
                    txn={txn}
                    onClick={() => navigate(`/transactions/${txn.id}`)}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <Search size={28} className="empty-icon" />
            </div>
            <h3 className="empty-title">No Transactions Found</h3>
            <p className="empty-text">
              {hasActiveFilters ? 'Try adjusting your filters.' : 'You havent made any transactions yet.'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={resetFilters}>Clear Filters</Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => navigate('/send-money')}>
                Send Your First Payment
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <p className="pagination-info">
            Page {page} of {totalPages} · {totalCount} total
          </p>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={page === 1}
              onClick={() => fetch(activeFilters, page - 1)}
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button
              className="pagination-btn"
              disabled={page === totalPages}
              onClick={() => fetch(activeFilters, page + 1)}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;