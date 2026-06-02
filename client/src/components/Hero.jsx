import React, { useState } from "react"
import { C, stats, properties } from "../constants";
import { useNavigate } from "react-router-dom";

const Hero = () => {

  const [searchType, setSearchType] = useState("Rent");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", padding: "80px 48px 60px", overflow: "hidden" }}>


      {/* Backgrounds */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#FAFAF7 0%,#F0EDE4 55%,#E8E0D0 100%)", zIndex: 0 }} />
      <div className="hero-bg-circle" style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(200,169,110,0.13) 0%,transparent 70%)", zIndex: 0 }} />

      {/* Main content */}
      <div className="hero-content" style={{ position: "relative", zIndex: 1, maxWidth: 640, width: "100%" }}>

        {/* Badge */}
        <div className="a1 hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.goldLight, color: C.gold, padding: "6px 16px", borderRadius: 100, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 28 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, display: "inline-block" }} />
          India's Smartest Property Platform
        </div>

        {/* Heading */}
        <h1 className="a2 playfair hero-h1" style={{ fontSize: "clamp(2.8rem,6vw,4.6rem)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-1.5px", color: C.ink, marginBottom: 22 }}>
          Find Your<br />
          <em style={{ color: C.gold, fontStyle: "italic" }}>Perfect</em> Space<br />
          to Call Home
        </h1>

        {/* Description */}
        <p className="a3 hero-desc" style={{ fontSize: 16, color: C.inkMuted, lineHeight: 1.75, fontWeight: 300, maxWidth: 460, marginBottom: 36 }}>
          Discover thousands of verified properties to rent, buy, or invest in — across 320+ cities. Simple. Transparent. Smart.
        </p>

        {/* Search Bar */}
        <div className="a4 hero-search-bar" style={{ background: C.white, borderRadius: 18, boxShadow: "0 8px 40px rgba(0,0,0,0.11)", padding: 8, display: "flex", alignItems: "center", gap: 6, maxWidth: 580 }}>

          {/* Type switcher */}
          <div className="hero-type-switcher" style={{ display: "flex", background: "#F5F5F2", borderRadius: 12, padding: 3, gap: 2, flexShrink: 0 }}>
            {["Rent", "Sell"].map((t) => (
              <button key={t} onClick={() => setSearchType(t)}
                style={{ padding: "7px 16px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all .2s", background: searchType === t ? C.white : "transparent", color: searchType === t ? C.ink : C.inkMuted, boxShadow: searchType === t ? "0 1px 6px rgba(0,0,0,0.08)" : "none" }}>
                {t}
              </button>
            ))}
          </div>

          {/* Input */}
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city, locality or project..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13, color: C.ink, padding: "10px 8px", minWidth: 0 }} />

          {/* Search button */}
          <button
  className="hero-search-btn"
  style={{
    background: C.ink,
    color: "#fff",
    border: "none",
    padding: "11px 22px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 500,
    flexShrink: 0,
    transition: "background .2s",
    display: "flex",
    alignItems: "center",
    gap: 4
  }}

  onClick={() => {
navigate(
  `/search-for-property/${searchType.toLowerCase()}?type=${searchType.toLowerCase()}&search=${encodeURIComponent(searchQuery)}`
);
  }}

  onMouseEnter={e => e.currentTarget.style.background = C.gold}
  onMouseLeave={e => e.currentTarget.style.background = C.ink}
>
  🔍 Search
</button>
        </div>

        {/* Stats */}
        <div className="a5 hero-stats" style={{ display: "flex", gap: 0, marginTop: 44, flexWrap: "wrap" }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 32 }}>
              {i > 0 && <div className="hero-stat-divider" style={{ width: 1, height: 36, background: C.border, margin: "0 8px" }} />}
              <div>
                <div className="playfair hero-stat-value" style={{ fontSize: 26, fontWeight: 700, color: C.ink, letterSpacing: "-0.5px" }}>{s.value}</div>
                <div className="hero-stat-label" style={{ fontSize: 11, color: C.inkMuted, marginTop: 2, letterSpacing: "0.5px" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
 
      <div style={{ position: "absolute", right: 48, top: "50%", transform: "translateY(-50%)", display: "grid", gridTemplateColumns: "180px 140px", gridTemplateRows: "160px 160px 160px", gap: 12, zIndex: 1 }}
        className="hero-grid">
        {properties.slice(0, 3).map((p, i) => (
          <div key={p.id}
            style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", gridRow: i === 0 ? "span 2" : "auto", transition: "transform .3s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
            <img src={p.img} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ))}
      </div>

    </section>
  )
}

export default Hero;