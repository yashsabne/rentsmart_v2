// src/components/property/OwnerCard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../../apis";

import ShareButton from "../ShareButton";



const PURPLE = { bg: "#EEEDFE", mid: "#534AB7", dark: "#26215C", border: "#CECBF6" };
const GREEN = { bg: "#EAF3DE", mid: "#3B6D11", light: "#C0DD97" };

const OwnerCard = ({ token, owner, property, stats = {} }) => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);


  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // ── open Razorpay checkout ──────────────────────────────────────────
  const openRazorpay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "PropApp",
      description: "Promote listing — 30 days",
      order_id: order.id,
      handler: async (response) => {
        try {
          const res = await fetch(`${API.PAYMENT}/api/payment/promote/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setModal("success");
          } else {
            setError("Payment verified but activation failed. Contact support.");
          }
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
      modal: {
        ondismiss: () => setModal("confirm"),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePay = async () => {
    setError(null);
    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError("Failed to load Razorpay. Check your internet connection.");
        return;
      }

      const res = await fetch(`${API.PAYMENT}/api/payment/promote/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingId: property._id, propertyTitle: property.title }),
      });

      const data = await res.json();

      if (!data.success) {
        setError("Could not create order. Please try again.");
        return;
      }

      setModal(null); // close modal before Razorpay opens
      openRazorpay(data.order);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const steps = ["plan", "confirm", "success"];
  const stepIdx = steps.indexOf(modal);


  const promoted =
    property?.isPromoted &&
    property?.promotedUntil &&
    new Date(property.promotedUntil) > new Date();

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      {/* ── CARD ── */}
      <div style={{ borderRadius: 16, background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", overflow: "hidden", marginBottom: 20 }}>

        {/* Top: owner info */}
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

        {/* Body */}
        <div style={{ padding: 16 }}>
          {/* Stats */}
          <div style={{ fontSize: 11, color: "#9ca3af", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 10 }}>Listing overview</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
            {/* {[["Views", stats.views ?? 247], ["Inquiries", stats.inquiries ?? 18], ["Reach", stats.reach ?? "4.2k"]].map(([label, val]) => (
              <div key={label} style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: "#111" }}>{val}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{label}</div>
              </div>
            ))} */}
            feature coming
          </div>

          {/* Promote block */}
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
              <span style={{ fontSize: 18, color: GREEN.mid }}>✅</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: GREEN.mid }}>Listing is promoted</div>
                <div style={{ fontSize: 12, color: "#3B6D11" }}>
                  Active for{" "}
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(property.promotedUntil) - new Date()) /
                      (1000 * 60 * 60 * 24)
                    )
                  )}{" "}
                  days
                </div>
              </div>
            </div>
          )}


          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#9ca3af", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 10 }}>
              Property Actions
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>

              <button style={{ padding: "11px", borderRadius: 10, border: "0.5px solid rgba(0,0,0,.08)", background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                👁️ Hide Listing
              </button>

              <ShareButton listing={property} currentUser={owner} />

              <button style={{ padding: "11px", borderRadius: 10, border: "0.5px solid rgba(0,0,0,.08)", background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                🔄 Refresh Listing
              </button>

              <button style={{ padding: "11px", borderRadius: 10, border: "0.5px solid rgba(0,0,0,.08)", background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                🏷️ Mark as {property.buyOrSell === "Rent" ? "RENTED" : "SOLD"}
              </button>

              
            </div>
          </div>

          <button onClick={() => navigate(`/edit-property/${property._id}`)}
            style={{ width: "100%", padding: "10px", borderRadius: 10, border: "0.5px solid rgba(0,0,0,0.1)", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            ✏️ Edit property
          </button>
          
        </div>
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div onClick={(e) => e.target === e.currentTarget && setModal(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, overflow: "hidden" }}>

            {/* Modal header */}
            <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#111" }}>
                {modal === "plan" ? "Promote your listing" : modal === "confirm" ? "Confirm & pay" : ""}
              </div>
              <button onClick={() => setModal(null)}
                style={{ width: 28, height: 28, borderRadius: "50%", border: "0.5px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <div style={{ padding: 16 }}>
              {/* Step bar */}
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {steps.map((s, i) => (
                  <div key={s} style={{ height: 3, flex: 1, borderRadius: 2, background: i < stepIdx ? "#3B6D11" : i === stepIdx ? PURPLE.mid : "#e5e7eb" }} />
                ))}
              </div>

              {/* PLAN */}
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

              {/* CONFIRM */}
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
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 12 }}>
                    You'll be taken to Razorpay's secure checkout. Listing is promoted immediately after payment.
                  </div>
                  <button onClick={handlePay} disabled={loading}
                    style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: PURPLE.mid, color: "#EEEDFE", fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .6 : 1 }}>
                    {loading ? "Creating order…" : "🔒 Pay ₹39 via Razorpay"}
                  </button>
                  <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 8 }}>256-bit SSL · Powered by Razorpay</div>
                </>
              )}

              {/* SUCCESS */}
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
                  <button onClick={() => { setModal(null); setPromoted(true); }}
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