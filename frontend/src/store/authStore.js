import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { tokenStorage } from '../services/authService';

const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ── State ──────────────────────────────────────────────
        user:            null,
        accessToken:     null,
        refreshToken:    null,
        isAuthenticated: false,
        isLoading:       false,
        authError:       null,

        // ── Setters ────────────────────────────────────────────

        /** Called after a successful login or register. */
        setAuth: (user, tokens) => {
          tokenStorage.setTokens(tokens.access, tokens.refresh);
          set({
            user,
            accessToken:     tokens.access,
            refreshToken:    tokens.refresh,
            isAuthenticated: true,
            authError:       null,
          });
        },

        /** Partial user update (e.g. after editProfile or balance refresh). */
        updateUser: (patch) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...patch } : patch,
          })),

        /** Update the stored access token (after silent refresh). */
        setAccessToken: (token) => {
          tokenStorage.setAccess(token);
          set({ accessToken: token });
        },

        /** Clear everything and redirect to login. */
        logout: () => {
          tokenStorage.clearTokens();
          set({
            user:            null,
            accessToken:     null,
            refreshToken:    null,
            isAuthenticated: false,
            authError:       null,
          });
        },

        setLoading:   (isLoading) => set({ isLoading }),
        setAuthError: (authError) => set({ authError }),
        clearError:   ()          => set({ authError: null }),

        // ── Selectors (derived) ────────────────────────────────
        getUser:         () => get().user,
        getBalance:      () => parseFloat(get().user?.account_balance ?? 0),
        getRefreshToken: () => get().refreshToken ?? tokenStorage.getRefresh(),
      }),
      {
        name:    'mpesa-auth',          // localStorage key
        partialize: (state) => ({       // Only persist these fields
          user:            state.user,
          accessToken:     state.accessToken,
          refreshToken:    state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

export default useAuthStore;