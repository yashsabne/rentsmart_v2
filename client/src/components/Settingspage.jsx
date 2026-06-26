// src/components/dashboard/SettingsPage.jsx
import { useState, useEffect, useCallback } from "react";
import {
  fetchSettings,
  saveProfile,
  saveNotifications,
  savePreferences,
  changePassword,
  deleteAccount,
  resendVerification,
} from "../services/settingsApi";
import { useNavigate } from "react-router-dom";
 
const PROPERTY_TYPES = ["1 BHK", "2 BHK", "3 BHK", "Villa", "Studio", "Commercial"];

const TABS = [
  { id: "profile", emoji: "👤", label: "Profile" },
  { id: "notifications", emoji: "🔔", label: "Notifications" },
  { id: "security", emoji: "🔒", label: "Security" },
  { id: "preferences", emoji: "⚙️", label: "Preferences" },
];
 
const initials = (first = "", last = "") =>
  `${first[0] || ""}${last[0] || ""}`.toUpperCase() || "?";

const T = {
  cream: "#F5F0E8",
  white: "#FFFFFF",
  dark: "#1C1C2E",
  accent: "#C8A96E",    
  accentHover: "#B8914A",
  purple: "#6B4EFF",    
  border: "#E8E0D0",
  text: "#1a1a2e",
  muted: "#888",
  error: "#C0392B",
  success: "#2D6A4F",
  inputBg: "#FDFAF5",
  cardBg: "#FFFFFF",
  rowHover: "#FAF7F2",
};
 
const Label = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>
    {children}
  </div>
);

const Input = ({ error, style, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", padding: "10px 13px", fontSize: 13.5,
        background: props.disabled ? "#F7F4EF" : T.inputBg,
        border: `1.5px solid ${error ? T.error : focused ? T.accent : T.border}`,
        borderRadius: 10, outline: "none", color: props.disabled ? T.muted : T.text,
        fontFamily: "inherit", transition: "border-color .15s",
        boxSizing: "border-box",
        boxShadow: focused && !props.disabled ? `0 0 0 3px ${T.accent}22` : "none",
        ...style,
      }}
      {...props}
    />
  );
};

const Btn = ({ children, variant = "ghost", disabled, onClick, style }) => {
  const [hov, setHov] = useState(false);
  const base = {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "9px 20px", fontSize: 13, fontWeight: 600,
    borderRadius: 10, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit", transition: "all .15s", opacity: disabled ? 0.55 : 1,
    ...style,
  };
  if (variant === "primary") return (
    <button disabled={disabled} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, background: hov && !disabled ? T.accentHover : T.accent, color: "#fff" }}>
      {children}
    </button>
  );
  if (variant === "danger") return (
    <button disabled={disabled} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, background: hov && !disabled ? "#FDECEA" : "#FFF5F5", color: T.error, border: `1.5px solid #FACACA` }}>
      {children}
    </button>
  );
  return (
    <button disabled={disabled} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, background: hov && !disabled ? T.cream : "transparent", color: T.text, border: `1.5px solid ${T.border}` }}>
      {children}
    </button>
  );
};

const Toggle = ({ checked, onChange }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      role="switch" aria-checked={checked}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, flexShrink: 0, cursor: "pointer",
        background: checked ? T.accent : (hov ? "#D0C8BE" : "#D8D0C8"),
        position: "relative", transition: "background .2s",
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: checked ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)",
      }} />
    </div>
  );
};

const SectionHead = ({ title, sub }) => (
  <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.text }}>{title}</h2>
    {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: T.muted }}>{sub}</p>}
  </div>
);

const FormActions = ({ children }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
    {children}
  </div>
);
 
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
};

const SettingsPage = ({ token, onLogout,onProfileUpdated }) => {
    const navigate = useNavigate();  

  const { toast, show: showToast } = useToast();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);

  const [profile, setProfile] = useState({ firstName: "", lastName: "", phone: "", city: "" });

  const [notifs, setNotifs] = useState({
    emailNotifications: true, smsNotifications: true, whatsappNotifications: false,
  });

  /* preferences */
  const [prefs, setPrefs] = useState({ preferences: [], city: "" });

  /* password */
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwErr, setPwErr] = useState({});
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  /* delete modal */
  const [delModal, setDelModal] = useState(false);
  const [delPw, setDelPw] = useState("");
  const [deleting, setDeleting] = useState(false);

  /* resend */
  const [resending, setResending] = useState(false);
 
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchSettings(token);
        setSettings(data);
        setProfile({ firstName: data.firstName || "", lastName: data.lastName || "", phone: data.phone || "", city: data.city || "" });
        setNotifs({ emailNotifications: data.emailNotifications ?? true, smsNotifications: data.smsNotifications ?? true, whatsappNotifications: data.whatsappNotifications ?? false });
        setPrefs({ preferences: data.preferences || [], city: data.city || "" });
      } catch (e) { showToast(e.message, "error"); }
      finally { setLoading(false); }
    })();
  }, [token]);
 
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await saveProfile(token, profile);
      setSettings(s => ({ ...s, ...profile }));
      showToast("Profile saved");

        await onProfileUpdated?.();   


      const redirect = localStorage.getItem("rentsmart_post_phone_redirect");
      if (redirect && profile.phone) {
        localStorage.removeItem("rentsmart_post_phone_redirect");
        setTimeout(() => navigate(redirect), 1000);  
      }

    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifs = async () => {
    setSaving(true);
    try { await saveNotifications(token, notifs); showToast("Notification preferences saved"); }
    catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleSavePrefs = async () => {
    setSaving(true);
    try { await savePreferences(token, prefs); showToast("Preferences saved"); }
    catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleChangePw = async () => {
    const errs = {};
    if (!pwForm.current) errs.current = "Required";
    if (pwForm.current === pwForm.next) errs.next = "Must differ from current";

    if (!pwForm.next || pwForm.next.length < 8) errs.next = "Min 8 characters";
    if (pwForm.next !== pwForm.confirm) errs.confirm = "Passwords don't match";
    if (pwForm.current === pwForm.next) errs.next = "Must differ from current";
    if (Object.keys(errs).length) { setPwErr(errs); return; }
    setPwErr({});
    setSaving(true);
    try {
      await changePassword(token, {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      setPwForm({ current: "", next: "", confirm: "" });
      showToast("Password updated");
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteAccount(token, delPw); showToast("Account deleted"); setTimeout(() => onLogout?.(), 1500); }
    catch (e) { showToast(e.message, "error"); }
    finally { setDeleting(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try { await resendVerification(token); showToast("Verification email sent"); }
    catch (e) { showToast(e.message, "error"); }
    finally { setResending(false); }
  };

  const togglePref = (type) => setPrefs(p => ({
    ...p,
    preferences: p.preferences.includes(type)
      ? p.preferences.filter(x => x !== type)
      : [...p.preferences, type],
  }));


  const isOAuth = settings && !!(settings.googleId || settings.microsoftId);
  const hasPassword = settings && !!settings.hasPassword;

  console.log(hasPassword)

  const pwStrength = (() => {
    const s = pwForm.next;
    if (!s) return null;
    let score = 0;
    if (s.length >= 8) score++;
    if (/[A-Z]/.test(s)) score++;
    if (/[0-9]/.test(s)) score++;
    if (/[^A-Za-z0-9]/.test(s)) score++;
    const map = ["Weak", "Fair", "Good", "Strong"];
    const col = [T.error, "#C8A96E", "#2D6A4F", "#4361EE"];
    return { score, label: map[score - 1] || "Too short", color: col[score - 1] || T.muted };
  })();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80, gap: 14, color: T.muted }}>
      <div style={{ width: 22, height: 22, border: `2.5px solid ${T.border}`, borderTopColor: T.accent, borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading settings…
    </div>
  );

  return (
    <div style={{ fontFamily: "inherit", position: "relative" }}>

      {toast && (
        <div style={{
          position: "fixed", top: 28, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          background: toast.type === "error" ? T.error : T.dark,
          color: "#fff", padding: "12px 22px", borderRadius: 12,
          fontSize: 13.5, fontWeight: 600, boxShadow: "0 8px 30px rgba(0,0,0,.18)",
          animation: "toastIn .2s ease",
        }}>
          <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
          {toast.type === "error" ? "✕" : "✓"} {toast.msg}
        </div>
      )}

      {delModal && (
        <div onClick={() => setDelModal(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: T.white, borderRadius: 18, padding: 32, maxWidth: 400, width: "100%",
            textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,.18)",
          }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: T.text }}>Delete account?</h3>
            <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6, margin: "0 0 20px" }}>
              This is permanent. All your listings, saved properties, and history will be removed.
            </p>
            {!isOAuth && (
              <Input type="password" placeholder="Confirm your password" value={delPw} onChange={e => setDelPw(e.target.value)} style={{ marginBottom: 16 }} />
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn onClick={() => setDelModal(false)}>Cancel</Btn>
              <Btn variant="danger" onClick={handleDelete} disabled={deleting || (!isOAuth && !delPw)}>
                {deleting ? "Deleting…" : "Yes, delete"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        background: T.white, borderRadius: 16, overflow: "hidden",
        border: `1px solid ${T.border}`, minHeight: 560,
      }}>

        <div style={{
          width: isMobile ? "100%" : 210, flexShrink: 0,
          background: T.cream, borderRight: isMobile ? "none" : `1px solid ${T.border}`,
          borderBottom: isMobile ? `1px solid ${T.border}` : "none",
        }}>

          {!isMobile && (
            <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: T.dark, color: T.accent, fontWeight: 700,
                fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {initials(settings?.firstName, settings?.lastName)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {settings?.firstName} {settings?.lastName}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {settings?.email}
                </div>
              </div>
            </div>
          )}

          {/* nav */}
          <nav style={{ display: isMobile ? "flex" : "block", overflowX: isMobile ? "auto" : "visible", padding: isMobile ? "8px 8px" : "8px 0" }}>
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  display: "flex", alignItems: "center", gap: 9,
                  width: isMobile ? "auto" : "100%",
                  whiteSpace: "nowrap",
                  padding: isMobile ? "8px 14px" : "10px 16px",
                  fontSize: 13.5, fontWeight: active ? 700 : 500,
                  color: active ? T.dark : T.muted,
                  background: active ? T.white : "transparent",
                  border: "none",
                  borderLeft: !isMobile ? `3px solid ${active ? T.accent : "transparent"}` : "none",
                  borderBottom: isMobile ? `3px solid ${active ? T.accent : "transparent"}` : "none",
                  borderRadius: isMobile ? 8 : 0,
                  cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 15 }}>{tab.emoji}</span>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, padding: isMobile ? "20px 16px" : "28px 32px", overflowY: "auto", maxHeight: isMobile ? "none" : 660 }}>

          {/* ══════ PROFILE ══════ */}
          {activeTab === "profile" && (
            <div>
              <SectionHead title="Profile" sub="Manage your personal information." />

              {/* unverified banner */}
              {!settings?.isEmailVerified && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                  background: "#FEF9EC", border: "1.5px solid #F5D97A",
                  borderRadius: 10, padding: "12px 16px", marginBottom: 20, flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: 13, color: "#7A5F00" }}>📧 Your email is not verified.</span>
                  <Btn onClick={handleResend} disabled={resending} style={{ padding: "6px 14px", fontSize: 12 }}>
                    {resending ? "Sending…" : "Resend verification"}
                  </Btn>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <Label>First name</Label>
                  <Input value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} placeholder="First name" />
                </div>
                <div>
                  <Label>Last name</Label>
                  <Input value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} placeholder="Last name" />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Label>Email</Label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Input value={settings?.email || ""} disabled style={{ flex: 1 }} />
                  <span style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                    background: settings?.isEmailVerified ? "#EAF7EE" : "#FEF9EC",
                    color: settings?.isEmailVerified ? T.success : "#7A5F00",
                    flexShrink: 0,
                  }}>
                    {settings?.isEmailVerified ? "✓ Verified" : "⚠ Unverified"}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: T.muted, marginTop: 5 }}>Email cannot be changed. Contact support.</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <Label>Phone</Label>
                  <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Mumbai" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <Label>Member since</Label>
                  <Input disabled value={settings?.createdAt ? new Date(settings.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
                </div>
                <div>
                  <Label>Account type</Label>
                  <Input disabled value={settings?.premiumMember ? "⭐ Premium" : "Free"} />
                </div>
              </div>

              <FormActions>
                <Btn variant="primary" onClick={handleSaveProfile} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Btn>
              </FormActions>
            </div>
          )}

          {/* ══════ NOTIFICATIONS ══════ */}
          {activeTab === "notifications" && (
            <div>
              <SectionHead title="Notifications" sub="Control how you hear about property updates and alerts." />

              <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
                {[
                  { key: "emailNotifications", icon: "📧", label: "Email notifications", desc: "Property alerts, saved search updates, and account activity via email" },
                  { key: "smsNotifications", icon: "📱", label: "SMS notifications", desc: "Text messages for urgent property alerts and OTPs" },
                  { key: "whatsappNotifications", icon: "💬", label: "WhatsApp notifications", desc: "Receive property recommendations and messages on WhatsApp" },
                ].map(({ key, icon, label, desc }, i, arr) => (
                  <div key={key} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                    padding: "16px 20px",
                    borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                  }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 18, marginTop: 2 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.5 }}>{desc}</div>
                      </div>
                    </div>
                    <Toggle checked={notifs[key]} onChange={val => setNotifs(n => ({ ...n, [key]: val }))} />
                  </div>
                ))}
              </div>

              <FormActions>
                <Btn variant="primary" onClick={handleSaveNotifs} disabled={saving}>{saving ? "Saving…" : "Save preferences"}</Btn>
              </FormActions>
            </div>
          )}

          {/* ══════ SECURITY ══════ */}
          {activeTab === "security" && (
            <div>
              <SectionHead title="Security" sub="Manage your password and keep your account safe." />

              {/* connected accounts */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${T.border}`, marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Connected accounts</div>
                  <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>OAuth providers linked to your account</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {settings?.googleId && <span style={{ padding: "4px 12px", borderRadius: 20, background: "#EEF2FF", color: "#4361EE", fontSize: 12, fontWeight: 700 }}>G Google</span>}
                  {settings?.microsoftId && <span style={{ padding: "4px 12px", borderRadius: 20, background: "#EEF2FF", color: "#4361EE", fontSize: 12, fontWeight: 700 }}>M Microsoft</span>}
                  {!settings?.googleId && !settings?.microsoftId && <span style={{ fontSize: 12.5, color: T.muted }}>None linked</span>}
                </div>
              </div>

              {isOAuth && (
                <div style={{ background: "#EEF2FF", border: "1.5px solid #C7D2FE", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#4361EE", marginBottom: 20 }}>
                  🔗 Your account is linked with Google login
                </div>
              )}

              {/* Password form — show if they have a password */}
              {hasPassword && (
                <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>Change password</div>

                  {/* Current password — skip if OAuth is also linked */}

                  <div style={{ marginBottom: 14 }}>
                    <Label>Current password</Label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Input error={pwErr.current} type={showPw.current ? "text" : "password"} value={pwForm.current}
                        onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} placeholder="Enter current password" style={{ flex: 1 }} />
                      <button onClick={() => setShowPw(s => ({ ...s, current: !s.current }))} style={{ width: 40, height: 40, border: `1.5px solid ${T.border}`, borderRadius: 10, background: T.inputBg, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>
                        {showPw.current ? "🙈" : "👁"}
                      </button>
                    </div>
                    {pwErr.current && <div style={{ color: T.error, fontSize: 11.5, marginTop: 4 }}>{pwErr.current}</div>}
                  </div>


                  {/* New + Confirm — always shown */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 10 }}>
                    {[
                      { key: "next", label: "New password", ph: "Min. 8 characters" },
                      { key: "confirm", label: "Confirm password", ph: "Repeat new password" },
                    ].map(({ key, label, ph }) => (
                      <div key={key}>
                        <Label>{label}</Label>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Input error={pwErr[key]} type={showPw[key] ? "text" : "password"} value={pwForm[key]}
                            onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={{ flex: 1 }} />
                          <button onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))} style={{ width: 40, height: 40, border: `1.5px solid ${T.border}`, borderRadius: 10, background: T.inputBg, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>
                            {showPw[key] ? "🙈" : "👁"}
                          </button>
                        </div>
                        {pwErr[key] && <div style={{ color: T.error, fontSize: 11.5, marginTop: 4 }}>{pwErr[key]}</div>}
                      </div>
                    ))}
                  </div>

                  {pwStrength && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[0, 1, 2, 3].map(i => (
                          <div key={i} style={{ width: 34, height: 4, borderRadius: 2, background: i < pwStrength.score ? pwStrength.color : T.border, transition: "background .3s" }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: pwStrength.color, fontWeight: 600 }}>{pwStrength.label}</span>
                    </div>
                  )}

                  <FormActions>
                    <Btn variant="primary" onClick={handleChangePw} disabled={saving}>{saving ? "Saving…" : "Update password"}</Btn>
                  </FormActions>
                </div>
              )}

              {/* Pure OAuth only — no password set */}
              {isOAuth && !hasPassword && (
                <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, fontSize: 13, color: T.muted }}>
                  You don't have a password set. You sign in exclusively via Google / Microsoft.
                </div>
              )}

              {/* danger zone */}
              <div style={{ border: "1.5px solid #FACACA", borderRadius: 12, padding: 20, background: "#FFF8F8" }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.error, marginBottom: 12 }}>⚠️ Danger zone</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Delete account</div>
                    <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>Permanently removes all your data, listings, and activity. Cannot be undone.</div>
                  </div>
                  <Btn variant="danger" onClick={() => setDelModal(true)}>🗑️ Delete account</Btn>
                </div>
              </div>
            </div>
          )}

          {/* ══════ PREFERENCES ══════ */}
          {activeTab === "preferences" && (
            <div>
              <SectionHead title="Preferences" sub="Tell us what you're looking for — we'll tailor your feed." />

              <div style={{ marginBottom: 24 }}>
                <Label>Property types you're interested in</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
                  {PROPERTY_TYPES.map(type => {
                    const sel = prefs.preferences.includes(type);
                    return (
                      <button key={type} onClick={() => togglePref(type)} style={{
                        padding: "9px 18px", fontSize: 13, fontWeight: sel ? 700 : 500,
                        borderRadius: 22, border: `1.5px solid ${sel ? T.accent : T.border}`,
                        background: sel ? T.accent : T.white, color: sel ? "#fff" : T.text,
                        cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                      }}>
                        {sel ? "✓ " : ""}{type}
                      </button>
                    );
                  })}
                </div>
                {prefs.preferences.length === 0 && (
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 8 }}>Select at least one type for better recommendations.</div>
                )}
              </div>

              <div style={{ marginBottom: 8, maxWidth: 300 }}>
                <Label>Preferred city</Label>
                <Input value={prefs.city} onChange={e => setPrefs(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Pune" />
              </div>

              <FormActions>
                <Btn variant="primary" onClick={handleSavePrefs} disabled={saving}>{saving ? "Saving…" : "Save preferences"}</Btn>
              </FormActions>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;