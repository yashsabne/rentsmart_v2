import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../../apis";
import { convertProcessSignalToExitCode } from "util";
import Footer from "../components/reuse/Footer";
import { C } from "../constants";

const steps = [
  { label: "Basic Info", desc: "Type, purpose & title" },
  { label: "Location", desc: "Address & city" },
  { label: "Details", desc: "Size, rooms & features" },
  { label: "Pricing", desc: "Price & availability" },
  { label: "Photos", desc: "Upload images" },
  { label: "Review", desc: "Preview & publish" },
];

const propertyTypes = ["Apartment", "Villa", "Bungalow", "Studio", "Penthouse", "Commercial", "Plot"];
const purposes = ["Rent", "Sell", "Lease"];
const furnishings = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];
const facings = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"];
const amenityList = ["Parking", "Lift", "Swimming Pool", "Gym", "Security", "Power Backup", "Garden", "Clubhouse", "Wi-Fi", "Air Conditioning", "Pet Friendly", "Laundry"];

function Label({ children }) {
  return <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 7 }}>{children}</label>;
}

function Input({ placeholder, value, onChange, type = "text", error }) {
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
        style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${error ? C.red : focused ? C.ink : C.border}`, fontSize: 14, color: C.ink, background: C.white, outline: "none", transition: "border-color .2s" }}
      />
      {error && <p style={{ fontSize: 12, color: C.red, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function SelectPills({ options, value, onChange, multi = false }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => {
        const active = multi ? value.includes(opt) : value === opt;
        return (
          <button key={opt} onClick={() => {
            if (multi) onChange(active ? value.filter(v => v !== opt) : [...value, opt]);
            else onChange(opt);
          }}
            style={{ padding: "8px 18px", borderRadius: 100, border: `1.5px solid ${active ? C.ink : C.border}`, background: active ? C.ink : "none", color: active ? C.white : C.muted, fontSize: 13, fontWeight: 500, transition: "all .2s" }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = "#aaa"; e.currentTarget.style.color = C.ink; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; } }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Counter({ label, value, onChange, min = 0, max = 20 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", background: C.cream, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.border}`, flex: 1 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => onChange(Math.max(min, value - 1))}
          style={{ width: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${C.border}`, background: C.white, fontSize: 16, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = C.white; }}
          onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.color = C.ink; }}>
          −
        </button>
        <span style={{ fontSize: 20, fontWeight: 700, color: C.ink, minWidth: 24, textAlign: "center" }}>{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))}
          style={{ width: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${C.border}`, background: C.white, fontSize: 16, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = C.white; }}
          onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.color = C.ink; }}>
          +
        </button>
      </div>
    </div>
  );
}

export default function EditListing() {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { id } = useParams();

  const [form, setForm] = useState({
    // Step 0
    type: "",
    purpose: "",
    title: "",
    description: "",

    // Step 1
    address: "",
    city: "",
    locality: "",
    pincode: "",

    // Step 2
    area: "",

    beds: 2,
    baths: 1,
    balconies: 1,

    floors: 0,
    totalFloors: 0,

    furnishing: "",
    facing: "",

    propertyAge: "",

    carParking: 0,
    bikeParking: 0,

    amenities: [],

    // Step 3
    price: "",
    deposit: "",
    maintenance: "",

    available: "",

    negotiable: false,

    // Step 4
    photos: [],
  });

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const setE = (k) => (e) => set(k)(e.target.value);

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.type) e.type = "Select a property type";
      if (!form.purpose) e.purpose = "Select a purpose";
      if (!form.title.trim()) e.title = "Enter a title";
    }
    if (step === 1) {
      if (!form.address.trim()) e.address = "Enter address";
      if (!form.city.trim()) e.city = "Enter city";
    }
    if (step === 3) {
      if (!form.price) {
        e.price = "Enter price";
      }
    }
    return e;
  };

  const next = () => {
    const e = validateStep();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API.PROPERTY}/api/property/details/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.message);
          return;
        } 

        setForm({
          type: data.type || "",
          purpose: data.buyOrSell || "",
          title: data.title || "",
          description: data.description || "",

          address: data.address.street || "",
          city: data.address.city || "",
          locality: data.address.aptSuite || "",
          pincode: data.address.pincode || "",

          area: data.details.area || "",

          beds: data.details.bedCount || 0,
          baths: data.details.bathroomCount || 0,
          balconies: data.details.balconyCount || 0,


          floors: data.details.floorNumber || 0,
          totalFloors: data.details.totalFloors || 0,

          furnishing: data.details.furnishing || "",
          facing: data.details.facing || "",

          propertyAge: data.propertyAge || "",

          carParking: data.parking?.car || 0,
          bikeParking: data.parking?.bike || 0,

          amenities: data.amenities || [],

          price: data.price || "",
          deposit: data.deposit || "",
          maintenance: data.maintenance || "",

          available: data.available
            ? data.available.split("T")[0]
            : "",

          negotiable: data.negotiable || false,

          photos: data.listingPhotos || [],
        });

        setLoading(false);

      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const back = () => { setErrors({}); setStep(s => Math.max(s - 1, 0)); };

const handlePhotoAdd = () => {
  alert("Image upload coming soon");
};
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        return;
      }

    const body = {
  type: form.type,
  buyOrSell: form.purpose,

  title: form.title,
  description: form.description,

  address: {
    street: form.address,
    aptSuite: form.locality,
    city: form.city,
    pincode: form.pincode,
    country: "India",
  },

  details: {
    area: form.area,

    bedCount: form.beds,
    bathroomCount: form.baths,
    balconyCount: form.balconies,

    floorNumber: form.floors,
    totalFloors: form.totalFloors,

    furnishing: form.furnishing,
    facing: form.facing,

    propertyAge: form.propertyAge || 0,

    parking: {
      car: form.carParking || 0,
      bike: form.bikeParking || 0,
    },
  },

  amenities: form.amenities,

  price: form.price,
  deposit: form.deposit,
  maintenance: form.maintenance,

  negotiable: form.negotiable,

  listingPhotos: form.photos,
};
      const res = await fetch(
        `${API.PROPERTY}/api/property/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        alert(data.message || "Failed to create listing");
        return;
      }

 
      alert("Property updated successfully");

      navigate(`/details/${id}`);

    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong");
    }
  };

  const removePhoto = (id) => set("photos")(form.photos.filter(p => p.id !== id));

  if (loading) {
    return <h2>Loading property...</h2>;
  }


  if (published) {
    return (
      <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } .pf { font-family: 'Playfair Display', serif !important; }`}</style>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.greenBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28, color: C.green, fontWeight: 700 }}>✓</div>
          <h1 className="pf" style={{ fontSize: "2rem", fontWeight: 700, color: C.ink, marginBottom: 10 }}>Listing Published!</h1>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 32 }}>
            Your property <strong style={{ color: C.ink }}>{form.title || "Untitled"}</strong> is now live and visible to thousands of buyers and renters.
          </p>
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px", marginBottom: 28, textAlign: "left" }}>
            {[["Type", form.type || "—"], ["Purpose", form.purpose || "—"], ["City", form.city || "—"], ["Price", form.price ? `₹${Number(form.price).toLocaleString("en-IN")}` : "—"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: k !== "Price" ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 13, color: C.muted }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setPublished(false); setStep(0); setForm({ type: "", purpose: "", title: "", description: "", address: "", city: "", locality: "", pincode: "", area: "", beds: 2, baths: 1, balconies: 1, floors: 0, totalFloors: 0, furnishing: "", facing: "", amenities: [], price: "", deposit: "", maintenance: "", available: "", negotiable: false, photos: [] }); }}
            style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: C.ink, color: C.white, fontSize: 14, fontWeight: 600, marginBottom: 10, cursor: "pointer", transition: "background .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#2a2a2a"}
            onMouseLeave={e => e.currentTarget.style.background = C.ink}>
            Add Another Listing
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ width: "100%", padding: "12px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "none", color: C.ink, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp .4s both; }
        input::placeholder, textarea::placeholder { color: #C0C0C0; }
        textarea:focus, input:focus { outline: none; }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .counter-row { display: flex; gap: 12px; }
        @media (max-width: 700px) {
          .form-grid-2 { grid-template-columns: 1fr; }
          .form-grid-3 { grid-template-columns: 1fr 1fr; }
          .counter-row { flex-wrap: wrap; }
          .layout { flex-direction: column !important; }
          .stepper { display: none !important; }
          .main-pad { padding: 24px 20px !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ height: 60, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
        <a href="/" className="pf" style={{ fontSize: 20, fontWeight: 700, color: C.ink }}>
          Rent<span style={{ color: C.gold }}>Smart</span>
        </a>
        <div style={{ fontSize: 13, color: C.muted }}>
          Step <strong style={{ color: C.ink }}>{step + 1}</strong> of {steps.length}
        </div>
        <span onClick={() => navigate("/dashboard")   }  style={{ fontSize: 13, color: C.light }}>get back</span>
      </nav>

      <div className="layout" style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>

        {/* ── LEFT STEPPER ── */}
        <div className="stepper" style={{ width: 240, background: C.white, borderRight: `1px solid ${C.border}`, padding: "32px 24px", flexShrink: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 24 }}>Progress</p>
          {steps.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <div key={i} style={{ display: "flex", gap: 14, marginBottom: 24, opacity: i > step ? 0.4 : 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? C.green : current ? C.ink : "transparent", border: `2px solid ${done ? C.green : current ? C.ink : C.border}`, color: done || current ? C.white : C.light, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, transition: "all .3s" }}>
                    {done ? "✓" : i + 1}
                  </div>
                  {i < steps.length - 1 && <div style={{ width: 1.5, height: 24, background: done ? C.green : C.border, marginTop: 4 }} />}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: current ? 600 : 400, color: current ? C.ink : C.muted }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: C.light, marginTop: 1 }}>{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── MAIN FORM ── */}
        <div className="main-pad" style={{ flex: 1, padding: "36px 48px 60px", overflowY: "auto" }}>
          <div style={{ maxWidth: 620, margin: "0 auto" }}>

            {/* Step heading */}
            <div className="fu" style={{ marginBottom: 32 }}>
              <h1 className="pf" style={{ fontSize: "1.8rem", fontWeight: 700, color: C.ink, marginBottom: 4 }}>{steps[step].label}</h1>
              <p style={{ fontSize: 14, color: C.muted }}>{steps[step].desc}</p>
            </div>

            {/* ── STEP 0: Basic Info ── */}
            {step === 0 && (
              <div className="fu">
                <div style={{ marginBottom: 22 }}>
                  <Label>Property Type</Label>
                  <SelectPills options={propertyTypes} value={form.type} onChange={set("type")} />
                  {errors.type && <p style={{ fontSize: 12, color: C.red, marginTop: 6 }}>{errors.type}</p>}
                </div>
                <div style={{ marginBottom: 22 }}>
                  <Label>Purpose</Label>
                  <SelectPills options={purposes} value={form.purpose} onChange={set("purpose")} />
                  {errors.purpose && <p style={{ fontSize: 12, color: C.red, marginTop: 6 }}>{errors.purpose}</p>}
                </div>
                <div style={{ marginBottom: 22 }}>
                  <Label>Listing Title</Label>
                  <Input placeholder="e.g. Spacious 3BHK with Sea View in Bandra" value={form.title} onChange={setE("title")} error={errors.title} />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    placeholder="Describe the property — highlights, nearby landmarks, special features…"
                    value={form.description}
                    onChange={setE("description")}
                    rows={5}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.ink, resize: "vertical", lineHeight: 1.6, transition: "border-color .2s" }}
                    onFocus={e => e.currentTarget.style.borderColor = C.ink}
                    onBlur={e => e.currentTarget.style.borderColor = C.border}
                  />
                  <p style={{ fontSize: 11, color: C.light, marginTop: 5, textAlign: "right" }}>{form.description.length} / 500</p>
                </div>
              </div>
            )}

            {/* ── STEP 1: Location ── */}
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
                {/* Map placeholder */}
                <div style={{ height: 200, borderRadius: 14, background: "linear-gradient(135deg,#e8f4f8,#d4e8e0)", border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ fontSize: 28 }}>🗺️</span>
                  <span style={{ fontSize: 13, color: C.muted }}>Map will appear here</span>
                  <span style={{ fontSize: 12, color: C.light }}>Integrate Google Maps API</span>
                </div>
              </div>
            )}

            {/* ── STEP 2: Details ── */}
            {step === 2 && (
              <div className="fu">
                <div style={{ marginBottom: 22 }}>
                  <Label>Built-up Area (sqft)</Label>
                  <Input placeholder="e.g. 1200" value={form.area} onChange={setE("area")} type="number" />
                </div>

                <div style={{ marginBottom: 22 }}>
                  <Label>Rooms</Label>
                  <div className="counter-row">
                    <Counter label="Bedrooms" value={form.beds} onChange={set("beds")} min={0} />
                    <Counter label="Bathrooms" value={form.baths} onChange={set("baths")} min={0} />
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
                  <SelectPills options={furnishings} value={form.furnishing} onChange={set("furnishing")} />
                </div>

                <div style={{ marginBottom: 22 }}>
                  <Label>Facing</Label>
                  <SelectPills options={facings} value={form.facing} onChange={set("facing")} />
                </div>

                <div>
                  <Label>Amenities</Label>
                  <SelectPills options={amenityList} value={form.amenities} onChange={set("amenities")} multi />
                  <p style={{ fontSize: 11, color: C.light, marginTop: 8 }}>{form.amenities.length} selected</p>
                </div>
              </div>
            )}

            {/* ── STEP 3: Pricing ── */}
            {step === 3 && (
              <div className="fu">
                <div style={{ marginBottom: 22 }}>
                  <Label>
                    {form.purpose === "Sell" ? "Asking Price (₹)" : "Monthly Rent (₹)"}
                  </Label>
                  <Input
                    placeholder={form.purpose === "Sell" ? "e.g. 8500000" : "e.g. 35000"}
                    value={form.price} onChange={setE("price")} type="number" error={errors.price}
                  />
                  {form.price && (
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
                  <input type="checkbox" checked={form.negotiable} onChange={e => set("negotiable")(e.target.checked)}
                    style={{ accentColor: C.ink, width: 16, height: 16 }} />
                  <span style={{ fontSize: 14, color: C.ink }}>Price is negotiable</span>
                </label>
              </div>
            )}

            {/* ── STEP 4: Photos ── */}
            {step === 4 && (
              <div className="fu">
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.7 }}>
                  Add up to 8 photos. High-quality images get 3× more inquiries.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
                  {form.photos.map(p => (
                    <div key={p.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
                      <div style={{ height: 110, background: p.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: C.muted }}>{p.name}</span>
                      </div>
                      <button onClick={() => removePhoto(p.id)}
                        style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%", background: "rgba(20,20,20,0.7)", border: "none", color: C.white, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ×
                      </button>
                    </div>
                  ))}

                  {form.photos.length < 8 && (
                    <button onClick={handlePhotoAdd}
                      style={{ height: 110, borderRadius: 12, border: `2px dashed ${C.border}`, background: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: C.muted, fontSize: 13, fontWeight: 500, transition: "all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                      <span style={{ fontSize: 22 }}>+</span>
                      Add Photo
                    </button>
                  )}
                </div>

                <p style={{ fontSize: 12, color: C.light }}>{form.photos.length} / 8 photos added</p>
              </div>
            )}

            {/* ── STEP 5: Review ── */}
            {step === 5 && (
              <div className="fu">
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.7 }}>
                  Review your listing before publishing. You can always edit it later from your dashboard.
                </p>

                {/* Summary card */}
                <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20 }}>
                  {/* Mock image */}
                  <div style={{ height: 160, background: "linear-gradient(135deg,#e8e2d5,#d4c8b4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13, color: C.muted }}>{form.photos.length} photo{form.photos.length !== 1 ? "s" : ""} added</span>
                  </div>
                  <div style={{ padding: "20px 22px" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      {form.purpose && <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: C.greenBg, color: C.green }}>{form.purpose}</span>}
                      {form.type && <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: C.goldBg, color: C.gold }}>{form.type}</span>}
                    </div>
                    <div className="pf" style={{ fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
                      {form.price ? `₹${Number(form.price).toLocaleString("en-IN")}${form.purpose !== "Sell" ? "/mo" : ""}` : "—"}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: C.ink, marginBottom: 4 }}>{form.title || "Untitled"}</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>{[form.locality, form.city].filter(Boolean).join(", ") || "—"}</div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                      {form.beds > 0 && <span style={{ fontSize: 12, color: C.muted }}>{form.beds} Bed</span>}
                      {form.baths > 0 && <span style={{ fontSize: 12, color: C.muted }}>{form.baths} Bath</span>}
                      {form.area && <span style={{ fontSize: 12, color: C.muted }}>{form.area} sqft</span>}
                      {form.furnishing && <span style={{ fontSize: 12, color: C.muted }}>{form.furnishing}</span>}
                    </div>
                  </div>
                </div>

                {/* Edit links */}
                <div style={{ background: C.cream, borderRadius: 12, border: `1px solid ${C.border}`, padding: "14px 18px", marginBottom: 24 }}>
                  {steps.slice(0, 5).map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
                      <span style={{ fontSize: 13, color: C.muted }}>{s.label}</span>
                      <button onClick={() => { setStep(i); setErrors({}); }}
                        style={{ fontSize: 12, fontWeight: 500, color: C.ink, border: "none", background: "none", borderBottom: `1px solid ${C.border}` }}>
                        Edit
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={handleUpdate}
                  style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: C.green, color: C.white, fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "opacity .2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  Update  Listing
                </button>
              </div>
            )}

            {/* Navigation buttons */}
            {step < 5 && (
              <div style={{ display: "flex", gap: 10, marginTop: 36 }}>
                {step > 0 && (
                  <button onClick={back}
                    style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "none", color: C.ink, fontSize: 14, fontWeight: 500, transition: "background .2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.cream}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    Back
                  </button>
                )}
                <button onClick={next}
                  style={{ flex: step === 0 ? 1 : 2, padding: "12px", borderRadius: 10, border: "none", background: C.ink, color: C.white, fontSize: 14, fontWeight: 600, transition: "background .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#2a2a2a"}
                  onMouseLeave={e => e.currentTarget.style.background = C.ink}>
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