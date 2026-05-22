import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SavedPropertiesPage from "./SavedList";
import VerifyEmailButton from "../components/VerifyEmailButton";
import { activityConfig,C,navItems } from "../constants";
import { Avatar,StatusBadge,formatPrice,fullLocation,userInitials } from "../const_func/dashFunction.jsx";
import { API } from "../../apis.js";


const todayStr = () =>
  new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState(() => {
    return localStorage.getItem("activeNav") || "overview";
  });

  const [sidebarHover, setSidebarHover] = useState(null);

  // ── Data state ──
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [propsLoading, setPropsLoading] = useState(true);
  const [statsData, setStatsData] = useState({ total: 0, active: 0, totalViews: 0, totalInquiries: 0 });
  
  const [activities, setActivities] =useState([]);


  const navigate = useNavigate();

  // ── Fetch user ──
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserLoading(true);
        const res = await fetch(`${API.AUTH}/api/auth/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) { navigate("/login"); return; }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.log(err);
        navigate("/login");
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);


  // ── Fetch properties ──
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setPropsLoading(true);
        const res = await fetch(`${API.PROPERTY}/api/property/my`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setProperties(list);

        setStatsData({
          total: list.length,

          active: list.filter((p) => p.promoted)
            .length,

          rent: list.filter(
            (p) =>
              p.buyOrSell &&
              p.buyOrSell.trim().toLowerCase() ===
              "rent"
          ).length,

          buy: list.filter(
            (p) =>
              p.buyOrSell &&
              p.buyOrSell.trim().toLowerCase() ===
              "sell"
          ).length,
        });
      } catch (err) {
        console.log(err);
      } finally {
        setPropsLoading(false);
      }
    };
    fetchProperties();
  }, []);


  useEffect(() => {
    const currentNav = navItems.find(item => item.id === activeNav);

    if (!currentNav?.tab) {
      localStorage.setItem("activeNav", activeNav);
    }
  }, [activeNav]);


  useEffect(() => {

    const fetchActivities =
      async () => {

        try {

          const res =
            await fetch(
              `${API.ACTIVITY}/api/activities/${user._id}`
            );

          const data =
            await res.json();

          setActivities(
            data.activities || []
          );

        } catch (error) {

          console.error(error);

        }
      };

    if (user?._id) {
      fetchActivities();
    }

  }, [user]);


  // ── Logout ──
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const initials = userInitials(user);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: C.cream }}>
   
      {/* ── SIDEBAR ── */}
      <aside style={{ width: 240, background: C.sidebar, display: "flex", flexDirection: "column", padding: "28px 0", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50 }}>

        {/* Logo */}
        <div className="playfair" style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", padding: "0 24px 28px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          Rent<span style={{ color: C.gold }}>Smart</span>
        </div>

        {/* User info */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {userLoading ? (
            <>
              <div className="sk" style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="sk" style={{ height: 13, width: "70%", marginBottom: 6 }} />
                <div className="sk" style={{ height: 11, width: "90%" }} />
              </div>
            </>
          ) : (
            <>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.goldLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.gold, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.email}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            const isHovered = sidebarHover === item.id;
            return (

              <button key={item.id}
                onClick={() => {
                  setActiveNav(item.id);

                  if (item.link) {
                    navigate(`/${item.link}`);
                  }
                }}
                onMouseEnter={() => setSidebarHover(item.id)}
                onMouseLeave={() => setSidebarHover(null)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, border: "none", background: isActive ? "rgba(200,169,110,0.15)" : isHovered ? "rgba(255,255,255,0.05)" : "transparent", color: isActive ? C.gold : "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: isActive ? 600 : 400, width: "100%", textAlign: "left", transition: "all .2s", position: "relative" }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}

                {isActive && <span style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, borderRadius: "0 3px 3px 0", background: C.gold }} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom: Add Listing + Logout */}
        <div style={{ padding: "16px 16px 0", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => navigate("/create")}
            style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: C.gold, color: C.ink, fontSize: 13, fontWeight: 600, transition: "opacity .2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            + Add New Listing
          </button>
          <button
            onClick={handleLogout}
            style={{ width: "100%", padding: "10px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(192,57,43,0.15)"; e.currentTarget.style.color = "#e57373"; e.currentTarget.style.borderColor = "rgba(192,57,43,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
            <span style={{ fontSize: 14 }}>→</span> Log Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <header style={{
          background: C.white,
          borderBottom: `1px solid ${C.border}`,
          padding: "0 36px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 40
        }}>

          {/* LEFT: Page title + date */}
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: C.ink }}>
              {navItems.find((n) => n.id === activeNav)?.label || "Overview"}
            </h1>
            <p style={{ fontSize: 12, color: C.inkMuted, marginTop: 1 }}>{todayStr()}</p>
          </div>

          {/* RIGHT: Verify email + bell + avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            {/* Email verification — only renders when needed */}
            <VerifyEmailButton
              user={user}
              token={localStorage.getItem("token")}
            />



            {/* Avatar chip */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 14px 6px 6px",
              borderRadius: 100,
              border: `1.5px solid ${C.border}`,
              cursor: "pointer"
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: C.goldLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: C.gold
              }}>
                {initials}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>
                {userLoading ? "..." : user?.firstName}
              </span>
            </div>

          </div>
        </header>

        <div style={{ padding: "32px 36px", flex: 1 }}>

          <div className="fu" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Total Listings", value: statsData.total, icon: "🏠", color: C.blue, bg: C.blueBg },
              { label: "Featured", value: statsData.active, icon: "⭐", color: C.gold, bg: C.goldLight },
              { label: "For Rent", value: statsData.rent, icon: "🔑", color: C.green, bg: C.greenBg },
              { label: "For Sale", value: statsData.buy, icon: "💰", color: C.red, bg: C.redBg },
            ].map((s) => (
              <div key={s.label} style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "20px 22px", boxShadow: C.cardShadow }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</span>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{s.icon}</div>
                </div>
                {propsLoading ? (
                  <div className="sk-light" style={{ height: 28, width: "50%" }} />
                ) : (
                  <div style={{ fontSize: 28, fontWeight: 700, color: C.ink, fontFamily: "'Playfair Display', serif" }}>{s.value ?? 0}</div>
                )}
              </div>
            ))}
          </div>



          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 22,
            padding: "32px 36px"
          }}>

            <div>

              {(activeNav === "listings" || activeNav === "overview") && (
                <>
                  {/* MY LISTINGS CONTENT */}

                  {/* My Listings */}
                  <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.cardShadow, maxHeight: 520, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>My Listings</div>
                        <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 2 }}>
                          Total: <b>{propsLoading ? "..." : properties.length}</b>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/create")}
                        style={{ fontSize: 12, fontWeight: 500, padding: "7px 16px", borderRadius: 100, border: `1.5px solid ${C.border}`, background: "none", color: C.ink, transition: "all .2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.ink; }}>
                        + Add New
                      </button>
                    </div>

                    {/* Scrollable list */}
                    <div style={{ overflowY: "auto", flex: 1 }}>
                      {propsLoading ? (
                        // Skeleton rows
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
                            <div className="sk-light" style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div className="sk-light" style={{ height: 13, width: "60%", marginBottom: 7 }} />
                              <div className="sk-light" style={{ height: 11, width: "40%" }} />
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div className="sk-light" style={{ height: 13, width: 80, marginBottom: 7 }} />
                              <div className="sk-light" style={{ height: 20, width: 56, borderRadius: 100 }} />
                            </div>
                          </div>
                        ))
                      ) : properties.length === 0 ? (
                        <div style={{ padding: "48px 24px", textAlign: "center" }}>
                          <div style={{ fontSize: 36, marginBottom: 12 }}>🏠</div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 6 }}>No listings yet</div>
                          <div style={{ fontSize: 12, color: C.inkMuted }}>Add your first property to get started</div>
                        </div>
                      ) : (
                        properties.map((p, i) => {
                          const isRent = p.buyOrSell?.toLowerCase() === "rent";
                          return (
                            <div key={p._id}
                              onClick={() => navigate(`/details/${p._id}`)}
                              style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 24px", borderBottom: i < properties.length - 1 ? `1px solid ${C.border}` : "none", transition: "background .2s", cursor: "pointer" }}
                              onMouseEnter={e => e.currentTarget.style.background = C.cream}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                              {/* Thumbnail */}
                              <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: C.border }}>
                                {p.listingPhotos?.[0] ? (
                                  <img src={p.listingPhotos[0]} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏠</div>
                                )}
                              </div>

                              {/* Info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {p.title}
                                </div>
                                <div style={{ fontSize: 11, color: C.inkMuted }}>
                                  📍 {fullLocation(p.address)}
                                </div>
                                <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
                                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: isRent ? C.greenBg : C.redBg, color: isRent ? C.green : C.red }}>
                                    {p.buyOrSell}
                                  </span>
                                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: C.border, color: C.inkMuted }}>
                                    {p.category}
                                  </span>
                                </div>
                              </div>

                              {/* Price + details */}
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 5 }}>
                                  {formatPrice(p.price, p.paymentType)}
                                </div>
                                <div style={{ fontSize: 11, color: C.inkMuted }}>
                                  🛏 {p.details?.bedroomCount ?? 0} &nbsp; 🚿 {p.details?.bathroomCount ?? 0}
                                </div>
                                {p.promoted && (
                                  <div style={{ marginTop: 4 }}>
                                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: C.goldLight, color: C.gold }}>
                                      ⭐ Featured
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                  </div>



                </>
              )}

              {activeNav === "saved" && (
                <SavedPropertiesPage embedded />
              )}

              {activeNav === "payments" && (
                <div style={{
                  background: C.white,
                  borderRadius: 20,
                  border: `1px solid ${C.border}`,
                  padding: 32
                }}>
                  Payments Coming Soon
                </div>
              )}

              {activeNav === "settings" && (
                <div style={{
                  background: C.white,
                  borderRadius: 20,
                  border: `1px solid ${C.border}`,
                  padding: 32
                }}>
                  Settings Coming Soon
                </div>
              )}

            </div>
         <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.cardShadow, display: "flex", flexDirection: "column" }}>

  {/* Header */}
  <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Recent Activity</div>
      <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>Last 7 days</div>
    </div>
    <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: C.goldLight, color: C.gold }}>
      {activities.length} events
    </span>
  </div>

  {/* Activity list */}
 <div style={{ overflowY: "auto", maxHeight: 340 }}>
  {activities.length === 0 ? (
    <div style={{ padding: "32px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>No activity yet</div>
      <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 4 }}>Actions you take will show up here</div>
    </div>
  ) : (
    activities.map((activity, i) => {
      const config = activityConfig[activity.type];
      if (!config) return null;

      const isLast = i === activities.length - 1;

      return (
        <div
          key={activity._id}
          style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 20px", borderBottom: isLast ? "none" : `1px solid ${C.border}`, transition: "background .15s", cursor: "default" }}
          onMouseEnter={e => e.currentTarget.style.background = C.cream}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {/* Icon bubble */}
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `${config.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, marginTop: 1 }}>
            {config.icon}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 100, background: `${config.color}15`, color: config.color }}>
                {config.label}
              </span>
            </div>
            <div style={{ fontSize: 12,fontWeight:"450", color: C.ink, lineHeight: 1.5, wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "normal", }}>
              {config.text(activity.meta)}
            </div>
            <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 3 }}>
              {new Date(activity.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
      );
    })
  )}
</div>

  {/* Profile quick view */}
  {!userLoading && user && (
    <div style={{ margin: "12px 14px 14px", padding: "14px 16px", background: C.cream, borderRadius: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>Your Profile</div>

      {[
        ["📍", "City",    user.city  || "Not set"],
        ["📞", "Phone",   user.phone || "Not set"],
        ["✉️", "Email",   user.email],
        ["🏷️", "Prefs",   user.preferences?.join(", ") || "None set"],
      ].map(([icon, label, val]) => (
        <div key={label} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-start" }}>
          <span style={{ fontSize: 11, flexShrink: 0, marginTop: 1 }}>{icon}</span>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 11, color: C.inkMuted }}>{label}: </span>
            <span style={{ fontSize: 11, fontWeight: 500, color: C.ink, wordBreak: "break-all" }}>{val}</span>
          </div>
        </div>
      ))}

      {user.premiumMember && (
        <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, background: C.goldLight, border: `1px solid rgba(200,169,110,0.3)`, borderRadius: 100, padding: "3px 10px" }}>
          <span style={{ fontSize: 11 }}>⭐</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.gold }}>Premium Member</span>
        </div>
      )}
    </div>
  )}
</div>

          </div>
          {/* ── PROPERTY DETAILS TABLE ── */}
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.cardShadow, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>All Properties — Detail View</div>
                <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 2 }}>
                  {propsLoading ? "Loading..." : `${properties.length} listing${properties.length !== 1 ? "s" : ""} total`}
                </div>
              </div>
              <button style={{ fontSize: 12, fontWeight: 500, color: C.gold, border: "none", background: "none" }}>
                Export →
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.cream }}>
                    {["Property", "Location", "Type", "Price", "Bedrooms", "Bathrooms", "Amenities", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "11px 20px", fontSize: 11, fontWeight: 600, color: C.inkMuted, textAlign: "left", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {propsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                        {Array.from({ length: 8 }).map((__, j) => (
                          <td key={j} style={{ padding: "14px 20px" }}>
                            <div className="sk-light" style={{ height: 13, width: j === 0 ? 140 : 80 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : properties.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "48px 24px", textAlign: "center", color: C.inkMuted, fontSize: 14 }}>
                        No properties found. Add your first listing!
                      </td>
                    </tr>
                  ) : (
                    properties.map((p) => (
                      <tr key={p._id}
                        style={{ borderTop: `1px solid ${C.border}`, transition: "background .15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = C.cream}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                        {/* Property */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: C.border }}>
                              {p.listingPhotos?.[0] ? (
                                <img src={p.listingPhotos[0]} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>🏠</div>
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>
                                {p.title}
                              </div>
                              <div style={{ fontSize: 11, color: C.inkMuted }}>{p.category}</div>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td style={{ padding: "14px 20px", fontSize: 13, color: C.inkMuted, whiteSpace: "nowrap" }}>
                          {fullLocation(p.address)}
                        </td>

                        {/* Type */}
                        <td style={{ padding: "14px 20px" }}>
                          <StatusBadge status={p.buyOrSell === "Rent" ? "Active" : "Paused"} />
                          <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 4 }}>{p.type}</div>
                        </td>

                        {/* Price */}
                        <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>
                          {formatPrice(p.price, p.paymentType)}
                        </td>

                        {/* Bedrooms */}
                        <td style={{ padding: "14px 20px", fontSize: 13, color: C.ink, textAlign: "center" }}>
                          {p.details?.bedroomCount ?? "—"}
                        </td>

                        {/* Bathrooms */}
                        <td style={{ padding: "14px 20px", fontSize: 13, color: C.ink, textAlign: "center" }}>
                          {p.details?.bathroomCount ?? "—"}
                        </td>

                        {/* Amenities */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 160 }}>
                            {p.amenities?.slice(0, 2).map((a) => (
                              <span key={a} style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 100, background: C.border, color: C.inkMuted }}>
                                {a}
                              </span>
                            ))}
                            {(p.amenities?.length ?? 0) > 2 && (
                              <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 100, background: C.goldLight, color: C.gold }}>
                                +{p.amenities.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => navigate(`/property/${p._id}`)}
                              style={{ fontSize: 12, fontWeight: 500, padding: "5px 14px", borderRadius: 100, border: `1.5px solid ${C.green}`, color: C.green, background: "none", transition: "all .2s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = C.green; e.currentTarget.style.color = "#fff"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.green; }}>
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/edit-listing/${p._id}`)}
                              style={{ fontSize: 12, fontWeight: 500, padding: "5px 14px", borderRadius: 100, border: `1.5px solid ${C.border}`, color: C.inkMuted, background: "none", transition: "all .2s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = C.ink; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.inkMuted; e.currentTarget.style.borderColor = C.border; }}>
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}