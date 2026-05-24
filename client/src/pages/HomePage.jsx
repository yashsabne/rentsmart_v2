import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../constants";
import Navbar from "../components/reuse/Navbar";
import Hero from "../components/Hero";
import { stats, steps } from "../constants";
import Footer from "../components/reuse/Footer";
import { API } from "../../apis";
import "./styles/homepage.css";

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [savedIds,     setSavedIds]     = useState([]);
  const [hoveredCard,  setHoveredCard]  = useState(null);
  const [hoveredStep,  setHoveredStep]  = useState(null);

  const [properties,   setProperties]  = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [user,         setUser]        = useState(null);
  const [sectionLabel, setSectionLabel] = useState("Latest Listings");
  const [sectionSub,   setSectionSub]  = useState("Properties You'll Love");

  const navigate = useNavigate();

  // ── Fetch user ──
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
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

  // ── Fetch properties ──
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        let url = "";

        if (user?.city || user?.preferences?.length > 0) {
          const params = new URLSearchParams();
          if (user.city)                    params.set("city",        user.city);
          if (user.preferences?.length > 0) params.set("preferences", user.preferences.join(","));
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
    setSavedIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );

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
    <div className="homepage-root">
      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── HERO ── */}
      <Hero />

      {/* ── LISTINGS SECTION ── */}
      <section className="listings-section">
        <div className="listings-section-inner">

          {/* Section header */}
          <div className="listings-header">
            <div className="listings-header-left">
              {user?.preferences?.length > 0 && (
                <div className="personalised-badge">
                  <span className="personalised-dot" aria-hidden="true" />
                  <span>Personalised for {user.firstName}</span>
                </div>
              )}
              <p className="section-label">{sectionLabel}</p>
              <p className="section-sub playfair">{sectionSub}</p>
            </div>
            <a
              href="#"
              className="see-all-link"
              aria-label="See all properties"
            >
              See all →
            </a>
          </div>

          {/* Filter pills */}
          <div className="filter-pills" role="group" aria-label="Filter properties">
            {["All", "Rent", "Buy"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`filter-pill${activeFilter === f ? " active" : ""}`}
                aria-pressed={activeFilter === f}
              >
                {f}
              </button>
            ))}
          </div>

          {/* ── SKELETON ── */}
          {loading && (
            <div className="cards-grid" aria-busy="true" aria-label="Loading properties">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="prop-skeleton">
                  <div className="skeleton skeleton-img" />
                  <div className="prop-skeleton-body">
                    <div className="skeleton" style={{ height: 20, width: "50%", marginBottom: 10 }} />
                    <div className="skeleton" style={{ height: 15, width: "75%", marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 13, width: "55%", marginBottom: 18 }} />
                    <div className="skeleton-row">
                      <div className="skeleton" style={{ height: 12, width: 54 }} />
                      <div className="skeleton" style={{ height: 12, width: 54 }} />
                      <div className="skeleton" style={{ height: 12, width: 54 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── EMPTY STATE ── */}
          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">🏠</div>
              <div className="empty-title">No properties found</div>
              <div className="empty-sub">
                {searchQuery
                  ? `No results for "${searchQuery}" — try a different search`
                  : "Try adjusting your filters"}
              </div>
            </div>
          )}

          {/* ── PROPERTY CARDS ── */}
          {!loading && filtered.length > 0 && (
            <div className="cards-grid">
              {filtered.map((p) => {
                const isRent = p.buyOrSell?.toLowerCase() === "rent";
                const isSaved = savedIds.includes(p._id);
                return (
                  <article
                    key={p._id}
                    className={`prop-card${hoveredCard === p._id ? " hovered" : ""}`}
                    onClick={() => navigate(`/details/${p._id}`)}
                    onMouseEnter={() => setHoveredCard(p._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/details/${p._id}`)}
                    aria-label={`View ${p.title}`}
                  >
                    {/* Image */}
                    <div className="prop-card-img-wrap">
                      {p.listingPhotos?.[0] ? (
                        <img
                          src={p.listingPhotos[0]}
                          alt={p.title}
                          className="prop-card-img"
                        />
                      ) : (
                        <div className="prop-card-img-placeholder" aria-hidden="true">🏠</div>
                      )}

                      {/* Badges row */}
                      <div className="prop-badge-row">
                        <span className={`prop-badge prop-badge-type${isRent ? " rent" : " buy"}`}>
                          For {p.buyOrSell}
                        </span>
                        {p.promoted && (
                          <span className="prop-badge prop-badge-featured">Featured</span>
                        )}
                      </div>

                      {/* Save button */}
                      <button
                        className={`save-btn${isSaved ? " saved" : ""}`}
                        onClick={(e) => { e.stopPropagation(); toggleSave(p._id); }}
                        aria-label={isSaved ? "Remove from saved" : "Save property"}
                        aria-pressed={isSaved}
                      >
                        {isSaved ? "❤️" : "🤍"}
                      </button>

                      {/* Category chip */}
                      <span className="prop-category-chip">{p.category}</span>
                    </div>

                    {/* Info */}
                    <div className="prop-card-body">
                      <div className="prop-price playfair">
                        {formattedPrice(p.price, p.paymentType)}
                      </div>
                      <div className="prop-title">{p.title}</div>
                      <div className="prop-location">
                        📍 {fullLocation(p.address)}
                      </div>
                      <div className="prop-details">
                        {[
                          ["🛏", `${p.details?.bedroomCount ?? 0} Beds`],
                          ["🚿", `${p.details?.bathroomCount ?? 0} Baths`],
                          ["👥", `${p.details?.guestCount ?? 0} Guests`],
                        ].map(([icon, val]) => (
                          <span key={val} className="prop-detail-item">
                            <span aria-hidden="true">{icon}</span> {val}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section" aria-labelledby="how-heading">
        <div className="how-section-inner">
          <p className="section-label section-label-light">Simple Process</p>
          <h2 id="how-heading" className="how-title playfair">
            How RentSmart Works
          </h2>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className={`step-card${hoveredStep === i ? " hovered" : ""}`}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div className="step-number playfair" aria-hidden="true">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <div className="cta-banner" role="complementary" aria-label="List your property">
        <div className="cta-banner-inner">
          <h2 className="cta-title playfair">
            Ready to list your{" "}
            <em className="cta-em">property</em> with us?
          </h2>
          <div className="cta-actions">
            <button
              className="btn-cta-primary"
              onClick={() => navigate("/create")}
            >
              List for Free →
            </button>
            <button className="btn-cta-outline">
              Talk to an Agent
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}