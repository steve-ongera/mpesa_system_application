import { userAPI, walletAPI, agentAPI, notificationAPI } from './api';

// ─────────────────────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's full profile.
 */
export const getProfile = async () => {
  const res = await userAPI.getProfile();
  return res.data.data || res.data;
};

/**
 * Update editable profile fields (first_name, last_name, email).
 * @param {{ first_name?, last_name?, email? }} data
 */
export const updateProfile = async (data) => {
  // Only forward editable fields
  const allowed = ['first_name', 'last_name', 'email'];
  const payload = Object.fromEntries(
    Object.entries(data).filter(([k]) => allowed.includes(k))
  );
  const res = await userAPI.updateProfile(payload);
  return res.data.data || res.data;
};

/**
 * Change the user's PIN.
 * @param {{ old_pin: string, new_pin: string, confirm_pin: string }} data
 */
export const changePin = async (data) => {
  const res = await userAPI.changePin(data);
  return res.data;
};

/**
 * Fetch just the current account balance.
 * Returns a number.
 */
export const getBalance = async () => {
  const res = await userAPI.getBalance();
  const raw = res.data.data?.account_balance ?? res.data?.account_balance ?? 0;
  return parseFloat(raw);
};

/**
 * Lookup a user by phone number (for recipient validation).
 * Returns { name, phone_number } or null if not found.
 */
export const lookupPhone = async (phone) => {
  try {
    const res = await userAPI.lookupPhone(phone);
    return res.data.data || res.data || null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// Wallet
// ─────────────────────────────────────────────────────────────

/**
 * Fetch the wallet associated with the current user.
 */
export const getWallet = async () => {
  const res = await walletAPI.getWallet();
  return res.data.data || res.data;
};

// ─────────────────────────────────────────────────────────────
// Agents
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all active agents, optionally filtered.
 * @param {{ location?, search? }} params
 */
export const getAgents = async (params = {}) => {
  const res = await agentAPI.getAgents(params);
  return res.data.data || res.data || [];
};

/**
 * Fetch agents near a given location.
 * @param {{ location: string }} params
 */
export const getNearbyAgents = async (params = {}) => {
  const res = await agentAPI.getNearbyAgents(params);
  return res.data.data || res.data || [];
};

// ─────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all notifications for the current user.
 */
export const getNotifications = async (params = {}) => {
  const res = await notificationAPI.getNotifications(params);
  return res.data.data || res.data || [];
};

/**
 * Mark a single notification as read.
 */
export const markNotificationRead = async (id) => {
  const res = await notificationAPI.markAsRead(id);
  return res.data;
};

/**
 * Mark all notifications as read.
 */
export const markAllNotificationsRead = async () => {
  const res = await notificationAPI.markAllAsRead();
  return res.data;
};

/**
 * Fetch the count of unread notifications.
 * Returns a number.
 */
export const getUnreadCount = async () => {
  const res = await notificationAPI.getUnreadCount();
  return res.data.data?.count ?? res.data?.count ?? 0;
};

/**
 * Delete all notifications.
 */
export const clearAllNotifications = async () => {
  const res = await notificationAPI.clearAll();
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Formatting helpers specific to the user domain
// ─────────────────────────────────────────────────────────────

/**
 * Returns the user's full name, falling back to phone number.
 */
export const displayName = (user) => {
  if (!user) return '';
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return name || user.phone_number || 'Unknown User';
};

/**
 * Returns initials from first + last name (for avatar display).
 */
export const initials = (user) => {
  if (!user) return '?';
  const f = user.first_name?.[0] || '';
  const l = user.last_name?.[0]  || '';
  return (f + l).toUpperCase() || user.phone_number?.[8] || '?';
};

export const userService = {
  getProfile,
  updateProfile,
  changePin,
  getBalance,
  lookupPhone,
  getWallet,
  getAgents,
  getNearbyAgents,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  clearAllNotifications,
  displayName,
  initials,
};

export default userService;