import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle, Clock,
  ArrowUpRight, ArrowDownLeft, ArrowDownToLine, ArrowUpFromLine,
  Download, Copy, Share2, User, RefreshCw,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { transactionAPI } from '../../services/api';
import toast from 'react-hot-toast';

/* ─── helpers ─────────────────────────────────────────── */
const fmt = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(parseFloat(v) || 0);

const fmtDateTime = (d) =>
  new Date(d).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

const fmtPhone = (p) => {
  if (!p || p.length !== 12) return p;
  return `+${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6, 9)} ${p.slice(9)}`;
};

const isDebit = (type) => ['SEND', 'WITHDRAW'].includes(type);

const TYPE_CONFIG = {
  SEND:     { Icon: ArrowUpRight,    bg: 'bg-red-100',    color: 'text-red-500',   label: 'Money Sent'      },
  RECEIVE:  { Icon: ArrowDownLeft,   bg: 'bg-green-100',  color: 'text-green-500', label: 'Money Received'  },
  DEPOSIT:  { Icon: ArrowDownToLine, bg: 'bg-blue-100',   color: 'text-blue-500',  label: 'Deposit'         },
  WITHDRAW: { Icon: ArrowUpFromLine, bg: 'bg-orange-100', color: 'text-orange-500',label: 'Withdrawal'      },
};

const STATUS_CONFIG = {
  COMPLETED: { Icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: 'Completed'  },
  PENDING:   { Icon: Clock,       color: 'text-yellow-500',bg: 'bg-yellow-100',label: 'Pending'    },
  FAILED:    { Icon: XCircle,     color: 'text-red-500',   bg: 'bg-red-100',   label: 'Failed'     },
  REVERSED:  { Icon: RefreshCw,   color: 'text-gray-500',  bg: 'bg-gray-100',  label: 'Reversed'   },
};

/* ─── Info row ────────────────────────────────────────── */
const InfoRow = ({ label, value, mono = false, highlight = false }) => (
  <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0 gap-4">
    <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
    <span className={`text-sm text-right break-all
      ${mono ? 'font-mono' : ''}
      ${highlight ? 'font-bold text-green-600' : 'font-medium text-gray-900'}`}>
      {value || '—'}
    </span>
  </div>
);

/* ─── Timeline ────────────────────────────────────────── */
const Timeline = ({ status, createdAt, updatedAt }) => {
  const steps = [
    { label: 'Initiated',  done: true,                          time: createdAt  },
    { label: 'Processing', done: status !== 'PENDING',          time: null       },
    { label: status === 'FAILED' ? 'Failed' : status === 'REVERSED' ? 'Reversed' : 'Completed',
      done: ['COMPLETED', 'FAILED', 'REVERSED'].includes(status),
      time: updatedAt,
      failed: ['FAILED', 'REVERSED'].includes(status),
    },
  ];

  return (
    <div className="relative">
      {steps.map((s, i) => (
        <div key={i} className="flex items-start gap-3 mb-4 last:mb-0">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
              ${s.done
                ? s.failed ? 'bg-red-500' : 'bg-green-500'
                : 'bg-gray-200'}`}>
              {s.done
                ? s.failed
                  ? <XCircle size={14} className="text-white" />
                  : <CheckCircle size={14} className="text-white" />
                : <div className="w-2 h-2 bg-gray-400 rounded-full" />}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-0.5 h-6 mt-1 ${s.done ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
          <div className="pt-0.5">
            <p className={`text-sm font-semibold ${s.done ? s.failed ? 'text-red-600' : 'text-gray-900' : 'text-gray-400'}`}>
              {s.label}
            </p>
            {s.time && (
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(s.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── Main ────────────────────────────────────────────── */
const Details = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [txn, setTxn]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await transactionAPI.getTransaction(id);
        setTxn(res.data.data || res.data);
      } catch {
        toast.error('Transaction not found');
        navigate('/transactions');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const copyCode = () => {
    navigator.clipboard.writeText(txn?.transaction_code || '');
    toast.success('Transaction code copied!');
  };

  const handleShare = async () => {
    const text = `M-Pesa Transaction\nCode: ${txn?.transaction_code}\nAmount: ${fmt(txn?.amount)}\nStatus: ${txn?.status}`;
    if (navigator.share) {
      await navigator.share({ title: 'Transaction Receipt', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Receipt details copied!');
    }
  };

  /* ─── Loading ─────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" text="Loading transaction…" />
      </div>
    );
  }

  if (!txn) return null;

  const typeCfg   = TYPE_CONFIG[txn.transaction_type]   || TYPE_CONFIG.SEND;
  const statusCfg = STATUS_CONFIG[txn.status]           || STATUS_CONFIG.PENDING;
  const debit     = isDebit(txn.transaction_type);
  const { Icon, bg, color, label: typeLabel } = typeCfg;
  const StatusIcon = statusCfg.Icon;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/transactions')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition-colors"
      >
        <ArrowLeft size={20} />
        Transaction History
      </button>

      {/* Hero card */}
      <Card className="mb-5">
        <div className="flex flex-col items-center py-6 text-center">
          {/* Type icon */}
          <div className={`w-20 h-20 ${bg} rounded-full flex items-center justify-center mb-4 shadow-inner`}>
            <Icon size={38} className={color} />
          </div>

          {/* Amount */}
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">{typeLabel}</p>
          <h1 className={`text-4xl font-black mb-3 ${debit ? 'text-red-600' : 'text-green-600'}`}>
            {debit ? '−' : '+'}{fmt(txn.amount)}
          </h1>

          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 ${statusCfg.bg} rounded-full`}>
            <StatusIcon size={16} className={statusCfg.color} />
            <span className={`text-sm font-bold ${statusCfg.color}`}>{statusCfg.label}</span>
          </div>

          {/* Date */}
          <p className="text-sm text-gray-400 mt-3">{fmtDateTime(txn.created_at)}</p>

          {/* Transaction code */}
          <div className="flex items-center gap-2 mt-3 px-4 py-2 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm font-bold text-gray-700">{txn.transaction_code}</span>
            <button onClick={copyCode} className="text-gray-400 hover:text-green-600 transition-colors">
              <Copy size={15} />
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" size="sm" fullWidth icon={<Share2 size={16} />} onClick={handleShare}>
            Share
          </Button>
          <Button variant="outline" size="sm" fullWidth icon={<Download size={16} />}>
            Receipt
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Transaction details */}
        <Card title="Transaction Details">
          <InfoRow label="Transaction Code"  value={txn.transaction_code} mono />
          <InfoRow label="Type"              value={typeLabel} />
          <InfoRow label="Status"            value={txn.status} />
          <InfoRow label="Amount"            value={fmt(txn.amount)} highlight />
          <InfoRow label="Transaction Fee"   value={txn.transaction_cost > 0 ? fmt(txn.transaction_cost) : 'Free'} />
          <InfoRow label="Total Charged"     value={fmt(parseFloat(txn.amount) + parseFloat(txn.transaction_cost || 0))} />
          {txn.description && (
            <InfoRow label="Description" value={txn.description} />
          )}
        </Card>

        {/* Parties & Timeline */}
        <div className="space-y-5">
          {/* Sender / Receiver */}
          <Card title="Transaction Parties">
            {txn.sender_phone && (
              <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Sender</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {txn.sender_name || fmtPhone(txn.sender_phone)}
                  </p>
                  {txn.sender_name && <p className="text-xs text-gray-400">{fmtPhone(txn.sender_phone)}</p>}
                </div>
              </div>
            )}
            {txn.receiver_phone && (
              <div className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Recipient</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {txn.receiver_name || fmtPhone(txn.receiver_phone)}
                  </p>
                  {txn.receiver_name && <p className="text-xs text-gray-400">{fmtPhone(txn.receiver_phone)}</p>}
                </div>
              </div>
            )}
          </Card>

          {/* Balance snapshot */}
          {(txn.balance_before !== undefined || txn.balance_after !== undefined) && (
            <Card title="Balance Snapshot">
              <InfoRow label="Before transaction" value={fmt(txn.balance_before)} />
              <InfoRow label="After transaction"  value={fmt(txn.balance_after)} highlight />
            </Card>
          )}

          {/* Timeline */}
          <Card title="Status Timeline">
            <Timeline
              status={txn.status}
              createdAt={txn.created_at}
              updatedAt={txn.updated_at}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Details;