// Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SavedPropertiesPage from "./SavedList";
import VerifyEmailButton from "../components/VerifyEmailButton";
import { activityConfig, C, navItems } from "../constants";
import { StatusBadge, formatPrice, fullLocation, userInitials } from "../const_func/dashFunction.jsx";
import { API } from "../../apis.js";
import "./styles/dashboard.css";
import MessagesPage from "../components/messages/MessagesPage.jsx";
import Footer from "../components/reuse/Footer.jsx";
import DashboardListingPanel from "../components/Dashboardlistingpanel";
import Payments from "../components/Payments.jsx";
import RecentlyViewed from "./RecentlyViewed.jsx";
import SettingsPage from "../components/Settingspage.jsx";

const todayStr = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState(
    () => sessionStorage.getItem("activeNav") || "overview"
  );
  const [sidebarHover, setSidebarHover] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── User ──
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // ── Paginated properties (for overview card + table) ──
  const [properties, setProperties] = useState([]);
  const [propsLoading, setPropsLoading] = useState(false);
  const [statsData, setStatsData] = useState({ total: 0, active: 0, rent: 0, buy: 0 });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ── Activities ──
  const [activities, setActivities] = useState([]);
 

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ── Fetch user ──
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserLoading(true);
        const res = await fetch(`${API.AUTH}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { navigate("/login"); return; }
        setUser(await res.json());
      } catch { navigate("/login"); }
      finally { setUserLoading(false); }
    };
    fetchUser();
  }, []);

  // ── Fetch paginated properties ──
  const fetchProperties = async (pageNum = 1, append = false) => {
    try {
      setPropsLoading(true);
      const res = await fetch(`${API.PROPERTY}/api/property/my?page=${pageNum}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProperties(prev => append ? [...prev, ...(data.listings || [])] : (data.listings || []));
      setHasMore(data.hasMore);
      if (!append) {
        setStatsData({ total: data.total, active: data.active, rent: data.rent, buy: data.buy });
      }
    } catch (err) { console.log(err); }
    finally { setPropsLoading(false); }
  };

  useEffect(() => { fetchProperties(1); }, []);

  // ── Activities ──
  useEffect(() => {
    if (!user?._id) return;
    fetch(`${API.ACTIVITY}/api/activities/${user._id}`)
      .then(r => r.json())
      .then(data => setActivities(data.activities || []))
      .catch(console.error);
  }, [user]);

  // ── Nav persistence ──
  useEffect(() => {
    const currentNav = navItems.find(item => item.id === activeNav);
    if (!currentNav?.tab) sessionStorage.setItem("activeNav", activeNav);
  }, [activeNav]);

  const handleNavClick = (item) => {
    setActiveNav(item.id);
    setSidebarOpen(false);
    if (item.link) navigate(`/${item.link}`);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    fetchProperties(next, true);
    setPage(next);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const initials = userInitials(user);

  return (
    <>
      <div className="dashboard-root">
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* ── SIDEBAR ── */}
        <aside className={`dashboard-sidebar${sidebarOpen ? " sidebar-open" : ""}`} aria-label="Main navigation">
          <div onClick={() => navigate("/")} style={{ cursor: "pointer" }} className="sidebar-logo playfair">
            Rent<span className="sidebar-logo-accent">Smart</span>
          </div>

          <div className="sidebar-user">
            {userLoading ? (
              <>
                <div className="sk sidebar-avatar-sk" />
                <div className="sidebar-user-text">
                  <div className="sk" style={{ height: 13, width: "70%", marginBottom: 6 }} />
                  <div className="sk" style={{ height: 11, width: "90%" }} />
                </div>
              </>
            ) : (
              <>
                <div className="sidebar-avatar">{initials}</div>
                <div className="sidebar-user-text">
                  <div className="sidebar-user-name">{user?.firstName} {user?.lastName}</div>
                  <div className="sidebar-user-email">{user?.email}</div>
                </div>
              </>
            )}
          </div>

          <nav className="sidebar-nav" aria-label="Dashboard sections">
            {navItems.map(item => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  onMouseEnter={() => setSidebarHover(item.id)}
                  onMouseLeave={() => setSidebarHover(null)}
                  className={`sidebar-nav-item${isActive ? " active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && <span className="sidebar-nav-indicator" aria-hidden="true" />}
                  <span className="sidebar-nav-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar-nav-label">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-bottom">
            <button onClick={() => navigate("/create")} className="btn-add-listing">+ Add New Listing</button>
            <button onClick={handleLogout} className="btn-logout"><span aria-hidden="true">→</span> Log Out</button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="dashboard-main">
          <header className="dashboard-topbar">
            <button
              className="topbar-hamburger"
              onClick={() => setSidebarOpen(v => !v)}
              aria-label="Toggle navigation menu"
              aria-expanded={sidebarOpen}
            >
              <span /><span /><span />
            </button>
            <div className="topbar-title-group">
              <h1 className="topbar-title">{navItems.find(n => n.id === activeNav)?.label || "Overview"}</h1>
              <p className="topbar-date">{todayStr()}</p>
            </div>
            <div className="topbar-right">
              <VerifyEmailButton user={user} token={token} />
              <div className="topbar-avatar-chip">
                <div className="topbar-avatar">{initials}</div>
                <span className="topbar-username">{userLoading ? "..." : user?.firstName}</span>
              </div>
            </div>
          </header>

          <div className="dashboard-content">

            {/* ── TOP STAT CARDS ── */}
            <div className="stats-grid">
              {[
                { label: "Total Listings", value: statsData.total, icon: "🏠", colorVar: "--color-blue", bgVar: "--color-blue-bg" },
                { label: "Featured", value: statsData.active, icon: "⭐", colorVar: "--color-gold", bgVar: "--color-gold-light" },
                { label: "For Rent", value: statsData.rent, icon: "🔑", colorVar: "--color-green", bgVar: "--color-green-bg" },
                { label: "For Sale", value: statsData.buy, icon: "💰", colorVar: "--color-red", bgVar: "--color-red-bg" },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-label">{s.label}</span>
                    <div className="stat-card-icon" style={{ background: `var(${s.bgVar})` }}>{s.icon}</div>
                  </div>
                  {propsLoading
                    ? <div className="sk-light stat-skeleton" />
                    : <div className="stat-value playfair">{s.value ?? 0}</div>
                  }
                </div>
              ))}
            </div>

            {/* ── MAIN TWO-COLUMN GRID ── */}
            <div className="dashboard-grid">

              {/* LEFT column */}
              <div className="dashboard-col-main">

                {/* OVERVIEW: simple paginated listing card */}
                {activeNav === "overview" && (
                  <div className="card listings-card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">My Listings</div>
                        <div className="card-subtitle">Total: <b>{propsLoading ? "..." : statsData.total}</b></div>
                      </div>
                      <button onClick={() => navigate("/create")} className="btn-outline-sm">+ Add New</button>
                    </div>

                    <div className="listings-scroll">
                      {propsLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="listing-row listing-row-sk">
                            <div className="sk-light listing-thumb-sk" />
                            <div className="listing-info">
                              <div className="sk-light" style={{ height: 13, width: "60%", marginBottom: 7 }} />
                              <div className="sk-light" style={{ height: 11, width: "40%" }} />
                            </div>
                            <div className="listing-meta">
                              <div className="sk-light" style={{ height: 13, width: 80, marginBottom: 7 }} />
                              <div className="sk-light" style={{ height: 20, width: 56, borderRadius: 100 }} />
                            </div>
                          </div>
                        ))
                      ) : properties.length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-icon">🏠</div>
                          <div className="empty-title">No listings yet</div>
                          <div className="empty-sub">Add your first property to get started</div>
                        </div>
                      ) : (
                        properties.map((p, i) => {
                          const isRent = p.buyOrSell?.toLowerCase() === "rent";
                          return (
                            <div
                              key={p._id}
                              onClick={() => navigate(`/details/${p._id}`)}
                              className="listing-row"
                              role="button" tabIndex={0}
                              onKeyDown={e => e.key === "Enter" && navigate(`/details/${p._id}`)}
                              style={{ borderBottom: i < properties.length - 1 ? `1px solid var(--color-border)` : "none" }}
                            >
                              <div className="listing-thumb">
                                {p.listingPhotos?.[0]
                                  ? <img src={p.listingPhotos[0]} alt={p.title} className="listing-thumb-img" />
                                  : <div className="listing-thumb-placeholder">🏠</div>
                                }
                              </div>
                              <div className="listing-info">
                                <div className="listing-title">{p.title}</div>
                                <div className="listing-location">📍 {fullLocation(p.address)}</div>
                                <div className="listing-tags">
                                  <span className="tag" style={{
                                    background: isRent ? `var(--color-green-bg)` : `var(--color-red-bg)`,
                                    color: isRent ? `var(--color-green)` : `var(--color-red)`,
                                  }}>{p.buyOrSell}</span>
                                  <span className="tag tag-muted">{p.category}</span>
                                </div>
                              </div>
                              <div className="listing-meta">
                                <div className="listing-price">{formatPrice(p.price, p.paymentType)}</div>
                                <div className="listing-details-text">🛏 {p.details?.bedroomCount ?? 0} &nbsp; 🚿 {p.details?.bathroomCount ?? 0}</div>
                                {p.isPromoted && <span className="tag tag-gold">⭐ Featured</span>}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {hasMore && !propsLoading && (
                      <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
                        <button onClick={handleLoadMore} className="btn-outline-sm">Load More</button>
                      </div>
                    )}
                  </div>
                )}

                {/* LISTINGS tab: DashboardListingPanel takes over */}
                {activeNav === "listings" && (
                  <DashboardListingPanel token={token} />
                )}

                {activeNav === "saved" && <SavedPropertiesPage embedded />}
                {activeNav === "messages" && <MessagesPage currentUser={user} />}
                {activeNav === "payments" && <Payments />}

                {activeNav === "recent" && <RecentlyViewed token={token} />}

                {activeNav === "settings" &&  <SettingsPage token={token} onLogout={handleLogout} /> }

              </div>

              {/* RIGHT column: Activity + Profile */}
              <aside className="dashboard-col-side" aria-label="Activity and profile">
                <div className="card activity-card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Recent Activity</div>
                      <div className="card-subtitle">Last 7 days</div>
                    </div>
                    <span className="tag tag-gold">{activities.length} events</span>
                  </div>

                  <div className="activity-scroll">
                    {activities.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <div className="empty-title">No activity yet</div>
                        <div className="empty-sub">Actions you take will show up here</div>
                      </div>
                    ) : (
                      activities.map((activity, i) => {
                        const config = activityConfig[activity.type];
                        console.log(config)
                        if (!config) return null;
                        return (
                          <div key={activity._id} className="activity-row"
                            style={{ borderBottom: i === activities.length - 1 ? "none" : `1px solid var(--color-border)` }}>
                            <div className="activity-icon" style={{ background: `${config.color}18` }}>{config.icon}</div>
                            <div className="activity-info">
                              <span className="tag" style={{ background: `${config.color}18`, color: config.color, marginBottom: 4, display: "inline-block" }}>
                                {config.label}
                              </span>
                              <div className="activity-text">{config.text(activity.meta)}</div>
                              <div className="activity-time">
                                {new Date(activity.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {!userLoading && user && (
                    <div className="profile-quickview">
                      <div className="profile-quickview-title">Your Profile</div>
                      {[
                        ["📍", "City", user.city || "Not set"],
                        ["📞", "Phone", user.phone || "Not set"],
                        ["✉️", "Email", user.email],
                        ["🏷️", "Prefs", user.preferences?.join(", ") || "None set"],
                      ].map(([icon, label, val]) => (
                        <div key={label} className="profile-row">
                          <span className="profile-row-icon" aria-hidden="true">{icon}</span>
                          <div className="profile-row-text">
                            <span className="profile-row-label">{label}: </span>
                            <span className="profile-row-val">{val}</span>
                          </div>
                        </div>
                      ))}
                      {user.premiumMember && (
                        <div className="premium-badge"><span>⭐</span><span>Premium Member</span></div>
                      )}
                    </div>
                  )}
                </div>
              </aside>
            </div>

            {/* ── ALL PROPERTIES TABLE (both tabs) ── */}
            {(activeNav === "overview" || activeNav === "listings") && (
              <div className="card table-card">
                <div className="card-header">
                  <div>
                    <div className="card-title">All Properties — Detail View</div>
                    <div className="card-subtitle">
                      {propsLoading ? "Loading..." : `${statsData.total} listing${statsData.total !== 1 ? "s" : ""} total`}
                    </div>
                  </div>
                  <button className="btn-text-gold">Export →</button>
                </div>

                <div className="table-scroll-wrapper">
                  <table className="properties-table">
                    <thead>
                      <tr>
                        {["Property", "Location", "Type", "Price", "Beds", "Baths", "Amenities", "Actions"].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {propsLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i} className="table-row-sk">
                            {Array.from({ length: 8 }).map((__, j) => (
                              <td key={j}><div className="sk-light" style={{ height: 13, width: j === 0 ? 140 : 80 }} /></td>
                            ))}
                          </tr>
                        ))
                      ) : properties.length === 0 ? (
                        <tr><td colSpan={8} className="table-empty">No properties found. Add your first listing!</td></tr>
                      ) : (
                        properties.map(p => (
                          <tr key={p._id} className="table-data-row">
                            <td>
                              <div className="table-property-cell">
                                <div className="table-thumb">
                                  {p.listingPhotos?.[0]
                                    ? <img src={p.listingPhotos[0]} alt={p.title} className="table-thumb-img" />
                                    : <div className="table-thumb-placeholder">🏠</div>
                                  }
                                </div>
                                <div className="table-property-info">
                                  <div className="table-property-title">{p.title}</div>
                                  <div className="table-property-cat">{p.category}</div>
                                </div>
                              </div>
                            </td>
                            <td className="table-location">{fullLocation(p.address)}</td>
                            <td>
                              <StatusBadge status={p.status === "AVAILABLE" && !p.isHidden ? "Active" : "Paused"} />
                              <div className="table-type-sub">{p.type}</div>
                            </td>
                            <td className="table-price">{formatPrice(p.price, p.paymentType)}</td>
                            <td className="table-center">{p.details?.bedroomCount ?? "—"}</td>
                            <td className="table-center">{p.details?.bathroomCount ?? "—"}</td>
                            <td>
                              <div className="amenities-wrap">
                                {p.amenities?.slice(0, 2).map(a => (
                                  <span key={a} className="tag tag-muted">{a}</span>
                                ))}
                                {(p.amenities?.length ?? 0) > 2 && (
                                  <span className="tag tag-gold">+{p.amenities.length - 2}</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button onClick={() => navigate(`/details/${p._id}`)} className="btn-action btn-action-green">View</button>
                                <button onClick={() => navigate(`/edit-property/${p._id}`)} className="btn-action btn-action-neutral">Edit</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {hasMore && !propsLoading && (
                  <div style={{ padding: "16px", textAlign: "center", borderTop: "1px solid #f0f0f0" }}>
                    <button onClick={handleLoadMore} className="btn-action btn-action-green">Load More</button>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}