
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ShareButton from "../components/ShareButton";
import ContactCard from "../components/property/ContactCard";
import { API } from "../../apis";
 
const tabs = ["Overview", "Amenities", "Location", "Similar"];

const AMENITY_ICONS = {
  "Lift": "🛗",
  "Air Conditioning": "❄️",
  "Security": "🔒",
  "Parking": "🅿️",
  "Swimming Pool": "🏊",
  "Garden": "🌿",
  "Gym": "🏋️",
  "Wifi": "📶",
  "Meals Included": "🍽️",
  "Laundry": "🧺",
  "Conference Room": "📊",
  "Terrace": "🏙️",
  "24/7 Security": "👮",
  "CCTV": "📷",
  "Power Backup": "🔋",
  "Generator": "⚡",
  "Clubhouse": "🏛️",
  "Children's Play Area": "🛝",
  "Housekeeping": "🧹",
  "Loading Dock": "🚚",
  "Beach Access": "🏖️",
  "BBQ Area": "🔥",
  "Cafeteria": "☕",
  "24/7 Access": "🕐",
  "Lawn": "🌱",
  "Kitchen Exhaust": "🍳",
  "Water Purifier": "💧",
  "Rooftop Lounge": "🌆",
  "Wide Roads": "🛣️",
  "Main Road Facing": "📍",
  "Corner Plot": "📐",
  "HMDA Approved": "✅",
  "BMRDA Approved": "✅",
  "Gated Community": "🚪",
};

export default function ListingDetails() {
  // ── ALL STATE ──
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



  const { id } = useParams();
  const navigate = useNavigate();

  const C = {
  cream: "#FAFAF7",
  white: "#FFFFFF",
  ink: "#141414",
  inkMuted: "#6B6B6B",
  inkLight: "#9A9A9A",
  gold: "#C8A96E",
  goldLight: "#F5EDD8",
  border: "#E8E8E3",
  green: "#2D6A4F",
  greenBg: "#EAF4EE",
  red: "#C0392B",
  cardShadow: "0 2px 16px rgba(0,0,0,0.07)",
};


  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => {

    const fetchUser = async () => {
      try {

        // First check localStorage
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
          return;
        }
 
        const res = await fetch(
          `${API.AUTH}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!res.ok) {
          return;
        }

        const data = await res.json();
 

        setCurrentUser(data);

      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, []);


  const isOwner =
    currentUser?._id === property?.creatorId;
   
  useEffect(() => {
    

    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API.PROPERTY}/api/property/details/${id}`);
        const data = await res.json();

        setProperty(data);

        const simRes = await fetch(
          `${API.PROPERTY}/api/property/search?type=${data.buyOrSell}&search=${data.category}`
        );
        const simData = await simRes.json();
        setSimilarProperties(simData.filter((p) => p._id !== data._id));
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (!property?.creatorId) return;
    const fetchOwner = async () => {
      try {
        setOwnerLoading(true);
        const res = await fetch(`${API.AUTH}/api/auth/user/${property.creatorId}`);
        const data = await res.json();
        setOwner(data);
      } catch (err) {
        console.log("Owner fetch failed:", err);
      } finally {
        setOwnerLoading(false);
      }
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

  // ── HANDLERS ──
  const handleSend = () => {
    if (message.trim()) {
      setSent(true);
      setMessage("");
      setTimeout(() => setSent(false), 3000);
    }
  };

  // ── GUARDS — must come after all hooks ──
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
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif !important; }
        .pf { font-family: 'Playfair Display', serif !important; }
        button { font-family: 'DM Sans', sans-serif; cursor: pointer; }
        input, textarea { font-family: 'DM Sans', sans-serif; }
        a { text-decoration: none; color: inherit; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp .5s both; }
        img { display: block; } 
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 64,
        background: scrolled ? "rgba(250,250,247,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.05)" : "none",
        transition: "all .3s",
      }}>
        <a href="/" className="pf" style={{ fontSize: 21, fontWeight: 700, color: C.ink }}>
          Rent<span style={{ color: C.gold }}>Smart</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.inkMuted }}>
          <a href="/" style={{ color: C.inkMuted }} onMouseEnter={e => e.target.style.color = C.ink} onMouseLeave={e => e.target.style.color = C.inkMuted}>Home</a>
          <span style={{ color: C.border }}>›</span>
          <a href="#" style={{ color: C.inkMuted }} onMouseEnter={e => e.target.style.color = C.ink} onMouseLeave={e => e.target.style.color = C.inkMuted}>{property.address?.city || "Listings"}</a>
          <span style={{ color: C.border }}>›</span>
          <span style={{ color: C.ink, fontWeight: 500, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{property.title}</span>
        </div>

      </nav>

      {/* ── IMAGE GALLERY ── */}
      <div style={{ paddingTop: 64 }}>
        {images.length > 0 ? (
          <>
            <style>{`
        @keyframes galleryFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lbFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lbImgSlide {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        .gal-wrap {
          animation: galleryFadeIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* ── MOSAIC GRID ── */
        .gal-mosaic {
          display: grid;
          grid-template-columns: 58% 1fr 1fr;
          grid-template-rows: 340px 160px;
          gap: 2px;
          overflow: hidden;
        }
        .gal-cell {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          background: #1a1a1a;
        }
        .gal-cell img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94),
                      filter 0.4s ease;
          filter: brightness(0.96);
          will-change: transform;
        }
        .gal-cell:hover img {
          transform: scale(1.08);
          filter: brightness(1.04);
        }
        .gal-cell-hero {
          grid-column: 1;
          grid-row: 1 / span 2;
        }
        .gal-cell-hero img {
          filter: brightness(0.92);
        }
        .gal-cell-hero:hover img {
          filter: brightness(1);
        }

        /* sheen on hover */
        .gal-cell::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%);
          opacity: 0;
          transition: opacity 0.35s;
          pointer-events: none;
        }
        .gal-cell:hover::after { opacity: 1; }

        /* subtle bottom vignette on hero */
        .gal-cell-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 55%);
          z-index: 1;
          pointer-events: none;
        }

        /* ── FLOATING CONTROLS ── */
        .gal-hero-badge {
          position: absolute; bottom: 20px; left: 22px; z-index: 3;
          display: flex; align-items: center; gap: 8px;
          background: rgba(10,10,10,0.55);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(16px);
          padding: 7px 14px 7px 10px;
          border-radius: 100px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.4px;
          pointer-events: none;
        }
        .gal-hero-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #C8A96E;
          box-shadow: 0 0 6px rgba(200,169,110,0.8);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.85); }
        }

        .gal-view-all {
          position: absolute; bottom: 16px; right: 16px;
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(255,255,255,0.5);
          backdrop-filter: blur(20px);
          padding: 9px 18px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #141414;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          letter-spacing: 0.3px;
          border: none;
        }
        .gal-view-all:hover {
          background: #fff;
          transform: translateY(-1px);
        }
        .gal-view-all svg {
          width: 14px; height: 14px; opacity: 0.6;
        }

        /* thumbnail +N overlay */
        .gal-more-overlay {
          position: absolute; inset: 0;
          background: rgba(12,12,12,0.6);
          backdrop-filter: blur(3px);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.3s;
          z-index: 2;
        }
        .gal-more-overlay:hover { background: rgba(12,12,12,0.45); }
        .gal-more-count {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.5px;
          line-height: 1;
        }
        .gal-more-label {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 3px;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        /* ── STRIP RAIL ── */
        .gal-strip-wrap {
          display: flex;
          gap: 6px;
          padding: 10px 0 2px;
          overflow-x: auto;
          scroll-behavior: smooth;
        }
        .gal-strip-wrap::-webkit-scrollbar { height: 0; }
        .gal-strip-thumb {
          flex-shrink: 0;
          width: 76px; height: 52px;
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.25s, opacity 0.25s, transform 0.25s;
          opacity: 0.5;
        }
        .gal-strip-thumb:hover { opacity: 0.8; transform: translateY(-2px); }
        .gal-strip-thumb.gal-active {
          border-color: #C8A96E;
          opacity: 1;
          transform: translateY(-2px);
        }
        .gal-strip-thumb img {
          width: 100%; height: 100%; object-fit: cover;
        }

        /* ── LIGHTBOX ── */
        .lb-wrap {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(6,6,6,0.97);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          animation: lbFadeIn 0.25s ease both;
          font-family: 'DM Sans', sans-serif;
        }
        .lb-img-frame {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 100%; flex: 1;
          padding: 80px 100px 20px;
        }
        .lb-img {
          max-width: 100%; max-height: 100%;
          object-fit: contain;
          border-radius: 4px;
          animation: lbImgSlide 0.3s cubic-bezier(0.22,1,0.36,1) both;
          box-shadow: 0 40px 100px rgba(0,0,0,0.9);
        }

        /* top bar */
        .lb-topbar {
          position: absolute; top: 0; left: 0; right: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px;
          z-index: 10;
        }
        .lb-title-pill {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(20px);
          padding: 7px 16px;
          border-radius: 100px;
          color: rgba(255,255,255,0.85);
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.3px;
        }
        .lb-title-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #C8A96E;
        }
        .lb-topbar-right {
          display: flex; align-items: center; gap: 10px;
        }
        .lb-counter-pill {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(20px);
          padding: 7px 16px;
          border-radius: 100px;
          color: rgba(255,255,255,0.7);
          font-size: 12px; font-weight: 600;
          letter-spacing: 1px;
        }
        .lb-close-btn {
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .lb-close-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.05); }

        /* nav arrows */
        .lb-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 54px; height: 54px; border-radius: 50%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(20px);
          color: #fff; font-size: 22px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s, opacity 0.2s;
          z-index: 5;
        }
        .lb-arrow:hover { background: rgba(255,255,255,0.16); transform: translateY(-50%) scale(1.06); }
        .lb-arrow-prev { left: 20px; }
        .lb-arrow-next { right: 20px; }
        .lb-arrow-disabled { opacity: 0.2; pointer-events: none; }

        /* progress bar */
        .lb-progress {
          width: 100%; height: 1px;
          background: rgba(255,255,255,0.08);
          position: relative;
          flex-shrink: 0;
        }
        .lb-progress-fill {
          height: 100%;
          background: #C8A96E;
          transition: width 0.35s cubic-bezier(0.22,1,0.36,1);
        }

        /* thumb strip in lightbox */
        .lb-thumb-rail {
          display: flex; gap: 6px; padding: 14px 24px 18px;
          overflow-x: auto; width: 100%;
          scroll-behavior: smooth;
        }
        .lb-thumb-rail::-webkit-scrollbar { height: 2px; }
        .lb-thumb-rail::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
        .lb-lbthumb {
          flex-shrink: 0;
          width: 72px; height: 48px;
          border-radius: 5px; overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          opacity: 0.4;
          transition: opacity 0.2s, border-color 0.2s, transform 0.2s;
        }
        .lb-lbthumb:hover { opacity: 0.75; transform: translateY(-2px); }
        .lb-lbthumb.lb-active { border-color: #C8A96E; opacity: 1; transform: translateY(-2px); }
        .lb-lbthumb img { width: 100%; height: 100%; object-fit: cover; }
      `}</style>

            <div className="gal-wrap">

              {/* ── MOSAIC ── */}
              <div style={{ position: "relative" }}>
                <div className="gal-mosaic">

                  {/* HERO */}
                  <div className="gal-cell gal-cell-hero"
                    onClick={() => { setLightboxOpen(true); setLightboxIdx(0); }}>
                    <img src={images[0]} alt="Hero view" loading="eager" />
                    <div className="gal-hero-badge">
                      <div className="gal-hero-dot" />
                      Premium Property
                    </div>
                  </div>

                  {/* TOP ROW thumbnails: slots 1–2 */}
                  {images.slice(1, 3).map((img, i) => (
                    <div key={i} className="gal-cell"
                      onClick={() => { setLightboxOpen(true); setLightboxIdx(i + 1); }}>
                      <img src={img} alt={`View ${i + 2}`} loading="lazy" />
                    </div>
                  ))}

                  {/* BOTTOM ROW thumbnails: slots 3–4 */}
                  {images.slice(3, 5).map((img, i) => (
                    <div key={i + 3} className="gal-cell"
                      onClick={() => { setLightboxOpen(true); setLightboxIdx(i + 3); }}>
                      <img src={img} alt={`View ${i + 4}`} loading="lazy" />
                      {i === 1 && images.length > 5 && (
                        <div className="gal-more-overlay"
                          onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); setLightboxIdx(4); }}>
                          <div className="gal-more-count">+{images.length - 4}</div>
                          <div className="gal-more-label">Photos</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* View All floating button */}

                {images.length > 1 &&
                  (<button className="gal-view-all"
                    onClick={() => { setLightboxOpen(true); setLightboxIdx(0); }}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="1" y="1" width="6" height="6" rx="1.2" />
                      <rect x="9" y="1" width="6" height="6" rx="1.2" />
                      <rect x="1" y="9" width="6" height="6" rx="1.2" />
                      <rect x="9" y="9" width="6" height="6" rx="1.2" />
                    </svg>
                    View all {images.length} photos
                  </button>)
                }


              </div>

              {/* ── THUMBNAIL STRIP RAIL ── */}
              <div style={{ padding: "0 0 0 0" }}>
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
              <div className="lb-wrap"
                onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false); }}>

                {/* Top bar */}
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

                {/* Progress bar */}
                <div className="lb-progress">
                  <div className="lb-progress-fill"
                    style={{ width: `${((lightboxIdx + 1) / images.length) * 100}%` }} />
                </div>

                {/* Image frame */}
                <div className="lb-img-frame">
                  <img
                    key={lightboxIdx}
                    className="lb-img"
                    src={images[lightboxIdx]}
                    alt={`Photo ${lightboxIdx + 1}`}
                  />

                  {/* Arrows */}
                  <button
                    className={`lb-arrow lb-arrow-prev${lightboxIdx === 0 ? " lb-arrow-disabled" : ""}`}
                    onClick={() => setLightboxIdx((i) => Math.max(i - 1, 0))}>
                    ‹
                  </button>
                  <button
                    className={`lb-arrow lb-arrow-next${lightboxIdx === images.length - 1 ? " lb-arrow-disabled" : ""}`}
                    onClick={() => setLightboxIdx((i) => Math.min(i + 1, images.length - 1))}>
                    ›
                  </button>
                </div>

                {/* Thumb rail */}
                <div className="lb-thumb-rail">
                  {images.map((img, i) => (
                    <div key={i}
                      className={`lb-lbthumb${i === lightboxIdx ? " lb-active" : ""}`}
                      onClick={() => setLightboxIdx(i)}>
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
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 32px 80px", display: "grid", gridTemplateColumns: "1fr 356px", gap: 32, alignItems: "start" }}>

        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Title row */}
          <div className="fu" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 12px", borderRadius: 100, background: isRent ? C.greenBg : C.goldLight, color: isRent ? C.green : C.gold }}>
                    For {property.buyOrSell}
                  </span>
                  {property.promoted && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 12px", borderRadius: 100, background: C.goldLight, color: C.gold }}>Featured</span>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 12px", borderRadius: 100, background: C.border, color: C.inkMuted }}>{property.category}</span>
                </div>
                <h1 className="pf" style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 700, color: C.ink, lineHeight: 1.15, marginBottom: 8 }}>
                  {property.title}
                </h1>
                <p style={{ fontSize: 14, color: C.inkMuted, display: "flex", alignItems: "center", gap: 5 }}>
                  📍 {fullAddress}
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="pf" style={{ fontSize: "2rem", fontWeight: 700, color: C.ink }}>{formattedPrice}</div>
                <div style={{ fontSize: 13, color: C.inkMuted }}>
                  {property.paymentType === "monthly" ? "per month" : property.paymentType === "one-time" ? "one-time payment" : property.paymentType || ""}
                </div>
                {isRent && (
                  <div style={{ fontSize: 12, color: C.inkLight, marginTop: 4 }}>+ security deposit may apply</div>
                )}
              </div>
            </div>

            {/* Quick meta strip */}
            <div style={{ display: "flex", gap: 24, padding: "16px 20px", background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, flexWrap: "wrap" }}>
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
          <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: `1px solid ${C.border}` }}>
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
              {/* Description */}
              <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "26px 28px", marginBottom: 22, boxShadow: C.cardShadow }}>
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

              {/* Property Highlights */}
              <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "26px 28px", boxShadow: C.cardShadow }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 20 }}>Property Highlights</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                  {highlights.map((h, i) => (
                    <div key={h.label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "13px 0",
                      borderBottom: i < highlights.length - 2 ? `1px solid ${C.border}` : "none",
                      paddingRight: i % 2 === 0 ? 24 : 0,
                      paddingLeft: i % 2 === 1 ? 24 : 0,
                      borderLeft: i % 2 === 1 ? `1px solid ${C.border}` : "none"
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
            <div className="fu" style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "26px 28px", boxShadow: C.cardShadow }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 22 }}>What this place offers</h2>
              {amenitiesList.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
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
              <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "26px 28px", boxShadow: C.cardShadow, marginBottom: 20 }}>
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
              {similarProperties.length === 0 ? (
                <p style={{ fontSize: 14, color: C.inkMuted }}>No similar properties found.</p>
              ) : (
                similarProperties.map((p) => (
                  <div key={p._id}
                    onClick={() => navigate(`/details/${p._id}`)}
                    onMouseEnter={() => setHoveredSim(p._id)}
                    onMouseLeave={() => setHoveredSim(null)}
                    style={{ display: "flex", gap: 16, background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: hoveredSim === p._id ? "0 8px 28px rgba(0,0,0,0.1)" : C.cardShadow, transform: hoveredSim === p._id ? "translateY(-3px)" : "none", transition: "all .25s", cursor: "pointer" }}>
                    <div style={{ width: 140, height: 120, flexShrink: 0, overflow: "hidden", background: C.border }}>
                      {p.listingPhotos?.[0] ? (
                        <img src={p.listingPhotos[0]} alt={p.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s", transform: hoveredSim === p._id ? "scale(1.06)" : "scale(1)" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🏠</div>
                      )}
                    </div>
                    <div style={{ padding: "16px 16px 16px 0", flex: 1 }}>
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
                ))
              )}
            </div>
          )}
        </div>

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
/>

      </div>
    </div>
  );
}