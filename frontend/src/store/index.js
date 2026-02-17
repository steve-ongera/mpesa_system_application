/**
 * Central store barrel — import any store from here.
 *
 *   import { useAuthStore, useTransactionStore, useUiStore } from '../store';
 */

export { default as useAuthStore }        from './authStore';
export { default as useTransactionStore } from './transactionStore';
export { default as useUiStore }          from './uiStore';

// ─────────────────────────────────────────────────────────────
// Wallet store  (lightweight — lives here to avoid extra file)
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useWalletStore = create(
  devtools(
    (set) => ({
      wallet:    null,
      isLoading: false,
      error:     null,

      setWallet:     (wallet)    => set({ wallet }),
      updateWallet:  (patch)     => set((s) => ({ wallet: s.wallet ? { ...s.wallet, ...patch } : patch })),
      setLoading:    (isLoading) => set({ isLoading }),
      setError:      (error)     => set({ error }),
      clearWallet:   ()          => set({ wallet: null }),

      getDailyLimit:       () => parseFloat(useWalletStore.getState().wallet?.daily_limit       ?? 0),
      getTransactionLimit: () => parseFloat(useWalletStore.getState().wallet?.transaction_limit ?? 0),
      isLocked:            () => useWalletStore.getState().wallet?.is_locked ?? false,
    }),
    { name: 'WalletStore' }
  )
);

// ─────────────────────────────────────────────────────────────
// Notification store  (lightweight — lives here to avoid extra file)
// ─────────────────────────────────────────────────────────────
export const useNotificationStore = create(
  devtools(
    (set, get) => ({
      notifications: [],
      unreadCount:   0,
      isLoading:     false,

      setNotifications: (notifications) => {
        const unread = notifications.filter((n) => !n.is_read).length;
        set({ notifications, unreadCount: unread });
      },

      addNotification: (n) =>
        set((s) => ({
          notifications: [n, ...s.notifications],
          unreadCount:   n.is_read ? s.unreadCount : s.unreadCount + 1,
        })),

      markAsRead: (id) =>
        set((s) => {
          const already = s.notifications.find((n) => n.id === id)?.is_read;
          return {
            notifications: s.notifications.map((n) =>
              n.id === id ? { ...n, is_read: true } : n
            ),
            unreadCount: already ? s.unreadCount : Math.max(0, s.unreadCount - 1),
          };
        }),

      markAllAsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
          unreadCount:   0,
        })),

      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

      setUnreadCount: (unreadCount) => set({ unreadCount }),
      setLoading:     (isLoading)   => set({ isLoading }),

      getUnread: () => get().notifications.filter((n) => !n.is_read),
    }),
    { name: 'NotificationStore' }
  )
);