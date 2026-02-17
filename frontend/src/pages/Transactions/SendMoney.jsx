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
    <div className="flex items-center mb-8">
      {steps.map((label, i) => {
        const n = i + 1;
        const done   = current > n;
        const active = current === n;
        return (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${done   ? 'bg-green-500 text-white'
                  : active ? 'bg-green-600 text-white ring-4 ring-green-100'
                  : 'bg-gray-200 text-gray-400'}`}>
                {done ? '✓' : n}
              </div>
              <span className={`text-[11px] mt-1 font-medium hidden sm:block
                ${active ? 'text-green-700' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${current > n ? 'bg-green-400' : 'bg-gray-200'}`} />
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
      <div className="max-w-md mx-auto py-10 text-center animate-fadeInUp">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle className="text-green-500" size={52} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Money Sent! 🎉</h1>
        <p className="text-gray-500 mb-6">
          {fmt(success.amount)} sent to {fmtPhone(form.receiver_phone)}
        </p>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left space-y-3 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Transaction Code</span>
            <span className="font-mono font-bold text-gray-800">{success.transaction_code}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Recipient</span>
            <span className="font-medium">{fmtPhone(form.receiver_phone)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount sent</span>
            <span className="font-medium">{fmt(success.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Fee</span>
            <span className="font-medium">{success.transaction_cost > 0 ? fmt(success.transaction_cost) : 'Free'}</span>
          </div>
          <div className="flex justify-between text-sm font-bold pt-3 border-t">
            <span>New Balance</span>
            <span className="text-green-600">{fmt(user?.account_balance)}</span>
          </div>
        </div>

        <div className="flex gap-3">
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
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {step > 1 && (
          <button onClick={() => { setStep(step - 1); setApiError(''); }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={22} className="text-gray-600" />
          </button>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Send Money</h1>
          <p className="text-gray-500 mt-0.5">Transfer instantly to any M-Pesa user</p>
        </div>
      </div>

      <StepBar current={step} />

      {apiError && (
        <Alert type="error" message={apiError} onClose={() => setApiError('')} className="mb-5" />
      )}

      {/* ─── STEP 1: Details ─────────────────────────────── */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="lg:col-span-2">
            <div className="space-y-5">
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
                <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-9 h-9 bg-green-200 rounded-full flex items-center justify-center">
                    <User size={17} className="text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800">{fmtPhone(form.receiver_phone)}</p>
                    <p className="text-xs text-green-600">M-Pesa registered number</p>
                  </div>
                  <Badge variant="success" size="sm" className="ml-auto">Valid</Badge>
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
                <div className="rounded-xl border border-blue-100 bg-blue-50 overflow-hidden">
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Amount to send</span>
                      <span className="font-medium">{fmt(form.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Transaction fee</span>
                      <span className={`font-medium ${fee === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {fee === 0 ? 'Free ✓' : fmt(fee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-blue-200">
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
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Fee table toggle */}
            <Card padding="sm">
              <button
                className="w-full flex items-center justify-between p-2 text-sm font-semibold text-gray-700"
                onClick={() => setShowFees(!showFees)}
              >
                <span className="flex items-center gap-2">
                  <Info size={15} className="text-blue-500" />
                  Charges
                </span>
                <span className="text-gray-400 text-xs">{showFees ? '▲ Hide' : '▼ Show'}</span>
              </button>
              {showFees && (
                <div className="mt-1 divide-y divide-gray-100">
                  {SEND_FEES.map(({ min, max, fee: f }) => (
                    <div key={min} className="flex justify-between py-1.5 px-2 text-xs">
                      <span className="text-gray-500">
                        {min === 1 ? '1' : min.toLocaleString()} – {max.toLocaleString()}
                      </span>
                      <span className="font-medium">{f === 0 ? 'Free' : `KES ${f}`}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Limits */}
            <Card padding="sm">
              <div className="p-2 space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Limits</p>
                {[
                  ['Minimum send', 'KES 10'],
                  ['Per transaction', 'KES 150,000'],
                  ['Daily limit', 'KES 150,000'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-800">{val}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ─── STEP 2: Review ──────────────────────────────── */}
      {step === 2 && (
        <Card className="max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Review Transaction</h2>

          {/* Recipient */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <User size={28} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Sending to</p>
              <p className="text-lg font-bold text-gray-900">{fmtPhone(form.receiver_phone)}</p>
            </div>
          </div>

          {/* Amount breakdown */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5 mb-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount</span>
              <span className="font-semibold">{fmt(form.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Transaction fee</span>
              <span className={`font-semibold ${fee === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {fee === 0 ? 'Free' : fmt(fee)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-green-300 pt-3">
              <span>Total deducted</span>
              <span className="text-green-700">{fmt(total)}</span>
            </div>
          </div>

          {/* Balance after */}
          <div className="flex justify-between text-sm px-4 py-3 bg-gray-50 rounded-xl mb-4">
            <span className="text-gray-500">Balance after transaction</span>
            <span className="font-bold text-gray-800">{fmt(balance - total)}</span>
          </div>

          {form.description && (
            <div className="px-4 py-3 bg-gray-50 rounded-xl mb-4">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700 font-medium">"{form.description}"</p>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
            <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 leading-relaxed">
              Verify the phone number before confirming. Completed transactions <strong>cannot be reversed</strong>.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} fullWidth>
              Edit Details
            </Button>
            <Button variant="primary" onClick={() => setStep(3)} fullWidth icon={<Lock size={17} />}>
              Enter PIN
            </Button>
          </div>
        </Card>
      )}

      {/* ─── STEP 3: PIN Confirmation ─────────────────────── */}
      {step === 3 && (
        <div className="max-w-sm mx-auto">
          <Card>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-green-600" size={30} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirm with PIN</h2>
              <p className="text-sm text-gray-500 mt-2">
                Sending {fmt(form.amount)} to {fmtPhone(form.receiver_phone)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">{fmt(form.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fee</span>
                <span className="font-medium">{fee === 0 ? 'Free' : fmt(fee)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1.5 mt-1.5">
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
              {loading ? 'Sending…' : `Confirm & Send ${fmt(total)}`}
            </Button>

            <p className="text-center text-xs text-gray-400 mt-4">
              🔒 Secured with end-to-end encryption
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SendMoney;