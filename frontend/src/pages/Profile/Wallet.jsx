import React, { useEffect, useState } from 'react';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, ArrowDownToLine, ArrowUpFromLine, Send, Lock } from 'lucide-react';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { walletAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StatBox = ({ label, value, icon: Icon, iconBg, iconColor }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
    <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
      <Icon size={18} className={iconColor} />
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const LimitBar = ({ label, used, limit, color }) => {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const fmt = (v) => `KES ${Number(v).toLocaleString()}`;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-500">{fmt(used)} / {fmt(limit)}</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{(100 - pct).toFixed(0)}% remaining</p>
    </div>
  );
};

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await walletAPI.getWallet();
        setWallet(res.data.data);
      } catch {
        toast.error('Failed to load wallet information');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" text="Loading wallet…" /></div>;
  }

  if (!wallet) return null;

  const fmt = (v) => `KES ${Number(v || 0).toLocaleString()}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-500 mt-1">Your wallet information and limits</p>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-3 px-5 py-4 rounded-xl ${wallet.is_locked ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${wallet.is_locked ? 'bg-red-100' : 'bg-green-100'}`}>
          {wallet.is_locked ? <Lock size={20} className="text-red-600" /> : <WalletIcon size={20} className="text-green-600" />}
        </div>
        <div>
          <p className={`font-semibold ${wallet.is_locked ? 'text-red-700' : 'text-green-700'}`}>
            {wallet.is_locked ? 'Wallet Locked' : 'Wallet Active'}
          </p>
          <p className="text-sm text-gray-500">
            {wallet.is_locked ? 'Contact support to unlock' : 'Your wallet is in good standing'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Total Sent"       value={fmt(wallet.total_sent)}       icon={Send}           iconBg="bg-red-50"    iconColor="text-red-600" />
        <StatBox label="Total Received"   value={fmt(wallet.total_received)}   icon={TrendingUp}     iconBg="bg-green-50"  iconColor="text-green-600" />
        <StatBox label="Total Deposited"  value={fmt(wallet.total_deposited)}  icon={ArrowDownToLine} iconBg="bg-blue-50"  iconColor="text-blue-600" />
        <StatBox label="Total Withdrawn"  value={fmt(wallet.total_withdrawn)}  icon={ArrowUpFromLine} iconBg="bg-orange-50" iconColor="text-orange-600" />
      </div>

      {/* Limits */}
      <Card title="Transaction Limits" subtitle="How much you've used of your limits">
        <div className="mt-2">
          <LimitBar
            label="Daily Limit"
            used={wallet.total_sent}
            limit={wallet.daily_limit}
            color="bg-green-500"
          />
          <LimitBar
            label="Per-Transaction Limit"
            used={0}
            limit={wallet.transaction_limit}
            color="bg-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400">Daily Limit</p>
            <p className="font-bold text-gray-900 mt-0.5">{fmt(wallet.daily_limit)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400">Max Per Transaction</p>
            <p className="font-bold text-gray-900 mt-0.5">{fmt(wallet.transaction_limit)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Wallet;