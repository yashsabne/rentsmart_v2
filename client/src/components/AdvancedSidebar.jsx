import { useState, useEffect, useRef, useCallback } from "react";
import { POPULAR_LOCATIONS,C,AMENITIES_LIST,PROPERTY_TYPES} from "../constants";


// ── Debounce hook ──────────────────────────────────────────────────────────────
function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
const BEDS_OPTIONS = ["Any", "1", "2", "3", "4+"];
const BATH_OPTIONS = ["Any", "1", "2", "3", "4+"]; 
const SORT_OPTIONS = ["Relevance", "Price: Low–High", "Price: High–Low", "Newest First"];

const STORAGE_KEY = "adv_sidebar_filters";
const RECENT_KEY = "adv_recent_searches";

const DEFAULT_FILTERS = {
  city: "",
  budgetMin: "",
  budgetMax: "",
  propertyType: "All",
  listingType: "Buy",
  beds: "Any",
  baths: "Any",
  furnished: false,
  amenities: [],
  readyToMove: false,
  parking: false, 
  sortBy: "Relevance",
};
 
// ── Sub-components ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase", color: C.inkMuted, marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

function PillBtn({ active, onClick, children, gold }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 13px", borderRadius: 100, cursor: "pointer",
      fontSize: 12, fontWeight: 500, transition: "all .18s",
      border: `1.5px solid ${active ? (gold ? C.gold : C.ink) : C.border}`,
      background: active ? (gold ? C.goldLight : C.ink) : "transparent",
      color: active ? (gold ? C.ink : "#fff") : C.inkMuted,
    }}>
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: "18px 0" }} />;
}

function Toggle({ label, value, onChange, icon }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 14px", borderRadius: 12,
      background: value ? C.goldLight : C.cream,
      border: `1.5px solid ${value ? C.gold : C.border}`,
      transition: "all .2s", cursor: "pointer",
    }} onClick={() => onChange(!value)}>
      <span style={{ fontSize: 13, fontWeight: 500, color: C.ink, display: "flex", alignItems: "center", gap: 8 }}>
        {icon && <span>{icon}</span>}
        {label}
      </span>
      <div style={{
        width: 38, height: 22, borderRadius: 100, position: "relative",
        background: value ? C.gold : C.border, transition: "background .2s",
      }}>
        <div style={{
          position: "absolute", top: 3, left: value ? 18 : 3,
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)", transition: "left .2s",
        }} />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdvancedSidebar({ onFiltersChange }) {
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_FILTERS, ...JSON.parse(saved) } : DEFAULT_FILTERS;
    } catch { return DEFAULT_FILTERS; }
  });

  const [cityInput, setCityInput] = useState(filters.city);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
    catch { return []; }
  });
  const [isSticky, setIsSticky] = useState(false);
  const sidebarRef = useRef(null);
  const cityInputRef = useRef(null);

  const debouncedCity = useDebounce(cityInput);

  // Persist filters
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(filters)); }
    catch { }
    onFiltersChange?.(filters);
  }, [filters]);

  // Update city in filters when debounced
  useEffect(() => {
    setFilters(f => ({ ...f, city: debouncedCity }));
  }, [debouncedCity]);

  // Sticky sidebar
  useEffect(() => {
    const handler = () => setIsSticky(window.scrollY > 80);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Suggestions filtered
  const suggestions = cityInput.length > 0
    ? POPULAR_LOCATIONS.filter(l => l.toLowerCase().includes(cityInput.toLowerCase()))
    : POPULAR_LOCATIONS;

  const set = useCallback((key, val) => setFilters(f => ({ ...f, [key]: val })), []);

  const toggleAmenity = (id) => {
    setFilters(f => ({
      ...f,
      amenities: f.amenities.includes(id)
        ? f.amenities.filter(a => a !== id)
        : [...f.amenities, id],
    }));
  };

  const selectCity = (city) => {
    setCityInput(city);
    setShowSuggestions(false);
    const updated = [city, ...recentSearches.filter(r => r !== city)].slice(0, 5);
    setRecentSearches(updated);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)); } catch { }
  };

  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    setCityInput("");
  };

  const activeCount = [
    filters.city,
    filters.budgetMin,
    filters.budgetMax,
    filters.propertyType !== "All",
    filters.listingType !== "Buy",
    filters.beds !== "Any",
    filters.baths !== "Any",
    filters.furnished,
    filters.amenities.length > 0,
    filters.readyToMove,
    filters.parking, 
    filters.sortBy !== "Relevance",
  ].filter(Boolean).length;

  return (
    <>
      <style>{`
        @keyframes sidebarIn { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }
        .adv-sidebar { animation: sidebarIn .4s both;margin-top:20px }
        .adv-sidebar::-webkit-scrollbar { width: 3px; }
        .adv-sidebar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 10px; }
        .adv-input { outline:none; transition: border-color .2s; }
        .adv-input:focus { border-color: ${C.gold} !important; }
        .adv-amenity:hover { border-color: ${C.ink} !important; background: ${C.cream} !important; }
        .clear-btn:hover { background: #fee !important; border-color: #faa !important; color: #c44 !important; }
        .apply-btn:hover { background: #b8944d !important; }
        .sugg-item:hover { background: ${C.cream} !important; }
      `}</style>

      <div
        className="adv-sidebar"
        ref={sidebarRef}
        style={{
          position: "sticky",
          top: isSticky ? 76 : 20,
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
          background: C.white,
          borderRadius: 20,
          border: `1px solid ${C.border}`,
          padding: "22px 20px 24px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          transition: "top .3s",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, fontFamily: "'Playfair Display', serif" }}>
              Advanced Search
            </div>
            {activeCount > 0 && (
              <div style={{ fontSize: 11, color: C.gold, fontWeight: 600, marginTop: 2 }}>
                {activeCount} filter{activeCount > 1 ? "s" : ""} active
              </div>
            )}
          </div>
          <button
            className="clear-btn"
            onClick={clearAll}
            style={{
              fontSize: 12, fontWeight: 600, color: C.inkMuted,
              background: "none", border: `1.5px solid ${C.border}`,
              borderRadius: 8, padding: "5px 12px", cursor: "pointer",
              transition: "all .18s",
            }}
          >
            Clear All
          </button>
        </div>

        {/* City Search */}
        <SectionLabel>Location</SectionLabel>
        <div style={{ position: "relative", marginBottom: 6 }}>
          <input
            ref={cityInputRef}
            className="adv-input"
            value={cityInput}
            onChange={e => { setCityInput(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search city or area…"
            style={{
              width: "100%", padding: "10px 36px 10px 14px",
              borderRadius: 12, border: `1.5px solid ${C.border}`,
              fontSize: 13, color: C.ink, background: C.cream,
              boxSizing: "border-box",
            }}
          />
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔍</span>

          {/* Dropdown */}
          {showSuggestions && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
              background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
              boxShadow: "0 8px 28px rgba(0,0,0,0.10)", zIndex: 999, overflow: "hidden",
            }}>
              {recentSearches.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: C.inkMuted, padding: "10px 14px 4px" }}>
                    Recent
                  </div>
                  {recentSearches.map(r => (
                    <div key={r} className="sugg-item" onClick={() => selectCity(r)} style={{
                      padding: "9px 14px", fontSize: 13, color: C.ink,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background .15s",
                    }}>
                      <span style={{ fontSize: 12, color: C.inkMuted }}>🕐</span> {r}
                    </div>
                  ))}
                  <div style={{ height: 1, background: C.border, margin: "4px 0" }} />
                </div>
              )}
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: C.inkMuted, padding: "8px 14px 4px" }}>
                {cityInput ? "Suggestions" : "Popular Cities"}
              </div>
              {suggestions.slice(0, 6).map(s => (
                <div key={s} className="sugg-item" onClick={() => selectCity(s)} style={{
                  padding: "9px 14px", fontSize: 13, color: C.ink,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background .15s",
                }}>
                  <span style={{ fontSize: 12, color: C.gold }}>📍</span> {s}
                </div>
              ))}
              {suggestions.length === 0 && (
                <div style={{ padding: "12px 14px", fontSize: 12, color: C.inkMuted }}>No locations found</div>
              )}
            </div>
          )}
        </div>

        <Divider />

        {/* Budget */}
        <SectionLabel>Budget Range (₹)</SectionLabel>
        <div style={{ display: "flex", gap: 5, marginBottom: 4 }}>
          <input
            className="adv-input"
            type="number"
            value={filters.budgetMin}
            onChange={e => set("budgetMin", e.target.value)}
            placeholder="Min"
            style={{
              flex: 1, padding: "9px 12px", borderRadius: 12,
              border: `1.5px solid ${C.border}`, fontSize: 13,
              color: C.ink, background: C.cream, boxSizing: "border-box",
              width:"70px"
            }}
          />
          <div style={{ display: "flex", alignItems: "center", color: C.inkMuted, fontSize: 12 }}>-</div>
          <input
            className="adv-input"
            type="number"
            value={filters.budgetMax}
            onChange={e => set("budgetMax", e.target.value)}
            placeholder="Max"
            style={{
              flex: 1, padding: "9px 12px", borderRadius: 12,
              border: `1.5px solid ${C.border}`, fontSize: 13,
              color: C.ink, background: C.cream, boxSizing: "border-box",
              width:"70px"
            }}
          />
        </div>
   

      
        <Divider />
 
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <SectionLabel>Bedrooms</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {BEDS_OPTIONS.map(b => (
                <PillBtn key={b} active={filters.beds === b} onClick={() => set("beds", b)}>{b}</PillBtn>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Bathrooms</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {BATH_OPTIONS.map(b => (
                <PillBtn key={b} active={filters.baths === b} onClick={() => set("baths", b)}>{b}</PillBtn>
              ))}
            </div>
          </div>
        </div>

        <Divider />
 

        {/* Amenities */}
        <SectionLabel>Amenities</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {AMENITIES_LIST.map(a => {
            const active = filters.amenities.includes(a.id);
            return (
              <button key={a.id} className="adv-amenity" onClick={() => toggleAmenity(a.id)} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 11px", borderRadius: 10, cursor: "pointer",
                fontSize: 12, fontWeight: 500, transition: "all .18s",
                border: `1.5px solid ${active ? C.gold : C.border}`,
                background: active ? C.goldLight : "transparent",
                color: active ? C.ink : C.inkMuted,
              }}>
                <span style={{ fontSize: 13 }}>{a.icon}</span>
                <span style={{ fontSize: 11 }}>{a.label}</span>
              </button>
            );
          })}
        </div>

 
        <Divider />

        {/* Apply */}
        <button
          className="apply-btn"
          onClick={() => onFiltersChange?.(filters)}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 14,
            background: C.gold, border: "none", color: C.ink,
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            transition: "background .2s", letterSpacing: "0.02em",
          }}
        >
          Apply Filters ✦
        </button>

        <button
          className="clear-btn"
          onClick={clearAll}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 14,
            background: "none", border: `1.5px solid ${C.border}`,
            color: C.inkMuted, fontSize: 12, fontWeight: 600,
            cursor: "pointer", marginTop: 8, transition: "all .18s",
          }}
        >
          Reset All Filters
        </button>
      </div>
    </>
  );
}
