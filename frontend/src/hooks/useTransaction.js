import { useState, useCallback, useEffect } from 'react';
import { useAuthStore, useTransactionStore } from '../store';
import transactionService from '../services/transactionService';
import toast from 'react-hot-toast';

/**
 * useTransaction — provides all transaction operations
 * with automatic store synchronisation.
 *
 * Usage:
 *   const { sendMoney, transactions, isLoading } = useTransaction();
 */
const useTransaction = () => {
  const { updateUser, user } = useAuthStore();

  const {
    transactions,
    recentTransactions,
    statistics,
    isLoading,
    isLoadingRecent,
    error,
    filters,
    currentPage,
    totalPages,
    totalCount,
    setTransactions,
    setRecentTransactions,
    setStatistics,
    addTransaction,
    updateTransaction,
    setFilters,
    resetFilters,
    setLoading,
    setLoadingRecent,
    setError,
    clearError,
    getSummary,
    getTransactionById,
  } = useTransactionStore();

  const [isSending,    setIsSending]    = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing,setIsWithdrawing]= useState(false);

  // ─────────────────────────────────────────────────────────────
  // Fetch paginated history
  // ─────────────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async (params = {}, page = 1) => {
    setLoading(true);
    clearError();
    try {
      const data = await transactionService.getTransactions({ ...params, page });
      const list  = Array.isArray(data) ? data : (data.results ?? data.data ?? []);
      const count = data.count ?? list.length;
      setTransactions(list, {
        currentPage: page,
        totalPages:  Math.ceil(count / (params.page_size ?? 15)),
        totalCount:  count,
      });
      return list;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load transactions';
      setError(msg);
      toast.error(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setTransactions, setError]);

  // ─────────────────────────────────────────────────────────────
  // Fetch recent (dashboard widget — last 10)
  // ─────────────────────────────────────────────────────────────
  const fetchRecentTransactions = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const data = await transactionService.getRecentTransactions();
      setRecentTransactions(data);
      return data;
    } catch {
      // Silently fail for the dashboard widget
      return [];
    } finally {
      setLoadingRecent(false);
    }
  }, [setLoadingRecent, setRecentTransactions]);

  // ─────────────────────────────────────────────────────────────
  // Fetch statistics
  // ─────────────────────────────────────────────────────────────
  const fetchStatistics = useCallback(async () => {
    try {
      const data = await transactionService.getStatistics();
      setStatistics(data);
      return data;
    } catch {
      return null;
    }
  }, [setStatistics]);

  // ─────────────────────────────────────────────────────────────
  // Fetch single transaction
  // ─────────────────────────────────────────────────────────────
  const fetchTransaction = useCallback(async (id) => {
    // Return from cache if available
    const cached = getTransactionById(id);
    if (cached) return cached;

    try {
      return await transactionService.getTransaction(id);
    } catch (err) {
      const msg = err.response?.data?.message || 'Transaction not found';
      toast.error(msg);
      return null;
    }
  }, [getTransactionById]);

  // ─────────────────────────────────────────────────────────────
  // Send money
  // ─────────────────────────────────────────────────────────────
  const sendMoney = useCallback(async ({ receiver_phone, amount, pin, description }) => {
    setIsSending(true);
    try {
      const txn = await transactionService.sendMoney({ receiver_phone, amount, pin, description });

      // Deduct from local balance optimistically
      const fee      = transactionService.getFee('SEND', parseFloat(amount));
      const newBal   = parseFloat(user?.account_balance ?? 0) - parseFloat(amount) - fee;
      updateUser({ account_balance: newBal });
      addTransaction(txn);

      toast.success('Money sent successfully!');
      return { success: true, transaction: txn };
    } catch (err) {
      const msg =
        err.response?.data?.errors?.pin?.[0] ||
        err.response?.data?.message ||
        'Failed to send money';
      toast.error(msg);
      return { success: false, error: msg, fieldErrors: err.response?.data?.errors ?? {} };
    } finally {
      setIsSending(false);
    }
  }, [user, updateUser, addTransaction]);

  // ─────────────────────────────────────────────────────────────
  // Deposit
  // ─────────────────────────────────────────────────────────────
  const deposit = useCallback(async ({ amount, agent_number }) => {
    setIsDepositing(true);
    try {
      const txn    = await transactionService.deposit({ amount, agent_number });
      const newBal = parseFloat(user?.account_balance ?? 0) + parseFloat(amount);
      updateUser({ account_balance: newBal });
      addTransaction(txn);
      toast.success('Deposit successful!');
      return { success: true, transaction: txn };
    } catch (err) {
      const msg = err.response?.data?.message || 'Deposit failed';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsDepositing(false);
    }
  }, [user, updateUser, addTransaction]);

  // ─────────────────────────────────────────────────────────────
  // Withdraw
  // ─────────────────────────────────────────────────────────────
  const withdraw = useCallback(async ({ amount, agent_number, pin }) => {
    setIsWithdrawing(true);
    try {
      const txn  = await transactionService.withdraw({ amount, agent_number, pin });
      const fee  = transactionService.getFee('WITHDRAW', parseFloat(amount));
      const newBal = parseFloat(user?.account_balance ?? 0) - parseFloat(amount) - fee;
      updateUser({ account_balance: newBal });
      addTransaction(txn);
      toast.success('Withdrawal successful!');
      return { success: true, transaction: txn };
    } catch (err) {
      const msg =
        err.response?.data?.errors?.pin?.[0] ||
        err.response?.data?.message ||
        'Withdrawal failed';
      toast.error(msg);
      return { success: false, error: msg, fieldErrors: err.response?.data?.errors ?? {} };
    } finally {
      setIsWithdrawing(false);
    }
  }, [user, updateUser, addTransaction]);

  // ─────────────────────────────────────────────────────────────
  // Filter helpers
  // ─────────────────────────────────────────────────────────────
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    fetchTransactions(newFilters);
  }, [setFilters, fetchTransactions]);

  const clearFilters = useCallback(() => {
    resetFilters();
    fetchTransactions();
  }, [resetFilters, fetchTransactions]);

  const goToPage = useCallback((page) => {
    fetchTransactions(filters, page);
  }, [filters, fetchTransactions]);

  return {
    // State
    transactions,
    recentTransactions,
    statistics,
    isLoading,
    isLoadingRecent,
    isSending,
    isDepositing,
    isWithdrawing,
    error,
    filters,
    currentPage,
    totalPages,
    totalCount,

    // Computed
    summary: getSummary(),

    // Data actions
    fetchTransactions,
    fetchRecentTransactions,
    fetchStatistics,
    fetchTransaction,

    // Mutation actions
    sendMoney,
    deposit,
    withdraw,
    updateTransaction,

    // Filter / pagination
    applyFilters,
    clearFilters,
    goToPage,
    clearError,

    // Helpers re-exported from service
    getFee:         transactionService.getFee,
    getFeeSchedule: transactionService.getFeeSchedule,
    groupByDate:    transactionService.groupByDate,
    validateSend:   transactionService.validateSend,
  };
};

export default useTransaction;