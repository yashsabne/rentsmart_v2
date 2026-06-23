import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../apis";
import Footer from "../components/reuse/Footer";
import { C } from "../constants";
 

 
const STEPS = [
  { label: "Basic Info", desc: "Type, purpose & title" },
  { label: "Location",   desc: "Address & city" },
  { label: "Details",    desc: "Size, rooms & features" },
  { label: "Pricing",    desc: "Price & availability" },
  { label: "Photos",     desc: "Upload images" },
  { label: "Review",     desc: "Preview & publish" },
];

const PROPERTY_TYPES = ["Apartment", "Villa", "Bungalow", "Studio", "Penthouse", "Commercial", "Plot"];
const PURPOSES       = ["Rent", "Sell", "Lease"];
const FURNISHINGS    = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];
const FACINGS        = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"];
const AMENITY_LIST   = ["Parking", "Lift", "Swimming Pool", "Gym", "Security", "Power Backup", "Garden", "Clubhouse", "Wi-Fi", "Air Conditioning", "Pet Friendly", "Laundry"];

const ALLOWED_MIME  = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_PHOTOS    = 8;

const INITIAL_FORM = {
  type: "", purpose: "", title: "", description: "",
  address: "", city: "", locality: "", pincode: "",
  area: "", beds: 2, baths: 1, balconies: 1,
  floors: 0, totalFloors: 0, furnishing: "", facing: "",
  propertyAge: "", carParking: 0, bikeParking: 0,
  amenities: [], price: "", deposit: "", maintenance: "",
  available: "", negotiable: false,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Label({ children }) {
  return (
    <label style={{
      display: "block", fontSize: 12, fontWeight: 600, color: C.muted,
      letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 7,
    }}>
      {children}
    </label>
  );
}

function Input({ placeholder, value, onChange, type = "text", error, disabled = false, maxLength }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: error ? 4 : 0 }}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        maxLength={maxLength}
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 10,
          border: `1.5px solid ${error ? C.red : focused ? C.ink : C.border}`,
          fontSize: 14, color: C.ink,
          background: disabled ? C.cream : C.white,
          outline: "none", transition: "border-color .2s",
          opacity: disabled ? 0.6 : 1,
        }}
      />
      {error && <p style={{ fontSize: 12, color: C.red, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function SelectPills({ options, value, onChange, multi = false, disabled = false }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => {
        const active = multi ? value.includes(opt) : value === opt;
        return (
          <button
            key={opt}
            onClick={() => {
              if (disabled) return;
              if (multi) onChange(active ? value.filter(v => v !== opt) : [...value, opt]);
              else onChange(opt);
            }}
            disabled={disabled}
            style={{
              padding: "8px 18px", borderRadius: 100,
              border: `1.5px solid ${active ? C.ink : C.border}`,
              background: active ? C.ink : "none",
              color: active ? C.white : C.muted,
              fontSize: 13, fontWeight: 500, transition: "all .2s",
              opacity: disabled ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!active && !disabled) { e.currentTarget.style.borderColor = "#aaa"; e.currentTarget.style.color = C.ink; } }}
            onMouseLeave={e => { if (!active && !disabled) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; } }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Counter({ label, value, onChange, min = 0, max = 20, disabled = false }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 10, alignItems: "center",
      background: C.cream, borderRadius: 12, padding: "16px 20px",
      border: `1px solid ${C.border}`, flex: 1,
      opacity: disabled ? 0.6 : 1,
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={disabled || value <= min}
          style={{
            width: 30, height: 30, borderRadius: "50%",
            border: `1.5px solid ${C.border}`, background: C.white,
            fontSize: 16, color: C.ink,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .2s",
            opacity: (disabled || value <= min) ? 0.4 : 1,
          }}
          onMouseEnter={e => { if (!disabled && value > min) { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = C.white; } }}
          onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.color = C.ink; }}
        >
          −
        </button>
        <span style={{ fontSize: 20, fontWeight: 700, color: C.ink, minWidth: 24, textAlign: "center" }}>
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={disabled || value >= max}
          style={{
            width: 30, height: 30, borderRadius: "50%",
            border: `1.5px solid ${C.border}`, background: C.white,
            fontSize: 16, color: C.ink,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .2s",
            opacity: (disabled || value >= max) ? 0.4 : 1,
          }}
          onMouseEnter={e => { if (!disabled && value < max) { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = C.white; } }}
          onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.color = C.ink; }}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ─── Upload Progress Bar component ────────────────────────────────────────────

function UploadProgressPanel({ progress, elapsed, isSlow }) {
  // Bar color transitions: gold (0-60%) → blended → green (100%)
  const barColor = progress >= 100 ? C.green : progress > 60
    ? `color-mix(in srgb, ${C.green} ${((progress - 60) / 40) * 100}%, ${C.gold})`
    : C.gold;

  const statusLabel =
    progress >= 100 ? "Processing…" :
    progress > 0    ? `Uploading… ${progress}%` :
    "Preparing upload…";

  return (
    <div style={{ marginTop: 16 }}>

      {/* Header row */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Animated spinner dot */}
          <span style={{
            display: "inline-block", width: 7, height: 7, borderRadius: "50%",
            background: progress >= 100 ? C.green : C.gold,
            animation: progress >= 100 ? "none" : "pulse 1.2s ease-in-out infinite",
          }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>
            {statusLabel}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: C.muted }}>{elapsed}s elapsed</span>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: progress >= 100 ? C.green : C.ink,
          }}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Track */}
      <div style={{
        height: 6, borderRadius: 100,
        background: C.border, overflow: "hidden",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          height: "100%", borderRadius: 100,
          width: `${progress}%`,
          background: barColor,
          transition: "width 0.4s ease, background 0.6s ease",
          boxShadow: progress > 0 && progress < 100
            ? `0 0 8px ${C.gold}55`
            : "none",
        }} />
      </div>

      {/* File count hint */}
      <p style={{ fontSize: 11, color: C.light, marginTop: 6 }}>
        Uploading directly to secure cloud storage
      </p>

      {/* Slow upload warning — appears after 15s */}
      {isSlow && (
        <div
          className="fu"
          style={{
            marginTop: 14, padding: "12px 16px", borderRadius: 10,
            background: C.goldBg, border: `1px solid ${C.gold}`,
            display: "flex", gap: 10, alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⏳</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 3 }}>
              Sorry for the inconvenience
            </p>
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
              This is taking longer than usual — likely due to a slow connection or
              large file sizes. Please keep this tab open and we'll finish as soon
              as possible.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CreateListing() {
  const navigate = useNavigate();

  // ── Wizard ────────────────────────────────────────────────────────────────
  const [step,         setStep]         = useState(0);
  const [errors,       setErrors]       = useState({});
  const [published,    setPublished]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishError, setPublishError] = useState("");

  // ── Photos ────────────────────────────────────────────────────────────────
  const [photoFiles,      setPhotoFiles]      = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgress,  setUploadProgress]  = useState(0);
  const [uploadElapsed,   setUploadElapsed]   = useState(0);
  const [isSlowUpload,    setIsSlowUpload]    = useState(false);
  const [photoError,      setPhotoError]      = useState("");
  const [isDragOver,      setIsDragOver]      = useState(false);

  // Refs for timers so we can clear them reliably
  const elapsedTimerRef  = useRef(null);
  const slowWarningRef   = useRef(null);

  // ── Form ──────────────────────────────────────────────────────────────────
  const [form, setForm] = useState(INITIAL_FORM);
  const set  = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const setE = (k) => (e) => set(k)(e.target.value);

  // Clear all upload timers on unmount
  useEffect(() => {
    return () => {
      clearInterval(elapsedTimerRef.current);
      clearTimeout(slowWarningRef.current);
    };
  }, []);

  // ─── Photo handlers ───────────────────────────────────────────────────────

  const processFiles = (rawFiles) => {
    setPhotoError("");
    let files = rawFiles;

    const invalid = files.filter(f => !ALLOWED_MIME.includes(f.type));
    if (invalid.length) {
      setPhotoError("Only JPG, PNG, and WEBP files are allowed.");
      return;
    }

    const tooBig = files.filter(f => f.size > MAX_FILE_SIZE);
    if (tooBig.length) {
      setPhotoError(`Each image must be under 5 MB. ${tooBig.length} file(s) exceeded the limit.`);
      return;
    }

    const remaining = MAX_PHOTOS - photoFiles.length;
    if (files.length > remaining) {
      setPhotoError(
        `You can only add ${remaining} more photo${remaining !== 1 ? "s" : ""}. ` +
        `${files.length - remaining} file(s) were skipped.`
      );
      files = files.slice(0, remaining);
    }

    const withPreview = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id:      Math.random().toString(36).slice(2),
    }));

    setPhotoFiles(prev => [...prev, ...withPreview]);
  };

  const handleFileSelect = (e) => {
    processFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = ()  => setIsDragOver(false);

  const removePhotoFile = (id) => {
    setPhotoFiles(prev => {
      const item = prev.find(p => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(p => p.id !== id);
    });
    setPhotoError("");
  };

  // ─── Real XHR upload with onprogress ─────────────────────────────────────

  const uploadAllPhotos = () =>
    new Promise((resolve) => {
      if (photoFiles.length === 0) { resolve([]); return; }

      // Reset state
      setUploadingPhotos(true);
      setUploadProgress(0);
      setUploadElapsed(0);
      setIsSlowUpload(false);
      setPhotoError("");

      // Elapsed-seconds ticker — updates every second
      const startTime = Date.now();
      elapsedTimerRef.current = setInterval(() => {
        setUploadElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Slow-upload warning after 15 seconds
      slowWarningRef.current = setTimeout(() => setIsSlowUpload(true), 15_000);

      const teardown = () => {
        clearInterval(elapsedTimerRef.current);
        clearTimeout(slowWarningRef.current);
        setUploadingPhotos(false);
        setIsSlowUpload(false);
      };

      const token    = localStorage.getItem("token");
      const formData = new FormData();
      photoFiles.forEach(({ file }) => formData.append("photos", file));

      const xhr = new XMLHttpRequest();

      // ── Real progress from the browser ───────────────────────────────────
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const pct = Math.min(Math.round((event.loaded / event.total) * 95), 95);
          // Cap at 95 — the remaining 5% is Cloudinary server-side processing
          setUploadProgress(pct);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 401) {
          teardown();
          navigate("/login?reason=session_expired");
          resolve(null);
          return;
        }

        let data;
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          teardown();
          setPhotoError("Server returned an unexpected response. Please try again.");
          resolve(null);
          return;
        }

        if (xhr.status < 200 || xhr.status >= 300) {
          teardown();
          setPhotoError(data.message || "Upload failed. Please try again.");
          resolve(null);
          return;
        }

        // Snap to 100% and hold briefly so user sees completion
        setUploadProgress(100);
        setTimeout(() => {
          teardown();
          resolve(data.urls);
        }, 600);
      };

      xhr.onerror = () => {
        teardown();
        setPhotoError("Network error during upload. Please check your connection and try again.");
        resolve(null);
      };

      xhr.ontimeout = () => {
        teardown();
        setPhotoError("Upload timed out. Please try again with a faster connection.");
        resolve(null);
      };

      xhr.timeout = 120_000; // 2 minute hard timeout
      xhr.open("POST", `${API.PROPERTY}/api/property/upload-photos`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
    });

  // ─── Step validation ──────────────────────────────────────────────────────

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.type)               e.type        = "Select a property type";
      if (!form.purpose)            e.purpose     = "Select a purpose";
      if (!form.title.trim())       e.title       = "Enter a title";
      if (!form.description.trim()) e.description = "Enter a description";
    }
    if (step === 1) {
      if (!form.address.trim()) e.address = "Enter an address";
      if (!form.city.trim())    e.city    = "Enter a city";
    }
    if (step === 3) {
      if (!String(form.price).trim() || Number(form.price) <= 0)
        e.price = "Enter a valid price greater than 0";
    }
    return e;
  };

  const next = () => {
    const e = validateStep();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setErrors({});
    setPublishError("");
    setStep(s => Math.max(s - 1, 0));
  };

  // ─── Publish ──────────────────────────────────────────────────────────────

  const handlePublish = async () => {
    if (isSubmitting || uploadingPhotos) return;

    setPublishError("");

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login?reason=session_expired"); return; }

    setIsSubmitting(true);

    try {
      // 1. Upload to Cloudinary with real progress
      let photoUrls = [];
      if (photoFiles.length > 0) {
        const result = await uploadAllPhotos();
        if (result === null) { setIsSubmitting(false); return; }
        photoUrls = result;
      }

      // 2. Create listing
      const body = {
        type:        form.type,
        purpose:     form.purpose,
        title:       form.title,
        description: form.description,
        address:     form.address,
        city:        form.city,
        locality:    form.locality,
        pincode:     form.pincode,
        area:        form.area,
        beds:        form.beds,
        baths:       form.baths,
        balconies:   form.balconies,
        floors:      form.floors,
        totalFloors: form.totalFloors,
        furnishing:  form.furnishing,
        facing:      form.facing,
        propertyAge: form.propertyAge || 0,
        parking:     { car: form.carParking || 0, bike: form.bikeParking || 0 },
        amenities:   form.amenities,
        price:       form.price,
        deposit:     form.deposit,
        maintenance: form.maintenance,
        available:   form.available,
        negotiable:  form.negotiable,
        photos:      photoUrls,
      };

      const res = await fetch(`${API.PROPERTY}/api/property`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(body),
      });

      if (res.status === 401) { navigate("/login?reason=session_expired"); return; }

      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message || "Failed to create listing. Please try again.");
        return;
      }

      setPublished(true);
    } catch (err) {
      console.error("[handlePublish] ERROR:", err);
      setPublishError("A network error occurred. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Reset ────────────────────────────────────────────────────────────────

  const resetAll = () => {
    photoFiles.forEach(p => URL.revokeObjectURL(p.preview));
    setPhotoFiles([]);
    setPhotoError("");
    setPublishError("");
    setUploadProgress(0);
    setUploadElapsed(0);
    setIsSlowUpload(false);
    setPublished(false);
    setStep(0);
    setErrors({});
    setForm(INITIAL_FORM);
  };

  const busy = uploadingPhotos || isSubmitting;

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLISHED SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────────────────────

  if (published) {
    return (
      <div style={{
        minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          .pf { font-family: 'Playfair Display', serif !important; }
        `}</style>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", background: C.greenBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px", fontSize: 28, color: C.green, fontWeight: 700,
          }}>✓</div>
          <h1 className="pf" style={{ fontSize: "2rem", fontWeight: 700, color: C.ink, marginBottom: 10 }}>
            Listing Published!
          </h1>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 32 }}>
            Your property <strong style={{ color: C.ink }}>{form.title || "Untitled"}</strong> is now live
            and visible to thousands of buyers and renters.
          </p>
          <div style={{
            background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
            padding: "20px", marginBottom: 28, textAlign: "left",
          }}>
            {[
              ["Type",    form.type    || "—"],
              ["Purpose", form.purpose || "—"],
              ["City",    form.city    || "—"],
              ["Price",   form.price   ? `₹${Number(form.price).toLocaleString("en-IN")}` : "—"],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: "flex", justifyContent: "space-between", padding: "9px 0",
                borderBottom: k !== "Price" ? `1px solid ${C.border}` : "none",
              }}>
                <span style={{ fontSize: 13, color: C.muted }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{v}</span>
              </div>
            ))}
          </div>
          <button
            onClick={resetAll}
            style={{
              width: "100%", padding: "13px", borderRadius: 10, border: "none",
              background: C.ink, color: C.white, fontSize: 14, fontWeight: 600,
              marginBottom: 10, cursor: "pointer", transition: "background .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#2a2a2a"}
            onMouseLeave={e => e.currentTarget.style.background = C.ink}
          >
            Add Another Listing
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              width: "100%", padding: "12px", borderRadius: 10,
              border: `1.5px solid ${C.border}`, background: "none",
              color: C.ink, fontSize: 14, fontWeight: 500, cursor: "pointer",
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN FORM
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif !important; }
        .pf { font-family: 'Playfair Display', serif !important; }
        button, input, textarea, select { font-family: 'DM Sans', sans-serif; cursor: pointer; }
        a { text-decoration: none; color: inherit; }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse   { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.75); } }
        .fu { animation: fadeUp .4s both; }
        input::placeholder, textarea::placeholder { color: #C0C0C0; }
        textarea:focus, input:focus { outline: none; }
        .form-grid-2  { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-grid-3  { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .counter-row  { display: flex; gap: 12px; }
        @media (max-width: 700px) {
          .form-grid-2 { grid-template-columns: 1fr; }
          .form-grid-3 { grid-template-columns: 1fr 1fr; }
          .counter-row { flex-wrap: wrap; }
          .layout      { flex-direction: column !important; }
          .stepper     { display: none !important; }
          .main-pad    { padding: 24px 20px !important; }
        }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav style={{
        height: 60, background: C.white, borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px",
      }}>
        <a href="/" className="pf" style={{ fontSize: 20, fontWeight: 700, color: C.ink }}>
          Rent<span style={{ color: C.gold }}>Smart</span>
        </a>
        <div style={{ fontSize: 13, color: C.muted }}>
          Step <strong style={{ color: C.ink }}>{step + 1}</strong> of {STEPS.length}
        </div>
        <span onClick={() => navigate("/dashboard")   }  style={{ fontSize: 13, color: C.light }}>get back</span>
      </nav>

      <div className="layout" style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>

        {/* ── LEFT STEPPER ──────────────────────────────────────────────────── */}
        <div className="stepper" style={{
          width: 240, background: C.white, borderRight: `1px solid ${C.border}`,
          padding: "32px 24px", flexShrink: 0,
        }}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: C.muted,
            letterSpacing: "1px", textTransform: "uppercase", marginBottom: 24,
          }}>Progress</p>
          {STEPS.map((s, i) => {
            const done    = i < step;
            const current = i === step;
            return (
              <div key={i} style={{ display: "flex", gap: 14, marginBottom: 24, opacity: i > step ? 0.4 : 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: done ? C.green : current ? C.ink : "transparent",
                    border: `2px solid ${done ? C.green : current ? C.ink : C.border}`,
                    color: done || current ? C.white : C.light,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, flexShrink: 0, transition: "all .3s",
                  }}>
                    {done ? "✓" : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 1.5, height: 24, background: done ? C.green : C.border, marginTop: 4 }} />
                  )}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: current ? 600 : 400, color: current ? C.ink : C.muted }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 11, color: C.light, marginTop: 1 }}>{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── MAIN FORM ──────────────────────────────────────────────────────── */}
        <div className="main-pad" style={{ flex: 1, padding: "36px 48px 60px", overflowY: "auto" }}>
          <div style={{ maxWidth: 620, margin: "0 auto" }}>

            {/* Step heading */}
            <div className="fu" style={{ marginBottom: 32 }}>
              <h1 className="pf" style={{ fontSize: "1.8rem", fontWeight: 700, color: C.ink, marginBottom: 4 }}>
                {STEPS[step].label}
              </h1>
              <p style={{ fontSize: 14, color: C.muted }}>{STEPS[step].desc}</p>
            </div>

            {/* ── STEP 0: Basic Info ─────────────────────────────────────────── */}
            {step === 0 && (
              <div className="fu">
                <div style={{ marginBottom: 22 }}>
                  <Label>Property Type</Label>
                  <SelectPills options={PROPERTY_TYPES} value={form.type} onChange={set("type")} />
                  {errors.type && <p style={{ fontSize: 12, color: C.red, marginTop: 6 }}>{errors.type}</p>}
                </div>
                <div style={{ marginBottom: 22 }}>
                  <Label>Purpose</Label>
                  <SelectPills options={PURPOSES} value={form.purpose} onChange={set("purpose")} />
                  {errors.purpose && <p style={{ fontSize: 12, color: C.red, marginTop: 6 }}>{errors.purpose}</p>}
                </div>
                <div style={{ marginBottom: 22 }}>
                  <Label>Listing Title</Label>
                  <Input
                    placeholder="e.g. Spacious 3BHK with Sea View in Bandra"
                    value={form.title} onChange={setE("title")} error={errors.title} maxLength={150}
                  />
                  <p style={{ fontSize: 11, color: C.light, marginTop: 4, textAlign: "right" }}>
                    {form.title.length} / 150
                  </p>
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    placeholder="Describe the property — highlights, nearby landmarks, special features…"
                    value={form.description}
                    onChange={setE("description")}
                    rows={5}
                    maxLength={500}
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 10,
                      border: `1.5px solid ${errors.description ? C.red : C.border}`,
                      fontSize: 14, color: C.ink, resize: "vertical",
                      lineHeight: 1.6, transition: "border-color .2s",
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = C.ink}
                    onBlur={e  => e.currentTarget.style.borderColor = errors.description ? C.red : C.border}
                  />
                  {errors.description && (
                    <p style={{ fontSize: 12, color: C.red, marginTop: 4 }}>{errors.description}</p>
                  )}
                  <p style={{
                    fontSize: 11, marginTop: 5, textAlign: "right",
                    color: form.description.length >= 480 ? C.gold : C.light,
                  }}>
                    {form.description.length} / 500
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP 1: Location ───────────────────────────────────────────── */}
            {step === 1 && (
              <div className="fu">
                <div style={{ marginBottom: 22 }}>
                  <Label>Full Address</Label>
                  <Input placeholder="Building name, street, area" value={form.address} onChange={setE("address")} error={errors.address} />
                </div>
                <div className="form-grid-2" style={{ marginBottom: 22 }}>
                  <div>
                    <Label>City</Label>
                    <Input placeholder="e.g. Mumbai" value={form.city} onChange={setE("city")} error={errors.city} />
                  </div>
                  <div>
                    <Label>Locality</Label>
                    <Input placeholder="e.g. Bandra West" value={form.locality} onChange={setE("locality")} />
                  </div>
                </div>
                <div style={{ marginBottom: 22 }}>
                  <Label>Pincode</Label>
                  <Input placeholder="400050" value={form.pincode} onChange={setE("pincode")} type="number" />
                </div>
                <div style={{
                  height: 200, borderRadius: 14,
                  background: "linear-gradient(135deg,#e8f4f8,#d4e8e0)",
                  border: `1px solid ${C.border}`,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 28 }}>🗺️</span>
                  <span style={{ fontSize: 13, color: C.muted }}>Map will appear here</span>
                  <span style={{ fontSize: 12, color: C.light }}>Integrate Google Maps API</span>
                </div>
              </div>
            )}

            {/* ── STEP 2: Details ────────────────────────────────────────────── */}
            {step === 2 && (
              <div className="fu">
                <div style={{ marginBottom: 22 }}>
                  <Label>Built-up Area (sqft)</Label>
                  <Input placeholder="e.g. 1200" value={form.area} onChange={setE("area")} type="number" />
                </div>
                <div style={{ marginBottom: 22 }}>
                  <Label>Rooms</Label>
                  <div className="counter-row">
                    <Counter label="Bedrooms"  value={form.beds}      onChange={set("beds")}      min={0} />
                    <Counter label="Bathrooms" value={form.baths}     onChange={set("baths")}     min={0} />
                    <Counter label="Balconies" value={form.balconies} onChange={set("balconies")} min={0} />
                  </div>
                </div>
                <div className="form-grid-2" style={{ marginBottom: 22 }}>
                  <div>
                    <Label>Property on Floor</Label>
                    <Input placeholder="e.g. 5" value={form.floors} onChange={setE("floors")} type="number" />
                  </div>
                  <div>
                    <Label>Total Floors</Label>
                    <Input placeholder="e.g. 12" value={form.totalFloors} onChange={setE("totalFloors")} type="number" />
                  </div>
                </div>
                <div style={{ marginBottom: 22 }}>
                  <Label>Furnishing</Label>
                  <SelectPills options={FURNISHINGS} value={form.furnishing} onChange={set("furnishing")} />
                </div>
                <div style={{ marginBottom: 22 }}>
                  <Label>Facing</Label>
                  <SelectPills options={FACINGS} value={form.facing} onChange={set("facing")} />
                </div>
                <div>
                  <Label>Amenities</Label>
                  <SelectPills options={AMENITY_LIST} value={form.amenities} onChange={set("amenities")} multi />
                  <p style={{ fontSize: 11, color: C.light, marginTop: 8 }}>{form.amenities.length} selected</p>
                </div>
              </div>
            )}

            {/* ── STEP 3: Pricing ────────────────────────────────────────────── */}
            {step === 3 && (
              <div className="fu">
                <div style={{ marginBottom: 22 }}>
                  <Label>{form.purpose === "Sell" ? "Asking Price (₹)" : "Monthly Rent (₹)"}</Label>
                  <Input
                    placeholder={form.purpose === "Sell" ? "e.g. 8500000" : "e.g. 35000"}
                    value={form.price} onChange={setE("price")} type="number" error={errors.price}
                  />
                  {form.price && Number(form.price) > 0 && (
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 5 }}>
                      ₹{Number(form.price).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
                {form.purpose !== "Sell" && (
                  <div className="form-grid-2" style={{ marginBottom: 22 }}>
                    <div>
                      <Label>Security Deposit (₹)</Label>
                      <Input placeholder="e.g. 100000" value={form.deposit} onChange={setE("deposit")} type="number" />
                    </div>
                    <div>
                      <Label>Maintenance (₹/mo)</Label>
                      <Input placeholder="e.g. 5000" value={form.maintenance} onChange={setE("maintenance")} type="number" />
                    </div>
                  </div>
                )}
                <div style={{ marginBottom: 22 }}>
                  <Label>Available From</Label>
                  <Input value={form.available} onChange={setE("available")} type="date" />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox" checked={form.negotiable}
                    onChange={e => set("negotiable")(e.target.checked)}
                    style={{ accentColor: C.ink, width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: 14, color: C.ink }}>Price is negotiable</span>
                </label>
              </div>
            )}

            {/* ── STEP 4: Photos ─────────────────────────────────────────────── */}
            {step === 4 && (
              <div className="fu">
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.7 }}>
                  Add up to {MAX_PHOTOS} photos. High-quality images get 3× more inquiries.
                  <br />
                  <span style={{ fontSize: 12, color: C.light }}>
                    Accepted: JPG, PNG, WEBP · Max 5 MB each
                  </span>
                </p>

                {/* Photo grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: 12, marginBottom: 16,
                }}>
                  {photoFiles.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        position: "relative", borderRadius: 12,
                        overflow: "hidden", border: `1px solid ${C.border}`,
                      }}
                    >
                      <img
                        src={item.preview}
                        alt={`Photo ${idx + 1}`}
                        style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }}
                      />
                      {idx === 0 && (
                        <span style={{
                          position: "absolute", bottom: 6, left: 6,
                          fontSize: 10, fontWeight: 600, padding: "2px 7px",
                          borderRadius: 100, background: C.ink, color: C.white,
                        }}>Cover</span>
                      )}
                      <button
                        onClick={() => removePhotoFile(item.id)}
                        aria-label={`Remove photo ${idx + 1}`}
                        disabled={uploadingPhotos}
                        style={{
                          position: "absolute", top: 6, right: 6,
                          width: 22, height: 22, borderRadius: "50%",
                          background: "rgba(20,20,20,0.75)", border: "none",
                          color: C.white, fontSize: 14,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          lineHeight: 1,
                          opacity: uploadingPhotos ? 0.4 : 1,
                          cursor: uploadingPhotos ? "not-allowed" : "pointer",
                        }}
                      >×</button>
                    </div>
                  ))}

                  {/* Drop zone */}
                  {photoFiles.length < MAX_PHOTOS && !uploadingPhotos && (
                    <label
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      aria-label="Add photos"
                      style={{
                        height: 110, borderRadius: 12,
                        border: `2px dashed ${isDragOver ? C.ink : C.border}`,
                        background: isDragOver ? "#F0F0EC" : "none",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: 6,
                        color: isDragOver ? C.ink : C.muted,
                        fontSize: 13, fontWeight: 500,
                        cursor: "pointer", transition: "all .2s",
                      }}
                      onMouseEnter={e => { if (!isDragOver) { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; } }}
                      onMouseLeave={e => { if (!isDragOver) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; } }}
                    >
                      <span style={{ fontSize: 22 }}>+</span>
                      {isDragOver ? "Drop here" : "Add Photos"}
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />
                    </label>
                  )}
                </div>

                {/* Count */}
                <p style={{ fontSize: 12, color: C.light }}>
                  {photoFiles.length} / {MAX_PHOTOS} photos selected
                </p>

                {/* Photo error */}
                {photoError && (
                  <div style={{
                    marginTop: 10, padding: "10px 14px", borderRadius: 10,
                    background: C.redBg, border: `1px solid ${C.red}`,
                  }}>
                    <p style={{ fontSize: 12, color: C.red }}>{photoError}</p>
                  </div>
                )}

                {/* Real progress panel — only visible while uploading */}
                {uploadingPhotos && (
                  <UploadProgressPanel
                    progress={uploadProgress}
                    elapsed={uploadElapsed}
                    isSlow={isSlowUpload}
                  />
                )}
              </div>
            )}

            {/* ── STEP 5: Review ─────────────────────────────────────────────── */}
            {step === 5 && (
              <div className="fu">
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.7 }}>
                  Review your listing before publishing. You can always edit it later from your dashboard.
                </p>

                {/* Summary card */}
                <div style={{
                  background: C.white, borderRadius: 16,
                  border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20,
                }}>
                  {photoFiles.length > 0 ? (
                    <img
                      src={photoFiles[0].preview}
                      alt="Cover"
                      style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div style={{
                      height: 160, background: "linear-gradient(135deg,#e8e2d5,#d4c8b4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 13, color: C.muted }}>No photos selected</span>
                    </div>
                  )}

                  {photoFiles.length > 1 && (
                    <div style={{
                      display: "flex", gap: 6, padding: "8px 12px",
                      borderBottom: `1px solid ${C.border}`, overflowX: "auto",
                    }}>
                      {photoFiles.slice(1).map((item, idx) => (
                        <img
                          key={item.id}
                          src={item.preview}
                          alt={`Thumbnail ${idx + 2}`}
                          style={{ width: 48, height: 40, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                        />
                      ))}
                    </div>
                  )}

                  <div style={{ padding: "20px 22px" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      {form.purpose && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: C.greenBg, color: C.green }}>
                          {form.purpose}
                        </span>
                      )}
                      {form.type && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: C.goldBg, color: C.gold }}>
                          {form.type}
                        </span>
                      )}
                    </div>
                    <div className="pf" style={{ fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
                      {form.price
                        ? `₹${Number(form.price).toLocaleString("en-IN")}${form.purpose !== "Sell" ? "/mo" : ""}`
                        : "—"}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: C.ink, marginBottom: 4 }}>
                      {form.title || "Untitled"}
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>
                      {[form.locality, form.city].filter(Boolean).join(", ") || "—"}
                    </div>
                    <div style={{
                      display: "flex", gap: 16, flexWrap: "wrap",
                      borderTop: `1px solid ${C.border}`, paddingTop: 12,
                    }}>
                      {form.beds  > 0    && <span style={{ fontSize: 12, color: C.muted }}>{form.beds} Bed</span>}
                      {form.baths > 0    && <span style={{ fontSize: 12, color: C.muted }}>{form.baths} Bath</span>}
                      {form.area         && <span style={{ fontSize: 12, color: C.muted }}>{form.area} sqft</span>}
                      {form.furnishing   && <span style={{ fontSize: 12, color: C.muted }}>{form.furnishing}</span>}
                      {form.negotiable   && <span style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>Negotiable</span>}
                    </div>
                  </div>
                </div>

                {/* Edit links */}
                <div style={{
                  background: C.cream, borderRadius: 12,
                  border: `1px solid ${C.border}`, padding: "14px 18px", marginBottom: 20,
                }}>
                  {STEPS.slice(0, 5).map((s, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none",
                    }}>
                      <span style={{ fontSize: 13, color: C.muted }}>{s.label}</span>
                      <button
                        onClick={() => { setStep(i); setErrors({}); setPublishError(""); }}
                        disabled={busy}
                        style={{
                          fontSize: 12, fontWeight: 500, color: C.ink,
                          border: "none", background: "none",
                          borderBottom: `1px solid ${C.border}`,
                          opacity: busy ? 0.4 : 1,
                          cursor: busy ? "not-allowed" : "pointer",
                        }}
                      >Edit</button>
                    </div>
                  ))}
                </div>

                {/* Publish error */}
                {publishError && (
                  <div style={{
                    marginBottom: 16, padding: "12px 16px", borderRadius: 10,
                    background: C.redBg, border: `1px solid ${C.red}`,
                  }}>
                    <p style={{ fontSize: 13, color: C.red, lineHeight: 1.5 }}>{publishError}</p>
                  </div>
                )}

                {/* Publish button */}
                <button
                  onClick={handlePublish}
                  disabled={busy}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 10, border: "none",
                    background: busy ? "#7aad94" : C.green,
                    color: C.white, fontSize: 15, fontWeight: 600,
                    cursor: busy ? "not-allowed" : "pointer",
                    transition: "opacity .2s, background .2s",
                  }}
                  onMouseEnter={e => { if (!busy) e.currentTarget.style.opacity = "0.85"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                >
                  {isSubmitting
                    ? "Publishing…"
                    : uploadingPhotos
                    ? "Uploading photos…"
                    : "Publish Listing"}
                </button>
              </div>
            )}

            {/* ── NAV BUTTONS ────────────────────────────────────────────────── */}
            {step < 5 && (
              <div style={{ display: "flex", gap: 10, marginTop: 36 }}>
                {step > 0 && (
                  <button
                    onClick={back}
                    disabled={busy}
                    style={{
                      flex: 1, padding: "12px", borderRadius: 10,
                      border: `1.5px solid ${C.border}`, background: "none",
                      color: C.ink, fontSize: 14, fontWeight: 500,
                      transition: "background .2s",
                      opacity: busy ? 0.5 : 1,
                      cursor: busy ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={e => { if (!busy) e.currentTarget.style.background = C.cream; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                  >Back</button>
                )}
                <button
                  onClick={next}
                  disabled={busy}
                  style={{
                    flex: step === 0 ? 1 : 2, padding: "12px", borderRadius: 10,
                    border: "none",
                    background: busy ? "#555" : C.ink,
                    color: C.white, fontSize: 14, fontWeight: 600,
                    transition: "background .2s",
                    cursor: busy ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={e => { if (!busy) e.currentTarget.style.background = "#2a2a2a"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = busy ? "#555" : C.ink; }}
                >
                  {step === 4 ? "Review Listing" : "Continue"}
                </button>
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