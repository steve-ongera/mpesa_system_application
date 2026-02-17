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
import './deposit.css'; // Import the CSS file


const fmt = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(parseFloat(v) || 0);

/* ─── Agent option row ───────────────────────────────── */
const AgentOption = ({ agent, selected, onSelect }) => (
  <div
    onClick={() => onSelect(agent)}
    className={`agent-option ${selected ? 'selected' : ''}`}
  >
    <div className={`agent-avatar ${selected ? 'selected' : 'default'}`}>
      {agent.store_name?.[0]?.toUpperCase()}
    </div>
    <div className="agent-info">
      <p className="agent-name">{agent.store_name}</p>
      <div className="agent-location">
        <MapPin size={11} className="agent-location-icon" />
        <p className="agent-location-text">{agent.location}</p>
      </div>
    </div>
    {selected && (
      <CheckCircle size={20} className="agent-check-icon" />
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
      <div className="success-screen">
        <div className="success-icon-wrapper">
          <CheckCircle />
        </div>
        <h1 className="success-title">Deposit Successful!</h1>
        <p className="success-subtitle">{fmt(amount)} added to your account</p>

        <div className="success-details">
          <div className="success-detail-row">
            <span className="success-detail-label">Transaction Code</span>
            <span className="success-detail-code">{success.transaction_code}</span>
          </div>
          <div className="success-detail-row">
            <span className="success-detail-label">Amount Deposited</span>
            <span className="success-detail-amount">{fmt(amount)}</span>
          </div>
          <div className="success-detail-row">
            <span className="success-detail-label">Agent</span>
            <span className="success-detail-agent">{selectedAgent?.store_name}</span>
          </div>
          <div className="success-total-row">
            <span>New Balance</span>
            <span className="success-balance">{fmt(user?.account_balance)}</span>
          </div>
        </div>

        <div className="success-actions">
          <Button variant="outline" fullWidth onClick={() => navigate('/transactions')}>View History</Button>
          <Button variant="primary" fullWidth onClick={() => navigate('/dashboard')}>Done</Button>
        </div>
      </div>
    );
  }

  /* ─── Form ────────────────────────────────────────── */
  return (
    <div className="deposit-container">
      <div className="deposit-header">
        <button onClick={() => navigate('/dashboard')} className="deposit-back-btn">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="deposit-title">Deposit Money</h1>
          <p className="deposit-subtitle">Add funds via an M-Pesa agent</p>
        </div>
      </div>

      {apiError && (
        <div className="alert-wrapper">
          <Alert type="error" message={apiError} onClose={() => setApiError('')} />
        </div>
      )}

      <div className="deposit-grid">
        {/* Left: Amount + Agent */}
        <div className="space-y-6">
          {/* Amount card */}
          <div className="deposit-card">
            <h3 className="card-title">Enter Amount</h3>
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
            <div className="quick-amount-section">
              <p className="quick-amount-label">Quick select</p>
              <div className="quick-amount-grid">
                {[500, 1000, 2500, 5000].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setAmount(String(q)); setAmountError(''); }}
                    className={`quick-amount-btn ${amount === String(q) ? 'active' : ''}`}
                  >
                    {q >= 1000 ? `${q / 1000}K` : q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Agent picker */}
          <div className="deposit-card">
            <h3 className="card-title">Select Agent</h3>
            <p className="card-subtitle">Find the agent you're depositing at</p>
            
            <div className="agent-search-wrapper">
              <Store size={16} className="agent-search-icon" />
              <input
                type="text"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                placeholder="Search agents by name or location…"
                className="agent-search-input"
              />
            </div>

            {agentsLoading ? (
              <div className="loading-container"><Spinner size="md" text="Loading agents…" /></div>
            ) : filteredAgents.length > 0 ? (
              <div className="agent-list">
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
              <div className="empty-state">
                <MapPin size={28} className="empty-state-icon" />
                <p className="empty-state-text">No agents found</p>
              </div>
            )}

            <button
              onClick={fetchAgents}
              className="refresh-agents-btn"
            >
              <RefreshCw size={13} /> Refresh list
            </button>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          {/* Summary */}
          <div className="summary-card">
            <h3 className="card-title">Deposit Summary</h3>
            <div className="summary-content">
              <div className="summary-row">
                <span className="summary-label">Current balance</span>
                <span className="summary-value">{fmt(user?.account_balance)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Amount to deposit</span>
                <span className={`summary-value ${amount ? 'highlight' : 'muted'}`}>
                  {amount ? fmt(amount) : '—'}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Agent</span>
                <span className="agent-summary-value">
                  {selectedAgent ? selectedAgent.store_name : '—'}
                </span>
              </div>
              <div className="summary-total">
                <span className="summary-total-label">Balance after</span>
                <span className="summary-total-value">
                  {amount ? fmt(parseFloat(user?.account_balance || 0) + parseFloat(amount)) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="info-box">
            <Info size={14} className="info-box-icon" />
            <p className="info-box-text">
              Give the exact cash amount to the agent. Deposits are instant and <strong>free</strong> of charge.
            </p>
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