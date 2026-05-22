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
import { API } from "../../apis";


const PAGE_SIZE = 9;

export default function PropertyBuyPage() {
  const [typeFilter, setTypeFilter] = useState("All");
  const [budgetIdx, setBudgetIdx] = useState(0);
  const [bedsFilter, setBedsFilter] = useState("Any");
  const [sortBy, setSortBy] = useState("Relevance");
  const [savedIds, setSavedIds] = useState([]);

  const [hoveredCard, setHoveredCard] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const { type } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [advFilters, setAdvFilters] = useState({});
  
  const navigate = useNavigate();
 const [searchParams] = useSearchParams();
const search = searchParams.get("search") || "all";

const PAGE_SIZE = 9;

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
    query.set(
      "amenities",
      advFilters.amenities.join(",")
    );
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

    // ---------------- PAGINATION ----------------

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

// FETCH WHEN FILTERS CHANGE
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

// FETCH DATA
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
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif", color: C.ink }}>
      <Navbar scrolled={true} />

      {/* FILTER BAR (UNTOUCHED) */}
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

          {/* Budget */}
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
            <div style={{ display: "flex", border: `1.5px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
              {[["⊞", "grid"], ["☰", "list"]].map(([icon, mode]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  style={{ padding: "6px 12px", border: "none", background: viewMode === mode ? C.ink : "none", color: viewMode === mode ? "#fff" : C.inkMuted, fontSize: 15, cursor: "pointer", transition: "all .2s" }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 80px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, alignItems: "start" }}>
        {/* LEFT: Listings */}
        <div>
          <div id="property-listing-top" style={{ position: "relative", top: -100 }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div>
              <span className="pf" style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>{totalCount}</span>
              <span style={{ fontSize: 14, color: C.inkMuted, marginLeft: 8 }}>properties found</span>
              {search && search !== "all" && <span style={{ fontSize: 13, color: C.gold, marginLeft: 8 }}>for "{search}"</span>}
            </div>
            <div style={{ fontSize: 12, color: C.inkMuted }}>Showing verified listings only ✓</div>
          </div>

          {/* Skeleton loading - same as before */}
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

          {/* Grid view (same UI as before) */}
          {!loading && viewMode === "grid" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {paginatedResults.map(p => (
                <div key={p._id} className="prop-card fu"
                  onClick={() => navigate(`/details/${p._id}`)}
                  onMouseEnter={() => setHoveredCard(p._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}`, transition: "all .3s", cursor: "pointer" }}>
                  <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                    <img src={p.listingPhotos?.[0]} alt={p.title} decoding="async" loading="lazy" style={{ width: "100%", height: "220px", objectFit: "cover" }} />
                <SaveButton
  id={p._id}
  isSaved={savedIds.includes(p._id)}
  onToggle={toggleSave}
/>
                  </div>
                  <div style={{ padding: "16px 18px 18px" }}>
                    <div className="pf" style={{ fontSize: 19, fontWeight: 700, color: C.ink, marginBottom: 2 }}>{p.priceLabel}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 4 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: C.inkMuted, marginBottom: 12 }}>📍 {p.address?.city}</div>
                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, display: "flex", gap: 14 }}>
                      {[["🛏", `${p.details?.bedroomCount} Bed`], ["🚿", `${p.details?.bathroomCount} Bath`], ["📐", `${p.details.area} sqft`]].map(([icon, val]) => (
                        <span key={val} style={{ fontSize: 12, color: C.inkMuted, display: "flex", alignItems: "center", gap: 4 }}>{icon} {val}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {paginatedResults.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>🏚️</div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: C.ink, marginBottom: 8 }}>No properties found</div>
                  <div style={{ fontSize: 13, color: C.inkMuted }}>Try adjusting your filters or search terms</div>
                </div>
              )}
            </div>
          )}

          {/* List view (same UI as before) */}
          {!loading && viewMode === "list" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {paginatedResults.map(p => (
                <div key={p._id}
                  onClick={() => navigate(`/details/${p._id}`)}
                  onMouseEnter={() => setHoveredCard(p._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ background: C.white, borderRadius: 18, overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: hoveredCard === p._id ? C.cardHover : C.cardShadow, transform: hoveredCard === p._id ? "translateY(-3px)" : "none", transition: "all .3s", cursor: "pointer", display: "flex" }}>
                  <div style={{ width: 220, flexShrink: 0, overflow: "hidden" }}>
                    <img src={p.listingPhotos?.[0]} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s", transform: hoveredCard === p._id ? "scale(1.05)" : "scale(1)" }} />
                  </div>
                  <div style={{ padding: "20px 22px", flex: 1, display: "flex", gap: 20 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 4 }}>{p.title}</div>
                      <div style={{ fontSize: 13, color: C.inkMuted, marginBottom: 12 }}>📍 {p.address?.city}</div>
                      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                        {[["🛏", `${p.details?.bedroomCount} Bed`], ["🚿", `${p.details?.bathroomCount} Bath`], ["📐", `${p.details.area} sqft`]].map(([icon, val]) => (
                          <span key={val} style={{ fontSize: 12, color: C.inkMuted, display: "flex", alignItems: "center", gap: 4 }}>{icon} {val}</span>
                        ))}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: C.greenBg, color: C.green }}>✓ Verified</span>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div className="pf" style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>{p.priceLabel}</div>
                      <button style={{ display: "block", width: "100%", padding: "9px 20px", borderRadius: 100, border: "none", background: C.ink, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: 8, transition: "background .2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = C.gold}
                        onMouseLeave={e => e.currentTarget.style.background = C.ink}>
                        View Details
                      </button>
                      <button onClick={e => { e.stopPropagation(); toggleSave(p._id); }}
                        style={{ display: "block", width: "100%", padding: "9px 20px", borderRadius: 100, border: `1.5px solid ${C.border}`, background: "none", color: C.inkMuted, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all .2s" }}>
                        {savedIds.includes(p._id) ? "❤️ Saved" : "🤍 Save"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {paginatedResults.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>🏚️</div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: C.ink, marginBottom: 8 }}>No properties found</div>
                  <div style={{ fontSize: 13, color: C.inkMuted }}>Try adjusting your filters or search terms</div>
                </div>
              )}
            </div>
          )}

          {/* PAGINATION */}
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
        <AdvancedSidebar onFiltersChange={setAdvFilters} />
      </div>
    </div>
  );
}