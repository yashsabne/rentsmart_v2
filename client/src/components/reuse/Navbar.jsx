import { React, useEffect, useState } from "react";
import { C } from "../../constants";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoggedIn(true);
    }
  }, []);


  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <style>{`
        .nb-links { display: flex; }
        .nb-actions { display: flex; }
        .nb-hamburger { display: none; }

        /* Tablet / Mobile: ≤768px */
        @media (max-width: 768px) {
          .nb-nav { padding: 0 24px !important; }
          .nb-links { display: none !important; }
          .nb-actions { display: none !important; }
          .nb-hamburger { display: flex !important; }
          .nb-nav {width:100vw }
        }

        /* Extra small: ≤380px */
        @media (max-width: 380px) {
          .nb-nav { padding: 0 16px !important; }
          .nb-logo { font-size: 18px !important; }
        }

        /* Mobile drawer */
        .nb-drawer {
          display: none;
          position: fixed;
          top: 64px; left: 0; right: 0;
          background: rgba(250,250,247,0.98);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid ${C.border};
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          z-index: 99;
          padding: 20px 24px 28px;
          flex-direction: column;
          gap: 0;
          transition: opacity .25s ease, transform .25s ease;
        }
        .nb-drawer.open { display: flex; }

        .nb-drawer-link {
          display: block;
          padding: 13px 0;
          font-size: 15px;
          font-weight: 500;
          color: ${C.inkMuted};
          border-bottom: 1px solid ${C.border};
          text-decoration: none;
          transition: color .2s;
        }
        .nb-drawer-link:last-of-type { border-bottom: none; }
        .nb-drawer-link:hover { color: ${C.ink}; }

        .nb-drawer-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .nb-drawer-actions button {
          flex: 1;
          padding: 11px 0;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all .2s;
        }

        /* Hamburger icon lines */
        .hb-line {
          display: block;
          width: 22px;
          height: 2px;
          background: ${C.ink};
          border-radius: 2px;
          transition: all .3s ease;
          transform-origin: center;
        }
        .hb-open .hb-line:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .hb-open .hb-line:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hb-open .hb-line:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
      `}</style>

      {/* Main navbar */}
      <nav className="nb-nav" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 64,
        background: scrolled || menuOpen ? "rgba(250,250,247,0.95)" : "transparent",
        backdropFilter: scrolled || menuOpen ? "blur(12px)" : "none",
        borderBottom: scrolled || menuOpen ? `1px solid ${C.border}` : "none",
        boxShadow: scrolled || menuOpen ? "0 2px 16px rgba(0,0,0,0.05)" : "none",
        transition: "all .3s ease",
      }}>

        {/* Logo */}
        <a href="/" className="playfair nb-logo" style={{ fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: "-0.5px", textDecoration: "none" }}>
          Rent<span style={{ color: C.gold }}>Smart</span>
        </a>

        <ul
          className="nb-links"
          style={{
            gap: 32,
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex"
          }}
        >
          {["sell", "rent", "help"].map((item) => (

            <li key={item}>

              <Link
                to={
                  item === "help"
                    ? "/help"
                    : `/search-for-property/${item}`
                }
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: C.inkMuted,
                  transition: "color .2s",
                  textDecoration: "none",
                  textTransform: "capitalize"
                }}
                onMouseEnter={(e) => (e.target.style.color = C.ink)}
                onMouseLeave={(e) => (e.target.style.color = C.inkMuted)}
              >
                {item}
              </Link>

            </li>

          ))}
        </ul>

        {/* Desktop action buttons */}
        <div className="nb-actions" style={{ gap: 10, alignItems: "center" }}>

          {loggedIn ? (<Link to="/dashboard" >
            <button style={{ fontSize: 13, fontWeight: 500, padding: "8px 20px", borderRadius: 100, border: `1.5px solid ${C.border}`, background: "none", color: C.ink, cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.ink; }}>
              Dashboard
            </button>
          </Link>
          )
            :
            (
              <Link to="/login" >
                <button style={{ fontSize: 13, fontWeight: 500, padding: "8px 20px", borderRadius: 100, border: `1.5px solid ${C.border}`, background: "none", color: C.ink, cursor: "pointer", transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.ink; }}>
                  Login
                </button>
              </Link>
            )
          }


          <Link to="/create" > <button style={{ fontSize: 13, fontWeight: 500, padding: "9px 22px", borderRadius: 100, border: "none", background: C.ink, color: "#fff", cursor: "pointer", transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = C.gold}
            onMouseLeave={e => e.currentTarget.style.background = C.ink}>
            List Property
          </button>
          </Link>
        </div>

        {/* Hamburger button — mobile only */}
        <button className="nb-hamburger" onClick={() => setMenuOpen(o => !o)}
          style={{ display: "none", flexDirection: "column", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8 }}>
          <span className={`hb-icon ${menuOpen ? "hb-open" : ""}`} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="hb-line" />
            <span className="hb-line" />
            <span className="hb-line" />
          </span>
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`nb-drawer ${menuOpen ? "open" : ""}`}>
        {["sell", "rent", "help"].map((item) => (
          <Link
            key={item}
            to={
              item === "help"
                ? "/help"
                : `/search-for-property/${item}`
            }
            className="nb-drawer-link"
            onClick={() => setMenuOpen(false)}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </Link>
        ))}
        <div className="nb-drawer-actions">
            {loggedIn ? (<Link to="/dashboard" >
            <button style={{ fontSize: 13, fontWeight: 500, padding: "8px 20px", borderRadius: 100, border: `1.5px solid ${C.border}`, background: "none", color: C.ink, cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.ink; }}>
              Dashboard
            </button>
          </Link>
          )
            :
            (
              <Link to="/login" >
                <button style={{ fontSize: 13, fontWeight: 500, padding: "8px 20px", borderRadius: 100, border: `1.5px solid ${C.border}`, background: "none", color: C.ink, cursor: "pointer", transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.ink; }}>
                  Login
                </button>
              </Link>
            )
          }
          <button style={{ border: "none", background: C.ink, color: "#fff" }}
            onMouseEnter={e => e.currentTarget.style.background = C.gold}
            onMouseLeave={e => e.currentTarget.style.background = C.ink}>
            List Property
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;