import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../constants";
import Navbar from "../components/reuse/Navbar";
import Hero from "../components/Hero";
import { stats, steps } from "../constants";
import Footer from "../components/reuse/Footer";
import { API } from "../../apis";

export default function HomePage() {
  const [activeFilter, setActiveFilter]   = useState("All");
  const [searchQuery,  setSearchQuery]    = useState("");
  const [savedIds,     setSavedIds]       = useState([]);
  const [hoveredCard,  setHoveredCard]    = useState(null);
  const [hoveredStep,  setHoveredStep]    = useState(null);
  const [hoveredCat,   setHoveredCat]     = useState(null);
 
  const [properties,   setProperties]     = useState([]);
  const [loading,      setLoading]        = useState(true);
  const [user,         setUser]           = useState(null);
  const [sectionLabel, setSectionLabel]   = useState("Latest Listings");
  const [sectionSub,   setSectionSub]     = useState("Properties You'll Love");

  const navigate = useNavigate();
 
  useEffect(() => {
    const fetchUser = async () => {
      try { 
        const token = localStorage.getItem("token");
        if (!token) return; // Guest — skip preference fetch

        const res = await fetch(`${API.AUTH}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.log("User fetch failed:", err);
      }
    };
    fetchUser();
  }, []);

  // ── Fetch properties based on user preferences or fallback to latest ──
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);

        let url = "";

        if (user?.city || user?.preferences?.length > 0) {
          // Personalised fetch
          const params = new URLSearchParams();
          if (user.city)                        params.set("city",        user.city);
          if (user.preferences?.length > 0)     params.set("preferences", user.preferences.join(","));
          params.set("limit", "10");

          url = `${API.PROPERTY}/api/property/recommended?${params.toString()}`;

          setSectionLabel("Recommended for You");
          setSectionSub(
            user.preferences?.length > 0
              ? `Based on your interest in ${user.preferences.join(", ")} · ${user.city}`
              : `Top picks near you in ${user.city}`
          );
        } else { 
          url = `${API.PROPERTY}/api/property/search?limit=10`;
          setSectionLabel("Latest Listings");
          setSectionSub("Properties You'll Love");
        }

        const res  = await fetch(url);
        const data = await res.json();
        setProperties(Array.isArray(data) ? data.slice(0, 10) : []);
      } catch (err) {
        console.log("Properties fetch failed:", err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
 
    fetchProperties();
  }, [user]);

  const toggleSave = (id) =>
    setSavedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
 
  const filtered = properties.filter((p) => {
    const buyOrSell = p.buyOrSell?.toLowerCase();
    const mf =
      activeFilter === "All" ||
      (activeFilter === "Rent" && buyOrSell === "rent") ||
      (activeFilter === "Buy"  && buyOrSell === "sell");

    const searchLower = searchQuery.toLowerCase();
    const ms =
      !searchQuery ||
      p.title?.toLowerCase().includes(searchLower) ||
      p.address?.city?.toLowerCase().includes(searchLower) ||
      p.address?.street?.toLowerCase().includes(searchLower) ||
      p.category?.toLowerCase().includes(searchLower);

    return mf && ms;
  });

  const formattedPrice = (price, paymentType) => {
    if (!price) return "Price on Request";
    const formatted = `₹${price.toLocaleString("en-IN")}`;
    return paymentType === "monthly" ? `${formatted}/mo` : formatted;
  };

  const fullLocation = (address) =>
    [address?.street, address?.city].filter(Boolean).join(", ");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.cream, color: C.ink, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif !important; }
        .playfair { font-family: 'Playfair Display', serif !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        .a1 { animation: fadeUp .55s .05s both; }
        .a2 { animation: fadeUp .55s .15s both; }
        .a3 { animation: fadeUp .55s .25s both; }
        .a4 { animation: fadeUp .55s .35s both; }
        .a5 { animation: fadeUp .55s .45s both; }
        .prop-img {display:block; width:100%; height:100%; object-fit:cover; }
        
        a { text-decoration: none; }
        ul { list-style: none; }
        button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
        input { font-family: 'DM Sans', sans-serif; }

        /* Skeleton loader */
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #ede9e0 25%, #f5f2eb 50%, #ede9e0 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 10px;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── HERO ── */}
      <Hero />

 
 
      <section style={{ padding: "80px 48px", background: C.cream }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            {/* Personalisation badge */}
            {user?.preferences?.length > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.goldLight, border: `1px solid rgba(200,169,110,0.3)`, borderRadius: 100, padding: "4px 12px", marginBottom: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: C.gold, letterSpacing: 0.5 }}>
                  Personalised for {user.firstName}
                </span>
              </div>
            )}
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 10 }}>
              {sectionLabel}
            </p>
            <span className="playfair" style={{ fontSize: "clamp(1.8rem,3vw,1rem)", fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>
 
            
                <span style={{  fontWeight: 400, color: C.inkMuted, fontStyle: "italic" }}>
                  {sectionSub}
                </span>
           
            </span>
          </div>
          <a href="#" style={{ fontSize: 13, fontWeight: 500, color: C.inkMuted, borderBottom: `1px solid ${C.border}`, paddingBottom: 2 }}
            onMouseEnter={e => { e.target.style.color = C.ink; e.target.style.borderBottomColor = C.ink; }}
            onMouseLeave={e => { e.target.style.color = C.inkMuted; e.target.style.borderBottomColor = C.border; }}>
            See all →
          </a>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {["All", "Rent", "Buy"].map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              style={{ padding: "8px 22px", borderRadius: 100, border: `1.5px solid ${activeFilter === f ? C.ink : C.border}`, background: activeFilter === f ? C.ink : "transparent", color: activeFilter === f ? "#fff" : C.inkMuted, fontSize: 13, fontWeight: 500, transition: "all .2s" }}>
              {f}
            </button>
          ))}
        </div>

        {/* ── SKELETON LOADER ── */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 22 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}` }}>
                <div className="skeleton" style={{ height: 210 }} />
                <div style={{ padding: "18px 20px 20px" }}>
                  <div className="skeleton" style={{ height: 22, width: "50%", marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 16, width: "75%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 13, width: "55%", marginBottom: 18 }} />
                  <div style={{ display: "flex", gap: 14 }}>
                    <div className="skeleton" style={{ height: 12, width: 60 }} />
                    <div className="skeleton" style={{ height: 12, width: 60 }} />
                    <div className="skeleton" style={{ height: 12, width: 60 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: C.ink, marginBottom: 8 }}>No properties found</div>
            <div style={{ fontSize: 13, color: C.inkMuted }}>
              {searchQuery
                ? `No results for "${searchQuery}" — try a different search`
                : "Try adjusting your filters"}
            </div>
          </div>
        )}

        {/* ── PROPERTY CARDS ── */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 22 }}>
            {filtered.map((p) => {
              const isRent = p.buyOrSell?.toLowerCase() === "rent";
              return (
                <div key={p._id}
                  className="prop-card"
                  onClick={() => navigate(`/details/${p._id}`)}
                  onMouseEnter={() => setHoveredCard(p._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: hoveredCard === p._id ? "0 12px 40px rgba(0,0,0,0.12)" : C.cardShadow,cursor: "pointer" }}>

                  {/* Image */}
                  <div style={{ position: "relative", height: 210, overflow: "hidden", background: C.border }}>
                    {p.listingPhotos?.[0] ? (
                      <img src={p.listingPhotos[0]} alt={p.title} className="prop-img" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🏠</div>
                    )}

                    {/* Buy / Rent badge */}
                    <span style={{ position: "absolute", top: 12, left: 12, fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 100, background: isRent ? "rgba(34,100,60,0.88)" : "rgba(180,40,30,0.88)", color: "#fff", backdropFilter: "blur(6px)" }}>
                      For {p.buyOrSell}
                    </span>

                    {/* Featured badge */}
                    {p.promoted && (
                      <span style={{ position: "absolute", top: 12, left: isRent ? 80 : 70, fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 100, background: "rgba(200,169,110,0.9)", color: "#fff", backdropFilter: "blur(6px)" }}>
                        Featured
                      </span>
                    )}

                    {/* Save button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSave(p._id); }}
                      style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.12)"  }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                      {savedIds.includes(p._id) ? "❤️" : "🤍"}
                    </button>

                    {/* Category chip */}
                    <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: "rgba(0,0,0,0.5)", color: "#fff", backdropFilter: "blur(6px)", letterSpacing: 0.3 }}>
                      {p.category}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "18px 20px 20px" }}>
                    <div className="playfair" style={{ fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
                      {formattedPrice(p.price, p.paymentType)}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: 12, color: C.inkMuted, marginBottom: 14 }}>
                      📍 {fullLocation(p.address)}
                    </div>
                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {[
                        ["🛏", `${p.details?.bedroomCount ?? 0} Beds`],
                        ["🚿", `${p.details?.bathroomCount ?? 0} Baths`],
                        ["👥", `${p.details?.guestCount ?? 0} Guests`],
                      ].map(([icon, val]) => (
                        <span key={val} style={{ fontSize: 12, color: C.inkMuted, display: "flex", alignItems: "center", gap: 4 }}>
                          {icon} {val}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "#141414", padding: "80px 48px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Simple Process</p>
        <h2 className="playfair" style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2, marginBottom: 48 }}>
          How RentSmart Works
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20 }}>
          {steps.map((s, i) => (
            <div key={s.n}
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
              style={{ padding: "32px 26px", borderRadius: 20, border: `1px solid ${hoveredStep === i ? "rgba(200,169,110,0.45)" : "rgba(255,255,255,0.1)"}`, background: hoveredStep === i ? "rgba(255,255,255,0.05)" : "transparent"}}>
              <div className="playfair" style={{ fontSize: 52, fontWeight: 700, color: "rgba(200,169,110,0.3)", marginBottom: 18, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF", marginBottom: 10 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <div style={{ margin: "64px 48px", background: C.goldLight, border: `1px solid rgba(200,169,110,0.25)`, borderRadius: 28, padding: "60px 72px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>
        <h2 className="playfair" style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, color: C.ink, lineHeight: 1.2, maxWidth: 420 }}>
          Ready to list your <em style={{ color: C.gold, fontStyle: "italic" }}>property</em> with us?
        </h2>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ background: C.ink, color: "#fff", border: "none", padding: "13px 28px", borderRadius: 100, fontSize: 14, fontWeight: 500, transition: "background .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = C.gold}
            onMouseLeave={e => e.currentTarget.style.background = C.ink}>
            List for Free →
          </button>
          <button style={{ background: "transparent", color: C.ink, border: `1.5px solid ${C.ink}`, padding: "13px 28px", borderRadius: 100, fontSize: 14, fontWeight: 500, transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.ink; }}>
            Talk to an Agent
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}