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

const featured = {
  slug: "how-to-find-rental-property-india",
  category: "Renting Guide",
  title: "How to Find a Genuine Rental Property in India (Without Getting Scammed)",
  excerpt:
    "The Indian rental market is full of duplicate listings, ghost brokers, and fake photos. Here's a practical checklist to protect yourself and find a real home — fast.",
  date: "June 12, 2026",
  readTime: "7 min read",
  tags: ["Renting", "India", "Tips"],
};

const posts = [
  {
    slug: "1bhk-vs-2bhk-which-is-right-for-you",
    category: "Property Advice",
    title: "1BHK vs 2BHK: Which Is Right for You in 2026?",
    excerpt:
      "Rent prices, space tradeoffs, and lifestyle factors — a practical guide to choosing the right flat size for your budget and situation.",
    date: "June 8, 2026",
    readTime: "5 min read",
    tags: ["1BHK", "2BHK", "Budget"],
  },
  {
    slug: "rental-agreement-india-what-to-check",
    category: "Legal",
    title: "What to Check in a Rental Agreement Before Signing",
    excerpt:
      "Most tenants skip the fine print. Here are the 10 clauses in every rental agreement that could cost you money if you miss them.",
    date: "June 4, 2026",
    readTime: "6 min read",
    tags: ["Legal", "Agreement", "Tenants"],
  },
  {
    slug: "best-cities-to-rent-india-2026",
    category: "City Guides",
    title: "Best Cities to Rent in India in 2026: Affordability vs Opportunity",
    excerpt:
      "Pune, Hyderabad, Chennai, or Bengaluru? We compare rental prices, job markets, and quality of life across India's top rental cities.",
    date: "May 28, 2026",
    readTime: "8 min read",
    tags: ["Cities", "India", "Relocation"],
  },
  {
    slug: "how-to-list-property-for-rent-rentsmart",
    category: "For Owners",
    title: "How to List Your Property on RentSmart and Get Genuine Enquiries",
    excerpt:
      "A step-by-step guide for property owners — from writing a listing that converts, to managing chat enquiries and getting your property rented faster.",
    date: "May 20, 2026",
    readTime: "5 min read",
    tags: ["Owners", "Listing", "Tips"],
  },
  {
    slug: "security-deposit-rules-india",
    category: "Legal",
    title: "Security Deposit Rules in India: What Landlords Can and Cannot Do",
    excerpt:
      "How much deposit is legal? Can a landlord refuse to return it? Everything tenants and owners need to know about security deposits in India.",
    date: "May 14, 2026",
    readTime: "6 min read",
    tags: ["Security Deposit", "Legal", "Rights"],
  },
  {
    slug: "furnished-vs-unfurnished-rental",
    category: "Property Advice",
    title: "Furnished vs Unfurnished Rental: Which Saves You More Money?",
    excerpt:
      "Furnished flats cost more upfront but less overall — sometimes. Here's how to run the numbers for your specific situation before deciding.",
    date: "May 6, 2026",
    readTime: "4 min read",
    tags: ["Furnished", "Budget", "Tips"],
  },
];

const categories = ["All", "Renting Guide", "Property Advice", "Legal", "City Guides", "For Owners"];

export default function BlogPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Blog — RentSmart | Property Renting Tips & Guides for India";
  }, []);

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>

      {/* HERO */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 48px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>
          RentSmart Blog
        </p>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 700, color: C.dark, lineHeight: 1.15, margin: "0 0 20px", fontFamily: "Georgia, serif" }}>
          Guides, tips & advice<br />
          <span style={{ color: C.gold, fontStyle: "italic" }}>for smarter renting</span>
        </h1>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
          Practical, no-fluff articles to help tenants find genuine homes and owners attract the right tenants — across India.
        </p>
      </section>

      {/* CATEGORIES */}
      <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", display: "flex", gap: 0, overflowX: "auto" }}>
          {categories.map((cat, i) => (
            <button key={i}
              style={{
                background: "none", border: "none", padding: "16px 20px", fontSize: 13, fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? C.dark : C.light, cursor: "pointer", whiteSpace: "nowrap",
                borderBottom: i === 0 ? `2px solid ${C.gold}` : "2px solid transparent",
                letterSpacing: 0.2,
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FEATURED POST */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 0" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.light, marginBottom: 20 }}>
          Featured
        </p>
        <div style={{ backgroundColor: C.bgCard, borderRadius: 16, padding: "40px 40px", border: `1px solid ${C.border}`, cursor: "pointer" }}
          onClick={() => navigate(`/blog/${featured.slug}`)}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.gold, backgroundColor: "#f5e9d0", padding: "4px 12px", borderRadius: 99, letterSpacing: "0.08em" }}>
              {featured.category}
            </span>
            <span style={{ fontSize: 12, color: C.light }}>{featured.date}</span>
            <span style={{ fontSize: 12, color: C.light }}>{featured.readTime}</span>
          </div>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: C.dark, lineHeight: 1.3, margin: "0 0 16px", fontFamily: "Georgia, serif" }}>
            {featured.title}
          </h2>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, margin: "0 0 24px" }}>
            {featured.excerpt}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {featured.tags.map((tag, i) => (
              <span key={i} style={{ fontSize: 11, color: C.muted, backgroundColor: C.bg, padding: "3px 10px", borderRadius: 99, border: `1px solid ${C.border}` }}>
                #{tag}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 13, color: C.dark, fontWeight: 600, borderBottom: `1px solid ${C.gold}`, paddingBottom: 2 }}>
            Read article
          </span>
        </div>
      </section>

      {/* ALL POSTS */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.light, marginBottom: 28 }}>
          All Articles
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {posts.map((post, i) => (
            <div key={i} 
              style={{ backgroundColor: C.bgCard, borderRadius: 12, padding: "28px 28px", border: `1px solid ${C.border}`, cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: C.gold, backgroundColor: "#f5e9d0", padding: "3px 10px", borderRadius: 99, letterSpacing: "0.06em" }}>
                  {post.category}
                </span>
                <span style={{ fontSize: 11, color: C.light }}>{post.readTime}</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, lineHeight: 1.4, margin: "0 0 10px", fontFamily: "Georgia, serif" }}>
                {post.title}
              </h3>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: "0 0 18px" }}>
                {post.excerpt}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: C.light }}>{post.date}</span> 
              </div>
            </div>
          ))}
        </div>
      </section>
 
      <section style={{ backgroundColor: C.bgCard, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.dark, margin: "0 0 16px", fontFamily: "Georgia, serif" }}>
            About This Blog
          </h2>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, maxWidth: 680, margin: "0 0 24px" }}>
            The RentSmart blog publishes practical guides for tenants and property owners across India.
            Topics include how to find rental flats in cities like Pune, Bengaluru, Hyderabad, and Chennai,
            understanding rental agreements, security deposit laws, and tips for listing properties to
            attract genuine enquiries — without brokers.
          </p>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, maxWidth: 680, margin: 0 }}>
            RentSmart (rentsmart.fun) is India's direct rental marketplace — no brokers, no commission,
            no fake listings. Browse verified properties across 320+ cities or list your property today.
          </p>
        </div>
      </section>

    </div>
  );
}
