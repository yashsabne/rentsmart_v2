import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchEvaluationHistory } from "../services/propertyReviewApi";

/* ───────── tokens ───────── */
const C = {
  text: "#172033", muted: "#667085", line: "#E5E7EB", bg: "#F6F8FB", soft: "#F1F5F9",
  blue: "#2563EB", green: "#15803D", amber: "#B45309", red: "#B91C1C", white: "#FFFFFF"
};
const SEV = {
  high: { label: "High", color: C.red, bg: "#FEF2F2" },
  medium: { label: "Medium", color: C.amber, bg: "#FFFBEB" },
  low: { label: "Low", color: C.blue, bg: "#EFF6FF" },
  other: { label: "Other", color: C.muted, bg: C.soft }
};
const muted = { color: C.muted, fontSize: 13 };
const grid = (min = 220) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit,minmax(min(100%,${min}px),1fr))`, gap: 14 });

/* ───────── styles (classes so we get hover, media queries, animation) ───────── */
const CSS = `
*{box-sizing:border-box}
.pr-page{min-height:100vh;background:${C.bg};color:${C.text};font-family:Inter,system-ui,Arial,sans-serif;-webkit-text-size-adjust:100%}
.pr-page h1,.pr-page h2,.pr-page h3,.pr-page p{overflow-wrap:anywhere}
.top{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.88);backdrop-filter:saturate(1.4) blur(10px);-webkit-backdrop-filter:saturate(1.4) blur(10px);border-bottom:1px solid ${C.line};padding-top:env(safe-area-inset-top)}
.top-in{max-width:1600px;margin:0 auto;padding:0 clamp(12px,3vw,32px);height:56px;display:flex;align-items:center;gap:12px}
.back{color:${C.blue};font-size:14px;font-weight:600;text-decoration:none;white-space:nowrap;transition:opacity .2s}
.back:hover{opacity:.75}
.crumb{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:600;color:${C.muted}}
.actions{display:flex;gap:8px;margin-left:auto}
.shell{max-width:1600px;margin:0 auto;padding:clamp(14px,2.5vw,28px) clamp(12px,3vw,32px) calc(48px + env(safe-area-inset-bottom));display:grid;grid-template-columns:minmax(0,1fr);gap:18px}
.side{display:contents}
.main{min-width:0;display:flex;flex-direction:column;gap:18px}
.card{background:${C.white};border:1px solid ${C.line};border-radius:14px;padding:clamp(16px,2vw,24px);box-shadow:0 1px 2px rgba(16,24,40,.04)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:38px;padding:8px 14px;border-radius:9px;background:${C.white};border:1px solid ${C.line};color:${C.text};text-decoration:none;font:600 13px/1.2 Inter,system-ui,Arial,sans-serif;cursor:pointer;transition:background .2s,border-color .2s,box-shadow .2s,transform .15s}
.btn:hover:not(:disabled){background:#F8FAFC;border-color:#CBD5E1;box-shadow:0 2px 6px rgba(16,24,40,.08)}
.btn:active:not(:disabled){transform:scale(.97)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.btn.tag{cursor:default;pointer-events:none;font-weight:500;background:${C.soft}}
.chip{padding:7px 13px;min-height:34px;border-radius:999px;font:600 13px/1 Inter,system-ui,Arial,sans-serif;cursor:pointer;border:1px solid ${C.line};background:${C.white};color:${C.text};transition:background .22s,color .22s,border-color .22s,transform .15s}
.chip:hover{border-color:var(--c)}
.chip:active{transform:scale(.96)}
.chip.on{background:var(--c);border-color:var(--c);color:#fff}
.nav{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;background:${C.white};border:1px solid ${C.line};border-radius:12px;padding:6px;position:sticky;top:calc(60px + env(safe-area-inset-top));z-index:20;scroll-snap-type:x proximity}
.nav::-webkit-scrollbar{display:none}
.navitem{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;padding:10px 12px;min-height:40px;border:0;border-radius:8px;background:transparent;color:${C.muted};font:600 14px/1 Inter,system-ui,Arial,sans-serif;cursor:pointer;white-space:nowrap;scroll-snap-align:start;transition:background .22s,color .22s}
.navitem:hover{background:${C.soft};color:${C.text}}
.navitem.on{background:#EFF6FF;color:${C.blue}}
.badge{font-size:12px;border-radius:999px;padding:2px 8px;background:${C.soft};color:${C.muted};transition:background .22s,color .22s}
.on .badge{background:#DBEAFE;color:${C.blue}}
.tile{text-align:left;background:${C.white};border:1px solid ${C.line};border-radius:14px;padding:18px;cursor:pointer;color:inherit;font-family:inherit;transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s,border-color .25s}
.tile:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(16,24,40,.09);border-color:#CBD5E1}
.panel{animation:panelIn .4s cubic-bezier(.22,1,.36,1) both}
.fade{animation:fadeIn .3s ease both}
.row{transition:background .2s}
.row:hover{background:${C.soft}}
.sk{background:linear-gradient(90deg,#EAEFF5 25%,#F6F8FB 50%,#EAEFF5 75%);background-size:200% 100%;animation:shimmer 1.4s linear infinite;border-radius:12px}
.draw{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.1s ease .1s forwards}
.pr-page :focus-visible{outline:2px solid ${C.blue};outline-offset:2px;border-radius:6px}
@keyframes panelIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{to{background-position:-200% 0}}
@keyframes draw{to{stroke-dashoffset:0}}
@media(min-width:1024px){
  .shell{grid-template-columns:320px minmax(0,1fr);gap:24px;align-items:start}
  .side{display:flex;flex-direction:column;gap:14px;position:sticky;top:80px;max-height:calc(100vh - 96px);overflow-y:auto;padding:2px}
  .nav{flex-direction:column;position:static;overflow:visible}
  .navitem{flex-shrink:1}
}
@media(min-width:1440px){.shell{grid-template-columns:360px minmax(0,1fr)}}
@media(max-width:640px){.hide-sm{display:none!important}.actions .btn{padding:8px 11px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
@media print{.top,.nav,.noprint{display:none!important}.shell{display:block}.side{position:static;max-height:none}.pr-page{background:#fff}.card{box-shadow:none}}
`;

/* ───────── helpers ───────── */
const arr = v => (Array.isArray(v) ? v : []);
const num = v => (typeof v === "number" && Number.isFinite(v) ? v : null);
const clamp = v => Math.max(0, Math.min(100, v));
const scoreColor = s => (s === null ? C.muted : s >= 85 ? C.green : s >= 70 ? C.blue : s >= 50 ? C.amber : C.red);
const ratingLabel = r => ({ EXCELLENT: "Excellent", GOOD: "Good", MODERATE: "Moderate", NEEDS_IMPROVEMENT: "Needs improvement" })[r] || r || "Not rated";
const sevKey = s => {
  const v = String(s || "").toLowerCase();
  if (/high|critical|error|major/.test(v)) return "high";
  if (/med|warn/.test(v)) return "medium";
  if (/low|info|minor/.test(v)) return "low";
  return "other";
};
const reduceMotion = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function formatDate(date, short) {
  if (!date) return "Date unavailable";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Date unavailable";
  return d.toLocaleString("en-IN", short
    ? { day: "2-digit", month: "short" }
    : { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function normalizeEvaluation(ev) {
  const text = ev.textEvaluation || {};
  const image = ev.imageEvaluation || {};
  const b = ev.breakdown || {};
  return {
    id: ev._id,
    date: ev.evaluatedAt || ev.createdAt,
    overall: num(ev.listingQualityScore),
    rating: ev.rating,
    textScore: num(text.score ?? ev.scoringDetails?.textScore),
    imageScore: num(ev.scoringDetails?.imageScore),
    imageStatus: image.status,
    completeness: num(b.completeness),
    consistency: num(b.consistency),
    quality: num(b.descriptionQuality),
    summary: ev.summary || text.summary || "",
    textSummary: text.summary || "",
    imageSummary: image.summary || "",
    property: ev.propertySnapshot || {},
    issues: arr(ev.flags).map(i => typeof i === "string"
      ? { title: i, detail: "", severity: "other" }
      : {
          title: i.title || i.message || i.description || "Issue detected",
          detail: i.detail || i.details || i.explanation || "",
          severity: sevKey(i.severity)
        }),
    suggestions: arr(ev.suggestions).map(i => typeof i === "string"
      ? { title: i, detail: "" }
      : { title: i.title || i.suggestion || i.message || i.description || "Improvement", detail: i.detail || i.explanation || "" }),
    photos: arr(image.photos).map(p => ({
      room: p.roomType || "Property photo",
      clarity: num(p.clarity), relevance: num(p.relevance), confidence: num(p.confidence),
      observations: p.observations || "", matchNotes: p.matchNotes || ""
    }))
  };
}

function getRecords(data) {
  const list = Array.isArray(data)
    ? data
    : arr(data?.evaluations || data?.history || data?.data?.evaluations || data?.data || data?.items);
  return list
    .map((ev, i) => ({ ...normalizeEvaluation(ev), id: ev._id ?? `rec-${i}` }))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

/* ───────── hooks ───────── */
function useCountUp(target, ms = 1000) {
  const [v, setV] = useState(target === null || reduceMotion() ? target : 0);
  const from = useRef(v);
  useEffect(() => {
    if (target === null || reduceMotion()) { from.current = target; setV(target); return; }
    let raf, start;
    const a = from.current ?? 0;
    const tick = t => {
      start = start ?? t;
      const p = Math.min(1, (t - start) / ms);
      const val = a + (target - a) * (1 - Math.pow(1 - p, 3));
      from.current = val;
      setV(val);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/* ───────── small components ───────── */
const Card = ({ children, style, className = "" }) => <div className={`card ${className}`} style={style}>{children}</div>;

function Section({ title, right, children }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 16, fontWeight: 650, margin: 0 }}>{title}</h2>
        {right}
      </div>
      {children}
    </Card>
  );
}

function Collapse({ open, children }) {
  return (
    <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .32s cubic-bezier(.22,1,.36,1)" }}>
      <div style={{ overflow: "hidden", opacity: open ? 1 : 0, transition: "opacity .25s ease" }}>{children}</div>
    </div>
  );
}

function Bar({ value, color, h = 6 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value === null ? 0 : clamp(value)), 40);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div style={{ height: h, borderRadius: 10, background: "#EEF0F3", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 10, transition: "width .9s cubic-bezier(.22,1,.36,1), background .3s" }} />
    </div>
  );
}

function Ring({ value, size = 156 }) {
  const shown = useCountUp(value);
  const r = (size - 18) / 2, circ = 2 * Math.PI * r;
  const color = scoreColor(value);
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }} role="img" aria-label={value === null ? "No score" : `Score ${Math.round(value)} out of 100`}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.soft} strokeWidth="11" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - clamp(shown ?? 0) / 100)} style={{ transition: "stroke .4s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 38, fontWeight: 700, color, lineHeight: 1, transition: "color .4s" }}>{shown === null ? "—" : Math.round(shown)}</div>
          <div style={{ ...muted, marginTop: 4 }}>out of 100</div>
        </div>
      </div>
    </div>
  );
}

function Delta({ now, before }) {
  if (now === null || before === null) return null;
  const d = Math.round(now - before);
  if (d === 0) return <span style={{ ...muted, fontWeight: 600 }}>No change since previous evaluation</span>;
  return (
    <span style={{ color: d > 0 ? C.green : C.red, fontSize: 13, fontWeight: 650 }}>
      {d > 0 ? "▲" : "▼"} {Math.abs(d)} point{Math.abs(d) === 1 ? "" : "s"} since previous evaluation
    </span>
  );
}

function Metric({ label, value, weight }) {
  const color = scoreColor(value);
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <span style={muted}>{label}</span><span style={muted}>{weight}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color, margin: "8px 0 12px" }}>
        {value === null ? "—" : Math.round(value)}
        {value !== null && <span style={{ fontSize: 13, color: C.muted, fontWeight: 400 }}> / 100</span>}
      </div>
      <Bar value={value} color={color} />
    </Card>
  );
}

function Tile({ label, value, sub, color, onClick }) {
  return (
    <button className="tile" onClick={onClick}>
      <div style={muted}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, margin: "6px 0 4px" }}>{value}</div>
      <div style={{ ...muted, color: C.blue, fontWeight: 600 }}>{sub}</div>
    </button>
  );
}

function Detail({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div style={{ padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
      <div style={muted}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 550, marginTop: 4 }}>{value}</div>
    </div>
  );
}

const Chip = ({ active, onClick, children, color = C.blue }) => (
  <button className={`chip${active ? " on" : ""}`} style={{ "--c": color }} onClick={onClick} aria-pressed={active}>{children}</button>
);

function Sparkline({ records, selectedId, onSelect }) {
  const pts = [...records].reverse().filter(r => r.overall !== null);
  if (pts.length < 2) return null;
  const W = 800, H = 160, P = 24;
  const x = i => P + (i * (W - 2 * P)) / (pts.length - 1);
  const y = v => H - P - (clamp(v) / 100) * (H - 2 * P);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.overall)}`).join(" ");
  return (
    <div style={{ marginBottom: 16 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", maxHeight: 220, display: "block" }} role="img" aria-label="Overall score over time">
        {[0, 50, 100].map(g => <line key={g} x1={P} x2={W - P} y1={y(g)} y2={y(g)} stroke={C.line} strokeDasharray="4 4" />)}
        <path d={path} pathLength="1" className="draw" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={p.id} onClick={() => onSelect(p.id)} style={{ cursor: "pointer" }}>
            <title>{`${formatDate(p.date, true)}: ${Math.round(p.overall)}`}</title>
            <circle cx={x(i)} cy={y(p.overall)} r="14" fill="transparent" />
            <circle cx={x(i)} cy={y(p.overall)} r={p.id === selectedId ? 8 : 5} fill={p.id === selectedId ? C.blue : C.white} stroke={C.blue} strokeWidth="2.5" style={{ transition: "r .25s, fill .25s" }} />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ───────── panels ───────── */
function ScoreSimulator({ rec }) {
  const base = { c: rec.completeness ?? 0, s: rec.consistency ?? 0, q: rec.quality ?? 0 };
  const [v, setV] = useState(base);
  const text = v.c * 0.4 + v.s * 0.35 + v.q * 0.25;
  const overall = rec.imageScore !== null ? text * 0.8 + rec.imageScore * 0.2 : text;
  const diff = rec.overall !== null ? Math.round(overall - rec.overall) : 0;
  const shown = useCountUp(overall, 350);
  return (
    <Section title="Score simulator" right={<button className="btn" onClick={() => setV(base)}>Reset</button>}>
      <p style={{ ...muted, marginTop: 0 }}>Drag the sliders to see how improving each area could change the overall score.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 22, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[["c", "Completeness"], ["s", "Consistency"], ["q", "Description quality"]].map(([k, label]) => (
            <label key={k} style={{ fontSize: 13, fontWeight: 600 }}>
              <span style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>{label}</span><span>{Math.round(v[k])}</span></span>
              <input type="range" min="0" max="100" value={v[k]} onChange={e => setV({ ...v, [k]: +e.target.value })} style={{ width: "100%", height: 28, accentColor: C.blue }} />
            </label>
          ))}
        </div>
        <div style={{ background: C.soft, borderRadius: 12, padding: 20, textAlign: "center" }}>
          <div style={muted}>Projected overall score</div>
          <div style={{ fontSize: 44, fontWeight: 700, color: scoreColor(overall), transition: "color .3s" }}>{Math.round(shown)}</div>
          <div style={{ fontSize: 13, fontWeight: 650, minHeight: 18, color: diff > 0 ? C.green : diff < 0 ? C.red : C.muted }}>
            {diff === 0 ? "Same as current" : `${diff > 0 ? "+" : ""}${diff} vs current`}
          </div>
        </div>
      </div>
    </Section>
  );
}

function Methodology() {
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ padding: 0 }}>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open}
        style={{ all: "unset", boxSizing: "border-box", width: "100%", padding: "clamp(16px,2vw,24px)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: 650, fontSize: 14 }}>
        How the score is calculated
        <span style={{ color: C.muted, transition: "transform .3s", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
      </button>
      <Collapse open={open}>
        <div style={{ ...muted, lineHeight: 1.8, padding: "0 clamp(16px,2vw,24px) 20px" }}>
          <p style={{ marginTop: 0 }}><strong>Text score:</strong> Completeness (40%), consistency (35%) and description quality (25%).</p>
          <p><strong>Image score:</strong> Photo quality (40%), property relevance (35%) and visual consistency (25%).</p>
          <p style={{ marginBottom: 0 }}><strong>Overall score:</strong> Text contributes 80% and images 20% when photos are evaluated. If no photos are provided, the text score contributes 100%.</p>
        </div>
      </Collapse>
    </Card>
  );
}

function IssuesPanel({ rec }) {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(new Set());
  const counts = rec.issues.reduce((m, i) => ({ ...m, [i.severity]: (m[i.severity] || 0) + 1 }), {});
  const list = rec.issues.map((it, idx) => ({ ...it, key: idx })).filter(i => filter === "all" || i.severity === filter);
  const toggle = k => setOpen(s => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const allOpen = list.length > 0 && list.every(i => !i.detail || open.has(i.key));

  return (
    <Section title="Issues identified" right={<span style={muted}>{rec.issues.length} found</span>}>
      {rec.issues.length === 0 ? (
        <p style={{ color: C.green, fontSize: 14, margin: 0 }}>No issues were identified in this evaluation.</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
            <Chip active={filter === "all"} onClick={() => setFilter("all")}>All ({rec.issues.length})</Chip>
            {Object.keys(SEV).filter(k => counts[k]).map(k => (
              <Chip key={k} color={SEV[k].color} active={filter === k} onClick={() => setFilter(k)}>{SEV[k].label} ({counts[k]})</Chip>
            ))}
            <button className="btn" style={{ marginLeft: "auto" }}
              onClick={() => setOpen(allOpen ? new Set() : new Set(list.filter(i => i.detail).map(i => i.key)))}>
              {allOpen ? "Collapse all" : "Expand all"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {list.map(issue => {
              const sev = SEV[issue.severity];
              const isOpen = open.has(issue.key);
              return (
                <div key={issue.key} className="fade" style={{ border: `1px solid ${C.line}`, borderLeft: `4px solid ${sev.color}`, borderRadius: 10, background: isOpen ? sev.bg : C.white, transition: "background .3s" }}>
                  <button onClick={() => issue.detail && toggle(issue.key)} aria-expanded={isOpen}
                    style={{ all: "unset", boxSizing: "border-box", width: "100%", padding: "14px 16px", display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center", cursor: issue.detail ? "pointer" : "default" }}>
                    <span style={{ fontSize: 14, fontWeight: 650 }}>{issue.title}</span>
                    <span style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 650, color: sev.color }}>{sev.label}</span>
                      {issue.detail && <span style={{ color: C.muted, transition: "transform .3s", transform: isOpen ? "rotate(180deg)" : "none" }}>▾</span>}
                    </span>
                  </button>
                  <Collapse open={isOpen}>
                    <p style={{ margin: 0, padding: "0 16px 16px", color: C.muted, fontSize: 13, lineHeight: 1.7 }}>{issue.detail}</p>
                  </Collapse>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Section>
  );
}

function SuggestionsPanel({ rec }) {
  const [done, setDone] = useState(new Set());
  const total = rec.suggestions.length;
  const toggle = i => setDone(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const pct = total ? Math.round((done.size / total) * 100) : 0;
  return (
    <Section title="Recommended improvements" right={total ? <span style={muted}>{done.size} of {total} done</span> : null}>
      {total === 0 ? (
        <p style={{ ...muted, margin: 0 }}>No additional recommendations were saved.</p>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}><Bar value={pct} color={C.green} h={8} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rec.suggestions.map((item, i) => (
              <label key={i} className="row" style={{ display: "flex", gap: 14, padding: 16, border: `1px solid ${done.has(i) ? "#BBF7D0" : C.line}`, borderRadius: 10, cursor: "pointer", background: done.has(i) ? "#F0FDF4" : C.white, transition: "background .3s, border-color .3s" }}>
                <input type="checkbox" checked={done.has(i)} onChange={() => toggle(i)} style={{ marginTop: 3, width: 18, height: 18, accentColor: C.green, flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: 14, textDecoration: done.has(i) ? "line-through" : "none", color: done.has(i) ? C.muted : C.text, transition: "color .3s" }}>{item.title}</strong>
                  {item.detail && <p style={{ ...muted, margin: "5px 0 0", lineHeight: 1.6 }}>{item.detail}</p>}
                </div>
              </label>
            ))}
          </div>
          <p style={{ ...muted, marginBottom: 0 }}>Ticks are a personal checklist for this visit. Re-run the evaluation after updating your listing to see the new score.</p>
        </>
      )}
    </Section>
  );
}

function PhotosPanel({ rec }) {
  const [sort, setSort] = useState("default");
  const photos = useMemo(() => {
    const p = [...rec.photos];
    if (sort !== "default") p.sort((a, b) => (a[sort] ?? 101) - (b[sort] ?? 101));
    return p;
  }, [rec.photos, sort]);
  return (
    <Section title="Photo analysis" right={<span style={muted}>{rec.photos.length ? `${rec.photos.length} photos analyzed` : "No photos"}</span>}>
      {rec.photos.length === 0 ? (
        <div style={{ background: C.bg, border: `1px dashed ${C.line}`, borderRadius: 10, padding: 22 }}>
          <strong style={{ fontSize: 14 }}>Photo evaluation not available</strong>
          <p style={{ ...muted, lineHeight: 1.6, marginBottom: 0 }}>Add property photos to your listing to include visual quality and relevance in a future evaluation.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
            <span style={muted}>Weakest first by</span>
            <Chip active={sort === "default"} onClick={() => setSort("default")}>Original order</Chip>
            <Chip active={sort === "clarity"} onClick={() => setSort("clarity")}>Clarity</Chip>
            <Chip active={sort === "relevance"} onClick={() => setSort("relevance")}>Relevance</Chip>
          </div>
          <div style={grid(260)}>
            {photos.map(p => (
              <div key={`${p.room}-${p.clarity}-${p.relevance}-${p.observations.slice(0, 12)}`} className="fade" style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 16 }}>
                <strong style={{ fontSize: 14 }}>{p.room}</strong>
                {[["Clarity", p.clarity], ["Relevance", p.relevance], ["Confidence", p.confidence]].map(([l, val]) => val !== null && (
                  <div key={l} style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", ...muted, marginBottom: 5 }}><span>{l}</span><span>{val}</span></div>
                    <Bar value={val <= 1 ? val * 100 : val} color={scoreColor(val <= 1 ? val * 100 : val)} />
                  </div>
                ))}
                {p.observations && <p style={{ ...muted, lineHeight: 1.6 }}>{p.observations}</p>}
                {p.matchNotes && <p style={{ ...muted, lineHeight: 1.6 }}>{p.matchNotes}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

function PropertyPanel({ property }) {
  const d = property.details || {}, a = property.address || {};
  return (
    <Section title="Property information">
      <h3 style={{ margin: "0 0 5px", fontSize: 18 }}>{property.title || "Property listing"}</h3>
      <p style={{ ...muted, margin: "0 0 16px" }}>{[a.street, a.city, a.pincode, a.country].filter(Boolean).join(", ") || "Address unavailable"}</p>
      <div style={grid(220)}>
        <Detail label="Listing type" value={property.buyOrSell} />
        <Detail label="Property category" value={property.type} />
        <Detail label="Price" value={property.price != null ? `₹${Number(property.price).toLocaleString("en-IN")}` : null} />
        <Detail label="Bedrooms" value={d.bedroomCount} />
        <Detail label="Bathrooms" value={d.bathroomCount} />
        <Detail label="Area" value={d.area ? `${d.area} sq.ft.` : null} />
        <Detail label="Furnishing" value={d.furnishing} />
        <Detail label="Facing" value={d.facing} />
      </div>
      {property.description && (
        <div style={{ marginTop: 18 }}>
          <p style={{ ...muted, marginBottom: 7 }}>Listing description</p>
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>{property.description}</p>
        </div>
      )}
    </Section>
  );
}

function HistoryPanel({ records, selectedId, onSelect }) {
  return (
    <Section title="Evaluation history" right={<span style={muted}>{records.length} saved</span>}>
      {records.length === 1 ? (
        <p style={{ ...muted, margin: 0 }}>This is the first saved evaluation for this property. Future evaluations will appear here.</p>
      ) : (
        <>
          <Sparkline records={records} selectedId={selectedId} onSelect={onSelect} />
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", minWidth: 480, borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
              <thead>
                <tr style={{ color: C.muted, borderBottom: `1px solid ${C.line}` }}>
                  {["Date", "Score", "Change", "Rating", ""].map((h, i) => <th key={i} style={{ padding: 12, fontWeight: 600 }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => {
                  const prev = records[i + 1];
                  const d = r.overall !== null && prev?.overall != null ? Math.round(r.overall - prev.overall) : null;
                  const sel = r.id === selectedId;
                  return (
                    <tr key={r.id} className="row" onClick={() => onSelect(r.id)} style={{ borderBottom: `1px solid ${C.line}`, cursor: "pointer", background: sel ? "#EFF6FF" : undefined }}>
                      <td style={{ padding: 12 }}>{formatDate(r.date)}{i === 0 && <span style={{ ...muted, marginLeft: 8 }}>latest</span>}</td>
                      <td style={{ padding: 12, fontWeight: 700, color: scoreColor(r.overall) }}>{r.overall === null ? "—" : `${Math.round(r.overall)} / 100`}</td>
                      <td style={{ padding: 12, color: !d ? C.muted : d > 0 ? C.green : C.red, fontWeight: 600 }}>{d === null ? "—" : d > 0 ? `+${d}` : d}</td>
                      <td style={{ padding: 12 }}>{ratingLabel(r.rating)}</td>
                      <td style={{ padding: 12, color: C.blue, fontWeight: 600 }}>{sel ? "Viewing" : "View"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Section>
  );
}

function Skeleton() {
  return (
    <div className="shell">
      <div className="side">
        <div className="sk" style={{ height: 300 }} />
        <div className="sk" style={{ height: 250 }} />
      </div>
      <div className="main">
        <div className="sk" style={{ height: 150 }} />
        <div style={grid(200)}>{[0, 1, 2, 3].map(i => <div key={i} className="sk" style={{ height: 110 }} />)}</div>
        <div className="sk" style={{ height: 240 }} />
      </div>
    </div>
  );
}

/* ───────── page ───────── */
export default function PropertyReviewPage() {
  const { propertyId } = useParams();
  const [state, setState] = useState({ loading: true, records: [], error: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async signal => {
    setState(s => ({ ...s, loading: true, error: "" }));
    try {
      const data = await fetchEvaluationHistory(propertyId, signal);
      const records = getRecords(data);
      setState({ loading: false, records, error: "" });
      setSelectedId(cur => (records.some(r => r.id === cur) ? cur : records[0]?.id ?? null));
    } catch (error) {
      if (error.name === "AbortError") return;
      setState({ loading: false, records: [], error: error.message || "Unable to load the property evaluation." });
    }
  }, [propertyId]);

  useEffect(() => {
    const c = new AbortController();
    load(c.signal);
    return () => c.abort();
  }, [load]);

  const { records } = state;
  const index = Math.max(0, records.findIndex(r => r.id === selectedId));
  const rec = records[index];
  const prev = records[index + 1];

  const copySummary = async () => {
    const text = [
      `${rec.property.title || "Property"} – listing quality ${rec.overall === null ? "n/a" : Math.round(rec.overall)}/100 (${ratingLabel(rec.rating)})`,
      rec.summary,
      rec.issues.length ? `Issues:\n${rec.issues.map(i => `- ${i.title}`).join("\n")}` : "",
      rec.suggestions.length ? `Improvements:\n${rec.suggestions.map(i => `- ${i.title}`).join("\n")}` : ""
    ].filter(Boolean).join("\n\n");
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard unavailable */ }
  };

  const backLink = <Link to="/dashboard" className="back">← <span className="hide-sm">Back to </span>Dashboard</Link>;

  if (state.loading && !rec) {
    return (
      <main className="pr-page"><style>{CSS}</style>
        <header className="top"><div className="top-in">{backLink}</div></header>
        <Skeleton />
      </main>
    );
  }

  if (state.error || !rec) {
    return (
      <main className="pr-page"><style>{CSS}</style>
        <header className="top"><div className="top-in">{backLink}</div></header>
        <div className="shell" style={{ display: "block", maxWidth: 640 }}>
          <Card className="panel" style={{ textAlign: "center", padding: "clamp(28px,6vw,56px)" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>{state.error ? "Evaluation unavailable" : "No evaluation found"}</h2>
            <p style={muted}>{state.error || "There is no saved AI evaluation for this property yet."}</p>
            <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn" onClick={() => load()}>Try again</button>
              <Link to="/owner/my-listings" className="btn">Back to listings</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const p = rec.property, d = p.details || {}, a = p.address || {};
  const hasImage = rec.imageScore !== null;
  const facts = [
    p.buyOrSell, p.type,
    p.price != null ? `₹${Number(p.price).toLocaleString("en-IN")}` : null,
    d.bedroomCount != null ? `${d.bedroomCount} bed` : null,
    d.bathroomCount != null ? `${d.bathroomCount} bath` : null,
    d.area ? `${d.area} sq.ft.` : null
  ].filter(Boolean);
  const tabs = [
    ["overview", "Overview"],
    ["issues", "Issues", rec.issues.length],
    ["improve", "Improvements", rec.suggestions.length],
    ["photos", "Photos", rec.photos.length],
    ["property", "Property"],
    ["history", "History", records.length]
  ];

  return (
    <main className="pr-page">
      <style>{CSS}</style>

      <header className="top">
        <div className="top-in">
          {backLink}
          <span className="crumb hide-sm">Listing review{p.title ? ` / ${p.title}` : ""}</span>
          <div className="actions">
            <button className="btn" onClick={() => load()} disabled={state.loading}>{state.loading ? "Refreshing…" : "Refresh"}</button>
            <button className="btn" onClick={copySummary}>{copied ? "Copied" : "Copy summary"}</button>
            <button className="btn hide-sm" onClick={() => window.print()}>Print</button>
          </div>
        </div>
      </header>

      <div className="shell">
        <aside className="side">
          <Card style={{ textAlign: "center" }}>
            <Ring value={rec.overall} />
            <h1 style={{ fontSize: 22, margin: "14px 0 4px" }}>{ratingLabel(rec.rating)}</h1>
            <div style={muted}>Evaluated {formatDate(rec.date)}</div>
            {index > 0 && <div style={{ ...muted, color: C.amber, fontWeight: 600, marginTop: 4 }}>Older evaluation</div>}
            <div style={{ marginTop: 10 }}><Delta now={rec.overall} before={prev?.overall ?? null} /></div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 14 }}>
              <span className="btn tag">{hasImage ? "Text + images" : "Text only"}</span>
            </div>
            {records.length > 1 && (
              <div className="noprint" style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.line}`, textAlign: "left" }}>
                <label htmlFor="eval-select" style={{ ...muted, display: "block", marginBottom: 6 }}>Viewing evaluation</label>
                <select id="eval-select" className="btn" style={{ width: "100%", fontWeight: 500 }} value={rec.id} onChange={e => setSelectedId(e.target.value)}>
                  {records.map((r, i) => (
                    <option key={r.id} value={r.id}>{formatDate(r.date)} – {r.overall === null ? "no score" : Math.round(r.overall)}{i === 0 ? " (latest)" : ""}</option>
                  ))}
                </select>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                  <button className="btn" disabled={!prev} onClick={() => setSelectedId(prev.id)}>← Older</button>
                  <button className="btn" disabled={index === 0} onClick={() => setSelectedId(records[index - 1].id)}>Newer →</button>
                </div>
              </div>
            )}
          </Card>

          <nav className="nav" role="tablist" aria-label="Report sections">
            {tabs.map(([id, label, count]) => (
              <button key={id} role="tab" aria-selected={tab === id} className={`navitem${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>
                {label}
                {count !== undefined && <span className="badge">{count}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <section className="main">
          <Card style={{ background: "linear-gradient(135deg,#EFF6FF 0%,#FFFFFF 65%)" }}>
            <h2 style={{ fontSize: "clamp(20px,2.6vw,28px)", margin: "0 0 6px", fontWeight: 700 }}>{p.title || "Property listing"}</h2>
            <p style={{ ...muted, margin: "0 0 14px" }}>{[a.street, a.city, a.pincode, a.country].filter(Boolean).join(", ") || "Address unavailable"}</p>
            {facts.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {facts.map(f => <span key={f} className="btn tag" style={{ background: C.white }}>{f}</span>)}
              </div>
            )}
            <p style={{ fontSize: 14, lineHeight: 1.7, color: C.text, margin: 0, maxWidth: "75ch" }}>
              {rec.summary || "This report summarizes the listing information and the issues identified during evaluation."}
            </p>
          </Card>

          <div key={`${tab}-${rec.id}`} className="panel" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {tab === "overview" && (
              <>
                <div style={grid(190)}>
                  <Tile label="Text score" value={rec.textScore === null ? "—" : Math.round(rec.textScore)} color={scoreColor(rec.textScore)} sub="See breakdown below" onClick={() => document.getElementById("breakdown")?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" })} />
                  <Tile label="Image score" value={hasImage ? Math.round(rec.imageScore) : "N/A"} color={hasImage ? scoreColor(rec.imageScore) : C.muted} sub="Open photos" onClick={() => setTab("photos")} />
                  <Tile label="Issues found" value={rec.issues.length} color={rec.issues.length ? C.amber : C.green} sub="Review issues" onClick={() => setTab("issues")} />
                  <Tile label="Suggestions" value={rec.suggestions.length} color={C.blue} sub="Start improving" onClick={() => setTab("improve")} />
                </div>

                <div id="breakdown" style={{ scrollMarginTop: 130 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 650, margin: "0 0 14px" }}>Score breakdown</h2>
                  <div style={grid(220)}>
                    <Metric label="Completeness" value={rec.completeness} weight="40% of text" />
                    <Metric label="Consistency" value={rec.consistency} weight="35% of text" />
                    <Metric label="Description quality" value={rec.quality} weight="25% of text" />
                  </div>
                </div>

                <div style={grid(320)}>
                  <Section title="Text evaluation">
                    <div style={{ fontSize: 30, fontWeight: 700, color: scoreColor(rec.textScore) }}>{rec.textScore === null ? "—" : `${Math.round(rec.textScore)} / 100`}</div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: C.muted, marginBottom: 0 }}>{rec.textSummary || "No separate text evaluation summary is available."}</p>
                  </Section>
                  <Section title="Image evaluation">
                    <div style={{ fontSize: 30, fontWeight: 700, color: hasImage ? scoreColor(rec.imageScore) : C.muted }}>{hasImage ? `${Math.round(rec.imageScore)} / 100` : "Not evaluated"}</div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: C.muted, marginBottom: 0 }}>
                      {rec.imageSummary || (rec.imageStatus === "NOT_PROVIDED" ? "No property photos were provided. Image quality was not included in this evaluation." : "No image evaluation details are available.")}
                    </p>
                  </Section>
                </div>

                <ScoreSimulator rec={rec} />
                <Methodology />
              </>
            )}
            {tab === "issues" && <IssuesPanel rec={rec} />}
            {tab === "improve" && <SuggestionsPanel rec={rec} />}
            {tab === "photos" && <PhotosPanel rec={rec} />}
            {tab === "property" && <PropertyPanel property={rec.property} />}
            {tab === "history" && <HistoryPanel records={records} selectedId={rec.id} onSelect={id => { setSelectedId(id); window.scrollTo?.({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" }); }} />}
          </div>

          <p style={{ textAlign: "center", ...muted, margin: "6px 0 0" }}>Property Intelligence · AI-generated listing assessment</p>
        </section>
      </div>
    </main>
  );
}