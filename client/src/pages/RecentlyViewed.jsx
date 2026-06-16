// RecentlyViewed.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../apis";
 

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const formatPrice = (price, paymentType) => {
  if (!price) return "Price on Request";
  const formatted = `₹${Number(price).toLocaleString("en-IN")}`;
  if (paymentType === "monthly") return `${formatted}/mo`;
  if (paymentType === "one-time") return formatted;
  return formatted;
};

const fullLocation = (address) =>
  [address?.street, address?.city].filter(Boolean).join(", ") || "—";
 
const STATUS_CONFIG = {
  AVAILABLE: { label: "Available", bg: "#EAF3DE", color: "#3B6D11" },
  RENTED:    { label: "Rented",    bg: "#EEEDFE", color: "#26215C" },
  SOLD:      { label: "Sold",      bg: "#F3F4F6", color: "#6B7280" },
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[(status || "").toUpperCase()] || STATUS_CONFIG.AVAILABLE;
  return (
    <span style={{
      display: "inline-block",
      fontSize: 10,
      fontWeight: 600,
      padding: "2px 8px",
      borderRadius: 100,
      background: cfg.bg,
      color: cfg.color,
      letterSpacing: "0.2px",
    }}>
      {cfg.label}
    </span>
  );
};

// ── API calls — same pattern as apilisting.js ─────────────────────────────

const apiGetRecentlyViewedIds = async (token) => {
  const res = await fetch(`${API.AUTH}/api/auth/recently-viewed`, {
    headers: authHeaders(token),
  });
  return res.json(); // { success, recentlyViewed: [id, ...] }
};

const apiGetListingById = async (id) => {
  const res = await fetch(`${API.PROPERTY}/api/property/details/${id}`);
  if (!res.ok) return null;
  return res.json();
};

// ── Skeletons ─────────────────────────────────────────────────────────────

const RowSkeleton = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
    <div style={{ width: 52, height: 52, borderRadius: 10, background: "#f3f4f6", flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{ height: 12, width: "58%", background: "#f3f4f6", borderRadius: 6, marginBottom: 7 }} />
      <div style={{ height: 10, width: "38%", background: "#f3f4f6", borderRadius: 6, marginBottom: 7 }} />
      <div style={{ height: 10, width: "28%", background: "#f3f4f6", borderRadius: 6 }} />
    </div>
    <div style={{ width: 56, height: 20, borderRadius: 100, background: "#f3f4f6" }} />
  </div>
);

// ── Main component ────────────────────────────────────────────────────────

export default function RecentlyViewed({ token }) {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    const load = async () => {
      try {
        setLoading(true);
        setError(false);

        // Step 1 — get ordered IDs from auth service
        const idData = await apiGetRecentlyViewedIds(token);
        if (!idData.success || !idData.recentlyViewed?.length) {
          setListings([]);
          return;
        }

        // Step 2 — hydrate all IDs in parallel from property service
        const results = await Promise.all(
          idData.recentlyViewed.map((id) =>
            apiGetListingById(id).catch(() => null)
          )
        );

        // Preserve the server's order (most recent first), drop deleted listings
        const valid = results.filter(Boolean);
        setListings(valid);
      } catch (err) {
        console.error("RecentlyViewed load error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="card listings-card">
        <div className="card-header">
          <div>
            <div className="card-title">Recently Viewed</div>
            <div className="card-subtitle">Loading…</div>
          </div>
        </div>
        <div className="listings-scroll">
          {Array.from({ length: 3 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="card listings-card">
        <div className="card-header">
          <div className="card-title">Recently Viewed</div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <div className="empty-title">Couldn't load history</div>
          <div className="empty-sub">Try refreshing the page</div>
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (listings.length === 0) {
    return (
      <div className="card listings-card">
        <div className="card-header">
          <div>
            <div className="card-title">Recently Viewed</div>
            <div className="card-subtitle">Properties you visit will appear here</div>
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">👁️</div>
          <div className="empty-title">Nothing viewed yet</div>
          <div className="empty-sub">Open any listing to start your history</div>
        </div>
      </div>
    );
  }

  // ── Populated ──
  return (
    <div className="card listings-card">
      <div className="card-header">
        <div>
          <div className="card-title">Recently Viewed</div>
          <div className="card-subtitle">
            Last <b>{listings.length}</b> propert{listings.length === 1 ? "y" : "ies"} you opened
          </div>
        </div>
      </div>

      <div className="listings-scroll">
        {listings.map((p, i) => {
          const isRent = p.buyOrSell?.toLowerCase() === "rent";
          return (
            <div
              key={p._id}
              onClick={() => navigate(`/details/${p._id}`)}
              className="listing-row"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/details/${p._id}`)}
              style={{
                borderBottom:
                  i < listings.length - 1
                    ? "1px solid var(--color-border)"
                    : "none",
              }}
            >
              {/* Thumbnail */}
              <div className="listing-thumb">
                {p.listingPhotos?.[0] ? (
                  <img
                    src={p.listingPhotos[0]}
                    alt={p.title}
                    className="listing-thumb-img"
                  />
                ) : (
                  <div className="listing-thumb-placeholder">🏠</div>
                )}
              </div>

              {/* Info */}
              <div className="listing-info">
                <div className="listing-title">{p.title}</div>
                <div className="listing-location">📍 {fullLocation(p.address)}</div>
                <div className="listing-tags">
                  <span
                    className="tag"
                    style={{
                      background: isRent
                        ? "var(--color-green-bg)"
                        : "var(--color-red-bg)",
                      color: isRent
                        ? "var(--color-green)"
                        : "var(--color-red)",
                    }}
                  >
                    {p.buyOrSell}
                  </span>
                  <span className="tag tag-muted">{p.category}</span>
                </div>
              </div>

              {/* Meta */}
              <div className="listing-meta">
                <div className="listing-price">
                  {formatPrice(p.price, p.paymentType)}
                </div>
                <div className="listing-details-text">
                  🛏 {p.details?.bedroomCount ?? 0}&nbsp;&nbsp;🚿{" "}
                  {p.details?.bathroomCount ?? 0}
                </div>
                <StatusPill status={p.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}