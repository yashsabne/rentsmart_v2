import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { API } from "../../apis"; 
import Footer from "../components/reuse/Footer";
import { C } from "../constants";

function Field({ label, type = "text", placeholder, value, onChange, error, right }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: right ? "11px 56px 11px 14px" : "11px 14px",
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
        {right && (
          <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
            {right}
          </div>
        )}
      </div>
      {error && <p style={{ margin: "5px 0 0", fontSize: 12, color: C.red }}>{error}</p>}
    </div>
  );
}

function StrengthBar({ password }) {
  const score = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", C.red, "#E67E22", C.gold, C.green];

  if (!password) return null;

  return (
    <div style={{ marginBottom: 16, marginTop: -8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= score ? colors[score] : C.border,
            transition: "background .2s",
          }} />
        ))}
      </div>
      <p style={{ fontSize: 12, color: colors[score], fontWeight: 500 }}>{labels[score]}</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.password || form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setServerError("");
    setLoading(true);

    try {
      const res = await fetch(`${API.AUTH}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Something went wrong. The link may have expired.");
        return;
      }

      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setServerError("Server error. Please try again.");
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
          .rp-layout { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
          .rp-left { display: flex; }
          @media (max-width: 768px) {
            .rp-layout { grid-template-columns: 1fr; }
            .rp-left { display: none; }
            .rp-right { padding: 40px 24px !important; }
          }
        `}</style>

        <div className="rp-layout">

          {/* LEFT PANEL */}
          <div className="rp-left" style={{ background: C.ink, flexDirection: "column", justifyContent: "space-between", padding: "48px 52px" }}>
            <a href="/" className="pf" style={{ fontSize: 22, fontWeight: 700, color: C.white }}>
              Rent<span style={{ color: C.gold }}>Smart</span>
            </a>

            <div>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 20 }}>
                Almost there
              </p>
              <h2 className="pf" style={{ fontSize: "2.4rem", fontWeight: 700, color: C.white, lineHeight: 1.15, marginBottom: 20 }}>
                Choose a<br />strong password.
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 320 }}>
                A good password is at least 8 characters with a mix of uppercase, numbers, and symbols.
              </p>

              <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Min. 8 characters",
                  "Include a number or symbol",
                  "Don't reuse old passwords",
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
          <div className="rp-right" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 52px", overflowY: "auto" }}>
            <div style={{ maxWidth: 400, width: "100%", margin: "0 auto" }}>

              {done ? (
                <div className="fu" style={{ textAlign: "center" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.greenBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 24, color: C.green, fontWeight: 700 }}>
                    ✓
                  </div>
                  <h1 className="pf" style={{ fontSize: "1.75rem", fontWeight: 700, color: C.ink, marginBottom: 8 }}>
                    Password updated!
                  </h1>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 32 }}>
                    Your password has been reset. Redirecting you to sign in…
                  </p>
                  <Link
                    to="/login"
                    style={{ display: "block", width: "100%", padding: "13px", borderRadius: 10, background: C.ink, color: C.white, fontSize: 14, fontWeight: 600, textAlign: "center" }}
                  >
                    Sign in now
                  </Link>
                </div>
              ) : (
                <div className="fu">
                  <h1 className="pf" style={{ fontSize: "1.75rem", fontWeight: 700, color: C.ink, marginBottom: 4 }}>
                    New password
                  </h1>
                  <p style={{ fontSize: 14, color: C.muted, marginBottom: 32 }}>
                    Set a new password for your RentSmart account.
                  </p>

                  {serverError && (
                    <div style={{ padding: "12px 14px", borderRadius: 10, background: "#FEF2F2", border: `1px solid ${C.red}22`, marginBottom: 20 }}>
                      <p style={{ fontSize: 13, color: C.red, margin: 0 }}>{serverError}</p>
                      {serverError.toLowerCase().includes("expired") && (
                        <Link to="/forgot-password" style={{ fontSize: 13, color: C.ink, fontWeight: 600, borderBottom: `1px solid ${C.border}`, marginTop: 6, display: "inline-block" }}>
                          Request a new link →
                        </Link>
                      )}
                    </div>
                  )}

                  <Field
                    label="New password"
                    type={showPass ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={set("password")}
                    error={errors.password}
                    right={
                      <button onClick={() => setShowPass(!showPass)}
                        style={{ border: "none", background: "none", fontSize: 12, color: C.muted, padding: 0 }}>
                        {showPass ? "Hide" : "Show"}
                      </button>
                    }
                  />

                  <StrengthBar password={form.password} />

                  <Field
                    label="Confirm password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={form.confirm}
                    onChange={set("confirm")}
                    error={errors.confirm}
                    right={
                      <button onClick={() => setShowConfirm(!showConfirm)}
                        style={{ border: "none", background: "none", fontSize: 12, color: C.muted, padding: 0 }}>
                        {showConfirm ? "Hide" : "Show"}
                      </button>
                    }
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
                    {loading ? "Saving…" : "Set new password"}
                  </button>

                  <p style={{ textAlign: "center", fontSize: 12, color: C.light }}>
                    <Link to="/login" style={{ color: C.muted, borderBottom: `1px solid ${C.border}` }}>
                      Back to sign in
                    </Link>
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