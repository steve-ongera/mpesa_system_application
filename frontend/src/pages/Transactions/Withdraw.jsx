import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, MapPin, Lock, ArrowLeft,
  CheckCircle, AlertTriangle, Store, Info,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import { transactionAPI, agentAPI } from '../../services/api';
import { useAuthStore, useTransactionStore } from '../../store';
import toast from 'react-hot-toast';

const fmt = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(parseFloat(v) || 0);

const WITHDRAW_FEES = [
  { min: 10,    max: 500,    fee: 10 },
  { min: 501,   max: 1000,   fee: 25 },
  { min: 1001,  max: 2500,   fee: 50 },
  { min: 2501,  max: 5000,   fee: 70 },
  { min: 5001,  max: 10000,  fee: 130 },
  { min: 10001, max: 150000, fee: 180 },
];

const calcFee = (amount) => {
  const row = WITHDRAW_FEES.find((r) => amount >= r.min && amount <= r.max);
  return row ? row.fee : 0;
};

/* ─── Agent row ──────────────────────────────────────── */
const AgentOption = ({ agent, selected, onSelect }) => (
  <div
    onClick={() => onSelect(agent)}
    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all
      ${selected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
      ${selected ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {agent.store_name?.[0]?.toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm text-gray-900 truncate">{agent.store_name}</p>
      <div className="flex items-center gap-1 mt-0.5">
        <MapPin size={11} className="text-gray-400 flex-shrink-0" />
        <p className="text-xs text-gray-400 truncate">{agent.location}</p>
      </div>
    </div>
    {selected && <CheckCircle size={20} className="text-green-500 flex-shrink-0" />}
  </div>
);

/* ─── Main ────────────────────────────────────────────── */
const Withdraw = () => {
  const navigate = useNavigate();
  const { user, updateUser }  = useAuthStore();
  const { addTransaction }    = useTransactionStore();

  const [agents, setAgents]           = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [amount, setAmount]           = useState('');
  const [pin, setPin]                 = useState('');
  const [fee, setFee]                 = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError]       = useState('');
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(null);
  const [agentSearch, setAgentSearch] = useState('');
  const [showFees, setShowFees]       = useState(false);

  useEffect(() => { fetchAgents(); }, []);
  useEffect(() => {
    const amt = parseFloat(amount) || 0;
    setFee(calcFee(amt));
  }, [amount]);

  const total   = (parseFloat(amount) || 0) + fee;
  const balance = parseFloat(user?.account_balance || 0);

  const fetchAgents = async () => {
    setAgentsLoading(true);
    try {
      const res = await agentAPI.getAgents();
      setAgents(res.data.data || res.data || []);
    } catch { toast.error('Could not load agents'); }
    finally { setAgentsLoading(false); }
  };

  const validate = () => {
    const errs = {};
    if (!amount || parseFloat(amount) <= 0)
      errs.amount = 'Please enter an amount';
    else if (parseFloat(amount) < 10)
      errs.amount = 'Minimum withdrawal is KES 10';
    else if (parseFloat(amount) > 150000)
      errs.amount = 'Maximum withdrawal is KES 150,000';
    else if (total > balance)
      errs.amount = `Insufficient balance — need ${fmt(total)}, have ${fmt(balance)}`;

    if (!selectedAgent)
      errs.agent = 'Please select an agent';
    if (!pin || pin.length !== 4)
      errs.pin = 'Enter your 4-digit PIN';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleWithdraw = async () => {
    if (!validate()) return;
    setApiError('');
    setLoading(true);
    try {
      const res = await transactionAPI.withdraw({
        amount,
        agent_number: selectedAgent.agent_number,
        pin,
      });
      const txn = res.data.data;
      updateUser({ account_balance: balance - total });
      addTransaction(txn);
      setSuccess(txn);
      toast.success('Withdrawal successful!');
    } catch (err) {
      setApiError(
        err.response?.data?.errors?.pin?.[0] ||
        err.response?.data?.message ||
        'Withdrawal failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter((a) => {
    const q = agentSearch.toLowerCase();
    return !q || a.store_name?.toLowerCase().includes(q) || a.location?.toLowerCase().includes(q);
  });

  /* ─── Success ─────────────────────────────────────── */
  if (success) {
    return (
      <div className="max-w-md mx-auto py-10 text-center animate-fadeInUp">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-500" size={52} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Withdrawal Complete!</h1>
        <p className="text-gray-500 mb-8">Collect {fmt(amount)} cash from {selectedAgent?.store_name}</p>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left space-y-3 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Transaction Code</span>
            <span className="font-mono font-bold">{success.transaction_code}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Cash to collect</span>
            <span className="font-semibold text-green-600">{fmt(amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Fee charged</span>
            <span className="font-medium">{fmt(fee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Agent</span>
            <span className="font-medium">{selectedAgent?.store_name} — {selectedAgent?.location}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t pt-3">
            <span>New Balance</span>
            <span className="text-green-600">{fmt(user?.account_balance)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => navigate('/transactions')}>View History</Button>
          <Button variant="primary" fullWidth onClick={() => navigate('/dashboard')}>Done</Button>
        </div>
      </div>
    );
  }

  /* ─── Form ────────────────────────────────────────── */
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={22} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Withdraw Money</h1>
          <p className="text-gray-500 mt-0.5">Get cash from a nearby M-Pesa agent</p>
        </div>
      </div>

      {apiError && <Alert type="error" message={apiError} onClose={() => setApiError('')} className="mb-5" />}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left */}
        <div className="lg:col-span-3 space-y-6">
          {/* Amount */}
          <Card title="Enter Amount">
            <Input
              label="Amount (KES)"
              type="number"
              value={amount}
              onChange={(v) => { setAmount(v); setFieldErrors((p) => ({ ...p, amount: '' })); }}
              placeholder="e.g. 1000"
              icon={<DollarSign size={18} />}
              error={fieldErrors.amount}
              required
              helperText={`Available balance: ${fmt(balance)}`}
            />

            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Quick select</p>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2500, 5000].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setAmount(String(q)); setFieldErrors((p) => ({ ...p, amount: '' })); }}
                    className={`py-2 text-sm font-medium rounded-lg border transition-colors
                      ${amount === String(q)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                  >
                    {q >= 1000 ? `${q / 1000}K` : q}
                  </button>
                ))}
              </div>
            </div>

            {/* Fee breakdown */}
            {amount && parseFloat(amount) > 0 && (
              <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Amount to withdraw</span>
                  <span className="font-medium">{fmt(amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Withdrawal fee</span>
                  <span className="font-medium text-orange-600">{fmt(fee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-orange-200 pt-2">
                  <span>Total deducted</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Agent picker */}
          <Card title="Select Agent" subtitle="Choose where you'll collect the cash">
            {fieldErrors.agent && (
              <p className="text-sm text-red-500 mb-2">{fieldErrors.agent}</p>
            )}
            <div className="relative mb-3">
              <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                placeholder="Search agents…"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {agentsLoading ? (
              <div className="flex justify-center py-8"><Spinner size="md" /></div>
            ) : filteredAgents.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredAgents.map((agent) => (
                  <AgentOption
                    key={agent.id}
                    agent={agent}
                    selected={selectedAgent?.id === agent.id}
                    onSelect={(a) => { setSelectedAgent(a); setFieldErrors((p) => ({ ...p, agent: '' })); }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">No agents found</div>
            )}
          </Card>

          {/* PIN */}
          <Card title="Enter PIN">
            <Input
              label="Your 4-digit PIN"
              type="password"
              value={pin}
              onChange={(v) => { setPin(v); setFieldErrors((p) => ({ ...p, pin: '' })); }}
              placeholder="••••"
              icon={<Lock size={18} />}
              maxLength={4}
              error={fieldErrors.pin}
              required
            />
          </Card>
        </div>

        {/* Right: summary */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Withdrawal Summary">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Current balance</span>
                <span className="font-medium">{fmt(balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cash to collect</span>
                <span className={`font-semibold ${amount ? 'text-green-600' : 'text-gray-400'}`}>
                  {amount ? fmt(amount) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fee</span>
                <span className={`font-medium ${amount ? 'text-orange-600' : 'text-gray-400'}`}>
                  {amount ? fmt(fee) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Agent</span>
                <span className="font-medium text-right max-w-[140px] truncate">
                  {selectedAgent ? selectedAgent.store_name : '—'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-3">
                <span>Balance after</span>
                <span className={amount && total <= balance ? 'text-green-600' : 'text-red-500'}>
                  {amount ? fmt(balance - total) : '—'}
                </span>
              </div>
            </div>
          </Card>

          {/* Fees info */}
          <Card padding="sm">
            <button
              className="w-full flex items-center justify-between p-2 text-xs font-semibold text-gray-600"
              onClick={() => setShowFees(!showFees)}
            >
              <span className="flex items-center gap-1.5"><Info size={13} className="text-blue-400" /> Withdrawal Charges</span>
              <span className="text-gray-400">{showFees ? '▲' : '▼'}</span>
            </button>
            {showFees && (
              <div className="divide-y divide-gray-100">
                {WITHDRAW_FEES.map(({ min, max, fee: f }) => (
                  <div key={min} className="flex justify-between py-1.5 px-2 text-xs">
                    <span className="text-gray-500">{min.toLocaleString()} – {max.toLocaleString()}</span>
                    <span className="font-medium">KES {f}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <p>Visit the agent <strong>before</strong> initiating the withdrawal. Withdrawals cannot be cancelled once confirmed.</p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading || !amount || !selectedAgent || !pin}
            onClick={handleWithdraw}
          >
            {loading ? 'Processing…' : `Withdraw ${amount ? fmt(amount) : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;