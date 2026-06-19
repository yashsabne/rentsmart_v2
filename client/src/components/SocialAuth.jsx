 
import { useState } from "react";
import { initGoogleAuth} from  "../services/authService.js"

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);
 

const PROVIDERS = [
  { key: "google",    label: "Google",    Icon: GoogleIcon,    init: initGoogleAuth }
];

export default function SocialAuth({
  mode = "login",
  onSuccess,
  onError,
  disabled = false,
}) {
  const [loading, setLoading] = useState(null);  

  const verb = mode === "signup" ? "Sign up" : "Continue";

  const handleClick = async (provider) => {
    if (loading || disabled) return;
    setLoading(provider.key);
    try {
      const userData = await provider.init();
      onSuccess?.(provider.key, userData);
    } catch (err) {
      onError?.(provider.key, err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
      {PROVIDERS.map((provider) => {
        const isLoading = loading === provider.key;
        const isDisabled = disabled || loading !== null;

        return (
          <button
            key={provider.key}
            type="button"
            onClick={() => handleClick(provider)}
            disabled={isDisabled}
            aria-label={`${verb} with ${provider.label}`}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "11px 8px",
              borderRadius: 10,
              border: "1.5px solid var(--color-border-secondary, #d1d5db)",
              background: "var(--color-background-primary, #fff)",
              color: "var(--color-text-primary, #111)",
              fontSize: 13,
              fontWeight: 500,
              cursor: isDisabled ? "not-allowed" : "pointer",
              opacity: isDisabled ? 0.6 : 1,
              transition: "border-color .2s, background .2s",
            }}
            onMouseEnter={e => {
              if (!isDisabled) e.currentTarget.style.borderColor = "var(--color-text-primary, #111)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--color-border-secondary, #d1d5db)";
            }}
          >
            {isLoading ? (
              <Spinner />
            ) : (
              <provider.Icon />
            )}
            {verb} with {provider.label}
          </button>
        );
      })}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width="16" height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ animation: "spin 0.75s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  );
}