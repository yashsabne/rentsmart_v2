import { Link } from "react-router-dom";
import { C, footerCols } from "../../constants";

const Footer = () => {
  const currentYear = new Date().getFullYear();
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

  return (
    <>
      <style>
        {`
          .footer-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 48px;
            margin-bottom: 48px;
            padding-bottom: 40px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }

          .footer-bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: rgba(255,255,255,0.3);
          }

          @media (max-width: 992px) {
            .footer-grid {
              grid-template-columns: 1fr 1fr;
              gap: 32px;
            }
          }

          @media (max-width: 768px) {
            .footer-container {
              padding: 40px 24px 24px !important;
            }

            .footer-grid {
              grid-template-columns: 1fr;
              gap: 28px;
              text-align: center;
            }

            .footer-description {
              max-width: 100% !important;
              margin: 0 auto;
            }

            .footer-links {
              align-items: center;
            }

            .footer-bottom {
              flex-direction: column;
              gap: 10px;
              text-align: center;
            }
          }

          @media (max-width: 480px) {
            .footer-container {
              padding: 32px 18px 20px !important;
            }

            .footer-logo {
              font-size: 20px !important;
            }

            .footer-heading {
              margin-bottom: 14px !important;
            }
          }
        `}
      </style>

      <footer
        className="footer-container"
        style={{
          background: "#141414",
          padding: "56px 48px 28px",
        }}
      >
        <div className="footer-grid">
          <div>
            <div
              className="playfair footer-logo"
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#FFFFFF",
                marginBottom: 14,
              }}
            >
              Rent<span style={{ color: C.gold }}>Smart</span>
            </div>

            <p
              className="footer-description"
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.75,
                maxWidth: 260,
              }}
            >
              India's most trusted platform to find, buy, rent, or sell
              properties across 320+ cities.
            </p>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <div
                className="footer-heading"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "#FFFFFF",
                  marginBottom: 20,
                }}
              >
                {col.title}
              </div>

              <ul
                className="footer-links"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      to={routeMap[l] || "/"}
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                        textDecoration: "none",
                        transition: "all .25s ease",
                        display: "inline-block",
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

        <div className="footer-bottom">
          <span>© {currentYear} RentSmart. All rights reserved.</span>
          <span>Made with ♥ for India 🇮🇳</span>
        </div>
      </footer>
    </>
  );
};

export default Footer;
