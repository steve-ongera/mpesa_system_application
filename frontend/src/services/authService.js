import { authAPI } from './api';

// ─────────────────────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────────────────────

export const tokenStorage = {
  getAccess:   ()      => localStorage.getItem('access_token'),
  getRefresh:  ()      => localStorage.getItem('refresh_token'),
  setAccess:   (token) => localStorage.setItem('access_token', token),
  setRefresh:  (token) => localStorage.setItem('refresh_token', token),
  setTokens:   (access, refresh) => {
    localStorage.setItem('access_token',  access);
    localStorage.setItem('refresh_token', refresh);
  },
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

/**
 * Decode a JWT payload (no signature verification — frontend only).
 */
export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

/**
 * Returns true if the access token is expired (or missing).
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  // Add 30 s buffer
  return Date.now() >= (decoded.exp - 30) * 1000;
};

/**
 * Returns true if the user appears to be logged in
 * (token present and not obviously expired).
 */
export const isLoggedIn = () => {
  const token = tokenStorage.getAccess();
  return !!token && !isTokenExpired(token);
};

// ─────────────────────────────────────────────────────────────
// Auth operations
// ─────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * Returns { user, tokens } on success.
 */
export const register = async (formData) => {
  const res  = await authAPI.register(formData);
  const data = res.data.data;
  tokenStorage.setTokens(data.tokens.access, data.tokens.refresh);
  return data;
};

/**
 * Log in with phone + PIN.
 * Returns { user, tokens } on success.
 */
export const login = async (credentials) => {
  const res  = await authAPI.login(credentials);
  const data = res.data.data;
  tokenStorage.setTokens(data.tokens.access, data.tokens.refresh);
  return data;
};

/**
 * Log out — attempts to blacklist the refresh token on the server,
 * then always clears local storage.
 */
export const logout = async () => {
  const refresh = tokenStorage.getRefresh();
  try {
    if (refresh) await authAPI.logout(refresh);
  } catch {
    // Silently ignore network errors during logout
  } finally {
    tokenStorage.clearTokens();
  }
};

/**
 * Silently refresh the access token using the stored refresh token.
 * Returns the new access token string, or null on failure.
 */
export const silentRefresh = async () => {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return null;
  try {
    const res        = await authAPI.refreshToken(refresh);
    const newAccess  = res.data.access;
    tokenStorage.setAccess(newAccess);
    return newAccess;
  } catch {
    tokenStorage.clearTokens();
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// Validation helpers (used in auth forms)
// ─────────────────────────────────────────────────────────────

/**
 * Normalise phone to 254XXXXXXXXX format.
 * Accepts: 07XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX
 */
export const normalisePhone = (phone) => {
  if (!phone) return '';
  let p = phone.toString().replace(/[\s\-+()]/g, '');
  if (p.startsWith('07') || p.startsWith('01')) p = '254' + p.slice(1);
  if (p.startsWith('7')  && p.length === 9)     p = '254' + p;
  return p;
};

export const authService = {
  register,
  login,
  logout,
  silentRefresh,
  isLoggedIn,
  isTokenExpired,
  decodeToken,
  normalisePhone,
  tokenStorage,
};

export default authService;