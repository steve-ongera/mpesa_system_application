import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Activity } from 'lucide-react';
import BalanceCard from '../../components/features/BalanceCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { useAuthStore, useTransactionStore } from '../../store';
import { transactionAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './dashboard.css'; // Import the CSS file

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { recentTransactions, statistics, setRecentTransactions, setStatistics } = useTransactionStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [recentRes, statsRes] = await Promise.all([
        transactionAPI.getRecent(),
        transactionAPI.getStatistics(),
      ]);
      
      setRecentTransactions(recentRes.data.data);
      setStatistics(statsRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Send Money',
      description: 'Transfer to any number',
      icon: ArrowUpRight,
      color: 'icon-bg-green',
      path: '/send-money',
    },
    {
      title: 'Deposit',
      description: 'Add money to wallet',
      icon: ArrowDownLeft,
      color: 'icon-bg-blue',
      path: '/deposit',
    },
    {
      title: 'Withdraw',
      description: 'Get cash from agent',
      icon: TrendingUp,
      color: 'icon-bg-orange',
      path: '/withdraw',
    },
    {
      title: 'Transactions',
      description: 'View your history',
      icon: Activity,
      color: 'icon-bg-purple',
      path: '/transactions',
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type) => {
    return type === 'SEND' || type === 'WITHDRAW' ? '↑' : '↓';
  };

  const getTransactionColor = (type) => {
    return type === 'SEND' || type === 'WITHDRAW' ? 'amount-negative' : 'amount-positive';
  };

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="welcome-subtitle">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Balance and Stats Grid */}
      <div className="grid-2col">
        {/* Balance Card - Spans 2 columns */}
        <div>
          <BalanceCard />
        </div>

        {/* Monthly Stats */}
        <div className="stats-card">
          <div className="stats-header">
            <div>
              <p className="stats-label">This Month</p>
              <h3 className="stats-value">
                {statistics?.monthly_sent_count || 0}
              </h3>
              <p className="stats-label">Transactions</p>
            </div>
            <div className="stats-icon">
              <Activity />
            </div>
          </div>
          <div className="stats-footer">
            <p>{statistics?.monthly_received_count || 0} received</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="quick-actions-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="quick-action-card"
              >
                <div className={`quick-action-icon-wrapper ${action.color}`}>
                  <Icon className="quick-action-icon" />
                </div>
                <h3 className="quick-action-title">{action.title}</h3>
                <p className="quick-action-description">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="statistics-grid">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-label">Total Sent</p>
              <h3 className="stat-amount">{formatCurrency(statistics?.total_sent)}</h3>
            </div>
            <div className="stat-icon-wrapper icon-bg-red-light">
              <ArrowUpRight className="stat-icon-red" size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-label">Total Received</p>
              <h3 className="stat-amount">{formatCurrency(statistics?.total_received)}</h3>
            </div>
            <div className="stat-icon-wrapper icon-bg-green-light">
              <ArrowDownLeft className="stat-icon-green" size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-label">Current Balance</p>
              <h3 className="stat-amount">{formatCurrency(user?.account_balance)}</h3>
            </div>
            <div className="stat-icon-wrapper icon-bg-blue-light">
              <TrendingUp className="stat-icon-blue" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="transactions-card">
        <div className="transactions-header">
          <h3 className="transactions-title">Recent Transactions</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/transactions')}
          >
            View All
          </Button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <Spinner text="Loading transactions..." />
          </div>
        ) : recentTransactions && recentTransactions.length > 0 ? (
          <div className="transactions-list">
            {recentTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="transaction-item"
                onClick={() => navigate(`/transactions/${transaction.id}`)}
              >
                <div className="transaction-left">
                  <div className={`transaction-icon ${getTransactionColor(transaction.transaction_type)}`}>
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  <div className="transaction-details">
                    <p className="transaction-type">{transaction.transaction_type}</p>
                    <p className="transaction-code">{transaction.transaction_code}</p>
                  </div>
                </div>
                <div className="transaction-right">
                  <p className={`transaction-amount ${getTransactionColor(transaction.transaction_type)}`}>
                    {transaction.transaction_type === 'SEND' || transaction.transaction_type === 'WITHDRAW' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="transaction-date">{formatDate(transaction.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-text">No transactions yet</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/send-money')}
            >
              Send Your First Transaction
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;