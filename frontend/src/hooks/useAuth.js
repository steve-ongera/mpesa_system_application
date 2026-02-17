import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import authService, { normalisePhone } from '../services/authService';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * useAuth — centralises all authentication logic.
 *
 * Usage:
 *   const { user, login, logout, register, isAuthenticated } = useAuth();
 */
const useAuth = () => {
  const navigate = useNavigate();

  const {
    user, isAuthenticated, isLoading, authError,
    setAuth, updateUser, logout: storeLogout,
    setLoading, setAuthError, clearError,
  } = useAuthStore();

  const [fieldErrors, setFieldErrors] = useState({});

  // ── Clear field errors when the hook re-mounts ──────────────
  useEffect(() => () => clearError(), []);

  // ─────────────────────────────────────────────────────────────
  // Register
  // ─────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setLoading(true);
    clearError();
    setFieldErrors({});

    try {
      const normalised = {
        ...formData,
        phone_number: normalisePhone(formData.phone_number),
      };
      const data = await authService.register(normalised);
      setAuth(data.user, data.tokens);
      toast.success(`Welcome, ${data.user.first_name}! 🎉`);
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      const serverErrors = err.response?.data?.errors || {};
      const message      = err.response?.data?.message || 'Registration failed';
      setFieldErrors(serverErrors);
      setAuthError(message);
      toast.error(message);
      return { success: false, errors: serverErrors };
    } finally {
      setLoading(false);
    }
  }, [navigate, setAuth, setLoading, setAuthError, clearError]);

  // ─────────────────────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────────────────────
  const login = useCallback(async ({ phone_number, pin }) => {
    setLoading(true);
    clearError();
    setFieldErrors({});

    try {
      const data = await authService.login({
        phone_number: normalisePhone(phone_number),
        pin,
      });
      setAuth(data.user, data.tokens);
      toast.success(`Welcome back, ${data.user.first_name}!`);
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      const serverErrors = err.response?.data?.errors || {};
      const message      =
        err.response?.data?.message ||
        (err.response?.status === 401 ? 'Invalid phone number or PIN' : 'Login failed');
      setFieldErrors(serverErrors);
      setAuthError(message);
      toast.error(message);
      return { success: false, errors: serverErrors };
    } finally {
      setLoading(false);
    }
  }, [navigate, setAuth, setLoading, setAuthError, clearError]);

  // ─────────────────────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch {
      // ignore network errors during logout
    } finally {
      storeLogout();
      setLoading(false);
      navigate('/login');
      toast.success('Logged out successfully');
    }
  }, [navigate, storeLogout, setLoading]);

  // ─────────────────────────────────────────────────────────────
  // Refresh profile from server
  // ─────────────────────────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    try {
      const res = await userAPI.getProfile();
      const fresh = res.data.data || res.data;
      updateUser(fresh);
      return fresh;
    } catch (err) {
      console.error('Profile refresh failed:', err);
      return null;
    }
  }, [updateUser]);

  // ─────────────────────────────────────────────────────────────
  // Refresh balance only (lightweight)
  // ─────────────────────────────────────────────────────────────
  const refreshBalance = useCallback(async () => {
    try {
      const res     = await userAPI.getBalance();
      const balance = res.data.data?.account_balance ?? res.data?.account_balance;
      if (balance !== undefined) updateUser({ account_balance: balance });
      return parseFloat(balance ?? 0);
    } catch {
      return null;
    }
  }, [updateUser]);

  // ─────────────────────────────────────────────────────────────
  // Guards
  // ─────────────────────────────────────────────────────────────
  const requireAuth = useCallback(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const requireGuest = useCallback(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    authError,
    fieldErrors,

    // Computed
    balance:   parseFloat(user?.account_balance ?? 0),
    fullName:  user ? `${user.first_name} ${user.last_name}`.trim() : '',
    initials:  user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() : '?',
    isVerified: user?.is_verified ?? false,

    // Actions
    login,
    logout,
    register,
    refreshProfile,
    refreshBalance,
    updateUser,
    clearError,

    // Guards
    requireAuth,
    requireGuest,
  };
};

export default useAuth;