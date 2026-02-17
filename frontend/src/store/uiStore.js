import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useUiStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ── Sidebar ────────────────────────────────────────────
        sidebarOpen:      false,   // mobile overlay
        sidebarCollapsed: false,   // desktop collapsed mode

        toggleSidebar:    ()       => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
        setSidebarOpen:   (open)   => set({ sidebarOpen: open }),
        closeSidebar:     ()       => set({ sidebarOpen: false }),
        toggleCollapsed:  ()       => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

        // ── Theme ──────────────────────────────────────────────
        theme: 'light',  // 'light' | 'dark'  (dark mode WIP)
        setTheme: (theme) => set({ theme }),
        toggleTheme: () =>
          set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

        // ── Notification badge ──────────────────────────────────
        unreadCount:    0,
        notifications:  [],

        setUnreadCount:     (unreadCount)    => set({ unreadCount }),
        incrementUnread:    ()               => set((s) => ({ unreadCount: s.unreadCount + 1 })),
        decrementUnread:    ()               => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
        resetUnread:        ()               => set({ unreadCount: 0 }),
        setNotifications:   (notifications)  => set({ notifications }),
        markNotifRead:      (id)             =>
          set((s) => ({
            notifications: s.notifications.map((n) =>
              n.id === id ? { ...n, is_read: true } : n
            ),
            unreadCount: Math.max(0, s.unreadCount - 1),
          })),
        markAllNotifsRead: () =>
          set((s) => ({
            notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
            unreadCount:   0,
          })),

        // ── Global modals ──────────────────────────────────────
        modals: {},   // { [modalId]: boolean }

        openModal:   (id) => set((s) => ({ modals: { ...s.modals, [id]: true  } })),
        closeModal:  (id) => set((s) => ({ modals: { ...s.modals, [id]: false } })),
        isModalOpen: (id) => get().modals[id] ?? false,

        // ── Global page loading overlay ─────────────────────────
        pageLoading: false,
        setPageLoading: (pageLoading) => set({ pageLoading }),

        // ── Breadcrumb / page title ────────────────────────────
        pageTitle:    '',
        breadcrumbs:  [],
        setPageTitle:   (pageTitle)   => set({ pageTitle }),
        setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
      }),
      {
        name: 'mpesa-ui',
        // Only persist layout prefs, not ephemeral state
        partialize: (s) => ({
          sidebarCollapsed: s.sidebarCollapsed,
          theme:            s.theme,
        }),
      }
    ),
    { name: 'UiStore' }
  )
);

export default useUiStore;