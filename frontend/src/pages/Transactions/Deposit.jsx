import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, MapPin, ArrowLeft, CheckCircle,
  Store, Info, RefreshCw,
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

/* ─── Agent option row ───────────────────────────────── */
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
    {selected && (
      <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
    )}
  </div>
);

/* ─── Main ────────────────────────────────────────────── */
const Deposit = () => {
  const navigate = useNavigate();
  const { user, updateUser }  = useAuthStore();
  const { addTransaction }    = useTransactionStore();

  const [agents, setAgents]         = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [amount, setAmount]         = useState('');
  const [amountError, setAmountError] = useState('');
  const [apiError, setApiError]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(null);
  const [agentSearch, setAgentSearch] = useState('');

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async () => {
    setAgentsLoading(true);
    try {
      const res = await agentAPI.getAgents();
      setAgents(res.data.data || res.data || []);
    } catch {
      toast.error('Could not load agents');
    } finally {
      setAgentsLoading(false);
    }
  };

  const validateAmount = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setAmountError('Please enter an amount');
      return false;
    }
    if (parseFloat(amount) < 10) {
      setAmountError('Minimum deposit is KES 10');
      return false;
    }
    if (parseFloat(amount) > 300000) {
      setAmountError('Maximum deposit is KES 300,000');
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleDeposit = async () => {
    if (!validateAmount()) return;
    if (!selectedAgent) { setApiError('Please select an agent to deposit at'); return; }
    setApiError('');
    setLoading(true);
    try {
      const res = await transactionAPI.deposit({
        amount,
        agent_number: selectedAgent.agent_number,
      });
      const txn = res.data.data;
      updateUser({ account_balance: parseFloat(user.account_balance) + parseFloat(amount) });
      addTransaction(txn);
      setSuccess(txn);
      toast.success('Deposit successful!');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Deposit failed. Please try again.');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Deposit Successful!</h1>
        <p className="text-gray-500 mb-8">{fmt(amount)} added to your account</p>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left space-y-3 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Transaction Code</span>
            <span className="font-mono font-bold">{success.transaction_code}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount Deposited</span>
            <span className="font-semibold text-green-600">{fmt(amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Agent</span>
            <span className="font-medium">{selectedAgent?.store_name}</span>
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
          <h1 className="text-3xl font-bold text-gray-900">Deposit Money</h1>
          <p className="text-gray-500 mt-0.5">Add funds via an M-Pesa agent</p>
        </div>
      </div>

      {apiError && <Alert type="error" message={apiError} onClose={() => setApiError('')} className="mb-5" />}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Amount + Agent */}
        <div className="lg:col-span-3 space-y-6">
          {/* Amount card */}
          <Card title="Enter Amount">
            <Input
              label="Amount (KES)"
              type="number"
              value={amount}
              onChange={(v) => { setAmount(v); setAmountError(''); }}
              placeholder="e.g. 5000"
              icon={<DollarSign size={18} />}
              error={amountError}
              required
              helperText={`Current balance: ${fmt(user?.account_balance)}`}
            />

            {/* Quick amount buttons */}
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Quick select</p>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2500, 5000].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setAmount(String(q)); setAmountError(''); }}
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
          </Card>

          {/* Agent picker */}
          <Card title="Select Agent" subtitle="Find the agent you're depositing at">
            <div className="mb-3">
              <div className="relative">
                <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={agentSearch}
                  onChange={(e) => setAgentSearch(e.target.value)}
                  placeholder="Search agents by name or location…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>

            {agentsLoading ? (
              <div className="flex justify-center py-8"><Spinner size="md" text="Loading agents…" /></div>
            ) : filteredAgents.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredAgents.map((agent) => (
                  <AgentOption
                    key={agent.id}
                    agent={agent}
                    selected={selectedAgent?.id === agent.id}
                    onSelect={setSelectedAgent}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MapPin size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No agents found</p>
              </div>
            )}

            <button
              onClick={fetchAgents}
              className="flex items-center gap-1.5 mt-3 text-xs text-green-600 hover:text-green-700 font-medium"
            >
              <RefreshCw size={13} /> Refresh list
            </button>
          </Card>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary */}
          <Card title="Deposit Summary">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Current balance</span>
                <span className="font-medium">{fmt(user?.account_balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount to deposit</span>
                <span className={`font-semibold ${amount ? 'text-green-600' : 'text-gray-400'}`}>
                  {amount ? fmt(amount) : '—'}
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
                <span className="text-green-600">
                  {amount ? fmt(parseFloat(user?.account_balance || 0) + parseFloat(amount)) : '—'}
                </span>
              </div>
            </div>
          </Card>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <p>Give the exact cash amount to the agent. Deposits are instant and <strong>free</strong> of charge.</p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading || !amount || !selectedAgent}
            onClick={handleDeposit}
          >
            {loading ? 'Processing…' : `Deposit ${amount ? fmt(amount) : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Deposit;