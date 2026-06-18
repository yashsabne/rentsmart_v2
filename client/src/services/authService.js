// authService.js

const API_BASE = import.meta.env.VITE_AUTH_API ?? "http://localhost:5000";

 
function openOAuthPopup(url) {
  const width = 500;
  const height = 620;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  return window.open(
    url,
    "oauth_popup",
    `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars`
  );
}

function waitForOAuthResult(popup) {
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(timer);
        window.removeEventListener("message", handler);
        reject(new Error("Auth popup closed by user"));
      }
    }, 500);

    function handler(event) { 
      if (event.origin !== new URL(API_BASE).origin) return;
      if (!event.data?.type?.startsWith("OAUTH_")) return;

      clearInterval(timer);
      window.removeEventListener("message", handler);
      popup?.close();

      if (event.data.type === "OAUTH_SUCCESS") {
        resolve(event.data.payload);  
      } else {
        reject(new Error(event.data.error ?? "OAuth failed"));
      }
    }

    window.addEventListener("message", handler);
  });
}

// ─── Google ─────────────────────────────────────────────────────────────────

export async function initGoogleAuth() {
  
  const popup = openOAuthPopup(`${API_BASE}/auth/social/google`);
  if (!popup) throw new Error("Popup blocked. Please allow popups and retry.");
  return waitForOAuthResult(popup);
}

export function saveAuthToken(token) {
   localStorage.setItem("token", token);
}

export function getAuthToken() {
  return localStorage.getItem("token");
}

export function clearAuthToken() {
  localStorage.removeItem("token");
}