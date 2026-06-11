import { useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../../apis";
import Footer from "../components/reuse/Footer";

const C = {
    cream: "#FAFAF7",
    white: "#FFFFFF",
    ink: "#141414",
    muted: "#6B6B6B",
    light: "#9A9A9A",
    gold: "#C8A96E",
    goldBg: "#F5EDD8",
    border: "#E8E8E3",
    green: "#2D6A4F",
    greenBg: "#EAF4EE",
    red: "#C0392B",
};

function Field({ label, type = "text", placeholder, value, onChange, error }) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 6 }}>
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${error ? C.red : focused ? C.ink : C.border}`,
                    fontSize: 14,
                    color: C.ink,
                    background: C.white,
                    outline: "none",
                    transition: "border-color .2s",
                    boxSizing: "border-box",
                }}
            />
            {error && <p style={{ margin: "5px 0 0", fontSize: 12, color: C.red }}>{error}</p>}
        </div>
    );
}

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [rateLimited, setRateLimited] = useState(null);

    const handleSubmit = async () => {
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            setError("Enter a valid email address");
            return;
        }
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API.AUTH}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.status === 429) {
                setRateLimited({
                    minutes: data.retryAfterMinutes,
                    seconds: data.retryAfter
                });
                return;
            }

            setSent(true);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif", color: C.ink }}>
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'DM Sans', sans-serif !important; }
          .pf { font-family: 'Playfair Display', serif !important; }
          button, input { font-family: 'DM Sans', sans-serif; cursor: pointer; }
          a { text-decoration: none; color: inherit; }
          input::placeholder { color: #C0C0C0; }
          @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
          .fu { animation: fadeUp .4s both; }
          .fp-layout { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
          .fp-left { display: flex; }
          @media (max-width: 768px) {
            .fp-layout { grid-template-columns: 1fr; }
            .fp-left { display: none; }
            .fp-right { padding: 40px 24px !important; }
          }
        `}</style>

                <div className="fp-layout">

                    {/* LEFT PANEL */}
                    <div className="fp-left" style={{ background: C.ink, flexDirection: "column", justifyContent: "space-between", padding: "48px 52px" }}>
                        <a href="/" className="pf" style={{ fontSize: 22, fontWeight: 700, color: C.white }}>
                            Rent<span style={{ color: C.gold }}>Smart</span>
                        </a>

                        <div>
                            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 20 }}>
                                Account recovery
                            </p>
                            <h2 className="pf" style={{ fontSize: "2.4rem", fontWeight: 700, color: C.white, lineHeight: 1.15, marginBottom: 20 }}>
                                Happens to<br />everyone.
                            </h2>
                            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 320 }}>
                                Enter the email you registered with and we'll send you a secure link to reset your password.
                            </p>

                            <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 14 }}>
                                {[
                                    "Link expires in 1 hour",
                                    "Secure one-time reset token",
                                    "No password stored in the link",
                                ].map((f) => (
                                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <span style={{ fontSize: 10, color: C.gold }}>✓</span>
                                        </div>
                                        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 32, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                            {[["12K+", "Properties"], ["8K+", "Users"], ["320+", "Cities"]].map(([val, label]) => (
                                <div key={label}>
                                    <div className="pf" style={{ fontSize: 20, fontWeight: 700, color: C.white }}>{val}</div>
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                 <div className="fp-right" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 52px", overflowY: "auto" }}>
  <div style={{ maxWidth: 400, width: "100%", margin: "0 auto" }}>

    {rateLimited ? (
      <div className="fu" style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FEF9EC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>
          🔒
        </div>
        <h1 className="pf" style={{ fontSize: "1.75rem", fontWeight: 700, color: C.ink, marginBottom: 8 }}>
          Too many attempts
        </h1>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 8 }}>
          You've requested too many reset links. For your account's security, please wait{" "}
          <strong style={{ color: C.ink }}>{rateLimited.minutes} minute{rateLimited.minutes !== 1 ? "s" : ""}</strong> before trying again.
        </p>
        <p style={{ fontSize: 13, color: C.light, marginBottom: 32, lineHeight: 1.6 }}>
          Already got a link? Check your inbox and spam folder — it may already be there.
        </p>
        <div style={{ padding: "14px 18px", borderRadius: 10, background: "#FEF9EC", border: `1px solid ${C.gold}55`, marginBottom: 28, textAlign: "left" }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: "#92660A", textTransform: "uppercase", letterSpacing: "0.4px" }}>Why am I seeing this?</p>
          <p style={{ margin: 0, fontSize: 13, color: "#92660A", lineHeight: 1.6 }}>
            We limit reset requests to 3 per hour to protect your account from abuse. This resets automatically after {rateLimited.minutes} minute{rateLimited.minutes !== 1 ? "s" : ""}.
          </p>
        </div>
        <Link
          to="/login"
          style={{ display: "block", width: "100%", padding: "13px", borderRadius: 10, background: C.ink, color: C.white, fontSize: 14, fontWeight: 600, textAlign: "center" }}
        >
          Back to sign in
        </Link>
      </div>

    ) : sent ? (
      <div className="fu" style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.greenBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 24, color: C.green, fontWeight: 700 }}>
          ✓
        </div>
        <h1 className="pf" style={{ fontSize: "1.75rem", fontWeight: 700, color: C.ink, marginBottom: 8 }}>
          Check your inbox
        </h1>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 8 }}>
          If <strong style={{ color: C.ink }}>{email}</strong> is registered, a reset link is on its way. Check your spam folder too.
        </p>
        <p style={{ fontSize: 13, color: C.light, marginBottom: 32 }}>
          The link expires in 1 hour.
        </p>
        <Link
          to="/login"
          style={{ display: "block", width: "100%", padding: "13px", borderRadius: 10, background: C.ink, color: C.white, fontSize: 14, fontWeight: 600, textAlign: "center" }}
        >
          Back to sign in
        </Link>
      </div>

    ) : (
      <div className="fu">
        <h1 className="pf" style={{ fontSize: "1.75rem", fontWeight: 700, color: C.ink, marginBottom: 4 }}>
          Reset password
        </h1>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 32 }}>
          Remember it?{" "}
          <Link to="/login" style={{ color: C.ink, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>
            Sign in
          </Link>
        </p>

        <Field
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "13px", borderRadius: 10, border: "none",
            background: C.ink, color: C.white, fontSize: 14, fontWeight: 600,
            marginTop: 8, marginBottom: 20, transition: "background .2s",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.8 : 1,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#2a2a2a"; }}
          onMouseLeave={e => e.currentTarget.style.background = C.ink}
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: C.light, lineHeight: 1.7 }}>
          We'll only send an email if the address is registered.
        </p>
      </div>
    )}

  </div>
</div>

                </div>
            </div>
            <Footer />
        </>
    );
}