// DashboardListingPanel.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetOwnerDashboard } from "../services/apilisting";

const COLORS = {
  available: { bg: "#EAF3DE", text: "#3B6D11" },
  hidden:    { bg: "#FEF3C7", text: "#92400E" },
  rented:    { bg: "#EEEDFE", text: "#26215C" },
  sold:      { bg: "#FEE2E2", text: "#991B1B" },
  promoted:  { bg: "#F0FDF4", text: "#166534" },
};

const STAT_DEFS = [
  { key: "availableCount", filterKey: "available", label: "Available", icon: "🏠", color: COLORS.available },
  { key: "hiddenCount",    filterKey: "hidden",    label: "Hidden",    icon: "👁️", color: COLORS.hidden },
  { key: "rentedCount",    filterKey: "rented",    label: "Rented",    icon: "🔑", color: COLORS.rented },
  { key: "soldCount",      filterKey: "sold",      label: "Sold",      icon: "✅", color: COLORS.sold },
  { key: "promotedCount",  filterKey: "promoted",  label: "Promoted",  icon: "🚀", color: COLORS.promoted },
];

const FILTER_TABS = [
  { key: "all",       label: "All",      countKey: "total" },
  { key: "available", label: "Live",     countKey: "availableCount" },
  { key: "hidden",    label: "Hidden",   countKey: "hiddenCount" },
  { key: "rented",    label: "Rented",   countKey: "rentedCount" },
  { key: "sold",      label: "Sold",     countKey: "soldCount" },
  { key: "promoted",  label: "Promoted", countKey: "promotedCount" },
];

const getStatusInfo = (listing) => {
  const isPromotedActive = listing.isPromoted && new Date(listing.promotedUntil) > new Date();
  if (listing.isHidden)            return { label: "Hidden",      ...COLORS.hidden };
  if (listing.status === "RENTED") return { label: "Rented",      ...COLORS.rented };
  if (listing.status === "SOLD")   return { label: "Sold",        ...COLORS.sold };
  if (isPromotedActive)            return { label: "🚀 Promoted", ...COLORS.promoted };
  return                                  { label: "Live",        ...COLORS.available };
};

// Clickable stat badge
const StatBadge = ({ label, count, icon, color, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: active ? color.bg : "#f9fafb",
      borderRadius: 12,
      padding: "11px 12px",
      display: "flex",
      alignItems: "center",
      gap: 9,
      cursor: "pointer",
      border: active ? `1.5px solid ${color.text}22` : "1px solid #f0f0f0",
      transition: "all .18s",
      userSelect: "none",
    }}
  >
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: "rgba(255,255,255,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 15, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: active ? color.text : "#111", lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 10, color: active ? color.text : "#9ca3af", marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

const DashboardListingPanel = ({ token }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (!token) return;
    apiGetOwnerDashboard(token)
      .then(res => { if (res.success) setData(res); })
      .finally(() => setLoading(false));
  }, [token]);

  const counts = data?.counts || {};

  const filteredListings = (data?.listings || []).filter(l => {
    if (activeFilter === "all")       return true;
    if (activeFilter === "available") return l.status === "AVAILABLE" && !l.isHidden;
    if (activeFilter === "hidden")    return l.isHidden;
    if (activeFilter === "rented")    return l.status === "RENTED";
    if (activeFilter === "sold")      return l.status === "SOLD";
    if (activeFilter === "promoted")  return l.isPromoted && new Date(l.promotedUntil) > new Date();
    return true;
  });

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div style={{ borderRadius: 16, background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", padding: 20 }}>
        <div style={{ height: 14, background: "#f3f4f6", borderRadius: 8, width: "45%", marginBottom: 6 }} />
        <div style={{ height: 11, background: "#f3f4f6", borderRadius: 8, width: "30%", marginBottom: 18 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 8 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 60, background: "#f9fafb", borderRadius: 12 }} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[1,2].map(i => <div key={i} style={{ height: 60, background: "#f9fafb", borderRadius: 12 }} />)}
        </div>
        {[1,2,3].map(i => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f3f4f6", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, background: "#f3f4f6", borderRadius: 6, width: "60%", marginBottom: 6 }} />
              <div style={{ height: 10, background: "#f3f4f6", borderRadius: 6, width: "40%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 16, background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", overflow: "hidden", marginBottom: 20 }}>

      {/* ── Header ── */}
      <div style={{ padding: "16px 16px 14px", borderBottom: "1px solid #f5f5f5" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>My Listings</div>
          <button
            onClick={() => navigate("/create")}
            style={{
              fontSize: 11, fontWeight: 500, padding: "4px 10px",
              borderRadius: 20, border: "1px solid #e5e7eb",
              background: "#fff", color: "#374151", cursor: "pointer",
            }}>
            + Add New
          </button>
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af" }}>{counts.total || 0} total · quick overview</div>
      </div>

      {/* ── Stat badges (clickable = filter) ── */}
      <div style={{ padding: "14px 16px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 7 }}>
          {STAT_DEFS.slice(0, 3).map(def => (
            <StatBadge
              key={def.key}
              label={def.label}
              count={counts[def.key] || 0}
              icon={def.icon}
              color={def.color}
              active={activeFilter === def.filterKey}
              onClick={() => setActiveFilter(p => p === def.filterKey ? "all" : def.filterKey)}
            />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 14 }}>
          {STAT_DEFS.slice(3).map(def => (
            <StatBadge
              key={def.key}
              label={def.label}
              count={counts[def.key] || 0}
              icon={def.icon}
              color={def.color}
              active={activeFilter === def.filterKey}
              onClick={() => setActiveFilter(p => p === def.filterKey ? "all" : def.filterKey)}
            />
          ))}
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ padding: "0 16px 12px", borderBottom: "1px solid #f5f5f5" }}>
        <div style={{ fontSize: 10, color: "#9ca3af", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 8 }}>Filter</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {FILTER_TABS.map(f => {
            const cnt = counts[f.countKey] || 0;
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
                  border: isActive ? "none" : "0.5px solid #e5e7eb",
                  background: isActive ? "#111" : "#f9fafb",
                  color: isActive ? "#fff" : "#374151",
                  cursor: "pointer", transition: "all .15s",
                }}>
                {f.label}{cnt > 0 && <span style={{ opacity: 0.6 }}> ({cnt})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Listing rows ── */}
      {filteredListings.length === 0 ? (
        <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: "#9ca3af" }}>
          No listings in this category
        </div>
      ) : (
        <div style={{ maxHeight: 340, overflowY: "auto" }}>
          {filteredListings.slice(0, 8).map((listing, i) => {
            const status = getStatusInfo(listing);
            return (
              <div
                key={listing._id}
                onClick={() => navigate(`/details/${listing._id}`)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 16px",
                  borderBottom: i < Math.min(filteredListings.length, 8) - 1 ? "1px solid #f5f5f5" : "none",
                  cursor: "pointer", transition: "background .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {listing.listingPhotos?.[0] ? (
                  <img src={listing.listingPhotos[0]} alt="" style={{ width: 40, height: 40, borderRadius: 9, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: 9, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏠</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {listing.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    ₹{listing.price?.toLocaleString("en-IN")} · {listing.address?.city}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 500, flexShrink: 0,
                  background: status.bg, color: status.text,
                  padding: "2px 8px", borderRadius: 20,
                }}>
                  {status.label}
                </span>
              </div>
            );
          })}
          {filteredListings.length > 8 && (
            <div style={{ padding: "10px 16px", textAlign: "center", fontSize: 12, color: "#9ca3af", borderTop: "1px solid #f5f5f5" }}>
              +{filteredListings.length - 8} more listings
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardListingPanel;