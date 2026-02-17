import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useTransactionStore = create(
  devtools(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────
      transactions:       [],   // full paginated list
      recentTransactions: [],   // dashboard recent (latest 10)
      statistics:         null, // monthly/lifetime stats object
      isLoading:          false,
      isLoadingRecent:    false,
      error:              null,

      // Pagination
      currentPage:  1,
      totalPages:   1,
      totalCount:   0,

      // Active filter state (mirrors TransactionFilter component)
      filters: {
        transaction_type: 'ALL',
        status:           'ALL',
        start_date:       '',
        end_date:         '',
      },

      // ── Actions ────────────────────────────────────────────

      setTransactions: (transactions, meta = {}) =>
        set({
          transactions,
          currentPage: meta.currentPage ?? 1,
          totalPages:  meta.totalPages  ?? 1,
          totalCount:  meta.totalCount  ?? transactions.length,
        }),

      setRecentTransactions: (recentTransactions) => set({ recentTransactions }),

      setStatistics: (statistics) => set({ statistics }),

      /** Prepend a newly created transaction to both lists. */
      addTransaction: (txn) =>
        set((state) => ({
          transactions:       [txn, ...state.transactions],
          recentTransactions: [txn, ...state.recentTransactions].slice(0, 10),
          totalCount:         state.totalCount + 1,
        })),

      /** Replace a transaction in the list (e.g. after status update). */
      updateTransaction: (txn) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === txn.id ? { ...t, ...txn } : t
          ),
          recentTransactions: state.recentTransactions.map((t) =>
            t.id === txn.id ? { ...t, ...txn } : t
          ),
        })),

      setFilters: (filters) => set({ filters }),

      resetFilters: () =>
        set({
          filters: {
            transaction_type: 'ALL',
            status:           'ALL',
            start_date:       '',
            end_date:         '',
          },
        }),

      setLoading:        (isLoading)     => set({ isLoading }),
      setLoadingRecent:  (isLoadingRecent) => set({ isLoadingRecent }),
      setError:          (error)         => set({ error }),
      clearError:        ()              => set({ error: null }),
      clearTransactions: ()              => set({ transactions: [], totalCount: 0 }),

      // ── Selectors ──────────────────────────────────────────

      getTransactionById: (id) =>
        get().transactions.find((t) => t.id === id) ??
        get().recentTransactions.find((t) => t.id === id) ??
        null,

      /** Summary numbers for the dashboard stats cards. */
      getSummary: () => {
        const s = get().statistics;
        return {
          totalSent:     parseFloat(s?.total_sent     ?? 0),
          totalReceived: parseFloat(s?.total_received ?? 0),
          monthlySent:   parseFloat(s?.monthly_sent   ?? 0),
          monthlyReceived: parseFloat(s?.monthly_received ?? 0),
          sentCount:     s?.monthly_sent_count     ?? 0,
          receivedCount: s?.monthly_received_count  ?? 0,
        };
      },
    }),
    { name: 'TransactionStore' }
  )
);

export default useTransactionStore;