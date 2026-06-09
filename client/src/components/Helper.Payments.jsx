export const t = {
  bg: "#ffffff",
  surface: "#f7f8fa",
  surfaceHover: "#f0f2f5",
  border: "#eaecf0",
  accent: "#2563eb",
  accentBg: "#eff4ff",
  green: "#16a34a",
  greenBg: "#dcfce7",
  amber: "#b45309",
  amberBg: "#fef3c7",
  red: "#dc2626",
  redBg: "#fee2e2",
  text: "#0f172a",
  textMid: "#475569",
  textMuted: "#94a3b8",
  radius: "12px",
  radiusSm: "8px",
  shadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.08)",
};


export const STYLES = `
  .ph-wrap { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; }
  .ph-cards { display: flex; gap: 12px; flex-wrap: wrap; }
  .ph-card { flex: 1 1 140px; min-width: 130px; }
  .ph-row { display: flex; align-items: flex-start; gap: 14px; padding: 16px 0; border-bottom: 1px solid ${t.border}; }
  .ph-row:last-child { border-bottom: none; }
  .ph-row-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
  .ph-tabs { display: flex; border-bottom: 2px solid ${t.border}; margin-bottom: 20px; gap: 4px; }
  .ph-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; gap: 8px; }
  .ph-pg-pages { display: flex; gap: 4px; align-items: center; }

  @media (max-width: 600px) {
    .ph-wrap { padding: 20px 16px !important; }
    .ph-row { gap: 10px; }
    .ph-amount { display: none; }
    .ph-amount-inline { display: block !important; }
    .ph-header { flex-direction: column; align-items: flex-start !important; gap: 6px; }
    .ph-pagination { flex-wrap: wrap; justify-content: center; }
    .ph-pg-pages { flex-wrap: wrap; justify-content: center; }
  }
`;


export function StatusBadge({ status }) {
  const map = {
    paid:    { bg: t.greenBg, color: t.green,   label: "Paid" },
    pending: { bg: t.amberBg, color: t.amber,   label: "Pending" },
    failed:  { bg: t.redBg,   color: t.red,     label: "Failed" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.3px",
      padding: "3px 9px", borderRadius: 20, textTransform: "uppercase",
    }}>
      {s.label}
    </span>
  );
}

 
 


export function Chip({ label, color = t.textMid, bg = t.surface }) {
  return (
    <span style={{
      background: bg, color,
      fontSize: 11, fontWeight: 500,
      padding: "3px 9px", borderRadius: 20,
    }}>
      {label}
    </span>
  );
}

export function SummaryCard({ icon, label, value }) {
  return (
    <div className="ph-card" style={{
      background: t.surface, borderRadius: t.radius,
      padding: "12px 16px", display: "flex", gap: 6,
      border: `1px solid ${t.border}`,
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div style={{ display: "flex", flexDirection: "column"}} >
      <span style={{ fontSize: 20, fontWeight: 600, color: t.text, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 400 }}>{label}</span>
      </div>
    </div>
  );
}

export function RowIcon({ emoji, bg }) {
  return (
    <div style={{
      width: 42, height: 42, borderRadius: t.radiusSm,
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0, fontSize: 18,
    }}>
      {emoji}
    </div>
  );
}

export function Amount({ amount, visible = true }) {
  return (
    <div className="ph-amount" style={{
      textAlign: "right", flexShrink: 0,
      display: visible ? undefined : "none",
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>₹{amount}</div>
      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>paid</div>
    </div>
  );
}

export function fmtDate(iso, opts = { day: "numeric", month: "short", year: "numeric" }) {
  return new Date(iso).toLocaleDateString("en-IN", opts);
}
 
export function ContactRow({ item }) {
  return (
    <div className="ph-row">
      <RowIcon emoji="📞" bg={t.accentBg} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.propertyTitle || "—"}
        </div>
        {(item.ownerName || item.ownerPhone) && (
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>
            {item.ownerName && <span>{item.ownerName}</span>}
            {item.ownerPhone && <span style={{ marginLeft: 6 }}>· {item.ownerPhone}</span>}
          </div>
        )}
        <div className="ph-row-meta">
          <StatusBadge status={item.status} />
          <Chip label="Contact Reveal" />
          <span style={{ fontSize: 11, color: t.textMuted }}>{fmtDate(item.createdAt)}</span>
          {/* mobile-only inline amount */}
          <span className="ph-amount-inline" style={{ display: "none", fontSize: 13, fontWeight: 700, color: t.text, marginLeft: "auto" }}>
            ₹{item.amount}
          </span>
        </div>
      </div>
      <Amount amount={item.amount} />
    </div>
  );
}

export function PromotionRow({ item }) {
  const isLive = item.expiresAt && new Date(item.expiresAt) > new Date();
  const expires = item.expiresAt ? fmtDate(item.expiresAt, { day: "numeric", month: "short" }) : null;

  return (
    <div className="ph-row">
      <RowIcon emoji="⭐" bg="#fff8e6" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.propertyTitle || "—"}
        </div>
        {expires && (
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>
            {isLive ? `Active · expires ${expires}` : `Expired ${expires}`}
          </div>
        )}
        <div className="ph-row-meta">
          <StatusBadge status={item.status} />
          <Chip label="Promotion" />
          {isLive && <Chip label="● Live" color={t.green} bg={t.greenBg} />}
          <span style={{ fontSize: 11, color: t.textMuted }}>{fmtDate(item.createdAt)}</span>
          <span className="ph-amount-inline" style={{ display: "none", fontSize: 13, fontWeight: 700, color: t.text, marginLeft: "auto" }}>
            ₹{item.amount}
          </span>
        </div>
      </div>
      <Amount amount={item.amount} />
    </div>
  );
}
 
export function Skeleton() {
  return (
    <div>
      {[1, 2, 3].map(i => (
        <div key={i} className="ph-row" style={{ opacity: 0.5 }}>
          <div style={{ width: 42, height: 42, borderRadius: t.radiusSm, background: t.surface }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ height: 14, width: "60%", borderRadius: 6, background: t.surface }} />
            <div style={{ height: 11, width: "35%", borderRadius: 6, background: t.surface }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
      <div style={{ fontWeight: 600, color: t.text, fontSize: 15, marginBottom: 4 }}>Something went wrong</div>
      <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 16 }}>{message}</div>
      <button onClick={onRetry} style={{
        background: t.text, color: "#fff", border: "none",
        borderRadius: t.radiusSm, padding: "9px 22px",
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        letterSpacing: "0.2px",
      }}>
        Try again
      </button>
    </div>
  );
}

export function EmptyState({ tab }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 24px" }}>
      <div style={{
        width: 60, height: 60, borderRadius: "50%",
        background: t.surface, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 26, margin: "0 auto 14px",
      }}>
        {tab === "contacts" ? "📞" : "⭐"}
      </div>
      <div style={{ fontWeight: 600, color: t.text, fontSize: 15, marginBottom: 6 }}>
        No {tab === "contacts" ? "contact reveals" : "promotions"} yet
      </div>
      <div style={{ fontSize: 13, color: t.textMuted, maxWidth: 280, margin: "0 auto" }}>
        {tab === "contacts"
          ? "Contact reveals will appear here once you unlock an owner's details."
          : "Promoted listings will appear here once you boost a property."}
      </div>
    </div>
  );
}
 
export function Pagination({ page, totalPages, onPrev, onNext }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className="ph-pagination">
      <button
        onClick={onPrev} disabled={page <= 1}
        style={pgBtn(page <= 1)}
      >
        ← Prev
      </button>

      <div className="ph-pg-pages">
        {visible.reduce((acc, p, idx) => {
          if (idx > 0 && p - visible[idx - 1] > 1) {
            acc.push(<span key={`dots-${p}`} style={{ fontSize: 13, color: t.textMuted, padding: "0 4px" }}>…</span>);
          }
          acc.push(
            <button key={p} style={{
              ...pgBtn(false),
              background: p === page ? t.text : "none",
              color: p === page ? "#fff" : t.textMid,
              borderColor: p === page ? t.text : t.border,
              minWidth: 36,
            }}>
              {p}
            </button>
          );
          return acc;
        }, [])}
      </div>

      <button
        onClick={onNext} disabled={page >= totalPages}
        style={pgBtn(page >= totalPages)}
      >
        Next →
      </button>
    </div>
  );
}

export function pgBtn(disabled) {
  return {
    background: "none", border: `1px solid ${t.border}`,
    borderRadius: t.radiusSm, padding: "7px 16px",
    fontSize: 13, fontWeight: 500, cursor: disabled ? "default" : "pointer",
    color: disabled ? t.textMuted : t.textMid,
    opacity: disabled ? 0.5 : 1,
    transition: "background 0.12s, color 0.12s",
  };
}