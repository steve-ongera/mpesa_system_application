import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone, DollarSign, Lock, ArrowRight, ArrowLeft,
  User, CheckCircle, AlertTriangle, Info, MessageSquare,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import { transactionAPI } from '../../services/api';
import { useAuthStore, useTransactionStore } from '../../store';
import toast from 'react-hot-toast';
import './send-money.css'; // Import the CSS file


/* ─── helpers ─────────────────────────────────────────── */
const fmt = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(parseFloat(v) || 0);

const fmtPhone = (p) => {
  if (!p || p.length !== 12) return p;
  return `+${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6, 9)} ${p.slice(9)}`;
};

const SEND_FEES = [
  { min: 1,      max: 100,    fee: 0 },
  { min: 101,    max: 500,    fee: 5 },
  { min: 501,    max: 1000,   fee: 10 },
  { min: 1001,   max: 2500,   fee: 15 },
  { min: 2501,   max: 5000,   fee: 25 },
  { min: 5001,   max: 10000,  fee: 45 },
  { min: 10001,  max: 20000,  fee: 70 },
  { min: 20001,  max: 150000, fee: 105 },
];

const calcFee = (amount) => {
  const row = SEND_FEES.find((r) => amount >= r.min && amount <= r.max);
  return row ? row.fee : 0;
};

/* ─── Step bar ────────────────────────────────────────── */
const StepBar = ({ current }) => {
  const steps = ['Details', 'Review', 'Confirm'];
  return (
    <div className="step-bar">
      {steps.map((label, i) => {
        const n = i + 1;
        const done   = current > n;
        const active = current === n;
        return (
          <React.Fragment key={n}>
            <div className="step-item">
              <div className={`step-number ${done ? 'done' : active ? 'active' : 'pending'}`}>
                {done ? '✓' : n}
              </div>
              <span className={`step-label ${active ? 'active' : 'pending'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`step-connector ${current > n ? 'active' : 'pending'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ─── Main ────────────────────────────────────────────── */
const SendMoney = () => {
  const navigate = useNavigate();
  const { user, updateUser }   = useAuthStore();
  const { addTransaction }     = useTransactionStore();

  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState({ receiver_phone: '', amount: '', description: '' });
  const [pin, setPin]           = useState('');
  const [fee, setFee]           = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(null);
  const [showFees, setShowFees] = useState(false);

  useEffect(() => {
    const amt = parseFloat(form.amount) || 0;
    setFee(calcFee(amt));
  }, [form.amount]);

  const total   = (parseFloat(form.amount) || 0) + fee;
  const balance = parseFloat(user?.account_balance || 0);

  /* ── field change ── */
  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setFieldErrors((p) => ({ ...p, [field]: '' }));
    setApiError('');
  };

  /* ── step 1 validation ── */
  const validateStep1 = () => {
    const errs = {};
    if (!form.receiver_phone)
      errs.receiver_phone = 'Phone number is required';
    else if (!/^254\d{9}$/.test(form.receiver_phone))
      errs.receiver_phone = 'Format must be 254XXXXXXXXX';
    else if (form.receiver_phone === user?.phone_number)
      errs.receiver_phone = 'You cannot send money to yourself';

    if (!form.amount || parseFloat(form.amount) <= 0)
      errs.amount = 'Please enter an amount';
    else if (parseFloat(form.amount) < 10)
      errs.amount = 'Minimum send amount is KES 10';
    else if (parseFloat(form.amount) > 150000)
      errs.amount = 'Maximum send amount is KES 150,000';
    else if (total > balance)
      errs.amount = `Insufficient balance — you need ${fmt(total)} but have ${fmt(balance)}`;

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── confirm & send ── */
  const handleConfirm = async () => {
    if (!pin || pin.length !== 4) {
      setApiError('Please enter your 4-digit PIN');
      return;
    }
    setLoading(true);
    setApiError('');
    try {
      const res = await transactionAPI.sendMoney({
        receiver_phone: form.receiver_phone,
        amount: form.amount,
        pin,
        description: form.description || 'Money transfer',
      });
      const txn = res.data.data;
      updateUser({ account_balance: balance - total });
      addTransaction(txn);
      setSuccess(txn);
      toast.success('Money sent successfully!');
    } catch (err) {
      const msg =
        err.response?.data?.errors?.pin?.[0] ||
        err.response?.data?.errors?.receiver_phone?.[0] ||
        err.response?.data?.message ||
        'Transaction failed. Please try again.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ══════════════════════════════════════════
     SUCCESS SCREEN
  ═══════════════════════════════════════════ */
  if (success) {
    return (
      <div className="success-screen">
        <div className="success-icon-wrapper">
          <CheckCircle />
        </div>
        <h1 className="success-title">Money Sent! 🎉</h1>
        <p className="success-subtitle">
          {fmt(success.amount)} sent to {fmtPhone(form.receiver_phone)}
        </p>

        <div className="success-details">
          <div className="success-detail-row">
            <span className="success-detail-label">Transaction Code</span>
            <span className="success-detail-code">{success.transaction_code}</span>
          </div>
          <div className="success-detail-row">
            <span className="success-detail-label">Recipient</span>
            <span className="success-detail-value">{fmtPhone(form.receiver_phone)}</span>
          </div>
          <div className="success-detail-row">
            <span className="success-detail-label">Amount sent</span>
            <span className="success-detail-value">{fmt(success.amount)}</span>
          </div>
          <div className="success-detail-row">
            <span className="success-detail-label">Fee</span>
            <span className="success-detail-value">{success.transaction_cost > 0 ? fmt(success.transaction_cost) : 'Free'}</span>
          </div>
          <div className="success-detail-total">
            <span>New Balance</span>
            <span className="success-balance">{fmt(user?.account_balance)}</span>
          </div>
        </div>

        <div className="success-actions">
          <Button variant="outline" fullWidth onClick={() => navigate('/transactions')}>
            View History
          </Button>
          <Button variant="primary" fullWidth onClick={() => navigate('/dashboard')}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     STEP FORMS
  ═══════════════════════════════════════════ */
  return (
    <div className="send-money-container">
      {/* Header */}
      <div className="send-money-header">
        {step > 1 && (
          <button onClick={() => { setStep(step - 1); setApiError(''); }}
            className="send-money-back-btn">
            <ArrowLeft size={22} />
          </button>
        )}
        <div>
          <h1 className="send-money-title">Send Money</h1>
          <p className="send-money-subtitle">Transfer instantly to any M-Pesa user</p>
        </div>
      </div>

      <StepBar current={step} />

      {apiError && (
        <div className="alert-wrapper">
          <Alert type="error" message={apiError} onClose={() => setApiError('')} />
        </div>
      )}

      {/* ─── STEP 1: Details ─────────────────────────────── */}
      {step === 1 && (
        <div className="grid-2col">
          {/* Form */}
          <div className="form-card">
            <div className="form-space">
              <Input
                label="Recipient Phone Number"
                type="tel"
                name="receiver_phone"
                value={form.receiver_phone}
                onChange={(v) => set('receiver_phone', v)}
                placeholder="254712345678"
                icon={<Phone size={18} />}
                error={fieldErrors.receiver_phone}
                required
                maxLength={12}
                helperText="Format: 254XXXXXXXXX (Safaricom)"
              />

              {/* Recipient preview */}
              {form.receiver_phone.length === 12 && !fieldErrors.receiver_phone && (
                <div className="recipient-preview">
                  <div className="recipient-avatar">
                    <User />
                  </div>
                  <div className="recipient-info">
                    <p className="recipient-phone">{fmtPhone(form.receiver_phone)}</p>
                    <p className="recipient-status">M-Pesa registered number</p>
                  </div>
                  <div className="recipient-badge">
                    <Badge variant="success" size="sm">Valid</Badge>
                  </div>
                </div>
              )}

              <Input
                label="Amount (KES)"
                type="number"
                name="amount"
                value={form.amount}
                onChange={(v) => set('amount', v)}
                placeholder="e.g. 500"
                icon={<DollarSign size={18} />}
                error={fieldErrors.amount}
                required
                helperText={`Available balance: ${fmt(user?.account_balance)}`}
              />

              {/* Live fee breakdown */}
              {form.amount && parseFloat(form.amount) > 0 && (
                <div className="fee-breakdown">
                  <div className="fee-content">
                    <div className="fee-row">
                      <span>Amount to send</span>
                      <span className="fee-row-amount">{fmt(form.amount)}</span>
                    </div>
                    <div className="fee-row">
                      <span>Transaction fee</span>
                      <span className={fee === 0 ? 'fee-free' : 'fee-paid'}>
                        {fee === 0 ? 'Free ✓' : fmt(fee)}
                      </span>
                    </div>
                    <div className="fee-row-total">
                      <span>Total deducted</span>
                      <span>{fmt(total)}</span>
                    </div>
                  </div>
                </div>
              )}

              <Input
                label="Description"
                name="description"
                value={form.description}
                onChange={(v) => set('description', v)}
                placeholder="What's this payment for? (optional)"
                icon={<MessageSquare size={18} />}
                maxLength={100}
              />

              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                icon={<ArrowRight size={18} />}
                onClick={() => validateStep1() && setStep(2)}
              >
                Review Transaction
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Fee table toggle */}
            <div className="sidebar-card">
              <button
                className="sidebar-toggle"
                onClick={() => setShowFees(!showFees)}
              >
                <span className="sidebar-toggle-left">
                  <Info size={15} className="sidebar-toggle-icon" />
                  Charges
                </span>
                <span className="sidebar-toggle-arrow">{showFees ? '▲ Hide' : '▼ Show'}</span>
              </button>
              {showFees && (
                <div className="fee-table">
                  {SEND_FEES.map(({ min, max, fee: f }) => (
                    <div key={min} className="fee-table-row">
                      <span className="fee-table-label">
                        {min === 1 ? '1' : min.toLocaleString()} – {max.toLocaleString()}
                      </span>
                      <span className="fee-table-value">{f === 0 ? 'Free' : `KES ${f}`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Limits */}
            <div className="sidebar-card">
              <div className="limits-card">
                <p className="limits-title">Limits</p>
                {[
                  ['Minimum send', 'KES 10'],
                  ['Per transaction', 'KES 150,000'],
                  ['Daily limit', 'KES 150,000'],
                ].map(([label, val]) => (
                  <div key={label} className="limits-row">
                    <span className="limits-label">{label}</span>
                    <span className="limits-value">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 2: Review ──────────────────────────────── */}
      {step === 2 && (
        <div className="review-card">
          <h2 className="review-title">Review Transaction</h2>

          {/* Recipient */}
          <div className="review-recipient">
            <div className="review-recipient-avatar">
              <User />
            </div>
            <div>
              <p className="review-recipient-label">Sending to</p>
              <p className="review-recipient-number">{fmtPhone(form.receiver_phone)}</p>
            </div>
          </div>

          {/* Amount breakdown */}
          <div className="review-amount-box">
            <div className="review-amount-row">
              <span className="review-amount-label">Amount</span>
              <span className="review-amount-value">{fmt(form.amount)}</span>
            </div>
            <div className="review-amount-row">
              <span className="review-amount-label">Transaction fee</span>
              <span className={fee === 0 ? 'fee-free' : 'fee-paid'}>
                {fee === 0 ? 'Free' : fmt(fee)}
              </span>
            </div>
            <div className="review-total-row">
              <span className="review-total-label">Total deducted</span>
              <span className="review-total-value">{fmt(total)}</span>
            </div>
          </div>

          {/* Balance after */}
          <div className="review-balance">
            <span className="review-balance-label">Balance after transaction</span>
            <span className="review-balance-value">{fmt(balance - total)}</span>
          </div>

          {form.description && (
            <div className="review-description">
              <p className="review-description-label">Description</p>
              <p className="review-description-text">"{form.description}"</p>
            </div>
          )}

          {/* Warning */}
          <div className="review-warning">
            <AlertTriangle size={16} className="review-warning-icon" />
            <p className="review-warning-text">
              Verify the phone number before confirming. Completed transactions <strong>cannot be reversed</strong>.
            </p>
          </div>

          <div className="review-actions">
            <Button variant="outline" onClick={() => setStep(1)} fullWidth>
              Edit Details
            </Button>
            <Button variant="primary" onClick={() => setStep(3)} fullWidth icon={<Lock size={17} />}>
              Enter PIN
            </Button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: PIN Confirmation ─────────────────────── */}
      {step === 3 && (
        <div className="pin-card">
          <div className="pin-header">
            <div className="pin-icon-wrapper">
              <Lock />
            </div>
            <h2 className="pin-title">Confirm with PIN</h2>
            <p className="pin-subtitle">
              Sending {fmt(form.amount)} to {fmtPhone(form.receiver_phone)}
            </p>
          </div>

          <div className="pin-summary">
            <div className="pin-summary-row">
              <span className="pin-summary-label">Amount</span>
              <span className="pin-summary-value">{fmt(form.amount)}</span>
            </div>
            <div className="pin-summary-row">
              <span className="pin-summary-label">Fee</span>
              <span className="pin-summary-value">{fee === 0 ? 'Free' : fmt(fee)}</span>
            </div>
            <div className="pin-summary-total">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>

          <Input
            label="Enter your 4-digit PIN"
            type="password"
            name="pin"
            value={pin}
            onChange={(v) => { setPin(v); setApiError(''); }}
            placeholder="••••"
            icon={<Lock size={18} />}
            maxLength={4}
            error={apiError}
            autoFocus
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading || pin.length !== 4}
            onClick={handleConfirm}
            className="mt-4"
          >
            {loading ? <span><span className="loading-spinner"></span>Sending…</span> : `Confirm & Send ${fmt(total)}`}
          </Button>

          <p className="pin-footer">
            🔒 Secured with end-to-end encryption
          </p>
        </div>
      )}
    </div>
  );
};

export default SendMoney;