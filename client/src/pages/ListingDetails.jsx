import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import ShareButton from "../components/ShareButton";
import { C, AMENITY_ICONS } from "../constants";
import ContactCard from "../components/property/ContactCard";
import { API } from "../../apis";
import "./styles/listingdetails.css"
import Footer from "../components/reuse/Footer";

const tabs = ["Overview", "Amenities", "Location", "Similar"];



export default function ListingDetails() {
  const [scrolled, setScrolled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [hoveredSim, setHoveredSim] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarProperties, setSimilarProperties] = useState([]);

  const [owner, setOwner] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);


  const { id } = useParams();
  const navigate = useNavigate();


  const token = localStorage.getItem("token");


  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) { setCurrentUser(JSON.parse(storedUser)); return; }
        const res = await fetch(`${API.AUTH}/api/auth/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setCurrentUser(data);
      } catch (err) { console.log(err); }
    };
    fetchUser();
  }, []);

  const isOwner = currentUser?._id === property?.creatorId;

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API.PROPERTY}/api/property/details/${id}`);
        const data = await res.json();
        setProperty(data);
      } catch (err) {
        console.log(err);
      }
      finally { setLoading(false); }
    };
    fetchProperty();
  }, [id]);

  const fetchSimilar = async (cursorVal = null) => {
    setLoadingMore(true); 
const url = `${API.PROPERTY}/api/property/similar?category=${property?.category}&type=${property?.buyOrSell}&excludeId=${id}`;
    const res = await fetch(url);
    const data = await res.json(); 
    setSimilarProperties(prev => cursorVal ? [...prev, ...data.listings] : data.listings);
    setHasMore(data.hasMore);
    setCursor(data.nextCursor);
    setLoadingMore(false);
  };

useEffect(() => { 
  if (property?._id && property?.category && property?.buyOrSell) {
    fetchSimilar();
  }
}, [property?._id, property?.category, property?.buyOrSell]);


  useEffect(() => {
    if (!property?.creatorId) return;
    const fetchOwner = async () => {
      try {
        setOwnerLoading(true);
        const res = await fetch(`${API.AUTH}/api/auth/user/${property.creatorId}`);
        const data = await res.json();
        setOwner(data);
      } catch (err) { console.log("Owner fetch failed:", err); }
      finally { setOwnerLoading(false); }
    };
    fetchOwner();
  }, [property?.creatorId]);



  useEffect(() => {
    if (!lightboxOpen) return;
    const total = property?.listingPhotos?.length ?? 0;
    const handler = (e) => {
      if (e.key === "ArrowRight") setLightboxIdx((i) => Math.min(i + 1, total - 1));
      if (e.key === "ArrowLeft") setLightboxIdx((i) => Math.max(i - 1, 0));
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, property?.listingPhotos?.length]);

  const handleSend = async () => {
    try {
      if (!message.trim()) return;

      if (!currentUser?._id) {
        throw new Error("Please login first");
      }

      if (!owner?._id) {
        throw new Error("Owner information not found");
      }

      if (!property?._id) {
        throw new Error("Property information not found");
      }

      const payload = {
        propertyId: property._id,
        propertyTitle: property.title,

        propertyImage:
          property.listingPhotos?.[0] ||
          "https://via.placeholder.com/300x200",

        propertyLocation:
          property.location ||
          `${property.address?.city || ""}, ${property.address?.country || ""}`,

        propertyPrice: String(property.price || ""),

        owner: {
          userId: owner._id,

          fullName:
            `${owner.firstName || ""} ${owner.lastName || ""}`.trim(),

          email: owner.email || "",

          avatar:
            owner.avatar ||
            owner.profilePicture ||
            "",
        },

        text: message.trim(),
      };


      const response = await fetch(
        `${import.meta.env.VITE_CHAT_API}/conversations/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.errors?.[0]?.msg ||
          "Failed to start chat"
        );
      }

      setSent(true);

      if (data?.conversationSlug) {
        navigate(
          `/dashboard/messages/${data.conversationSlug}`
        );
      } else {
        console.error(
          "conversationSlug missing:",
          data
        );
        throw new Error(
          "Conversation created but slug missing"
        );
      }
    } catch (err) {
      console.error("Chat Error:", err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🏠</div>
          <div style={{ fontSize: 16, color: C.inkMuted, fontWeight: 500 }}>Loading property details...</div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>😕</div>
          <div style={{ fontSize: 16, color: C.inkMuted }}>Property not found.</div>
          <button onClick={() => navigate("/")} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 100, border: "none", background: C.ink, color: "#fff", cursor: "pointer", fontSize: 14 }}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const images = property.listingPhotos || [];
  const isRent = property.buyOrSell?.toLowerCase() === "rent";

  const highlights = [
    { label: "Property Type", value: property.type || "—" },
    { label: "Category", value: property.category || "—" },
    { label: "Bedrooms", value: property.details?.bedroomCount ?? "—" },
    { label: "Bathrooms", value: property.details?.bathroomCount ?? "—" },
    { label: "Beds", value: property.details?.bedCount ?? "—" },
    { label: "Balconies", value: property.details?.balconyCount ?? "—" },
    { label: "Max Guests", value: property.details?.guestCount ?? "—" },
    { label: "Area", value: property.details?.area ? `${property.details.area} sqft` : "—" },
    { label: "Floor", value: property.details?.floorNumber !== undefined && property.details?.totalFloors !== undefined ? `${property.details.floorNumber} / ${property.details.totalFloors}` : "—" },
    { label: "Furnishing", value: property.details?.furnishing || "—" },
    { label: "Facing", value: property.details?.facing || "—" },
    { label: "Property Age", value: property.details?.propertyAge ? `${property.details.propertyAge} years` : "—" },
    { label: "Car Parking", value: property.details?.parking?.car ?? 0 },
    { label: "Bike Parking", value: property.details?.parking?.bike ?? 0 },
    { label: "Listing Type", value: `For ${property.buyOrSell}` },
    { label: "Payment", value: property.paymentType === "one-time" ? "One-time" : property.paymentType === "monthly" ? "Monthly" : property.paymentType || "—" },
    { label: "Price", value: property.price ? `₹${Number(property.price).toLocaleString("en-IN")}` : "—" },
    { label: "Deposit", value: property.deposit ? `₹${Number(property.deposit).toLocaleString("en-IN")}` : "—" },
    { label: "Maintenance", value: property.maintenance ? `₹${Number(property.maintenance).toLocaleString("en-IN")}/mo` : "—" },
    { label: "Negotiable", value: property.negotiable ? "Yes" : "No" },
    { label: "City", value: property.address?.city || "—" },
    { label: "Country", value: property.address?.country || "—" },
    { label: "Pincode", value: property.address?.pincode || "—" },
  ];

  const amenitiesList = (property.amenities || []).map((a) => ({
    label: a,
    icon: AMENITY_ICONS[a] || "✨",
  }));

  const formattedPrice = property.price
    ? `₹${property.price.toLocaleString("en-IN")}`
    : "Price on Request";

  const fullAddress = [
    property.address?.street,
    property.address?.aptSuite,
    property.address?.city,
    property.address?.country,
    property.address?.pincode,
  ].filter(Boolean).join(", ");

  return (
    <>
      <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif", color: C.ink }}>


        {/* ── NAVBAR ── */}
        <nav className="nav-inner" style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 48px", height: 64,
          background: scrolled ? "rgba(250,250,247,0.96)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? `1px solid ${C.border}` : "none",
          boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.05)" : "none",
          transition: "all .3s",
        }}>
          <a href="/" className="pf" style={{ fontSize: 21, fontWeight: 700, color: C.ink, flexShrink: 0 }}>
            Rent<span style={{ color: C.gold }}>Smart</span>
          </a>
          <div className="nav-breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.inkMuted, overflow: "hidden" }}>
            <a href="/" style={{ color: C.inkMuted, whiteSpace: "nowrap" }} onMouseEnter={e => e.target.style.color = C.ink} onMouseLeave={e => e.target.style.color = C.inkMuted}>Home</a>
            <span style={{ color: C.border }}>›</span>
            <a href="#" style={{ color: C.inkMuted, whiteSpace: "nowrap" }} onMouseEnter={e => e.target.style.color = C.ink} onMouseLeave={e => e.target.style.color = C.inkMuted}>{property.address?.city || "Listings"}</a>
            <span style={{ color: C.border }}>›</span>
            <span style={{ color: C.ink, fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{property.title}</span>
          </div>
        </nav>

        {/* ── IMAGE GALLERY ── */}
        <div style={{ paddingTop: 64 }}>
          {images.length > 0 ? (
            <>
              <div className="gal-wrap">
                {/* ── MOSAIC ── */}
                <div style={{ position: "relative" }}>
                  <div className="gal-mosaic">
                    {/* HERO */}
                    <div className="gal-cell gal-cell-hero" onClick={() => { setLightboxOpen(true); setLightboxIdx(0); }}>
                      <img src={images[0]} alt="Hero view" loading="eager" />
                      <div className="gal-hero-badge">
                        <div className="gal-hero-dot" />
                        Premium Property
                      </div>
                    </div>
                    {/* TOP ROW thumbnails: slots 1–2 */}
                    {images.slice(1, 3).map((img, i) => (
                      <div key={i} className="gal-cell" onClick={() => { setLightboxOpen(true); setLightboxIdx(i + 1); }}>
                        <img src={img} alt={`View ${i + 2}`} loading="lazy" />
                      </div>
                    ))}
                    {/* BOTTOM ROW thumbnails: slots 3–4 */}
                    {images.slice(3, 5).map((img, i) => (
                      <div key={i + 3} className="gal-cell" onClick={() => { setLightboxOpen(true); setLightboxIdx(i + 3); }}>
                        <img src={img} alt={`View ${i + 4}`} loading="lazy" />
                        {i === 1 && images.length > 5 && (
                          <div className="gal-more-overlay" onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); setLightboxIdx(4); }}>
                            <div className="gal-more-count">+{images.length - 4}</div>
                            <div className="gal-more-label">Photos</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {images.length > 1 && (
                    <button className="gal-view-all" onClick={() => { setLightboxOpen(true); setLightboxIdx(0); }}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="1" y="1" width="6" height="6" rx="1.2" />
                        <rect x="9" y="1" width="6" height="6" rx="1.2" />
                        <rect x="1" y="9" width="6" height="6" rx="1.2" />
                        <rect x="9" y="9" width="6" height="6" rx="1.2" />
                      </svg>
                      View all {images.length} photos
                    </button>
                  )}
                </div>

                {/* ── THUMBNAIL STRIP RAIL ── */}
                <div>
                  <div className="gal-strip-wrap">
                    {images.map((img, i) => (
                      <div key={i}
                        className={`gal-strip-thumb${lightboxIdx === i && lightboxOpen ? " gal-active" : ""}`}
                        onClick={() => { setLightboxOpen(true); setLightboxIdx(i); }}>
                        <img src={img} alt={`thumb-${i}`} loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── LIGHTBOX ── */}
              {lightboxOpen && (
                <div className="lb-wrap" onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false); }}>
                  <div className="lb-topbar">
                    <div className="lb-title-pill">
                      <div className="lb-title-dot" />
                      {property.title}
                    </div>
                    <div className="lb-topbar-right">
                      <div className="lb-counter-pill">
                        {String(lightboxIdx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                      </div>
                      <button className="lb-close-btn" onClick={() => setLightboxOpen(false)}>✕</button>
                    </div>
                  </div>
                  <div className="lb-progress">
                    <div className="lb-progress-fill" style={{ width: `${((lightboxIdx + 1) / images.length) * 100}%` }} />
                  </div>
                  <div className="lb-img-frame">
                    <img key={lightboxIdx} className="lb-img" src={images[lightboxIdx]} alt={`Photo ${lightboxIdx + 1}`} />
                    <button className={`lb-arrow lb-arrow-prev${lightboxIdx === 0 ? " lb-arrow-disabled" : ""}`} onClick={() => setLightboxIdx((i) => Math.max(i - 1, 0))}>‹</button>
                    <button className={`lb-arrow lb-arrow-next${lightboxIdx === images.length - 1 ? " lb-arrow-disabled" : ""}`} onClick={() => setLightboxIdx((i) => Math.min(i + 1, images.length - 1))}>›</button>
                  </div>
                  <div className="lb-thumb-rail">
                    {images.map((img, i) => (
                      <div key={i} className={`lb-lbthumb${i === lightboxIdx ? " lb-active" : ""}`} onClick={() => setLightboxIdx(i)}>
                        <img src={img} alt={`lb-thumb-${i}`} loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ height: 500, background: "#1a1a1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <span style={{ fontSize: 52 }}>🏠</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.5px" }}>No images available</span>
            </div>
          )}
        </div>

        {/* ── BODY ── */}
        <div className="body-outer" style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 32px 80px" }}>
          <div className="body-grid" style={{ display: "grid", gridTemplateColumns: "1fr 356px", gap: 32, alignItems: "start" }}>

            {/* ── LEFT COLUMN ── */}
            <div>
              {/* Title row */}
              <div className="fu" style={{ marginBottom: 24 }}>
                <div className="title-row" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 12px", borderRadius: 100, background: isRent ? C.greenBg : C.goldLight, color: isRent ? C.green : C.gold }}>
                        For {property.buyOrSell}
                      </span>
                      {property.promoted && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 12px", borderRadius: 100, background: C.goldLight, color: C.gold }}>Featured</span>
                      )}
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 12px", borderRadius: 100, background: C.border, color: C.inkMuted }}>{property.category}</span>
                    </div>
                    <h1 className="pf" style={{ fontSize: "clamp(1.6rem,3vw,2.6rem)", fontWeight: 700, color: C.ink, lineHeight: 1.15, marginBottom: 8 }}>
                      {property.title}
                    </h1>
                    <p style={{ fontSize: 11, color: C.inkMuted, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                      📍 {fullAddress}
                    </p>
                  </div>
                  <div className="price-block" style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="pf price-text" style={{ fontSize: "2rem", fontWeight: 700, color: C.ink }}>{formattedPrice}</div>
                    <div style={{ fontSize: 13, color: C.inkMuted }}>
                      {property.paymentType === "monthly" ? "per month" : property.paymentType === "one-time" ? "one-time payment" : property.paymentType || ""}
                    </div>
                    {isRent && (
                      <div style={{ fontSize: 12, color: C.inkLight, marginTop: 4 }}>+ security deposit may apply</div>
                    )}
                  </div>
                </div>

                {/* Quick meta strip */}
                <div className="meta-strip" style={{ display: "flex", gap: 24, padding: "16px 20px", background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, flexWrap: "wrap" }}>
                  {[
                    ["🛏", `${property.details?.bedroomCount ?? 0} Bedrooms`],
                    ["🚿", `${property.details?.bathroomCount ?? 0} Bathrooms`],
                    ["🛌", `${property.details?.bedCount ?? 0} Beds`],
                    ["👥", `${property.details?.guestCount ?? 0} Guests`],
                    ["🏢", property.category],
                  ].map(([icon, val]) => (
                    <div key={val} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: C.ink, fontWeight: 500 }}>
                      <span style={{ fontSize: 16 }}>{icon}</span> {val}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── TABS ── */}
              <div className="tab-bar" style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: `1px solid ${C.border}` }}>
                {tabs.map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{ padding: "10px 20px", border: "none", background: "none", fontSize: 14, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? C.ink : C.inkMuted, borderBottom: activeTab === tab ? `2.5px solid ${C.gold}` : "2.5px solid transparent", marginBottom: -1, transition: "all .2s" }}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* ── OVERVIEW TAB ── */}
              {activeTab === "Overview" && (
                <div className="fu">
                  <div className="card-inner" style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "26px 28px", marginBottom: 22, boxShadow: C.cardShadow }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 14 }}>About this Property</h2>
                    <p style={{ fontSize: 14, color: C.inkMuted, lineHeight: 1.8, marginBottom: 12 }}>{property.description}</p>
                    {property.highlight && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "14px 16px", background: C.goldLight, borderRadius: 12, marginTop: 16 }}>
                        <span style={{ fontSize: 18 }}>⭐</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 4 }}>{property.highlight}</div>
                          <div style={{ fontSize: 13, color: C.inkMuted }}>{property.highlightDesc}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card-inner" style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "26px 28px", boxShadow: C.cardShadow }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 20 }}>Property Highlights</h2>
                    <div className="highlights-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                      {highlights.map((h, i) => (
                        <div key={h.label} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "13px 0",
                          borderBottom: i < highlights.length - 2 ? `1px solid ${C.border}` : "none",
                          paddingRight: i % 2 === 0 ? 24 : 0,
                          paddingLeft: i % 2 === 1 ? 24 : 0,
                          borderLeft: i % 2 === 1 ? `1px solid ${C.border}` : "none",
                        }}>
                          <span style={{ fontSize: 13, color: C.inkMuted }}>{h.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{String(h.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── AMENITIES TAB ── */}
              {activeTab === "Amenities" && (
                <div className="fu card-inner" style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "26px 28px", boxShadow: C.cardShadow }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 22 }}>What this place offers</h2>
                  {amenitiesList.length > 0 ? (
                    <div className="amenities-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                      {amenitiesList.map((a) => (
                        <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: C.cream, borderRadius: 12, border: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 20 }}>{a.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{a.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 14, color: C.inkMuted }}>No amenities listed for this property.</p>
                  )}
                </div>
              )}

              {/* ── LOCATION TAB ── */}
              {activeTab === "Location" && (
                <div className="fu">
                  <div className="card-inner" style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "26px 28px", boxShadow: C.cardShadow, marginBottom: 20 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 6 }}>Location</h2>
                    <p style={{ fontSize: 13, color: C.inkMuted, marginBottom: 20 }}>{fullAddress}</p>
                    <div style={{ height: 280, borderRadius: 14, overflow: "hidden", background: "linear-gradient(135deg,#e8f4f8,#d4e8e0)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 36, marginBottom: 12 }}>🗺️</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: C.inkMuted }}>{property.address?.city}, {property.address?.country}</span>
                      <span style={{ fontSize: 12, color: C.inkLight, marginTop: 4 }}>Integrate Google Maps here</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SIMILAR TAB ── */}
              {activeTab === "Similar" && (
                <div className="fu" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>Similar Properties</h2>

                  {similarProperties?.length === 0 && !loadingMore ? (
                    <p style={{ fontSize: 14, color: C.inkMuted }}>No similar properties found.</p>
                  ) : (
                    <>
                      {similarProperties.map((p) => (
                        <div key={p._id}
                          className="sim-card"
                          onClick={() => navigate(`/details/${p._id}`)}
                          onMouseEnter={() => setHoveredSim(p._id)}
                          onMouseLeave={() => setHoveredSim(null)}
                          style={{ display: "flex", background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: hoveredSim === p._id ? "0 8px 28px rgba(0,0,0,0.1)" : C.cardShadow, transform: hoveredSim === p._id ? "translateY(-3px)" : "none", transition: "all .25s", cursor: "pointer" }}>
                          <div className="sim-thumb" style={{ width: 140, height: 120, flexShrink: 0, overflow: "hidden", background: C.border }}>
                            {p.listingPhotos?.[0] ? (
                              <img src={p.listingPhotos[0]} alt={p.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s", transform: hoveredSim === p._id ? "scale(1.06)" : "scale(1)" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🏠</div>
                            )}
                          </div>
                          <div className="sim-body" style={{ padding: "16px", flex: 1 }}>
                            <div className="pf" style={{ fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
                              ₹{p.price?.toLocaleString("en-IN")}
                              <span style={{ fontSize: 12, fontWeight: 400, color: C.inkMuted, marginLeft: 4 }}>
                                {p.paymentType === "monthly" ? "/mo" : ""}
                              </span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 4 }}>{p.title}</div>
                            <div style={{ fontSize: 12, color: C.inkMuted, marginBottom: 10 }}>
                              📍 {[p.address?.street, p.address?.city].filter(Boolean).join(", ")}
                            </div>
                            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 12, color: C.inkMuted }}>🛏 {p.details?.bedroomCount ?? 0} Bed</span>
                              <span style={{ fontSize: 12, color: C.inkMuted }}>🚿 {p.details?.bathroomCount ?? 0} Bath</span>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: C.goldLight, color: C.gold }}>{p.category}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {hasMore && (
                        <button
                          onClick={() => fetchSimilar(cursor)}
                          disabled={loadingMore}
                          style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, color: C.ink, fontSize: 14, fontWeight: 500, cursor: loadingMore ? "not-allowed" : "pointer", opacity: loadingMore ? 0.6 : 1, transition: "all .2s" }}>
                          {loadingMore ? "Loading..." : "Load more similar properties"}
                        </button>
                      )}

                      {loadingMore && similarProperties.length === 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {[1, 2, 3].map(i => (
                            <div key={i} style={{ height: 120, borderRadius: 16, background: C.border, opacity: 0.4, animation: "pulse 1.5s infinite" }} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── CONTACT CARD ── */}
            <div className="contact-sticky" style={{ position: "sticky", top: 80 }}>
              <ContactCard
                isOwner={isOwner}
                owner={owner}
                property={property}
                currentUser={currentUser}
                message={message}
                setMessage={setMessage}
                sent={sent}
                handleSend={handleSend}
                C={C}
                token={token}
                onPropertyUpdate={(updatedListing) =>
                  setProperty((prev) => ({ ...prev, ...updatedListing }))
                }

              />
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}