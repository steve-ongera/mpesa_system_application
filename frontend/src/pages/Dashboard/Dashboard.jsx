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
      color: 'bg-green-500',
      path: '/send-money',
    },
    {
      title: 'Deposit',
      description: 'Add money to wallet',
      icon: ArrowDownLeft,
      color: 'bg-blue-500',
      path: '/deposit',
    },
    {
      title: 'Withdraw',
      description: 'Get cash from agent',
      icon: TrendingUp,
      color: 'bg-orange-500',
      path: '/withdraw',
    },
    {
      title: 'Transactions',
      description: 'View your history',
      icon: Activity,
      color: 'bg-purple-500',
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
    return type === 'SEND' || type === 'WITHDRAW' ? 'text-red-600' : 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Balance and Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card - Spans 2 columns */}
        <div className="lg:col-span-2">
          <BalanceCard />
        </div>

        {/* Monthly Stats */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">This Month</p>
                <h3 className="text-3xl font-bold mt-1">
                  {statistics?.monthly_sent_count || 0}
                </h3>
                <p className="text-blue-100 text-sm mt-1">Transactions</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Activity size={24} />
              </div>
            </div>
            <div className="pt-4 border-t border-white border-opacity-20">
              <p className="text-xs text-blue-100">
                {statistics?.monthly_received_count || 0} received
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all duration-200 text-left group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Sent</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(statistics?.total_sent)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="text-red-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Received</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(statistics?.total_received)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Balance</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(user?.account_balance)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card
        title="Recent Transactions"
        headerAction={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/transactions')}
          >
            View All
          </Button>
        }
      >
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner text="Loading transactions..." />
          </div>
        ) : recentTransactions && recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/transactions/${transaction.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl ${getTransactionColor(transaction.transaction_type)}`}>
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.transaction_type}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.transaction_code}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                    {transaction.transaction_type === 'SEND' || transaction.transaction_type === 'WITHDRAW' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions yet</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/send-money')}
              className="mt-4"
            >
              Send Your First Transaction
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;