import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const C = {
  bg: "#f0ebe0",
  bgCard: "#e8e2d6",
  dark: "#111111",
  gold: "#b8963e",
  goldLight: "#d4af6a",
  muted: "#555555",
  light: "#888888",
  border: "#d9d2c5",
  white: "#ffffff",
};

const stats = [
  { number: "12K+", label: "Properties Listed" },
  { number: "8K+", label: "Happy Tenants" },
  { number: "320+", label: "Cities Covered" },
  { number: "99.99%", label: "Platform Uptime" },
];

const values = [
  {
    title: "Transparency First",
    description:
      "Every listing on RentSmart is owner-verified. Contact details are only revealed after a secure payment — eliminating spam, fake listings, and time-wasters for both sides.",
  },
  {
    title: "Built for India",
    description:
      "Designed specifically for the Indian rental market — from 1BHK apartments in Pune to villas in Hyderabad. Search by city, BHK type, budget, and more.",
  },
  {
    title: "Real-time Everything",
    description:
      "Chat with property owners instantly. No phone tag, no waiting. Our real-time messaging system shows you exactly when your message is delivered and read.",
  },
  {
    title: "Secure Payments",
    description:
      "All transactions are processed through Razorpay with server-side signature verification. Your financial data never touches our servers — ever.",
  },
];

const team = [
  {
    name: "Yash Sabne",
    img: "me.png",
    role: "Founder & Full Stack Developer",
    bio: "B.Tech ECE at NIT Surat. Built RentSmart to solve the real problem of finding rental properties in India — too many fake listings, too many calls, too little transparency.",
    link: "https://www.linkedin.com/in/yash-sabne-77239b287",
  },
];



export default function AboutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "About RentSmart — India's Smartest Property Platform";
  }, []);

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>

      {/* HERO */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 60px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: 20 }}>
          About RentSmart
        </p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700, color: C.dark, lineHeight: 1.1, margin: "0 0 24px", fontFamily: "Georgia, serif" }}>
          We built the platform<br />
          <span style={{ color: C.gold, fontStyle: "italic" }}>we wished existed</span>
        </h1>
        <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.8, maxWidth: 620, margin: 0 }}>
          Finding a rental in India shouldn't mean scrolling through hundreds of fake listings,
          fielding broker calls, or paying commission for nothing. RentSmart connects property
          owners directly with genuine seekers — transparently, securely, and in real time.
        </p>
      </section>

      {/* STATS */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32 }}>
          {stats.map((s, i) => (
            <div key={i}>
              <p style={{ fontSize: 36, fontWeight: 700, color: C.dark, margin: "0 0 4px", fontFamily: "Georgia, serif" }}>{s.number}</p>
              <p style={{ fontSize: 13, color: C.light, margin: 0, letterSpacing: 0.3 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>Our Mission</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: C.dark, lineHeight: 1.25, margin: "0 0 20px", fontFamily: "Georgia, serif" }}>
              Make renting as simple as it should be
            </h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, margin: "0 0 16px" }}>
              The Indian rental market is broken. Brokers charge one to two months' rent as commission.
              Listings are duplicated across platforms. Owners get hundreds of spam calls. Tenants
              can't tell real listings from fake ones.
            </p>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, margin: 0 }}>
              RentSmart fixes this by putting owners and seekers in direct contact — with a small,
              transparent access fee that keeps the platform spam-free and the listings genuine.
            </p>
          </div>
          <div style={{ backgroundColor: C.bgCard, borderRadius: 16, padding: "36px 32px" }}>
            <p style={{ fontSize: 13, color: C.light, margin: "0 0 20px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              Why RentSmart
            </p>
            {[
              "Zero broker commission",
              "Owner-verified listings only",
              "Real-time chat with owners",
              "Secure Razorpay payments",
              "Properties across 320+ cities",
              "Smart recommendations by preference",
            ].map((point, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                <span style={{ color: C.gold, fontSize: 16, marginTop: 1, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section style={{ backgroundColor: C.bgCard, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>What We Stand For</p>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: C.dark, margin: "0 0 48px", fontFamily: "Georgia, serif" }}>Our values</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
            {values.map((v, i) => (
              <div key={i} style={{ borderTop: `2px solid ${C.gold}`, paddingTop: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: C.dark, margin: "0 0 10px" }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, margin: 0 }}>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* TEAM */}
      <section style={{ backgroundColor: C.bgCard, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>The People</p>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: C.dark, margin: "0 0 48px", fontFamily: "Georgia, serif" }}>Built by</h2>
          {team.map((member, i) => (
            <div key={i} style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
              <a target="_blank" href={member.img}>
              <div style={{width:200,height: 200,borderRadius: "50%",backgroundColor: C.gold,display: "flex",alignItems: "center",justifyContent: "center",overflow: "hidden",}}>
                  <img
                    src={member.img}
                    alt={member.name ?? ""}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
              </div>
              </a>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.dark, margin: "0 0 4px" }}>{member.name}</h3>
                <p style={{ fontSize: 13, color: C.gold, margin: "0 0 12px", fontWeight: 500 }}>{member.role}</p>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, margin: "0 0 16px", maxWidth: 560 }}>{member.bio}</p>
                <a href={member.link} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: C.dark, borderBottom: `1px solid ${C.gold}`, textDecoration: "none", paddingBottom: 2 }}>
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: C.dark, margin: "0 0 16px", fontFamily: "Georgia, serif" }}>
          Ready to find your next home?
        </h2>
        <p style={{ fontSize: 15, color: C.muted, margin: "0 0 36px" }}>
          Join thousands of tenants and owners already using RentSmart.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/search-for-property/rent")}
            style={{ backgroundColor: C.dark, color: C.white, border: "none", padding: "14px 32px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: 0.3 }}>
            Browse Properties
          </button>
          <button
            onClick={() => navigate("/create")}
            style={{ backgroundColor: "transparent", color: C.dark, border: `1.5px solid ${C.dark}`, padding: "14px 32px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: 0.3 }}>
            List Your Property
          </button>
        </div>
      </section>

    </div>
  );
}
