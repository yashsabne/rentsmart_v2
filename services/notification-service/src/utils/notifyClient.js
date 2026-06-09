/**
 * notifyClient.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop this file into any other microservice's src/utils/ folder.
 * It provides typed helpers that POST to the notification-service REST API,
 * so each service never touches Brevo or email logic directly.
 *
 * Usage:
 *   import { notifyPaymentSuccess, notifyContactRevealed } from "./utils/notifyClient.js";
 *
 *   await notifyPaymentSuccess({ email, tenantName, ownerName, propertyTitle });
 *   await notifyContactRevealed({ email, tenantName, ownerName, ownerPhone });
 *
 * Set NOTIFICATION_SERVICE_URL in your .env, e.g.:
 *   NOTIFICATION_SERVICE_URL=http://notification-service:5003
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BASE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5003";

/**
 * Internal: POST to a notification-service endpoint.
 * @param {string} path   - e.g. "/api/notify/payment-success"
 * @param {object} body   - JSON payload
 */
const post = async (path, body) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    // Non-fatal: log but do NOT crash the calling service
    console.error(`[notifyClient] ${path} failed:`, data);
  }

  return data;
};

// ── Individual notification helpers ──────────────────────────────────────────

/**
 * Notify a tenant that their payment was successful.
 * @param {{ email: string, tenantName?: string, ownerName: string, propertyTitle: string }} payload
 */
export const notifyPaymentSuccess = (payload) =>
  post("/api/notify/payment-success", payload);

/**
 * Notify a tenant that the owner's contact has been revealed.
 * @param {{ email: string, tenantName?: string, ownerName: string, ownerPhone: string }} payload
 */
export const notifyContactRevealed = (payload) =>
  post("/api/notify/contact-revealed", payload);

export const notifyContactRevealedOwner = (payload) =>
  post("/api/notify/owner-contact-revealed", payload);
