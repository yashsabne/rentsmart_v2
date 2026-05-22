import { useEffect } from "react";

const C = {
  ink: "#1a1a2e",
  inkMuted: "#7a7a8a",
  border: "#e8e8f0",
  white: "#ffffff",
  cream: "#f9f8f5",
  gold: "#c8a96e",
  goldLight: "rgba(200,169,110,0.12)",
};

/**
 * Pagination
 * Props:
 *   currentPage  : number  (1-based)
 *   totalPages   : number
 *   onPageChange : (page: number) => void
 *   totalItems   : number   (optional — shows "Showing X–Y of Z")
 *   pageSize     : number   (optional, default 10)
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  pageSize = 10,
}) {
  // Scroll to top of listing section smoothly on page change
  useEffect(() => {
    const el = document.getElementById("property-listing-top");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  if (totalPages <= 1) return null;

  // Build page range with ellipsis
  const buildRange = () => {
    const range = [];
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        range.push(i);
      }
    }

    const withEllipsis = [];
    let prev = null;
    for (const page of range) {
      if (prev !== null && page - prev > 1) {
        withEllipsis.push("…");
      }
      withEllipsis.push(page);
      prev = page;
    }
    return withEllipsis;
  };

  const pages = buildRange();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems ?? currentPage * pageSize);

  return (
    <>
      <style>{`
        @keyframes pgFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .pg-root { animation: pgFadeIn .35s both; }
        .pg-btn { transition: all .18s; }
        .pg-btn:hover:not(:disabled) { border-color: ${C.ink} !important; color: ${C.ink} !important; transform: translateY(-1px); }
        .pg-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      <div className="pg-root" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        padding: "32px 0 12px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Item count label */}
        {totalItems !== undefined && (
          <div style={{ fontSize: 12, color: C.inkMuted }}>
            Showing <strong style={{ color: C.ink }}>{startItem}–{endItem}</strong> of{" "}
            <strong style={{ color: C.ink }}>{totalItems}</strong> properties
          </div>
        )}

        {/* Page buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Prev */}
          <button
            className="pg-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange?.(currentPage - 1)}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              background: C.white,
              color: currentPage === 1 ? C.border : C.inkMuted,
              fontSize: 13,
              fontWeight: 500,
              cursor: currentPage === 1 ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← Prev
          </button>

          {/* Page numbers */}
          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} style={{ padding: "8px 6px", fontSize: 13, color: C.inkMuted }}>
                …
              </span>
            ) : (
              <button
                key={p}
                className="pg-btn"
                onClick={() => onPageChange?.(p)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  border: `1.5px solid ${p === currentPage ? C.gold : C.border}`,
                  background: p === currentPage ? C.goldLight : C.white,
                  color: p === currentPage ? C.ink : C.inkMuted,
                  fontSize: 13,
                  fontWeight: p === currentPage ? 700 : 400,
                  cursor: p === currentPage ? "default" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <button
            className="pg-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange?.(currentPage + 1)}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              background: C.white,
              color: currentPage === totalPages ? C.border : C.inkMuted,
              fontSize: 13,
              fontWeight: 500,
              cursor: currentPage === totalPages ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Next →
          </button>
        </div>

        {/* Quick jump */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.inkMuted }}>
          <span>Go to page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            defaultValue={currentPage}
            key={currentPage}
            onKeyDown={e => {
              if (e.key === "Enter") {
                const val = parseInt(e.target.value);
                if (val >= 1 && val <= totalPages) onPageChange?.(val);
              }
            }}
            style={{
              width: 52,
              padding: "5px 8px",
              borderRadius: 8,
              border: `1.5px solid ${C.border}`,
              fontSize: 12,
              color: C.ink,
              textAlign: "center",
              outline: "none",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <span>of {totalPages}</span>
        </div>
      </div>
    </>
  );
}
