import React, { useState } from 'react';
import { Wallet, Eye, EyeOff, RefreshCw } from 'lucide-react';
import Card from '../common/Card';
import { useAuthStore } from '../../store';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './balance-card.css'; // Import the CSS file

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
    <div className="balance-card">
      {/* Header */}
      <div className="balance-header">
        <div className="balance-info">
          <div className="balance-icon-wrapper">
            <Wallet className="balance-icon" />
          </div>
          <div className="balance-text">
            <p className="balance-label">Available Balance</p>
            <p className="balance-phone">{user?.phone_number}</p>
          </div>
        </div>

        <div className="balance-actions">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="balance-action-btn"
            aria-label={showBalance ? 'Hide balance' : 'Show balance'}
          >
            {showBalance ? <Eye /> : <EyeOff />}
          </button>
          <button
            onClick={refreshBalance}
            disabled={loading}
            className="balance-action-btn"
            aria-label="Refresh balance"
          >
            <RefreshCw className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Balance Amount */}
      <div className="balance-amount-container">
        {showBalance ? (
          <h2 className="balance-amount">
            {formatCurrency(user?.account_balance || 0)}
          </h2>
        ) : (
          <h2 className="balance-hidden">••••••</h2>
        )}
      </div>

      {/* Footer */}
      <div className="balance-footer">
        <div className="balance-footer-item">
          <p className="balance-footer-label">Account Status</p>
          <p className="balance-footer-value">
            {user?.is_verified ? (
              <span className="verified-status">
                ✓ Verified
                <span className="verified-badge">✓</span>
              </span>
            ) : (
              'Unverified'
            )}
          </p>
        </div>
        <div className="balance-footer-item balance-footer-value-right">
          <p className="balance-footer-label">Member Since</p>
          <p className="balance-footer-value">
            {new Date(user?.date_joined).toLocaleDateString('en-US', { 
              month: 'short', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;