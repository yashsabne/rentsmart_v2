import { useState } from "react";

const C = {
  cream:   "#FAFAF7",
  white:   "#FFFFFF",
  ink:     "#141414",
  muted:   "#6B6B6B",
  light:   "#9A9A9A",
  gold:    "#C8A96E",
  goldBg:  "#F5EDD8",
  border:  "#E8E8E3",
  green:   "#2D6A4F",
  greenBg: "#EAF4EE",
  red:     "#C0392B",
};

const plans = [
  {
    id:       "basic",
    name:     "Basic",
    monthly:  0,
    yearly:   0,
    tag:      null,
    desc:     "Everything you need to get started.",
    features: [
      { text: "3 active listings",          included: true  },
      { text: "Standard visibility",        included: true  },
      { text: "Basic analytics",            included: true  },
      { text: "Email support",              included: true  },
      { text: "Featured listing badges",    included: false },
      { text: "Priority search placement",  included: false },
      { text: "Dedicated account manager",  included: false },
      { text: "Unlimited listings",         included: false },
    ],
  },
  {
    id:       "pro",
    name:     "Pro",
    monthly:  999,
    yearly:   799,
    tag:      "Most Popular",
    desc:     "For serious property owners and agents.",
    features: [
      { text: "20 active listings",         included: true  },
      { text: "Priority search placement",  included: true  },
      { text: "Featured listing badges",    included: true  },
      { text: "Advanced analytics",         included: true  },
      { text: "Email & chat support",       included: true  },
      { text: "Dedicated account manager",  included: false },
      { text: "Unlimited listings",         included: false },
      { text: "API access",                 included: false },
    ],
  },
  {
    id:       "elite",
    name:     "Elite",
    monthly:  2499,
    yearly:   1999,
    tag:      "Best Value",
    desc:     "The full power of RentSmart for professionals.",
    features: [
      { text: "Unlimited active listings",  included: true  },
      { text: "Top search placement",       included: true  },
      { text: "Featured listing badges",    included: true  },
      { text: "Full analytics suite",       included: true  },
      { text: "Priority 24/7 support",      included: true  },
      { text: "Dedicated account manager",  included: true  },
      { text: "API access",                 included: true  },
      { text: "Custom branding",            included: true  },
    ],
  },
];

const faqs = [
  { q: "Can I cancel anytime?",                  a: "Yes. You can cancel your subscription at any time from your account settings. You'll retain access until the end of your billing period." },
  { q: "Is there a free trial?",                  a: "Pro and Elite plans come with a 14-day free trial. No credit card required to start." },
  { q: "Can I switch plans?",                     a: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle." },
  { q: "What payment methods are accepted?",      a: "We accept all major credit and debit cards, UPI, net banking, and wallets." },
  { q: "Do you offer refunds?",                   a: "We offer a 7-day money-back guarantee on paid plans if you're not satisfied." },
];

export default function BeAPremium() {
  const [yearly,    setYearly]    = useState(false);
  const [selected,  setSelected]  = useState("pro");
  const [openFaq,   setOpenFaq]   = useState(null);
  const [hovered,   setHovered]   = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif !important; }
        .pf { font-family: 'Playfair Display', serif !important; }
        button, input { font-family: 'DM Sans', sans-serif; cursor: pointer; }
        a { text-decoration: none; color: inherit; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp .45s both; }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .compare-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 0;
        }
        @media (max-width: 900px) {
          .plans-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
          .compare-grid { display: none; }
        }
        @media (max-width: 600px) {
          .section-pad { padding: 48px 20px !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 64, borderBottom: `1px solid ${C.border}`, background: C.white }}>
        <a href="/" className="pf" style={{ fontSize: 21, fontWeight: 700, color: C.ink }}>
          Rent<span style={{ color: C.gold }}>Smart</span>
        </a>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ fontSize: 13, fontWeight: 500, padding: "8px 20px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "none", color: C.ink, transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = C.white; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.ink; }}>
            Login
          </button>
          <button style={{ fontSize: 13, fontWeight: 500, padding: "8px 20px", borderRadius: 10, border: "none", background: C.ink, color: C.white, transition: "background .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#2a2a2a"}
            onMouseLeave={e => e.currentTarget.style.background = C.ink}>
            Dashboard
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="section-pad fu" style={{ padding: "72px 48px 56px", textAlign: "center" }}>
        <div style={{ display: "inline-block", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.gold, background: C.goldBg, padding: "5px 16px", borderRadius: 100, marginBottom: 20 }}>
          Premium Plans
        </div>
        <h1 className="pf" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 700, color: C.ink, lineHeight: 1.12, marginBottom: 16 }}>
          Grow faster with<br />RentSmart Premium
        </h1>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 480, margin: "0 auto 36px" }}>
          More visibility, more leads, more closings. Choose a plan that fits your needs.
        </p>

        {/* Billing toggle */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 100, padding: "6px 20px" }}>
          <span style={{ fontSize: 14, fontWeight: yearly ? 400 : 600, color: yearly ? C.muted : C.ink }}>Monthly</span>
          <div onClick={() => setYearly(!yearly)}
            style={{ width: 44, height: 24, borderRadius: 12, background: yearly ? C.ink : C.border, cursor: "pointer", position: "relative", transition: "background .25s" }}>
            <div style={{ position: "absolute", top: 3, left: yearly ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: C.white, transition: "left .25s" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: yearly ? 600 : 400, color: yearly ? C.ink : C.muted }}>
            Yearly
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: C.green, background: C.greenBg, padding: "2px 8px", borderRadius: 100 }}>Save 20%</span>
          </span>
        </div>
      </div>

      {/* ── PLANS ── */}
      <div className="section-pad" style={{ padding: "0 48px 72px" }}>
        <div className="plans-grid">
          {plans.map((plan) => {
            const isSelected = selected === plan.id;
            const price      = yearly ? plan.yearly : plan.monthly;
            const isPro      = plan.id === "pro";

            return (
              <div key={plan.id}
                onMouseEnter={() => setHovered(plan.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background:   isSelected ? C.ink : C.white,
                  border:       `2px solid ${isSelected ? C.ink : hovered === plan.id ? "#aaa" : C.border}`,
                  borderRadius: 20,
                  padding:      "32px 28px",
                  position:     "relative",
                  transition:   "all .25s",
                  transform:    isSelected ? "translateY(-6px)" : "none",
                  boxShadow:    isSelected ? "0 16px 48px rgba(0,0,0,0.14)" : "0 2px 12px rgba(0,0,0,0.05)",
                  cursor:       "pointer",
                }}
                onClick={() => setSelected(plan.id)}
              >
                {/* Tag */}
                {plan.tag && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: isSelected ? C.gold : C.ink, color: isSelected ? C.ink : C.white, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 14px", borderRadius: 100, whiteSpace: "nowrap" }}>
                    {plan.tag}
                  </div>
                )}

                <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "rgba(255,255,255,0.5)" : C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {plan.name}
                </div>

                <div style={{ marginBottom: 6 }}>
                  <span className="pf" style={{ fontSize: 36, fontWeight: 700, color: isSelected ? C.white : C.ink }}>
                    {price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`}
                  </span>
                  {price > 0 && (
                    <span style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.4)" : C.muted, marginLeft: 4 }}>
                      / mo
                    </span>
                  )}
                </div>

                {yearly && price > 0 && (
                  <div style={{ fontSize: 12, color: isSelected ? "rgba(255,255,255,0.4)" : C.muted, marginBottom: 4 }}>
                    Billed ₹{(price * 12).toLocaleString("en-IN")}/year
                  </div>
                )}

                <p style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.5)" : C.muted, lineHeight: 1.6, marginBottom: 24, marginTop: 8 }}>
                  {plan.desc}
                </p>

                <div style={{ borderTop: `1px solid ${isSelected ? "rgba(255,255,255,0.12)" : C.border}`, paddingTop: 20, marginBottom: 24, display: "flex", flexDirection: "column", gap: 11 }}>
                  {plan.features.map((f) => (
                    <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: f.included ? (isSelected ? "rgba(255,255,255,0.15)" : C.greenBg) : "transparent", border: f.included ? "none" : `1.5px solid ${isSelected ? "rgba(255,255,255,0.15)" : C.border}` }}>
                        {f.included && <span style={{ fontSize: 9, fontWeight: 700, color: isSelected ? C.white : C.green }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 13, color: f.included ? (isSelected ? "rgba(255,255,255,0.85)" : C.ink) : (isSelected ? "rgba(255,255,255,0.25)" : C.light), textDecoration: f.included ? "none" : "none" }}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  style={{
                    width: "100%", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                    border:      `1.5px solid ${isSelected ? C.gold : C.ink}`,
                    background:  isSelected ? C.gold : "transparent",
                    color:       isSelected ? C.ink : C.ink,
                    transition:  "all .2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = isSelected ? "#d4b87a" : C.ink; e.currentTarget.style.color = isSelected ? C.ink : C.white; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? C.gold : "transparent"; e.currentTarget.style.color = C.ink; }}
                >
                  {plan.id === "basic" ? "Get Started Free" : `Get ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: C.light, marginTop: 24 }}>
          All paid plans include a 14-day free trial. No credit card required.
        </p>
      </div>

      {/* ── COMPARISON TABLE ── */}
      <div className="section-pad" style={{ padding: "0 48px 80px" }}>
        <h2 className="pf" style={{ fontSize: "1.8rem", fontWeight: 700, color: C.ink, textAlign: "center", marginBottom: 40 }}>
          Compare plans
        </h2>

        <div className="compare-grid" style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          {/* Header */}
          {["Feature", "Basic", "Pro", "Elite"].map((h, i) => (
            <div key={h} style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, background: i === 0 ? C.cream : i === 2 ? C.ink : C.white, display: "flex", alignItems: "center", justifyContent: i === 0 ? "flex-start" : "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: i === 2 ? C.white : C.ink, textTransform: i === 0 ? "none" : "uppercase", letterSpacing: i === 0 ? 0 : "0.5px" }}>{h}</span>
            </div>
          ))}

          {/* Rows */}
          {[
            ["Active Listings",         "3",        "20",       "Unlimited"],
            ["Search Placement",        "Standard", "Priority", "Top"],
            ["Featured Badges",         "—",        "✓",        "✓"],
            ["Analytics",               "Basic",    "Advanced", "Full Suite"],
            ["Support",                 "Email",    "Email & Chat", "24/7 Priority"],
            ["Account Manager",         "—",        "—",        "✓"],
            ["API Access",              "—",        "—",        "✓"],
            ["Custom Branding",         "—",        "—",        "✓"],
          ].map(([feat, basic, pro, elite], rowIdx) => (
            [feat, basic, pro, elite].map((cell, colIdx) => (
              <div key={`${rowIdx}-${colIdx}`}
                style={{ padding: "14px 24px", borderBottom: rowIdx < 7 ? `1px solid ${C.border}` : "none", background: colIdx === 2 ? "rgba(20,20,20,0.03)" : colIdx === 0 ? C.cream : C.white, display: "flex", alignItems: "center", justifyContent: colIdx === 0 ? "flex-start" : "center" }}>
                <span style={{ fontSize: 13, color: cell === "—" ? C.light : C.ink, fontWeight: colIdx === 0 ? 500 : 400 }}>{cell}</span>
              </div>
            ))
          ))}
        </div>
      </div>

      {/* ── TRUST STRIP ── */}
      <div style={{ background: C.white, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "32px 48px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          {[
            ["14-day free trial",       "No credit card needed"],
            ["Cancel anytime",          "No lock-in contracts"],
            ["7-day money back",        "If you're not satisfied"],
            ["Secure payments",         "256-bit SSL encryption"],
          ].map(([title, sub]) => (
            <div key={title} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{title}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="section-pad" style={{ padding: "72px 48px" }}>
        <h2 className="pf" style={{ fontSize: "1.8rem", fontWeight: 700, color: C.ink, textAlign: "center", marginBottom: 40 }}>
          Frequently asked questions
        </h2>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", background: "none", border: "none", textAlign: "left", gap: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: C.ink }}>{faq.q}</span>
                <span style={{ fontSize: 18, color: C.muted, flexShrink: 0, transition: "transform .2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
              </button>
              {openFaq === i && (
                <p className="fu" style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, paddingBottom: 20 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div style={{ background: C.ink, padding: "64px 48px", textAlign: "center" }}>
        <h2 className="pf" style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 700, color: C.white, marginBottom: 12, lineHeight: 1.2 }}>
          Ready to grow your listings?
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 32, maxWidth: 400, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Join thousands of property owners and agents already using RentSmart Premium.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{ padding: "13px 32px", borderRadius: 10, border: "none", background: C.gold, color: C.ink, fontSize: 14, fontWeight: 600, transition: "opacity .2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Start Free Trial
          </button>
          <button style={{ padding: "13px 32px", borderRadius: 10, border: `1.5px solid rgba(255,255,255,0.2)`, background: "none", color: C.white, fontSize: 14, fontWeight: 500, transition: "border-color .2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}>
            Talk to Sales
          </button>
        </div>
      </div>

      {/* Footer strip */}
      <div style={{ background: C.ink, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "16px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2025 RentSmart</span>
        <div style={{ display: "flex", gap: 20 }}>
          {["Terms", "Privacy", "Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.7)"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}>
              {l}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}