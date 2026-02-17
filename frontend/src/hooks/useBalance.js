import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore, useWalletStore } from '../store';
import { userAPI, walletAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * useBalance — manages account balance and wallet data.
 *
 * Features:
 *  - Fetches live balance from the server
 *  - Optional auto-polling (configurable interval)
 *  - show/hide toggle for the balance display
 *  - Wallet limits and stats
 *
 * Usage:
 *   const { balance, isVisible, toggle, refresh, isRefreshing } = useBalance();
 */
const useBalance = ({ pollInterval = 0 } = {}) => {
  const { user, updateUser } = useAuthStore();
  const { wallet, setWallet, setLoading: setWalletLoading } = useWalletStore();

  const [isVisible,   setIsVisible]   = useState(true);
  const [isRefreshing,setIsRefreshing]= useState(false);
  const [walletLoading, setWalletLoadingLocal] = useState(false);
  const [lastUpdated,  setLastUpdated]= useState(null);

  const pollRef = useRef(null);

  // ─── Fetch live balance ──────────────────────────────────────
  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res     = await userAPI.getBalance();
      const balance = res.data.data?.account_balance ?? res.data?.account_balance;
      if (balance !== undefined) {
        updateUser({ account_balance: parseFloat(balance) });
        setLastUpdated(new Date());
      }
      return parseFloat(balance ?? 0);
    } catch (err) {
      if (!silent) toast.error('Could not refresh balance');
      return null;
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [updateUser]);

  // ─── Fetch wallet (limits, stats) ───────────────────────────
  const fetchWallet = useCallback(async () => {
    setWalletLoadingLocal(true);
    setWalletLoading(true);
    try {
      const res = await walletAPI.getWallet();
      const w   = res.data.data || res.data;
      setWallet(w);
      return w;
    } catch {
      return null;
    } finally {
      setWalletLoadingLocal(false);
      setWalletLoading(false);
    }
  }, [setWallet, setWalletLoading]);

  // ─── Auto-poll ───────────────────────────────────────────────
  useEffect(() => {
    if (pollInterval > 0) {
      pollRef.current = setInterval(() => refresh({ silent: true }), pollInterval);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollInterval, refresh]);

  // ─── Helpers ─────────────────────────────────────────────────
  const toggle = () => setIsVisible((v) => !v);
  const show   = () => setIsVisible(true);
  const hide   = () => setIsVisible(false);

  const formatBalance = (amount = user?.account_balance, opts = {}) =>
    new Intl.NumberFormat('en-KE', {
      style:    'currency',
      currency: 'KES',
      ...opts,
    }).format(parseFloat(amount) || 0);

  const maskBalance = (amount = user?.account_balance) => {
    const str = formatBalance(amount);
    // Replace digits with bullets
    return str.replace(/\d/g, '•');
  };

  const balance = parseFloat(user?.account_balance ?? 0);

  // How much of the daily limit has been used
  const dailyUsedPercent = wallet?.daily_limit > 0
    ? Math.min(
        100,
        ((parseFloat(wallet.total_sent ?? 0) / parseFloat(wallet.daily_limit)) * 100)
      )
    : 0;

  return {
    // Raw values
    balance,
    wallet,
    lastUpdated,

    // Display
    isVisible,
    displayBalance: isVisible ? formatBalance(balance) : maskBalance(balance),
    formattedBalance: formatBalance(balance),
    maskedBalance:    maskBalance(balance),

    // Loading
    isRefreshing,
    walletLoading,

    // Limits (from wallet)
    dailyLimit:        parseFloat(wallet?.daily_limit        ?? 0),
    transactionLimit:  parseFloat(wallet?.transaction_limit  ?? 0),
    isLocked:          wallet?.is_locked ?? false,
    dailyUsedPercent,

    // Stats (from wallet)
    totalSent:      parseFloat(wallet?.total_sent      ?? 0),
    totalReceived:  parseFloat(wallet?.total_received  ?? 0),
    totalDeposited: parseFloat(wallet?.total_deposited ?? 0),
    totalWithdrawn: parseFloat(wallet?.total_withdrawn ?? 0),

    // Actions
    refresh,
    fetchWallet,
    toggle,
    show,
    hide,
    formatBalance,
    maskBalance,
  };
};

export default useBalance;