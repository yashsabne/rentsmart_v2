    // src/api/settingsApi.js
import { API } from "../../apis"; 

const BASE = `${API.AUTH}/api/auth/settings`;

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// ── GET current settings ────────────────────────────────────────────────────
export const fetchSettings = async (token) => {
  const res = await fetch(BASE, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load settings");
  return data.data;
};

// ── PATCH profile ────────────────────────────────────────────────────────────
export const saveProfile = async (token, payload) => {
  const res = await fetch(`${BASE}/profile`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update profile");
  return data;
};

// ── PATCH notifications ──────────────────────────────────────────────────────
export const saveNotifications = async (token, payload) => {
  const res = await fetch(`${BASE}/notifications`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update notifications");
  return data;
};

// ── PATCH preferences ────────────────────────────────────────────────────────
export const savePreferences = async (token, payload) => {
  const res = await fetch(`${BASE}/preferences`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update preferences");
  return data;
};

// ── PATCH password ───────────────────────────────────────────────────────────
export const changePassword = async (token, payload) => {
  const res = await fetch(`${BASE}/password`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to change password");
  return data;
};

// ── DELETE account ───────────────────────────────────────────────────────────
export const deleteAccount = async (token, password) => {
  const res = await fetch(`${BASE}/account`, {
    method: "DELETE",
    headers: authHeaders(token),
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete account");
  return data;
};

// ── GET activity log (activity service) ─────────────────────────────────────
export const fetchActivity = async (token, limit = 20) => {
  const res = await fetch(`${API.ACTIVITY}/api/activity?limit=${limit}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load activity");
  return data.data || data; // handle both { data: [] } and []
};

// ── POST resend verification (reuse existing auth route) ─────────────────────
export const resendVerification = async (token) => {
  const res = await fetch(`${API.AUTH}/api/auth/resend-verification`, {
    method: "POST",
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to resend email");
  return data;
};