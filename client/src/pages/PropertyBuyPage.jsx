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

    // BASIC
    if (type) {
      query.set("type", type);
    }

    if (search && search !== "all") {
      query.set("search", search);
    }

    // PROPERTY TYPE
    const finalPropertyType =
      advFilters?.propertyType || typeFilter;

    if (
      finalPropertyType &&
      finalPropertyType !== "All"
    ) {
      query.set(
        "propertyType",
        finalPropertyType
      );
    }

    // BEDROOMS
    const finalBeds =
      advFilters?.beds || bedsFilter;

    if (
      finalBeds &&
      finalBeds !== "Any"
    ) {
      query.set("bedrooms", finalBeds);
    }

    // BATHROOMS
    if (
      advFilters?.baths &&
      advFilters.baths !== "Any"
    ) {
      query.set(
        "bathrooms",
        advFilters.baths
      );
    }

    // CITY
    if (advFilters?.city?.trim()) {
      query.set("city", advFilters.city);
    }

    // TOGGLES
    if (advFilters?.furnished) {
      query.set("furnished", "true");
    }

    if (advFilters?.parking) {
      query.set("parking", "true");
    }

    if (advFilters?.readyToMove) {
      query.set("readyToMove", "true");
    }

    // AMENITIES
    if (
      advFilters?.amenities?.length > 0
    ) {
      advFilters.amenities.forEach((item) => {
        query.append("amenities", item);
      });
    }

    // SORT
    const activeSortBy =
      advFilters?.sortBy &&
        advFilters.sortBy !== "Relevance"
        ? advFilters.sortBy
        : sortBy;

    if (
      activeSortBy &&
      activeSortBy !== "Relevance"
    ) {
      query.set("sortBy", activeSortBy);
    }

    // PAGE
    query.set("page", currentPage);

    navigate(
      {
        pathname: window.location.pathname,
        search: query.toString(),
      },
      { replace: true }
    );

  }, [
    type,
    search,
    budgetIdx,
    typeFilter,
    bedsFilter,
    sortBy,
    advFilters,
    currentPage,
    navigate
  ]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);

      const budget = budgetRanges[budgetIdx];

      const params = new URLSearchParams();

      // ---------------- BASIC FILTERS ----------------

      if (type) {
        params.append("type", type);
      }

      if (search && search !== "all") {
        params.append("search", search);
      }

      // ---------------- PRICE ----------------

      const finalMinPrice =
        advFilters?.budgetMin || budget?.min || 0;

      const finalMaxPrice =
        advFilters?.budgetMax ||
        (budget?.max === Infinity ? 999999999 : budget?.max) ||
        999999999;

      params.append("minPrice", finalMinPrice);
      params.append("maxPrice", finalMaxPrice);

      // ---------------- PROPERTY TYPE ----------------

      const finalPropertyType =
        advFilters?.propertyType || typeFilter;

      if (
        finalPropertyType &&
        finalPropertyType !== "All"
      ) {
        params.append("propertyType", finalPropertyType);
      }

      // ---------------- BEDROOMS ----------------

      const finalBeds =
        advFilters?.beds || bedsFilter;

      if (finalBeds && finalBeds !== "Any") {
        params.append("bedrooms", finalBeds);
      }

      // ---------------- BATHROOMS ----------------

      if (
        advFilters?.baths &&
        advFilters.baths !== "Any"
      ) {
        params.append("bathrooms", advFilters.baths);
      }

      // ---------------- CITY ----------------

      if (advFilters?.city?.trim()) {
        params.append("city", advFilters.city);
      }


      // ---------------- TOGGLES ----------------

      if (advFilters?.furnished) {
        params.append("furnished", "true");
      }

      if (advFilters?.parking) {
        params.append("parking", "true");
      }

      if (advFilters?.readyToMove) {
        params.append("readyToMove", "true");
      }

      // ---------------- AMENITIES ----------------

      if (
        advFilters?.amenities &&
        advFilters.amenities.length > 0
      ) {
        advFilters.amenities.forEach((item) => {
          params.append("amenities", item);
        });
      }

      // ---------------- SORTING ----------------

      const activeSortBy =
        advFilters?.sortBy &&
          advFilters.sortBy !== "Relevance"
          ? advFilters.sortBy
          : sortBy;

      if (
        activeSortBy &&
        activeSortBy !== "Relevance"
      ) {
        params.append("sortBy", activeSortBy);
      }


      params.append("page", currentPage);
      params.append("limit", PAGE_SIZE);

      const url = `${API.PROPERTY}/api/property/filter?${params.toString()}`;


      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

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
  }, [
    type,
    search,
    budgetIdx,
    typeFilter,
    bedsFilter,
    sortBy,
    advFilters,
    currentPage
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    type,
    search,
    budgetIdx,
    typeFilter,
    bedsFilter,
    sortBy,
    advFilters
  ]);

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
      <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif", color: C.ink }}>


        <Navbar scrolled={true} />

        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 48px", position: "sticky", top: 64, zIndex: 50, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", height: 56 }}>
            {/* Property Type */}
            <div style={{ display: "flex", gap: 4, paddingRight: 20, borderRight: `1px solid ${C.border}`, flexShrink: 0 }}>
              {propertyTypes.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  style={{ padding: "6px 14px", borderRadius: 100, border: `1.5px solid ${typeFilter === t ? C.ink : C.border}`, background: typeFilter === t ? C.ink : "none", color: typeFilter === t ? "#fff" : C.inkMuted, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap" }}>
                  {t}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 4, padding: "0 20px", borderRight: `1px solid ${C.border}`, flexShrink: 0 }}>
              {budgetRanges.map((b, i) => (
                <button key={b.label} onClick={() => setBudgetIdx(i)}
                  style={{ padding: "6px 14px", borderRadius: 100, border: `1.5px solid ${budgetIdx === i ? C.gold : C.border}`, background: budgetIdx === i ? C.goldLight : "none", color: budgetIdx === i ? C.ink : C.inkMuted, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap" }}>
                  {b.label}
                </button>
              ))}
            </div>

            {/* Sort + view mode */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto", flexShrink: 0, paddingLeft: 20 }}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ fontSize: 13, color: C.ink, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "6px 12px", background: C.white, outline: "none", cursor: "pointer" }}>
                {sortOptions.map(s => <option key={s}>{s}</option>)}
              </select>

            </div>
          </div>
        </div>

        {/* CONTENT */} <div className="pbp-layout">

          <div>
            <div id="property-listing-top" style={{ position: "relative", top: -100 }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40, marginBottom: 20 }}>
              <div >
                <span className="pf" style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>{totalCount}</span>
                <span style={{ fontSize: 14, color: C.inkMuted, marginLeft: 8 }}>properties found</span>
                {search && search !== "all" && <span style={{ fontSize: 13, color: C.gold, marginLeft: 8 }}>for "{search}"</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <button
                  className="pbp-mobile-filter-btn"
                  onClick={() => setShowSidebar(true)}
                  style={{ display: "none", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 12, border: "1.5px solid #E8E4DF", background: "#fff", color: "#1A1A2E", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", fontFamily: "inherit" }}
                > Filters
                </button>
              </div>
            </div>

            {loading && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 22 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ background: C.white, overflow: "hidden", border: `1px solid ${C.border}` }}>
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

            {!loading && (
              <div className="image-grid">
                {paginatedResults.map((p) => {
                  const isRent = p.buyOrSell?.toLowerCase() === "rent";
                  const isSaved = savedIds.includes(p._id);

                  return (
                    <article
                      key={p._id}
                      className={`prop-card ${hoveredCard === p._id ? "hovered" : ""
                        }`}
                      onClick={() => navigate(`/details/${p._id}`)}
                      onMouseEnter={() => setHoveredCard(p._id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && navigate(`/details/${p._id}`)
                      }
                    >
                      {/* Image */}
                      <div className="prop-card-img-wrap">
                        {p.listingPhotos?.[0] ? (
                          <img
                            src={p.listingPhotos[0]}
                            alt={p.title}
                            className="prop-card-img"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="prop-card-img-placeholder"
                            aria-hidden="true"
                          >
                            🏠
                          </div>
                        )}

                        {/* Top badges */}
                        <div className="prop-badge-row">
                          <span
                            className={`prop-badge prop-badge-type ${isRent ? "rent" : "buy"
                              }`}
                          >
                            {p.buyOrSell || "Property"}
                          </span>
                        </div>

                     

                        {p.isPromoted && (
                          <span className="badge-promoted">
                            🚀 Promoted
                          </span>
                        )}

                        <span className="prop-category-chip">
                          {p.type || "Property"}
                        </span>

                        <div className="save-btn-wrap">
                          <SaveButton
                            id={p._id}
                            isSaved={savedIds.includes(p._id)}
                            onToggle={toggleSave}
                          />
                        </div>


                      </div>

                      {/* Body */}
                      <div className="prop-card-body">
                        <div className="prop-price playfair">
                          {formattedPrice(p.price, p.paymentType)}
                        </div>
                        <div className="prop-price pf"  >

                          {p.priceLabel}

                        </div>

                        <div className="prop-title">
                          {p.title}
                        </div>

                        <div className="prop-location">
                          📍 {p.address?.city || "Location not available"}
                        </div>

                        <div className="prop-details">
                          <span className="prop-detail-item">
                            <span>🛏</span>
                            {p.details?.bedroomCount || 0} Bed
                          </span>

                          <span className="prop-detail-item">
                            <span>🚿</span>
                            {p.details?.bathroomCount || 0} Bath
                          </span>

                          <span className="prop-detail-item">
                            <span>📐</span>
                            {p.details?.area || 0} sqft
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {paginatedResults.length === 0 && (
                  <div
                    style={{
                      gridColumn: "1/-1",
                      textAlign: "center",
                      padding: "80px 20px",
                    }}
                  >
                    <div style={{ fontSize: 50, marginBottom: 16 }}>🏚️</div>

                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: C.ink,
                        marginBottom: 10,
                      }}
                    >
                      No properties found
                    </div>

                    <div
                      style={{
                        fontSize: 14,
                        color: C.inkMuted,
                      }}
                    >
                      Try adjusting your filters or search terms
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loading && totalCount > 0 && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          {/* RIGHT: Advanced Sidebar */}

          <div className="pbp-desktop-sidebar">
            <AdvancedSidebar onFiltersChange={setAdvFilters} />
          </div>

          {showSidebar && (
            <>
              <div className="pbp-overlay" onClick={() => setShowSidebar(true)} />
              <div className="pbp-drawer">
                <div className="pbp-drawer-header">
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", fontFamily: "'Playfair Display', serif" }}>Filters</div>
                    <div style={{ fontSize: 12, color: "#8A8A9A", marginTop: 2 }}>Narrow down your search</div>
                  </div>
                  <button className="pbp-drawer-close" onClick={() => setShowSidebar(false)}>✕</button>
                </div>
                <div className="pbp-drawer-body">
                  <AdvancedSidebar onFiltersChange={(f) => { setAdvFilters(f); setShowSidebar(true); }} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}