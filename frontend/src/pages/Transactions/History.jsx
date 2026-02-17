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

/* ─── helpers ─────────────────────────────────────────── */
const fmt = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(parseFloat(v) || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatTime = (d) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const isDebit = (type) => ['SEND', 'WITHDRAW'].includes(type);

const TYPE_CONFIG = {
  SEND:     { Icon: ArrowUpRight,    bg: 'bg-red-100',    color: 'text-red-500'    },
  RECEIVE:  { Icon: ArrowDownLeft,   bg: 'bg-green-100',  color: 'text-green-500'  },
  DEPOSIT:  { Icon: ArrowDownToLine, bg: 'bg-blue-100',   color: 'text-blue-500'   },
  WITHDRAW: { Icon: ArrowUpFromLine, bg: 'bg-orange-100', color: 'text-orange-500' },
};

const STATUS_VARIANT = {
  COMPLETED: 'success',
  PENDING:   'warning',
  FAILED:    'error',
  REVERSED:  'default',
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
      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className={`w-11 h-11 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={color} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">
          {txn.transaction_type.charAt(0) + txn.transaction_type.slice(1).toLowerCase().replace('_', ' ')}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{txn.transaction_code}</p>
        {(txn.sender_name || txn.receiver_name) && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {debit
              ? `To: ${txn.receiver_name || txn.receiver_phone || '—'}`
              : `From: ${txn.sender_name || txn.sender_phone || '—'}`}
          </p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-sm ${debit ? 'text-red-600' : 'text-green-600'}`}>
          {debit ? '−' : '+'}{fmt(txn.amount)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatTime(txn.created_at)}</p>
        <Badge variant={STATUS_VARIANT[txn.status] || 'default'} size="sm" className="mt-1">
          {txn.status}
        </Badge>
      </div>
    </div>
  );
};

/* ─── Date group header ──────────────────────────────── */
const DateHeader = ({ label }) => (
  <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
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

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500';

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-500 mt-1">
            {totalCount > 0 ? `${totalCount} transaction${totalCount !== 1 ? 's' : ''}` : 'All your transactions'}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            Filters {hasActiveFilters && '•'}
          </Button>
          <Button variant="outline" size="sm" icon={<Download size={15} />}>
            Export
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card className="mb-5 animate-fadeInDown">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
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
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
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
              <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters((p) => ({ ...p, start_date: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters((p) => ({ ...p, end_date: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
            <Button variant="primary" size="sm" onClick={applyFilters}>Apply Filters</Button>
          </div>
        </Card>
      )}

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />}

      {/* Transaction list */}
      <Card padding="none">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" text="Loading transactions…" />
          </div>
        ) : Object.keys(grouped).length > 0 ? (
          <div className="divide-y divide-gray-100">
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
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search size={28} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No Transactions Found</h3>
            <p className="text-sm text-gray-400 mb-5">
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
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} · {totalCount} total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<ChevronLeft size={16} />}
              disabled={page === 1}
              onClick={() => fetch(activeFilters, page - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => fetch(activeFilters, page + 1)}
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;