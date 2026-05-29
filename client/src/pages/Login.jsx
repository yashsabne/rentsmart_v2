import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";
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

export default function LoginPage() {
  const [tab, setTab] = useState("email");  
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", phone: "", password: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, []);



  const validate = () => {
    const e = {};
    if (tab === "email") {
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    } else {
      if (form.phone.length < 10) e.phone = "Enter a valid phone number";
    }
    if (!form.password || form.password.length < 6) e.password = "password length > 6";
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setErrors({});

    try {
      setLoading(true)
      const res = await fetch(`${API.AUTH}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: tab === "email" ? form.email : undefined,
          phone: tab === "phone" ? form.phone : undefined,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ password: data.message || "Login failed" });
        
      setLoading(false)
        return;
      }
 
      localStorage.setItem("token", data.token);
 
      setSuccess(true);
      
      setLoading(false)
      
 
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);

    } catch (err) {
      console.error(err);
      setErrors({ password: "Server error" });
      setLoading(false)
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

        .login-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }
        .login-left { display: flex; }
        @media (max-width: 768px) {
          .login-layout { grid-template-columns: 1fr; }
          .login-left   { display: none; }
          .login-right  { padding: 40px 24px !important; }
        }
      `}</style>

      <div className="login-layout">

        {/* ── LEFT PANEL ── */}
        <div className="login-left" style={{ background: C.ink, flexDirection: "column", justifyContent: "space-between", padding: "48px 52px" }}>
          <a href="/" className="pf" style={{ fontSize: 22, fontWeight: 700, color: C.white }}>
            Rent<span style={{ color: C.gold }}>Smart</span>
          </a>

          <div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 20 }}>
              Welcome back
            </p>
            <h2 className="pf" style={{ fontSize: "2.4rem", fontWeight: 700, color: C.white, lineHeight: 1.15, marginBottom: 20 }}>
              Good to see<br />you again.
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 320 }}>
              Sign in to manage your listings, track applications, connect with owners, and more.
            </p>

            <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 14 }}>
              {["Your listings and saved properties", "Messages and inquiries", "Payment history and agreements"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: C.gold }}>✓</span>
                  </div>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stat strip */}
          <div style={{ display: "flex", gap: 32, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {[["12K+", "Properties"], ["8K+", "Users"], ["320+", "Cities"]].map(([val, label]) => (
              <div key={label}>
                <div className="pf" style={{ fontSize: 20, fontWeight: 700, color: C.white }}>{val}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="login-right" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 52px", overflowY: "auto" }}>
          <div style={{ maxWidth: 400, width: "100%", margin: "0 auto" }}>

            {/* Success state */}
            {success ? (
              <div className="fu" style={{ textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.greenBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 24, color: C.green, fontWeight: 700 }}>
                  ✓
                </div>
                <h1 className="pf" style={{ fontSize: "1.75rem", fontWeight: 700, color: C.ink, marginBottom: 8 }}>
                  Signed in!
                </h1>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 1.7 }}>
                  Welcome back. Redirecting you to your dashboard…
                </p>
                <button
                  style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: C.ink, color: C.white, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#2a2a2a"}
                  onMouseLeave={e => e.currentTarget.style.background = C.ink}>
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="fu">
                <h1 className="pf" style={{ fontSize: "1.75rem", fontWeight: 700, color: C.ink, marginBottom: 4 }}>Sign in</h1>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 32 }}>
                  Don't have an account?{" "}
                  <Link to="/register" style={{ color: C.ink, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>Create one</Link>
                </p>

                {/* Email / Phone tab toggle */}
                <div style={{ display: "flex", background: "#F0EFEC", borderRadius: 10, padding: 3, marginBottom: 24, gap: 3 }}>
                  {[["email", "Email"], ["phone", "Phone"]].map(([id, label]) => (
                    <button key={id} onClick={() => { setTab(id); setErrors({}); }}
                      style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: tab === id ? C.white : "transparent", color: tab === id ? C.ink : C.muted, fontSize: 14, fontWeight: tab === id ? 600 : 400, transition: "all .2s", boxShadow: tab === id ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Email or Phone input */}
                {tab === "email" ? (
                  <Field label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} error={errors.email} />
                ) : (
                  <Field label="Phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} error={errors.phone} />
                )}

                {/* Password */}
                <Field
                  label="Password"
                  type={showPass ? "text" : "password"}
                  placeholder="Your password"
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

                {/* Remember + Forgot */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" style={{ accentColor: C.ink, width: 14, height: 14 }} />
                    <span style={{ fontSize: 13, color: C.muted }}>Remember me</span>
                  </label>
                  <a href="#" style={{ fontSize: 13, color: C.ink, fontWeight: 500, borderBottom: `1px solid ${C.border}` }}>
                    Forgot password?
                  </a>
                </div>

                {/* Sign in button */}
                <button onClick={handleLogin}
                  disabled={loading}
                  style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: C.ink, color: C.white, fontSize: 14, fontWeight: 600, marginBottom: 20, transition: "background .2s",cursor:loading?"not-allowed":"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#2a2a2a"}
                  onMouseLeave={e => e.currentTarget.style.background = C.ink}>
                   {loading?"Working...":"Sign in" } 
                </button>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  <span style={{ fontSize: 12, color: C.light }}>or</span>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>

                {/* Social */}
                <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
                  {["Continue with Google", "Continue with Apple"].map((label) => (
                    <button key={label}
                      style={{ flex: 1, padding: "11px 8px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, color: C.ink, fontSize: 13, fontWeight: 500, transition: "border-color .2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.ink}
                      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                      {label}
                    </button>
                  ))}
                </div>
 
                <p style={{ textAlign: "center", fontSize: 12, color: C.light, lineHeight: 1.7 }}>
                  By signing in, you agree to our{" "}
                  <a href="#" style={{ color: C.muted, borderBottom: `1px solid ${C.border}` }}>Terms</a> and{" "}
                  <a href="#" style={{ color: C.muted, borderBottom: `1px solid ${C.border}` }}>Privacy Policy</a>
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>

    <Footer/>
    </>
  );
}