import { C } from "../constants";
export function Avatar({ initials, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: C.goldLight, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

 export function StatusBadge({ status }) {
  const map = {
    Active: { bg: C.greenBg, color: C.green },
    Approved: { bg: C.greenBg, color: C.green },
    Paused: { bg: "#FFF3E0", color: "#E67E22" },
    Pending: { bg: C.blueBg, color: C.blue },
    Rejected: { bg: C.redBg, color: C.red },
  };
  const s = map[status] || { bg: C.border, color: C.inkMuted };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}


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


export  const formattedPrice = (price, paymentType) => {
    if (!price) return "Price on Request";
    const formatted = `₹${price.toLocaleString("en-IN")}`;
    return paymentType === "monthly" ? `${formatted}/mo` : formatted;
  };
