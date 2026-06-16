import { C } from "../constants";
export function Avatar({ initials, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: C.goldLight, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}
// Replace / update the StatusBadge export in dashFunction.jsx

export const StatusBadge = ({ status }) => {
  // Normalise — schema stores "AVAILABLE"/"RENTED"/"SOLD",
  // but DashboardListingPanel also passes "Active"/"Paused" legacy strings
  const normalised = (status || "").toUpperCase();

  const config = {
    AVAILABLE: { label: "Available", bg: "#EAF3DE", color: "#3B6D11" },
    ACTIVE: { label: "Available", bg: "#EAF3DE", color: "#3B6D11" }, // legacy alias
    RENTED: { label: "Rented", bg: "#EEEDFE", color: "#26215C" },
    SOLD: { label: "Sold", bg: "#F3F4F6", color: "#6B7280" },
    PAUSED: { label: "Paused", bg: "#FEF3C7", color: "#92400E" }, // legacy alias
  }[normalised] || { label: status || "Unknown", bg: "#F3F4F6", color: "#6B7280" };

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 100,
        background: config.bg,
        color: config.color,
        letterSpacing: "0.2px",
      }}
    >
      {config.label}
    </span>
  );
};

export const formatPrice = (price, paymentType) => {
  if (!price) return "Price on Request";
  const f = `₹${Number(price).toLocaleString("en-IN")}`;
  return paymentType === "monthly" ? `${f}/mo` : f;
};

export const fullLocation = (address) =>
  [address?.street, address?.city].filter(Boolean).join(", ") || "—";

export const userInitials = (user) => {
  if (!user) return "??";
  return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
};


export const formattedPrice = (price, paymentType) => {
  if (!price) return "Price on Request";
  const formatted = `₹${price.toLocaleString("en-IN")}`;
  return paymentType === "monthly" ? `${formatted}/mo` : formatted;
};
