import React, { useState } from 'react';
import { Wallet, Eye, EyeOff, RefreshCw } from 'lucide-react';
import Card from '../common/Card';
import { useAuthStore } from '../../store';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const BalanceCard = () => {
  const { user, updateUser } = useAuthStore();
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const refreshBalance = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getBalance();
      updateUser({ account_balance: response.data.data.account_balance });
      toast.success('Balance updated');
    } catch (error) {
      toast.error('Failed to refresh balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      className="bg-gradient-to-br from-green-600 to-green-700 text-white"
      padding="lg"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Wallet className="text-white" size={24} />
          </div>
          <div>
            <p className="text-green-100 text-sm">Available Balance</p>
            <p className="text-xs text-green-200 mt-1">{user?.phone_number}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
          >
            {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
          <button
            onClick={refreshBalance}
            disabled={loading}
            className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="mb-2">
        <h2 className="text-4xl font-bold">
          {showBalance 
            ? formatCurrency(user?.account_balance || 0)
            : '••••••'
          }
        </h2>
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-white border-opacity-20">
        <div>
          <p className="text-xs text-green-100">Account Status</p>
          <p className="text-sm font-medium mt-1">
            {user?.is_verified ? '✓ Verified' : 'Unverified'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-green-100">Member Since</p>
          <p className="text-sm font-medium mt-1">
            {new Date(user?.date_joined).toLocaleDateString('en-US', { 
              month: 'short', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default BalanceCard;