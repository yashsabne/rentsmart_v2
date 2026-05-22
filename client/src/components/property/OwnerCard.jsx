// src/components/property/OwnerCard.jsx

const OwnerCard = ({ owner, C }) => {
  return (
 <div style={{ marginBottom: 24, borderRadius: 28, overflow: "hidden", background: "#fff", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 10px 35px rgba(0,0,0,0.06)" }}>

  {/* TOP */}
  <div style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>

    {/* AVATAR */}
    <div style={{ width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(135deg,#f5d365,#fda085)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, color: "#111", flexShrink: 0, boxShadow: "0 8px 18px rgba(253,160,133,0.22)" }}>
      {owner?.firstName?.[0] || "O"}
    </div>

    {/* INFO */}
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 4 }}>
        {owner?.name || `${owner?.firstName || ""} ${owner?.lastName || ""}`}
      </div>

      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: owner?.phone ? 5 : 0 }}>
        {owner?.email}
      </div>

      {owner?.phone && (
        <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
          {owner.phone}
        </div>
      )}
    </div>

 
  </div>

  {/* BODY */}
  <div style={{ padding: 22 }}>

    <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
      This is your property
    </div>

    <div style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.7, marginBottom: 20 }}>
      Manage your property professionally, increase listing visibility, and connect faster with serious buyers.
    </div>

    {/* BUTTONS */}
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>

      <button style={{ padding: "13px 18px", borderRadius: 16, border: "none", background: "linear-gradient(135deg,#f5d365,#fda085)", color: "#111", fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 20px rgba(253,160,133,0.18)" }}>
        Promote Listing
      </button>

      <button style={{ padding: "13px 18px", borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)", background: "#fff", color: "#111827", fontWeight: 700, cursor: "pointer" }}>
        Edit Property
      </button>

    </div>
  </div>
</div>
  );
};

export default OwnerCard;