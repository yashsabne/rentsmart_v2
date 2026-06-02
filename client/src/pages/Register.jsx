import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../apis";

const C = {
  cream:    "#FAFAF7",
  white:    "#FFFFFF",
  ink:      "#141414",
  muted:    "#6B6B6B",
  light:    "#9A9A9A",
  gold:     "#C8A96E",
  goldBg:   "#F5EDD8",
  border:   "#E8E8E3",
  green:    "#2D6A4F",
  greenBg:  "#EAF4EE",
  red:      "#C0392B",
};
const steps = ["Account", "Profile", "Done"];

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
            padding: right ? "11px 42px 11px 14px" : "11px 14px",
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

function Toggle({ label, defaultOn = false, onToggle }) {
  const [on, setOn] = useState(defaultOn);
  
  const handleToggle = () => {
    const newState = !on;
    setOn(newState);
    if (onToggle) onToggle(newState);
  };
  
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 14, color: C.ink }}>{label}</span>
      <div
        onClick={handleToggle}
        style={{ width: 38, height: 21, borderRadius: 11, background: on ? C.ink : C.border, cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}
      >
        <div style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 15, height: 15, borderRadius: "50%", background: C.white, transition: "left .2s" }} />
      </div>
    </div>
  );
}

// PreferenceButton component to fix useState in loop
function PreferenceButton({ label, onToggle }) {
  const [selected, setSelected] = useState(false);
  
  const handleClick = () => {
    const newState = !selected;
    setSelected(newState);
    if (onToggle) onToggle(label, newState);
  };
  
  return (
    <button onClick={handleClick}
      style={{ 
        padding: "7px 16px", 
        borderRadius: 100, 
        border: `1.5px solid ${selected ? C.ink : C.border}`, 
        background: selected ? C.ink : "none", 
        color: selected ? C.white : C.muted, 
        fontSize: 13, 
        fontWeight: 500, 
        cursor: "pointer", 
        transition: "all .2s" 
      }}>
      {label}
    </button>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Track selected preferences
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  
  // Track notification states
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [smsUpdatesEnabled, setSmsUpdatesEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", password: "", confirm: "", city: "",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const strength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Weak", color: C.red, w: "33%" };
    if (p.length < 9) return { label: "Fair", color: "#E67E22", w: "66%" };
    return { label: "Strong", color: C.green, w: "100%" };
  })();

  const validateStep0 = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (form.phone.length < 10) e.phone = "Enter a valid phone number";
    if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const next = () => {
    if (step === 0) {
      const e = validateStep0();
      if (Object.keys(e).length) { setErrors(e); return; }
      setErrors({});
      setStep(1);
    } else if (step === 1) {
      handleCreateAccount();
    } else {
      setStep(s => Math.min(s + 1, 2));
    }
  };

  const handlePreferenceToggle = (pref, isSelected) => {
    if (isSelected) {
      setSelectedPreferences([...selectedPreferences, pref]);
    } else {
      setSelectedPreferences(selectedPreferences.filter(p => p !== pref));
    }
  };

  const handleCreateAccount = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API.AUTH}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          city: form.city,
          preferences: selectedPreferences,
          notifications: {
            emailAlerts: emailAlertsEnabled,
            smsUpdates: smsUpdatesEnabled,
            whatsappNotifications: whatsappEnabled
          }
        }),
      });

      const data = await response.json();
  
      if (response.ok) { 
           localStorage.setItem("token", data.token);
 
        setStep(2);  
      } else {
        console.error('Registration failed:', data.error);
        alert(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const preferences = ["1 BHK", "2 BHK", "3 BHK", "Villa", "Studio", "Commercial"];

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif !important; }
        .pf { font-family: 'Playfair Display', serif !important; }
        button, input { font-family: 'DM Sans', sans-serif; }
        a { text-decoration: none; color: inherit; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp .4s both; }
        input::placeholder { color: #C0C0C0; }

        /* Responsive */
        .reg-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }
        .reg-left { display: flex; }
        @media (max-width: 768px) {
          .reg-layout { grid-template-columns: 1fr; }
          .reg-left { display: none; }
          .reg-right { padding: 32px 24px !important; }
          .name-grid { grid-template-columns: 1fr !important; }
          .role-grid  { grid-template-columns: 1fr 1fr !important; }
          .pref-wrap  { flex-wrap: wrap; }
        }
        @media (max-width: 420px) {
          .role-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="reg-layout">

        {/* ── LEFT PANEL ── */}
        <div className="reg-left" style={{ background: C.ink, flexDirection: "column", justifyContent: "space-between", padding: "48px 52px" }}>
          <a href="/" className="pf" style={{ fontSize: 22, fontWeight: 700, color: C.white }}>
            Rent<span style={{ color: C.gold }}>Smart</span>
          </a>

          <div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 20 }}>
              Join 8,000+ users
            </p>
            <h2 className="pf" style={{ fontSize: "2.4rem", fontWeight: 700, color: C.white, lineHeight: 1.15, marginBottom: 20 }}>
              Your dream home<br />starts here.
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 320 }}>
              Browse thousands of verified properties, connect with owners, and close deals — all in one place.
            </p>

            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
              {["Zero brokerage on all listings", "Verified properties and owners", "Secure digital agreements"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: C.gold }}>✓</span>
                  </div>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>© 2025 RentSmart</p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="reg-right" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 52px", overflowY: "auto" }}>
          <div style={{ maxWidth: 420, width: "100%", margin: "0 auto" }}>

            {/* Step bar */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
              {steps.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: i < step ? C.green : i === step ? C.ink : "transparent",
                      border: `2px solid ${i < step ? C.green : i === step ? C.ink : C.border}`,
                      color: i <= step ? C.white : C.light,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 600, transition: "all .3s",
                    }}>
                      {i < step ? "✓" : i + 1}
                    </div>
                    <span style={{ fontSize: 10, color: i === step ? C.ink : C.light, fontWeight: i === step ? 600 : 400 }}>{s}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, height: 1.5, background: i < step ? C.green : C.border, margin: "0 6px 18px", transition: "background .3s" }} />
                  )}
                </div>
              ))}
            </div>

            {/* ── STEP 0: Account ── */}
            {step === 0 && (
              <div className="fu">
                <h1 className="pf" style={{ fontSize: "1.75rem", fontWeight: 700, color: C.ink, marginBottom: 4 }}>Create account</h1>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>Free forever. No credit card needed.</p>

                <div className="name-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                  <Field label="First Name" placeholder="Yash" value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
                  <Field label="Last Name" placeholder="Sabne" value={form.lastName} onChange={set("lastName")} />
                </div>

                <Field label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} error={errors.email} />
                <Field label="Phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} error={errors.phone} />

                <Field
                  label="Password"
                  type={showPass ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={set("password")}
                  error={errors.password}
                  right={
                    <button onClick={() => setShowPass(!showPass)}
                      style={{ border: "none", background: "none", fontSize: 12, color: C.muted, cursor: "pointer", padding: 0 }}>
                      {showPass ? "Hide" : "Show"}
                    </button>
                  }
                />

                {/* Strength bar */}
                {strength && (
                  <div style={{ marginTop: -10, marginBottom: 16 }}>
                    <div style={{ height: 3, background: C.border, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                      <div style={{ height: "100%", width: strength.w, background: strength.color, transition: "width .3s" }} />
                    </div>
                    <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label} password</span>
                  </div>
                )}

                <Field
                  label="Confirm Password"
                  type={showPass ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  error={errors.confirm}
                />

                {/* T&C */}
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 24, cursor: "pointer" }}>
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                    style={{ marginTop: 2, accentColor: C.ink, width: 15, height: 15, cursor: "pointer", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                    I agree to the <a href="#" style={{ color: C.ink, fontWeight: 500, borderBottom: `1px solid ${C.border}` }}>Terms of Service</a> and <a href="#" style={{ color: C.ink, fontWeight: 500, borderBottom: `1px solid ${C.border}` }}>Privacy Policy</a>
                  </span>
                </label>

                <button onClick={next} disabled={!agreed}
                  style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: agreed ? C.ink : C.border, color: agreed ? C.white : C.light, fontSize: 14, fontWeight: 600, transition: "background .2s", marginBottom: 20 }}
                  onMouseEnter={e => { if (agreed) e.currentTarget.style.background = "#2a2a2a"; }}
                  onMouseLeave={e => { if (agreed) e.currentTarget.style.background = C.ink; }}>
                  Continue
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  <span style={{ fontSize: 12, color: C.light }}>or</span>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>

                <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                  {["Continue with Google", "Continue with Apple"].map((label) => (
                    <button key={label}
                      style={{ flex: 1, padding: "11px 8px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, color: C.ink, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "border-color .2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.ink}
                      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                      {label}
                    </button>
                  ))}
                </div>

                <p style={{ textAlign: "center", fontSize: 13, color: C.muted }}>
                  Already have an account?{" "}
                  <a href="#" style={{ color: C.ink, fontWeight: 600 }}>Sign in</a>
                </p>
              </div>
            )}

            {/* ── STEP 1: Profile ── */}
            {step === 1 && (
              <div className="fu">
                <h1 className="pf" style={{ fontSize: "1.75rem", fontWeight: 700, color: C.ink, marginBottom: 4 }}>Complete profile</h1>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>A few more details to personalise your experience.</p>

                <Field label="City" placeholder="e.g. Mumbai, Pune, Bangalore" value={form.city} onChange={set("city")} />

                {/* Preferences */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 10 }}>
                    Property Preferences
                  </label>
                  <div className="pref-wrap" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {preferences.map(pref => (
                      <PreferenceButton 
                        key={pref} 
                        label={pref} 
                        onToggle={handlePreferenceToggle}
                      />
                    ))}
                  </div>
                </div>

                {/* Notification toggles */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 10 }}>
                    Notifications
                  </label>
                  <Toggle 
                    label="Email alerts for new listings" 
                    defaultOn={true} 
                    onToggle={setEmailAlertsEnabled}
                  />
                  <Toggle 
                    label="SMS updates" 
                    defaultOn={true} 
                    onToggle={setSmsUpdatesEnabled}
                  />
                  <Toggle 
                    label="WhatsApp notifications" 
                    defaultOn={false} 
                    onToggle={setWhatsappEnabled}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(0)}
                    style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "none", color: C.ink, fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "background .2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.cream}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    Back
                  </button>
                  <button 
                    onClick={handleCreateAccount}
                    disabled={isLoading}
                    style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: C.ink, color: C.white, fontSize: 14, fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", transition: "background .2s", opacity: isLoading ? 0.7 : 1 }}
                    onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = "#2a2a2a"; }}
                    onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = C.ink; }}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Done ── */}
            {step === 2 && (
              <div className="fu" style={{ textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.greenBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 26, color: C.green, fontWeight: 700 }}>
                  ✓
                </div>
                <h1 className="pf" style={{ fontSize: "1.75rem", fontWeight: 700, color: C.ink, marginBottom: 8 }}>
                  Welcome aboard!
                </h1>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, maxWidth: 320, margin: "0 auto 32px" }}>
                  Your account has been created. Start exploring thousands of verified properties today.
                </p>

                {/* Summary */}
                <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px", marginBottom: 28, textAlign: "left" }}>
                  {[
                    ["Name", `${form.firstName || "—"} ${form.lastName || ""}`.trim()],
                    ["Email", form.email || "—"],
                    ["City", form.city || "—"],
                  ].map(([k, v], i, arr) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <span style={{ fontSize: 13, color: C.muted }}>{k}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{v}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate("/dashboard")}
                  style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: C.ink, color: C.white, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 10, transition: "background .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#2a2a2a"}
                  onMouseLeave={e => e.currentTarget.style.background = C.ink}>
                  Go to Dashboard
                </button>
                <button 
                  onClick={() => navigate("/properties")}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "none", color: C.ink, fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "background .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.cream}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  Explore Properties
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}