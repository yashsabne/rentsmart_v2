// PropertyBuyPage.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { C } from "../constants";
import Navbar from "../components/reuse/Navbar";
import { useNavigate } from "react-router-dom";
import { propertyTypes, budgetRanges, bedsOptions, sortOptions } from "../constants";
import { useParams, useSearchParams } from "react-router-dom";
import AdvancedSidebar from "../components/AdvancedSidebar";
import Pagination from "../components/Pagination";
import debounce from 'lodash/debounce';
import SaveButton from "../components/SaveBtn";
import { formattedPrice } from "../const_func/dashFunction";
import { API } from "../../apis";
import "./styles/propertybuy.css"
import Footer from "../components/reuse/Footer";
import { trackInteraction } from "../utils/trackInteraction";
import PropertySearch from "../components/PropertySearch";

const PAGE_SIZE = 15;

export default function PropertyBuyPage() {
  const [typeFilter, setTypeFilter] = useState("All");
  const [budgetIdx, setBudgetIdx] = useState(0);
  const [bedsFilter, setBedsFilter] = useState("Any");
  const [sortBy, setSortBy] = useState("Relevance");
  const [savedIds, setSavedIds] = useState([]);

  const [hoveredCard, setHoveredCard] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { type } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [advFilters, setAdvFilters] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "all";

  const PAGE_SIZE = 20;

  useEffect(() => {
    const query = new URLSearchParams();
    const finalPropertyType = advFilters?.propertyType || typeFilter;
    const finalBeds = advFilters?.beds || bedsFilter;
    const activeSortBy = advFilters?.sortBy && advFilters.sortBy !== "Relevance" ? advFilters.sortBy : sortBy;

    if (type) query.set("type", type);
    if (search && search !== "all") query.set("search", search);
    if (finalPropertyType && finalPropertyType !== "All") query.set("propertyType", finalPropertyType);
    if (finalBeds && finalBeds !== "Any") query.set("bedrooms", finalBeds);
    if (advFilters?.baths && advFilters.baths !== "Any") query.set("bathrooms", advFilters.baths);
    if (advFilters?.city?.trim()) query.set("city", advFilters.city);
    if (advFilters?.furnished) query.set("furnished", "true");
    if (advFilters?.parking) query.set("parking", "true");
    if (advFilters?.readyToMove) query.set("readyToMove", "true");
    if (advFilters?.amenities?.length > 0) advFilters.amenities.forEach((item) => query.append("amenities", item));
    if (activeSortBy && activeSortBy !== "Relevance") query.set("sortBy", activeSortBy);
    query.set("page", currentPage);

    navigate({ pathname: window.location.pathname, search: query.toString() }, { replace: true });
  }, [type, search, budgetIdx, typeFilter, bedsFilter, sortBy, advFilters, currentPage, navigate]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);

      const budget = budgetRanges[budgetIdx];
      const finalPropertyType = advFilters?.propertyType || typeFilter;
      const finalBeds = advFilters?.beds || bedsFilter;
      const finalMinPrice = advFilters?.budgetMin || budget?.min || 0;
      const finalMaxPrice = advFilters?.budgetMax || (budget?.max === Infinity ? 999999999 : budget?.max) || 999999999;
      const activeSortBy = advFilters?.sortBy && advFilters.sortBy !== "Relevance" ? advFilters.sortBy : sortBy;

      const params = new URLSearchParams();

      if (type) params.append("type", type);
      if (search && search !== "all") params.append("search", search);

      params.append("minPrice", finalMinPrice);
      params.append("maxPrice", finalMaxPrice);

      if (finalPropertyType && finalPropertyType !== "All") params.append("propertyType", finalPropertyType);
      if (finalBeds && finalBeds !== "Any") params.append("bedrooms", finalBeds);
      if (advFilters?.baths && advFilters.baths !== "Any") params.append("bathrooms", advFilters.baths);
      if (advFilters?.city?.trim()) params.append("city", advFilters.city);
      if (advFilters?.furnished) params.append("furnished", "true");
      if (advFilters?.parking) params.append("parking", "true");
      if (advFilters?.readyToMove) params.append("readyToMove", "true");
      if (advFilters?.amenities?.length > 0) advFilters.amenities.forEach((item) => params.append("amenities", item));
      if (activeSortBy && activeSortBy !== "Relevance") params.append("sortBy", activeSortBy);

      params.append("page", currentPage);
      params.append("limit", PAGE_SIZE);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API.PROPERTY}/api/property/filter?${params.toString()}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setProperties(data.listings || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setProperties([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [type, search, budgetIdx, typeFilter, bedsFilter, sortBy, advFilters, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [type, search, budgetIdx, typeFilter, bedsFilter, sortBy, advFilters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const paginatedResults = properties || [];

  const toggleSave = (id) => {
    setSavedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

return (
    <>
      <style>{`
        .rp-page { min-height: 100vh; background: ${C.cream}; font-family: 'DM Sans', sans-serif; color: ${C.ink}; }

        .rp-hero { background: ${C.ink}; padding: 56px 48px 40px; position: relative; overflow: hidden; }
        .rp-hero::after { content:""; position:absolute; inset:0; background: radial-gradient(circle at 85% 0%, rgba(255,255,255,0.06), transparent 55%); pointer-events:none; }
        .rp-hero-inner { max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }
        .rp-eyebrow { display:inline-block; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: ${C.gold}; font-weight: 600; margin-bottom: 14px; }
        .rp-hero-title { font-family: 'Playfair Display', serif; font-size: 40px; line-height: 1.15; color: #fff; margin: 0 0 28px; max-width: 620px; font-weight: 600; }
        .rp-search-shell { background: #fff; border-radius: 16px; padding: 14px; box-shadow: 0 20px 50px rgba(0,0,0,0.25); margin-bottom: 22px; }

        .rp-toolbar { display: flex; align-items: flex-end; gap: 28px; flex-wrap: wrap; }
        .rp-toolbar-group { display: flex; flex-direction: column; gap: 8px; }
        .rp-toolbar-label { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.55); font-weight: 600; }
        .rp-pill-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .rp-pill { padding: 7px 14px; border-radius: 100px; font-size: 12.5px; font-weight: 500; cursor: pointer; transition: all .18s; white-space: nowrap; }
        .rp-pill-type { border: 1.5px solid rgba(255,255,255,0.25); background: transparent; color: rgba(255,255,255,0.8); }
        .rp-pill-type.active { background: #fff; border-color: #fff; color: ${C.ink}; }
        .rp-pill-budget { border: 1.5px solid rgba(255,255,255,0.25); background: transparent; color: rgba(255,255,255,0.8); }
        .rp-pill-budget.active { background: ${C.gold}; border-color: ${C.gold}; color: ${C.ink}; }
        .rp-sort-group { margin-left: auto; display:flex; flex-direction:column; gap:8px; }
        .rp-sort-select { font-size: 13px; color: ${C.ink}; border: none; border-radius: 10px; padding: 9px 14px; background: #fff; outline: none; cursor: pointer; font-weight: 500; min-width: 160px; }

        .rp-body { max-width: 1200px; margin: 0 auto; padding: 36px 48px 80px; }
        .rp-results-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom: 24px; flex-wrap: wrap; }
        .rp-count-num { font-family:'Playfair Display', serif; font-size: 26px; font-weight: 700; color: ${C.ink}; }
        .rp-count-label { font-size: 14px; color: ${C.inkMuted}; margin-left: 8px; }
        .rp-search-chip { font-size: 12.5px; color: ${C.ink}; background: ${C.goldLight}; border: 1px solid ${C.gold}; padding: 5px 12px; border-radius: 100px; margin-left: 10px; }
        .rp-mobile-filter-btn { display: none; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 100px; border: 1.5px solid ${C.ink}; background: ${C.ink}; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }

        .rp-layout { display: grid; grid-template-columns: 1fr 300px; gap: 40px; align-items: start; }
        .rp-sidebar-desktop { position: sticky; top: 90px; }

        .rp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .rp-card { position: relative; background: ${C.white}; border: 1px solid ${C.border}; border-radius: 14px; overflow: hidden; cursor: pointer; transition: transform .2s, box-shadow .2s; display:flex; flex-direction:column; }
        .rp-card.hovered { transform: translateY(-4px); box-shadow: 0 18px 34px rgba(0,0,0,0.10); }
        .rp-card-featured { grid-column: span 2; grid-row: span 2; }
        .rp-card-featured .rp-img-wrap { height: 100%; min-height: 320px; }
        .rp-img-wrap { position: relative; height: 190px; background: ${C.border}; overflow: hidden; flex-shrink: 0; }
        .rp-card-featured .rp-body-inner { position:absolute; left:0; right:0; bottom:0; padding: 24px; background: linear-gradient(180deg, transparent, rgba(0,0,0,0.82) 70%); color: #fff; }
        .rp-card-featured .rp-title, .rp-card-featured .rp-location, .rp-card-featured .rp-price { color: #fff; }
        .rp-card-featured .rp-detail-item { color: rgba(255,255,255,0.85); }
        .rp-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .35s; }
        .rp-card.hovered .rp-img { transform: scale(1.05); }
        .rp-img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size: 40px; background: ${C.cream}; }

        .rp-badge-row { position: absolute; top: 12px; left: 12px; display:flex; gap:6px; z-index:2; }
        .rp-badge-type { font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.03em; }
        .rp-badge-type.rent { background: ${C.ink}; color: #fff; }
        .rp-badge-type.buy { background: ${C.gold}; color: ${C.ink}; }
        .rp-badge-promoted { position: absolute; top: 12px; left: 12px; margin-top: 30px; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 100px; background: #fff; color: ${C.ink}; z-index:2; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
        .rp-category-chip { position: absolute; bottom: 10px; left: 12px; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px; background: rgba(255,255,255,0.92); color: ${C.ink}; z-index: 2; }
        .rp-card-featured .rp-category-chip { bottom: auto; top: 12px; right: 12px; left: auto; }
        .rp-save-wrap { position: absolute; top: 12px; right: 12px; z-index: 3; }

        .rp-body-inner { padding: 16px 18px 18px; }
        .rp-price { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 700; color: ${C.ink}; }
        .rp-price-label { font-size: 12px; color: ${C.gold}; font-weight: 600; margin-bottom: 4px; }
        .rp-title { font-size: 14.5px; font-weight: 600; color: ${C.ink}; margin: 6px 0 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rp-location { font-size: 12.5px; color: ${C.inkMuted}; margin-bottom: 12px; }
        .rp-details-row { display: flex; gap: 14px; padding-top: 12px; border-top: 1px solid ${C.border}; }
        .rp-card-featured .rp-details-row { border-top: 1px solid rgba(255,255,255,0.25); }
        .rp-detail-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: ${C.inkMuted}; font-weight: 500; }

        .rp-empty { grid-column: 1/-1; text-align: center; padding: 90px 20px; }

        .rp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 100; }
        .rp-drawer { position: fixed; top:0; right:0; bottom:0; width: 320px; max-width: 88vw; background: #fff; z-index: 101; box-shadow: -8px 0 30px rgba(0,0,0,0.15); display:flex; flex-direction:column; }
        .rp-drawer-header { display:flex; align-items:center; justify-content:space-between; padding: 20px; border-bottom: 1px solid ${C.border}; }
        .rp-drawer-close { border:none; background: ${C.cream}; width:34px; height:34px; border-radius: 100px; cursor:pointer; font-size:14px; }
        .rp-drawer-body { padding: 20px; overflow-y: auto; }

        @media (max-width: 1280px) {
          .rp-hero, .rp-body { padding-left: 32px; padding-right: 32px; }
          .rp-grid { grid-template-columns: repeat(2, 1fr); }
          .rp-card-featured { grid-column: span 2; grid-row: span 1; }
          .rp-card-featured .rp-img-wrap { min-height: 260px; }
        }
        @media (max-width: 1024px) {
          .rp-layout { grid-template-columns: 1fr; }
          .rp-sidebar-desktop { display: none; }
          .rp-mobile-filter-btn { display: inline-flex; }
        }
        @media (max-width: 768px) {
          .rp-hero, .rp-body { padding-left: 20px; padding-right: 20px; }
          .rp-hero-title { font-size: 28px; }
          .rp-toolbar { gap: 18px; }
          .rp-sort-group { margin-left: 0; width: 100%; }
          .rp-sort-select { width: 100%; }
          .rp-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .rp-card-featured { grid-column: span 2; }
        }
        @media (max-width: 480px) {
          .rp-hero { padding-top: 36px; padding-bottom: 28px; }
          .rp-hero-title { font-size: 23px; margin-bottom: 20px; }
          .rp-count-num { font-size: 21px; }
          .rp-grid { grid-template-columns: 1fr; }
          .rp-card-featured { grid-column: span 1; }
          .rp-card-featured .rp-img-wrap { min-height: 220px; }
          .rp-results-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="rp-page">
        <Navbar scrolled={true} />

        <section className="rp-hero">
          <div className="rp-hero-inner">
            <span className="rp-eyebrow">Curated Listings</span>
            <h1 className="rp-hero-title">Find a place that feels right, not just available.</h1>

            <div className="rp-search-shell">
              <PropertySearch />
            </div>

            <div className="rp-toolbar">
              <div className="rp-toolbar-group">
                <span className="rp-toolbar-label">Type</span>
                <div className="rp-pill-row">
                  {propertyTypes.map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`rp-pill rp-pill-type ${typeFilter === t ? "active" : ""}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rp-toolbar-group">
                <span className="rp-toolbar-label">Budget</span>
                <div className="rp-pill-row">
                  {budgetRanges.map((b, i) => (
                    <button
                      key={b.label}
                      onClick={() => setBudgetIdx(i)}
                      className={`rp-pill rp-pill-budget ${budgetIdx === i ? "active" : ""}`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rp-sort-group">
                <span className="rp-toolbar-label">Sort by</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="rp-sort-select">
                  {sortOptions.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        <div className="rp-body">
          <div id="property-listing-top" style={{ position: "relative", top: -100 }} />

          <div className="rp-results-header">
            <div>
              <span className="rp-count-num">{loading ? "" : totalCount}</span>
              <span className="rp-count-label">{loading ? "getting results..." : "properties found"}</span>
              {search && search !== "all" && <span className="rp-search-chip">for "{search}"</span>}
            </div>
            <button className="rp-mobile-filter-btn" onClick={() => setShowSidebar(true)}>
              ⚙ Filters
            </button>
          </div>

          <div className="rp-layout">
            <div>
              {loading && (
                <div className="rp-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rp-card">
                      <div className="skeleton" style={{ height: 190 }} />
                      <div style={{ padding: "16px 18px" }}>
                        <div className="skeleton" style={{ height: 20, width: "50%", marginBottom: 10 }} />
                        <div className="skeleton" style={{ height: 14, width: "75%", marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 12, width: "55%", marginBottom: 16 }} />
                        <div style={{ display: "flex", gap: 12 }}>
                          <div className="skeleton" style={{ height: 11, width: 50 }} />
                          <div className="skeleton" style={{ height: 11, width: 50 }} />
                          <div className="skeleton" style={{ height: 11, width: 50 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && (
                <div className="rp-grid">
                  {paginatedResults.map((p, idx) => {
                    const isRent = p.buyOrSell?.toLowerCase() === "rent";
                    const isFeatured = idx === 0;

                    return (
                      <article
                        key={p._id}
                        className={`rp-card ${hoveredCard === p._id ? "hovered" : ""} ${isFeatured ? "rp-card-featured" : ""}`}
                        onClick={() => {
                          navigate(`/details/${p._id}`);
                          trackInteraction(p._id, "VIEW");
                        }}
                        onMouseEnter={() => setHoveredCard(p._id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && navigate(`/details/${p._id}`)}
                      >
                        <div className="rp-img-wrap">
                          {p.listingPhotos?.[0] ? (
                            <img src={p.listingPhotos[0]} alt={p.title} className="rp-img" loading="lazy" />
                          ) : (
                            <div className="rp-img-placeholder" aria-hidden="true">🏠</div>
                          )}

                          <div className="rp-badge-row">
                            <span className={`rp-badge-type ${isRent ? "rent" : "buy"}`}>
                              {p.buyOrSell || "Property"}
                            </span>
                          </div>

                          {p.isPromoted && <span className="rp-badge-promoted">🚀 Promoted</span>}

                          <span className="rp-category-chip">{p.type || "Property"}</span>

                          <div className="rp-save-wrap">
                            <SaveButton id={p._id} isSaved={savedIds.includes(p._id)} onToggle={toggleSave} />
                          </div>

                          {isFeatured && (
                            <div className="rp-body-inner">
                              <div className="rp-price-label">{p.priceLabel}</div>
                              <div className="rp-price">{formattedPrice(p.price, p.paymentType)}</div>
                              <div className="rp-title">{p.title}</div>
                              <div className="rp-location">📍 {p.address?.city || "Location not available"}</div>
                              <div className="rp-details-row">
                                <span className="rp-detail-item">🛏 {p.details?.bedroomCount || 0} Bed</span>
                                <span className="rp-detail-item">🚿 {p.details?.bathroomCount || 0} Bath</span>
                                <span className="rp-detail-item">📐 {p.details?.area || 0} sqft</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {!isFeatured && (
                          <div className="rp-body-inner">
                            <div className="rp-price-label">{p.priceLabel}</div>
                            <div className="rp-price">{formattedPrice(p.price, p.paymentType)}</div>
                            <div className="rp-title">{p.title}</div>
                            <div className="rp-location">📍 {p.address?.city || "Location not available"}</div>
                            <div className="rp-details-row">
                              <span className="rp-detail-item">🛏 {p.details?.bedroomCount || 0}</span>
                              <span className="rp-detail-item">🚿 {p.details?.bathroomCount || 0}</span>
                              <span className="rp-detail-item">📐 {p.details?.area || 0} sqft</span>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}

                  {paginatedResults.length === 0 && (
                    <div className="rp-empty">
                      <div style={{ fontSize: 50, marginBottom: 16 }}>🏚️</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 10 }}>
                        No properties found
                      </div>
                      <div style={{ fontSize: 14, color: C.inkMuted }}>
                        Try adjusting your filters or search terms
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!loading && totalCount > 0 && totalPages > 1 && (
                <div style={{ marginTop: 32 }}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalCount}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>

            <aside className="rp-sidebar-desktop">
              <AdvancedSidebar onFiltersChange={setAdvFilters} />
            </aside>
          </div>
        </div>

        {showSidebar && (
          <>
            <div className="rp-overlay" onClick={() => setShowSidebar(true)} />
            <div className="rp-drawer">
              <div className="rp-drawer-header">
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, fontFamily: "'Playfair Display', serif" }}>
                    Filters
                  </div>
                  <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 2 }}>Narrow down your search</div>
                </div>
                <button className="rp-drawer-close" onClick={() => setShowSidebar(false)}>✕</button>
              </div>
              <div className="rp-drawer-body">
                <AdvancedSidebar onFiltersChange={(f) => { setAdvFilters(f); setShowSidebar(true); }} />
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}