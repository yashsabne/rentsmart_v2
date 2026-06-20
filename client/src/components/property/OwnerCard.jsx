import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../../apis";
import ShareButton from "../ShareButton";
import { apiToggleHide, apiRefreshListing, apiUpdateStatus } from "../../services/apilisting.js";

const PURPLE = { bg: "#EEEDFE", mid: "#534AB7", dark: "#26215C", border: "#CECBF6" };
const GREEN = { bg: "#EAF3DE", mid: "#3B6D11", light: "#C0DD97" };
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: type === "error" ? "#ef4444" : "#111",
      color: "#fff", borderRadius: 10, padding: "10px 18px",
      fontSize: 13, fontWeight: 500, zIndex: 9999,
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      whiteSpace: "nowrap",
    }}>
      {message}
    </div>
  );
};

const formatCountdown = (ms) => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const OwnerCard = ({ token, owner, property, stats = {}, onPropertyUpdate }) => {

 

  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState({ pay: false, hide: false, refresh: false, status: false });
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [refreshRemaining, setRefreshRemaining] = useState(0);

 

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);
 

  useEffect(() => {
    if (!property.lastRefreshedAt) return;
    const elapsed = Date.now() - new Date(property.lastRefreshedAt).getTime();
    const remaining = COOLDOWN_MS - elapsed;
    if (remaining <= 0) { setRefreshRemaining(0); return; }
    setRefreshRemaining(remaining);
    const interval = setInterval(() => {
      setRefreshRemaining(prev => {
        const next = prev - 1000;
        if (next <= 0) { clearInterval(interval); return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [property.lastRefreshedAt]);

  const handleHide = async () => {
    setLoading(l => ({ ...l, hide: true }));
    try {
      const data = await apiToggleHide(token, property._id);
 
      if (data.success) {
        onPropertyUpdate(data.listing);
        showToast(data.listing.isHidden ? "Listing hidden" : "Listing visible again");
      } else {
        showToast("Failed to update listing", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(l => ({ ...l, hide: false }));
    }
  };

  const handleRefresh = async () => {
    if (refreshRemaining > 0) return;
    setLoading(l => ({ ...l, refresh: true }));
    try {
      const data = await apiRefreshListing(token, property._id);
      if (data.success) {
        onPropertyUpdate(data.listing);
        setRefreshRemaining(COOLDOWN_MS);
        showToast("Listing refreshed! It's now higher in search.");
      } else if (data.remainingMs) {
        setRefreshRemaining(data.remainingMs);
        showToast(`Cooldown active — try in ${formatCountdown(data.remainingMs)}`, "error");
      } else {
        showToast("Could not refresh", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(l => ({ ...l, refresh: false }));
    }
  };

  const handleStatus = async () => {
    const isAvailable = property?.status === "AVAILABLE";
    const newStatus = isAvailable
      ? property?.buyOrSell === "Rent" ? "RENTED" : "SOLD"
      : "AVAILABLE";
    setLoading(l => ({ ...l, status: true }));
    try {
      const data = await apiUpdateStatus(token, property._id, newStatus);
      if (data.success) {
        onPropertyUpdate(data.listing);
        showToast(`Marked as ${newStatus}`);
      } else {
        showToast("Failed to update status", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(l => ({ ...l, status: false }));
    }
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const openRazorpay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "RENTSMART",
      description: "Promote listing — 30 days",
      order_id: order.id,
      handler: async (response) => {
        try {
          const res = await fetch(`${API.PAYMENT}/api/payment/promote/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const data = await res.json();
          if (data.success) setModal("success");
          else setError("Payment verified but activation failed. Contact support.");
        } catch {
          setError("Something went wrong during verification. Contact support.");
        }
      },
      prefill: {
        name: `${owner?.firstName ?? ""} ${owner?.lastName ?? ""}`.trim(),
        email: owner?.email ?? "",
        contact: owner?.phone ?? "",
      },
      theme: { color: "#534AB7" },
      modal: { ondismiss: () => setModal("confirm") },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePay = async () => {
    setError(null);
    setLoading(l => ({ ...l, pay: true }));
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { setError("Failed to load Razorpay."); return; }
      const res = await fetch(`${API.PAYMENT}/api/payment/promote/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listingId: property._id, propertyTitle: property.title }),
      });
      const data = await res.json();
      if (!data.success) { setError("Could not create order. Please try again."); return; }
      setModal(null);
      openRazorpay(data.order);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(l => ({ ...l, pay: false }));
    }
  };

  const steps = ["plan", "confirm", "success"];
  const stepIdx = steps.indexOf(modal);

  const promoted =
    property?.isPromoted &&
    property?.promotedUntil &&
    new Date(property?.promotedUntil) > new Date();

 
  const isAvailable = property.status === "AVAILABLE";
  const statusLabel = !isAvailable
    ? "↩️ Mark Available Again"
    : `🏷️ Mark as ${property?.buyOrSell === "Rent" ? "RENTED" : "SOLD"}`;

  const refreshCoolingDown = refreshRemaining > 0;

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ borderRadius: 16, background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", overflow: "hidden", marginBottom: 20 }}>

        <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: PURPLE.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 16, color: PURPLE.dark, flexShrink: 0 }}>
            {(owner?.firstName?.[0] || "O") + (owner?.lastName?.[0] || "")}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#111" }}>
              {owner?.firstName} {owner?.lastName}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
              {owner?.email}<br />{owner?.phone}
            </div>
          </div>
          <div style={{ background: PURPLE.bg, color: PURPLE.dark, fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20 }}>
            Owner
          </div>
        </div>

        <div style={{ height: "0.5px", background: "rgba(0,0,0,0.06)" }} />

        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#9ca3af", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 10 }}>Listing overview</div>
 
          {!promoted ? (
            <div style={{ background: PURPLE.bg, borderRadius: 12, padding: 14, marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: PURPLE.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: PURPLE.dark, fontSize: 18 }}>🚀</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: PURPLE.dark, marginBottom: 2 }}>Promote this listing</div>
                <div style={{ fontSize: 12, color: PURPLE.mid }}>Get 3× more visibility · ₹39 / 30 days</div>
              </div>
              <button onClick={() => setModal("plan")}
                style={{ background: PURPLE.mid, color: "#EEEDFE", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer", flexShrink: 0 }}>
                Promote
              </button>
            </div>
          ) : (
            <div style={{ background: GREEN.bg, borderRadius: 12, padding: 14, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: GREEN.mid }}>Listing is promoted</div>
                <div style={{ fontSize: 12, color: "#3B6D11" }}>
                  Active for {Math.max(0, Math.ceil((new Date(property?.promotedUntil) - new Date()) / (1000 * 60 * 60 * 24)))} days
                </div>
              </div>
            </div>
          )}

          {property?.isHidden && (
            <div style={{ background: "#FEF3C7", borderRadius: 10, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#92400E" }}>
              👁️ This listing is hidden from public search
            </div>
          )}

          {!isAvailable && (
            <div style={{ background: "#F3F4F6", borderRadius: 10, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#374151" }}>
              🏷️ Marked as <strong>{property?.status}</strong>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#9ca3af", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 10 }}>Property Actions</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button
                onClick={handleHide}
                disabled={loading.hide}
                style={{ padding: "11px", borderRadius: 10, border: "0.5px solid rgba(0,0,0,.08)", background: property.isHidden ? "#FEF3C7" : "#fff", fontSize: 13, fontWeight: 500, cursor: loading.hide ? "not-allowed" : "pointer", opacity: loading.hide ? 0.6 : 1 }}>
                {loading.hide ? "…" : property?.isHidden ? "👁️ Unhide Listing" : "👁️ Hide Listing"}
              </button>

              <ShareButton listing={property} currentUser={owner} />

              <button
                onClick={handleRefresh}
                disabled={loading.refresh || refreshCoolingDown}
                title={refreshCoolingDown ? `Available in ${formatCountdown(refreshRemaining)}` : "Refresh to boost in search"}
                style={{ padding: "11px", borderRadius: 10, border: "0.5px solid rgba(0,0,0,.08)", background: refreshCoolingDown ? "#f3f4f6" : "#fff", fontSize: 13, fontWeight: 500, cursor: (loading.refresh || refreshCoolingDown) ? "not-allowed" : "pointer", opacity: (loading.refresh || refreshCoolingDown) ? 0.6 : 1 }}>
                {loading.refresh ? "…" : refreshCoolingDown ? `🔄 ${formatCountdown(refreshRemaining)}` : "🔄 Refresh Listing"}
              </button>

              <button
                onClick={handleStatus}
                disabled={loading.status}
                style={{ padding: "11px", borderRadius: 10, border: "0.5px solid rgba(0,0,0,.08)", background: !isAvailable ? "#EAF3DE" : "#fff", fontSize: 13, fontWeight: 500, cursor: loading.status ? "not-allowed" : "pointer", opacity: loading.status ? 0.6 : 1 }}>
                {loading.status ? "…" : statusLabel}
              </button>
            </div>
          </div>

          <button onClick={() => navigate(`/edit-property/${property._id}`)}
            style={{ width: "100%", padding: "10px", borderRadius: 10, border: "0.5px solid rgba(0,0,0,0.1)", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            ✏️ Edit property
          </button>
        </div>
      </div>

      {modal && (
        <div onClick={(e) => e.target === e.currentTarget && setModal(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, overflow: "hidden" }}>
            <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#111" }}>
                {modal === "plan" ? "Promote your listing" : modal === "confirm" ? "Confirm & pay" : ""}
              </div>
              <button onClick={() => setModal(null)}
                style={{ width: 28, height: 28, borderRadius: "50%", border: "0.5px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {steps.map((s, i) => (
                  <div key={s} style={{ height: 3, flex: 1, borderRadius: 2, background: i < stepIdx ? "#3B6D11" : i === stepIdx ? PURPLE.mid : "#e5e7eb" }} />
                ))}
              </div>

              {modal === "plan" && (
                <>
                  <div style={{ background: PURPLE.bg, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: PURPLE.dark }}>Featured boost</div>
                      <span style={{ background: PURPLE.border, color: PURPLE.dark, fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 20 }}>Popular</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 500, color: PURPLE.dark, marginBottom: 12 }}>
                      ₹39 <span style={{ fontSize: 13, fontWeight: 400, color: PURPLE.mid }}>/ 30 days</span>
                    </div>
                    {["Top placement in search results", '"Promoted" badge on listing', "3× more visibility", "Priority in buyer alerts"].map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#3C3489", marginBottom: 6 }}>
                        <span style={{ color: "#3B6D11", fontWeight: 500 }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    {["🔒 Secure checkout", "↩ Cancel anytime", "💬 24/7 support"].map(t => (
                      <span key={t} style={{ fontSize: 11, color: "#6b7280", background: "#f3f4f6", borderRadius: 20, padding: "3px 9px" }}>{t}</span>
                    ))}
                  </div>
                  <button onClick={() => setModal("confirm")}
                    style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: PURPLE.mid, color: "#EEEDFE", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                    Continue →
                  </button>
                </>
              )}

              {modal === "confirm" && (
                <>
                  <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Order summary</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151", marginBottom: 8 }}>
                      <span>Featured boost (30 days)</span><span>₹39.00</span>
                    </div>
                    <div style={{ height: "0.5px", background: "#e5e7eb", margin: "8px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 500, color: "#111" }}>
                      <span>Total</span><span>₹39.00</span>
                    </div>
                  </div>
                  {error && <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 10 }}>{error}</div>}
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 12 }}>
                    You'll be taken to Razorpay's secure checkout. Listing is promoted immediately after payment.
                  </div>
                  <button onClick={handlePay} disabled={loading.pay}
                    style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: PURPLE.mid, color: "#EEEDFE", fontSize: 14, fontWeight: 500, cursor: loading.pay ? "not-allowed" : "pointer", opacity: loading.pay ? .6 : 1 }}>
                    {loading.pay ? "Creating order…" : "🔒 Pay ₹39 via Razorpay"}
                  </button>
                  <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 8 }}>256-bit SSL · Powered by Razorpay</div>
                </>
              )}

              {modal === "success" && (
                <>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: GREEN.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 24 }}>🚀</div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: "#111", textAlign: "center", marginBottom: 4 }}>Listing promoted!</div>
                  <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center", lineHeight: 1.6, marginBottom: 14 }}>
                    Your property is now featured at the top of search results for 30 days.
                  </div>
                  <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#111", marginBottom: 8 }}>What happens next</div>
                    {["📧 Confirmation email sent", "⭐ Promoted badge live now", "📊 Analytics in your dashboard"].map(x => (
                      <div key={x} style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{x}</div>
                    ))}
                  </div>
                  <button onClick={() => setModal(null)}
                    style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: "#111", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                    Done ✓
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerCard;