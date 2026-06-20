// src/components/PaymentHistory.jsx
import { useState, useEffect } from "react";
import { STYLES,t,StatusBadge,Chip,SummaryCard, RowIcon,Amount,fmtDate,ContactRow,PromotionRow,Skeleton,ErrorState ,EmptyState,Pagination,pgBtn} from "./Helper.Payments.jsx";

const API_BASE = import.meta.env.VITE_PAYMENT_API || "";

const TABS = [
  { key: "contacts", label: "Contact Reveals", icon: "📞" },
  { key: "promotions", label: "Listing Promotions", icon: "⭐" },
];


/* ─── Main component ─────────────────────────────────── */
export default function Payments() {
  const [activeTab, setActiveTab] = useState("contacts");
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  /* fetch summary once */
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/payments/history/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) setSummary(json.summary);
      } catch (err) {
        console.error("Summary fetch error:", err);
      }
    };
    fetchSummary();
  }, []);

  /* reset on tab change */
  useEffect(() => {
    setData([]);
    setPage(1);
    setPagination(null);
  }, [activeTab]);

  /* fetch list */
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = activeTab === "contacts"
        ? "/api/payments/history/contacts"
        : "/api/payments/history/promotions";

      const res = await fetch(`${API_BASE}${endpoint}?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setPagination(json.pagination);
      } else {
        setError(json.message || "Failed to load payments.");
      }
    } catch (err) {
      console.error("Data fetch error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab, page]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="ph-wrap" style={{
        background: t.bg, borderRadius: 16,
        padding: "28px 28px 24px", 
        boxSizing: "border-box",
      }}>

        {/* Header */}
        <div className="ph-header" style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 22,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: t.text, letterSpacing: "-0.3px" }}>
              Payment History
            </h2>
            {summary && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: t.textMuted }}>
                ₹{summary.totalSpent} total spent across all transactions
              </p>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="ph-cards" style={{ marginBottom: 24 }}>
            <SummaryCard icon="📞" label="Contacts Revealed" value={summary.contactsRevealed} />
            <SummaryCard icon="⭐" label="Listings Promoted" value={summary.listingsPromoted} />
            <SummaryCard icon="💳" label="Total Spent" value={`₹${summary.totalSpent}`} />
          </div>
        )}

        {/* Tabs */}
        <div className="ph-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "10px 16px", fontSize: 14,
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? t.text : t.textMuted,
                borderBottom: activeTab === tab.key
                  ? `2px solid ${t.text}` : "2px solid transparent",
                marginBottom: -2, transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && <Skeleton />}

        {/* Error */}
        {error && !loading && (
          <ErrorState message={error} onRetry={fetchData} />
        )}

        {/* Empty */}
        {!loading && !error && data.length === 0 && (
          <EmptyState tab={activeTab} />
        )}

        {/* List */}
        {!loading && !error && data.length > 0 && (
          <div>
            {activeTab === "contacts"
              ? data.map(item => <ContactRow key={item._id} item={item} />)
              : data.map(item => <PromotionRow key={item._id} item={item} />)}

            {pagination && pagination.totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={pagination.totalPages}
                onPrev={() => setPage(p => p - 1)}
                onNext={() => setPage(p => p + 1)}
              />
            )}
          </div>
        )}

      </div>
    </>
  );
}