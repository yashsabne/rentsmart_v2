import { Link } from "react-router-dom";
import { C,footerCols } from "../../constants"

const Footer =  () => {

    const routeMap = {
    "About Us": "/about",
    Careers: "/careers",
    Press: "/press",
    Blog: "/blog",

    Buy: "/search-for-property/sell",
    Rent: "/search-for-property/rent",  
    Premium: "/premium-coming-soon",

    "Help Center": "/help",
    "Contact Us": "/contact",
    "Privacy Policy": "/privacy-policy",
    developer: "/developer",
  };


    return   <footer style={{ background: "#141414", padding: "56px 48px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48, paddingBottom: 40, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div>
            <div className="playfair" style={{ fontSize: 22, fontWeight: 700, color: "#FFFFFF", marginBottom: 14 }}>
              Rent<span style={{ color: C.gold }}>Smart</span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, maxWidth: 260 }}>
              India's most trusted platform to find, buy, rent, or sell properties across 320+ cities.
            </p>
          </div>
          {footerCols.map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 20 }}>{col.title}</div>
              <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {col.links.map((l) => (
                   <li key={l}>
                  <Link
                    to={routeMap[l] || "/"}
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.4)",
                      textDecoration: "none",
                      transition: "all .25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = "#FFFFFF";
                      e.target.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "rgba(255,255,255,0.4)";
                      e.target.style.transform = "translateX(0px)";
                    }}
                  >
                    {l}
                  </Link>
                </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          <span>© 2025 RentSmart. All rights reserved.</span>
          <span>Made with ♥ for India 🇮🇳</span>
        </div>
      </footer>
}

export default Footer;