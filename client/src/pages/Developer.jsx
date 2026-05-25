import { useState, useEffect, useRef } from "react";

const NAV_LINKS = [
  { label: "Architecture", href: "#architecture" },
  { label: "Services", href: "#services" },
  { label: "Auth", href: "#auth" },
  { label: "DevOps", href: "#devops" },
  { label: "API", href: "#api" },
  { label: "Roadmap", href: "#roadmap" },
];

const METRICS = [
  { value: "5+", label: "Microservices" },
  { value: "RT", label: "Real-time Chat" },
  { value: "JWT", label: "Auth Layer" },
  { value: "Docker", label: "Containerized" },
];

const SERVICES = [
  {
    id: "auth",
    name: "Auth Service",
    desc: "JWT + Google OAuth, token lifecycle management, refresh strategy",
    color: "#6366f1",
    glow: "rgba(99,102,241,0.3)",
    icon: "🔐",
    endpoints: ["POST /auth/login", "POST /auth/google", "GET /auth/refresh", "POST /auth/logout"],
  },
  {
    id: "listing",
    name: "Listing Service",
    desc: "Property CRUD, advanced search engine, filter pipeline, pagination",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.3)",
    icon: "🏠",
    endpoints: ["GET /listings", "POST /listings", "PUT /listings/:id", "DELETE /listings/:id"],
  },
  {
    id: "payment",
    name: "Payment Service",
    desc: "Razorpay integration, contact unlock flow, webhook validation",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.3)",
    icon: "💳",
    endpoints: ["POST /pay/create-order", "POST /pay/verify", "GET /pay/history"],
  },
  {
    id: "chat",
    name: "Chat Service",
    desc: "Socket.IO real-time engine, room-based messaging, event delivery",
    color: "#10b981",
    glow: "rgba(16,185,129,0.3)",
    icon: "💬",
    endpoints: ["WS /chat/join", "WS /chat/message", "GET /chat/history/:room"],
  },
  {
    id: "share",
    name: "Share Service",
    desc: "Token-based property sharing, expiry management, analytics",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.3)",
    icon: "🔗",
    endpoints: ["POST /share/generate", "GET /share/:token", "DELETE /share/:token"],
  },
];

const DB_COLLECTIONS = [
  { name: "users", fields: ["_id", "name", "email", "role", "savedProperties", "createdAt"], color: "#6366f1" },
  { name: "listings", fields: ["_id", "title", "price", "type", "location", "ownerId", "images"], color: "#06b6d4" },
  { name: "chats", fields: ["_id", "roomId", "participants", "messages[]", "createdAt"], color: "#10b981" },
  { name: "payments", fields: ["_id", "userId", "listingId", "razorpayId", "status", "amount"], color: "#8b5cf6" },
  { name: "notifications", fields: ["_id", "userId", "type", "message", "read", "createdAt"], color: "#f59e0b" },
  { name: "shares", fields: ["_id", "listingId", "token", "expiresAt", "clicks", "createdAt"], color: "#ef4444" },
];

const ROADMAP = [
  { phase: "Q3 2025", title: "AI Recommendations", desc: "ML-powered property matching based on user behavior and preferences", status: "planned", color: "#6366f1" },
  { phase: "Q4 2025", title: "Maps Integration", desc: "Google Maps API for location-based search and proximity filters", status: "planned", color: "#06b6d4" },
  { phase: "Q1 2026", title: "ML Price Prediction", desc: "Regression models for dynamic property valuation and market analysis", status: "planned", color: "#8b5cf6" },
  { phase: "Q2 2026", title: "Analytics Dashboard", desc: "Real-time analytics for owners: views, inquiries, conversion funnels", status: "planned", color: "#10b981" },
  { phase: "Q3 2026", title: "Kubernetes", desc: "Migration from Docker Compose to K8s for auto-scaling production", status: "future", color: "#f59e0b" },
  { phase: "Q4 2026", title: "Cloud Deployment", desc: "AWS ECS or GCP Cloud Run with CDN, edge caching, global scale", status: "future", color: "#ef4444" },
];

function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function RevealSection({ children, className = "", delay = 0 }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function GlowOrb({ style }) {
  return (
    <div
      style={{
        position: "absolute",
        borderRadius: "50%",
        filter: "blur(80px)",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

function TerminalBlock({ lines }) {
  const [typed, setTyped] = useState(0);
  const [ref, visible] = useScrollReveal();
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTyped((p) => (p < lines.length ? p + 1 : p)), 180);
    return () => clearInterval(t);
  }, [visible, lines.length]);
  return (
    <div ref={ref} style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 12, overflow: "hidden", fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      <div style={{ background: "#111120", padding: "10px 16px", display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e" }} />
        <span style={{ fontSize: 11, color: "#555", marginLeft: 8 }}>rentsmart — bash</span>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {lines.slice(0, typed).map((line, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <span style={{ color: "#6366f1", userSelect: "none" }}>$</span>
            <span style={{ color: line.color || "#e2e8f0", fontSize: 13 }}>{line.text}</span>
          </div>
        ))}
        {typed < lines.length && (
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ color: "#6366f1" }}>$</span>
            <span style={{ display: "inline-block", width: 8, height: 16, background: "#6366f1", animation: "blink 1s infinite" }} />
          </div>
        )}
      </div>
    </div>
  );
}

function PulseNode({ x, y, color, label, size = 48 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={size * 0.75} fill={color} opacity="0.08">
        <animate attributeName="r" values={`${size * 0.75};${size * 1.1};${size * 0.75}`} dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.08;0.03;0.08" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx={x} cy={y} r={size / 2} fill={color} opacity="0.18" />
      <circle cx={x} cy={y} r={size / 2 - 6} fill="#0d0d1a" stroke={color} strokeWidth="1.5" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="11" fill={color} fontFamily="monospace" fontWeight="600">
        {label}
      </text>
    </g>
  );
}

function AnimatedArrow({ x1, y1, x2, y2, color = "#6366f1", delay = "0s" }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="6 4">
      <animate attributeName="strokeDashoffset" from="0" to="-20" dur="1.5s" begin={delay} repeatCount="indefinite" />
    </line>
  );
}

function ArchitectureDiagram() {
  return (
    <svg viewBox="0 0 700 480" style={{ width: "100%", maxWidth: 700 }}>
      <defs>
        <filter id="glow-blue">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background grid */}
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e1e3a" strokeWidth="0.5" />
      </pattern>
      <rect width="700" height="480" fill="url(#grid)" />

      {/* Client */}
      <rect x="275" y="20" width="150" height="56" rx="10" fill="#0d0d1a" stroke="#6366f1" strokeWidth="1.5" />
      <text x="350" y="43" textAnchor="middle" fontSize="12" fill="#a5b4fc" fontFamily="monospace" fontWeight="600">FRONTEND CLIENT</text>
      <text x="350" y="60" textAnchor="middle" fontSize="10" fill="#4f46e5" fontFamily="monospace">React + Vite + Tailwind</text>

      {/* Arrow Client -> Gateway */}
      <AnimatedArrow x1={350} y1={76} x2={350} y2={140} color="#6366f1" />

      {/* API Gateway */}
      <rect x="230" y="140" width="240" height="52" rx="10" fill="#0d0d1a" stroke="#06b6d4" strokeWidth="1.5" />
      <text x="350" y="162" textAnchor="middle" fontSize="12" fill="#67e8f9" fontFamily="monospace" fontWeight="600">API GATEWAY</text>
      <text x="350" y="178" textAnchor="middle" fontSize="10" fill="#0891b2" fontFamily="monospace">Express.js + JWT Middleware</text>

      {/* Arrows from gateway to 5 services */}
      <AnimatedArrow x1={260} y1={192} x2={85} y2={280} color="#6366f1" delay="0s" />
      <AnimatedArrow x1={295} y1={192} x2={205} y2={280} color="#06b6d4" delay="0.3s" />
      <AnimatedArrow x1={350} y1={192} x2={350} y2={280} color="#8b5cf6" delay="0.6s" />
      <AnimatedArrow x1={405} y1={192} x2={495} y2={280} color="#10b981" delay="0.9s" />
      <AnimatedArrow x1={440} y1={192} x2={615} y2={280} color="#f59e0b" delay="1.2s" />

      {/* 5 Services */}
      {[
        { x: 30, color: "#6366f1", label: "AUTH", sub: "JWT·OAuth" },
        { x: 155, color: "#06b6d4", label: "LISTING", sub: "Search·CRUD" },
        { x: 300, color: "#8b5cf6", label: "PAYMENT", sub: "Razorpay" },
        { x: 425, color: "#10b981", label: "CHAT", sub: "Socket.IO" },
        { x: 550, color: "#f59e0b", label: "SHARE", sub: "Tokens" },
      ].map(({ x, color, label, sub }) => (
        <g key={label}>
          <rect x={x} y={280} width={120} height={56} rx={8} fill="#0d0d1a" stroke={color} strokeWidth="1.5" />
          <text x={x + 60} y={305} textAnchor="middle" fontSize="11" fill={color} fontFamily="monospace" fontWeight="700">{label}</text>
          <text x={x + 60} y={322} textAnchor="middle" fontSize="9" fill={color} fontFamily="monospace" opacity="0.6">{sub}</text>
        </g>
      ))}

      {/* MongoDB arrow */}
      <AnimatedArrow x1={60} y1={336} x2={280} y2={400} color="#22c55e" delay="0.2s" />
      <AnimatedArrow x1={215} y1={336} x2={290} y2={400} color="#22c55e" delay="0.4s" />
      <AnimatedArrow x1={350} y1={336} x2={350} y2={400} color="#22c55e" delay="0.6s" />
      <AnimatedArrow x1={475} y1={336} x2={395} y2={400} color="#22c55e" delay="0.8s" />
      <AnimatedArrow x1={595} y1={336} x2={420} y2={400} color="#22c55e" delay="1s" />

      {/* MongoDB */}
      <rect x="255" y="400" width="190" height="58" rx="10" fill="#0d0d1a" stroke="#22c55e" strokeWidth="1.5" />
      <text x="350" y="424" textAnchor="middle" fontSize="12" fill="#86efac" fontFamily="monospace" fontWeight="600">MONGODB</text>
      <text x="350" y="441" textAnchor="middle" fontSize="10" fill="#16a34a" fontFamily="monospace">Collections · Atlas-ready</text>

      {/* Socket.IO label on Chat */}
      <text x="485" y="370" fontSize="9" fill="#10b981" fontFamily="monospace" opacity="0.7">Socket.IO</text>
      <line x1="485" y1="364" x2="485" y2="336" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}

function ServiceCard({ svc, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? `rgba(${hexToRgb(svc.color)},0.08)` : "#0a0a12",
        border: `1px solid ${active ? svc.color : "#1e1e2e"}`,
        borderRadius: 14,
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: active ? `0 0 24px ${svc.glow}` : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {active && (
        <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle, ${svc.glow}, transparent 70%)`, pointerEvents: "none" }} />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{svc.icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: svc.color, fontFamily: "monospace", letterSpacing: "0.08em" }}>{svc.name.toUpperCase()}</span>
      </div>
      <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 14px", lineHeight: 1.6 }}>{svc.desc}</p>
      {active && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {svc.endpoints.map((ep) => (
            <code key={ep} style={{ fontSize: 11, color: svc.color, background: `rgba(${hexToRgb(svc.color)},0.1)`, padding: "4px 10px", borderRadius: 6, display: "inline-block", opacity: 0.9 }}>{ep}</code>
          ))}
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function AuthFlowDiagram() {
  const steps = [
    { label: "User Login", color: "#6366f1", y: 40 },
    { label: "JWT Generated", color: "#8b5cf6", y: 120 },
    { label: "Token Signed", color: "#06b6d4", y: 200 },
    { label: "Protected Route", color: "#10b981", y: 280 },
    { label: "Access Granted", color: "#22c55e", y: 360 },
  ];
  return (
    <svg viewBox="0 0 320 430" style={{ width: "100%", maxWidth: 320 }}>
      {steps.map((s, i) => (
        <g key={s.label}>
          <rect x="60" y={s.y} width="200" height="44" rx="8" fill="#0d0d1a" stroke={s.color} strokeWidth="1.5" />
          <text x="160" y={s.y + 22} textAnchor="middle" dominantBaseline="central" fontSize="11" fill={s.color} fontFamily="monospace" fontWeight="600">{s.label}</text>
          {i < steps.length - 1 && (
            <line x1="160" y1={s.y + 44} x2="160" y2={steps[i + 1].y} stroke={s.color} strokeWidth="1.5" strokeDasharray="5 4">
              <animate attributeName="strokeDashoffset" from="0" to="-18" dur="1.2s" repeatCount="indefinite" />
            </line>
          )}
        </g>
      ))}
      {/* Google OAuth side branch */}
      <rect x="230" y="40" width="80" height="40" rx="8" fill="#0d0d1a" stroke="#f59e0b" strokeWidth="1" />
      <text x="270" y="60" textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#f59e0b" fontFamily="monospace">Google OAuth</text>
      <line x1="230" y1="60" x2="260" y2="62" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}

function ChatFlowDiagram() {
  return (
    <svg viewBox="0 0 600 160" style={{ width: "100%" }}>
      <defs>
        <pattern id="gridSm" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#12122a" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="600" height="160" fill="url(#gridSm)" />

      {/* User A */}
      <rect x="20" y="50" width="110" height="60" rx="10" fill="#0d0d1a" stroke="#6366f1" strokeWidth="1.5" />
      <text x="75" y="76" textAnchor="middle" fontSize="11" fill="#a5b4fc" fontFamily="monospace" fontWeight="600">USER A</text>
      <text x="75" y="95" textAnchor="middle" fontSize="9" fill="#4f46e5" fontFamily="monospace">sends message</text>

      {/* Socket Server */}
      <rect x="230" y="40" width="140" height="80" rx="10" fill="#0d0d1a" stroke="#10b981" strokeWidth="1.5" />
      <text x="300" y="70" textAnchor="middle" fontSize="11" fill="#6ee7b7" fontFamily="monospace" fontWeight="600">SOCKET SERVER</text>
      <text x="300" y="87" textAnchor="middle" fontSize="9" fill="#059669" fontFamily="monospace">Socket.IO Engine</text>
      <text x="300" y="103" textAnchor="middle" fontSize="9" fill="#059669" fontFamily="monospace">Room · Event · Emit</text>
      {/* Pulse */}
      <circle cx="300" cy="80" r="45" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.3">
        <animate attributeName="r" values="45;65;45" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* User B */}
      <rect x="470" y="50" width="110" height="60" rx="10" fill="#0d0d1a" stroke="#8b5cf6" strokeWidth="1.5" />
      <text x="525" y="76" textAnchor="middle" fontSize="11" fill="#c4b5fd" fontFamily="monospace" fontWeight="600">USER B</text>
      <text x="525" y="95" textAnchor="middle" fontSize="9" fill="#7c3aed" fontFamily="monospace">receives event</text>

      {/* Arrows */}
      <line x1="130" y1="80" x2="228" y2="80" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5 4" markerEnd="url(#arr1)">
        <animate attributeName="strokeDashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite" />
      </line>
      <line x1="370" y1="80" x2="468" y2="80" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="5 4" markerEnd="url(#arr2)">
        <animate attributeName="strokeDashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite" />
      </line>

      <defs>
        <marker id="arr1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#6366f1" strokeWidth="1.5" />
        </marker>
        <marker id="arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
        </marker>
      </defs>

      <text x="175" y="68" textAnchor="middle" fontSize="9" fill="#6366f1" fontFamily="monospace">emit('msg')</text>
      <text x="415" y="68" textAnchor="middle" fontSize="9" fill="#8b5cf6" fontFamily="monospace">broadcast()</text>
    </svg>
  );
}

function DockerSection() {
  return (
    <svg viewBox="0 0 660 300" style={{ width: "100%" }}>
      <defs>
        <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" fill="#1e1e3a" />
        </pattern>
      </defs>
      <rect width="660" height="300" fill="url(#dots)" />

      {/* Docker Compose boundary */}
      <rect x="10" y="10" width="640" height="280" rx="16" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="8 5" />
      <text x="30" y="32" fontSize="11" fill="#06b6d4" fontFamily="monospace" opacity="0.7">docker-compose.yml</text>

      {/* Frontend container */}
      <rect x="40" y="55" width="170" height="100" rx="12" fill="#0a0a12" stroke="#6366f1" strokeWidth="1.5" />
      <text x="125" y="82" textAnchor="middle" fontSize="12" fill="#a5b4fc" fontFamily="monospace" fontWeight="700">FRONTEND</text>
      <text x="125" y="100" textAnchor="middle" fontSize="10" fill="#4f46e5" fontFamily="monospace">React + Vite</text>
      <text x="125" y="116" textAnchor="middle" fontSize="9" fill="#3730a3" fontFamily="monospace">Port: 5173</text>
      <text x="125" y="131" textAnchor="middle" fontSize="9" fill="#3730a3" fontFamily="monospace">Nginx serving</text>

      {/* Backend container */}
      <rect x="245" y="55" width="170" height="100" rx="12" fill="#0a0a12" stroke="#10b981" strokeWidth="1.5" />
      <text x="330" y="82" textAnchor="middle" fontSize="12" fill="#6ee7b7" fontFamily="monospace" fontWeight="700">BACKEND</text>
      <text x="330" y="100" textAnchor="middle" fontSize="10" fill="#059669" fontFamily="monospace">Node + Express</text>
      <text x="330" y="116" textAnchor="middle" fontSize="9" fill="#047857" fontFamily="monospace">Port: 5000</text>
      <text x="330" y="131" textAnchor="middle" fontSize="9" fill="#047857" fontFamily="monospace">Services bound</text>

      {/* MongoDB container */}
      <rect x="450" y="55" width="170" height="100" rx="12" fill="#0a0a12" stroke="#22c55e" strokeWidth="1.5" />
      <text x="535" y="82" textAnchor="middle" fontSize="12" fill="#86efac" fontFamily="monospace" fontWeight="700">MONGODB</text>
      <text x="535" y="100" textAnchor="middle" fontSize="10" fill="#16a34a" fontFamily="monospace">mongo:7 image</text>
      <text x="535" y="116" textAnchor="middle" fontSize="9" fill="#15803d" fontFamily="monospace">Port: 27017</text>
      <text x="535" y="131" textAnchor="middle" fontSize="9" fill="#15803d" fontFamily="monospace">Volume mounted</text>

      {/* Arrows */}
      <line x1="210" y1="105" x2="243" y2="105" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 3">
        <animate attributeName="strokeDashoffset" from="0" to="-14" dur="1s" repeatCount="indefinite" />
      </line>
      <line x1="415" y1="105" x2="448" y2="105" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3">
        <animate attributeName="strokeDashoffset" from="0" to="-14" dur="1s" repeatCount="indefinite" />
      </line>

      {/* Network label */}
      <rect x="200" y="195" width="260" height="50" rx="10" fill="#0d0d1a" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4 3" />
      <text x="330" y="216" textAnchor="middle" fontSize="11" fill="#c4b5fd" fontFamily="monospace" fontWeight="600">Docker Internal Network</text>
      <text x="330" y="233" textAnchor="middle" fontSize="9" fill="#7c3aed" fontFamily="monospace">rentsmart_net — bridge driver</text>

      {/* Lines from containers to network */}
      <line x1="125" y1="155" x2="230" y2="195" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
      <line x1="330" y1="155" x2="330" y2="195" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
      <line x1="535" y1="155" x2="430" y2="195" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />

      {/* Env label */}
      <text x="50" y="265" fontSize="9" fill="#f59e0b" fontFamily="monospace" opacity="0.8">.env.production → container env vars → no secrets in image</text>
    </svg>
  );
}

function ApiBlock({ method, path, desc, color }) {
  const methodColors = { GET: "#10b981", POST: "#6366f1", PUT: "#f59e0b", DELETE: "#ef4444" };
  const mc = methodColors[method] || "#94a3b8";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "#0a0a12", border: "1px solid #1e1e2e", borderRadius: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: mc, background: `rgba(${hexToRgb(mc)},0.12)`, padding: "3px 10px", borderRadius: 6, minWidth: 52, textAlign: "center" }}>{method}</span>
      <code style={{ fontSize: 13, color: "#e2e8f0", flex: 1 }}>{path}</code>
      <span style={{ fontSize: 12, color: "#475569" }}>{desc}</span>
    </div>
  );
}

function DBCard({ col }) {
  return (
    <div style={{ background: "#0a0a12", border: `1px solid ${col.color}33`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ background: `${col.color}11`, padding: "10px 16px", borderBottom: `1px solid ${col.color}22`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: col.color, fontFamily: "monospace" }}>{col.name}</span>
      </div>
      <div style={{ padding: "12px 16px" }}>
        {col.fields.map((f) => (
          <div key={f} style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace", padding: "3px 0", borderBottom: "1px solid #0f0f1e" }}>{f}</div>
        ))}
      </div>
    </div>
  );
}

export default function RentSmartDev() {
  const [activeService, setActiveService] = useState("auth");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("monolith");

  useEffect(() => {
    const handler = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ background: "#050508", color: "#e2e8f0", minHeight: "100vh", fontFamily: "'Inter', 'Helvetica Neue', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes pulse-ring { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(2);opacity:0} }
        .section-divider { width: 60px; height: 2px; background: linear-gradient(90deg, #6366f1, transparent); border-radius: 2px; margin: 0 auto 24px; }
        a { color: inherit; text-decoration: none; }
        .nav-link:hover { color: #a5b4fc !important; }
      `}</style>

      {/* Mouse-reactive background glow */}
      <div
        style={{
          position: "fixed",
          pointerEvents: "none",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
          left: mousePos.x - 250,
          top: mousePos.y - 250,
          zIndex: 0,
          transition: "left 0.15s, top 0.15s",
        }}
      />

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(5,5,8,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid #1e1e2e", padding: "0 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14 }}>R</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>RentSmart</span>
            <span style={{ fontSize: 11, background: "#1e1e2e", color: "#6366f1", padding: "2px 8px", borderRadius: 20, marginLeft: 4 }}>v1.0</span>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            {NAV_LINKS.map((l) => (
              <button key={l.label} className="nav-link" onClick={() => scrollTo(l.href)}
                style={{ fontSize: 13, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "color 0.2s" }}>
                {l.label}
              </button>
            ))}
          </div>
          <a href="https://github.com" style={{ fontSize: 12, background: "#1e1e2e", border: "1px solid #2e2e4e", color: "#94a3b8", padding: "7px 16px", borderRadius: 8, transition: "all 0.2s" }}>GitHub ↗</a>
        </div>
      </nav>

      {/* ─────────────────── HERO ─────────────────── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 40px 80px", overflow: "hidden" }}>
        {/* Grid bg */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)", backgroundSize: "60px 60px", zIndex: 0 }} />
        <GlowOrb style={{ width: 600, height: 600, background: "rgba(99,102,241,0.12)", top: -100, left: "50%", transform: "translateX(-50%)" }} />
        <GlowOrb style={{ width: 400, height: 400, background: "rgba(139,92,246,0.08)", top: "30%", left: "20%" }} />
        <GlowOrb style={{ width: 300, height: 300, background: "rgba(6,182,212,0.07)", top: "40%", right: "15%" }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 900 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0d0d1a", border: "1px solid #2e2e4e", borderRadius: 20, padding: "6px 16px", marginBottom: 32, fontSize: 12, color: "#94a3b8" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse-ring 1.5s linear infinite" }} />
            Microservices · Docker · Real-time · Production Architecture
          </div>

          <h1 style={{ fontSize: "clamp(48px, 8vw, 88px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 28 }}>
            <span className="glow-text">Engineering</span>
            <br />
            <span style={{ color: "#f8fafc" }}>modern real-estate</span>
            <br />
            <span style={{ color: "#334155" }}>infrastructure.</span>
          </h1>

          <p style={{ fontSize: 20, color: "#64748b", maxWidth: 640, margin: "0 auto 40px", lineHeight: 1.7, fontWeight: 400 }}>
            RentSmart is a production-grade real estate platform engineered with microservices, real-time communication, secure payment systems, and containerized deployment.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
            <button onClick={() => scrollTo("#architecture")} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", color: "#fff", padding: "13px 28px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 24px rgba(99,102,241,0.4)" }}>
              Explore Architecture
            </button>
            <button onClick={() => scrollTo("#services")} style={{ background: "transparent", border: "1px solid #2e2e4e", color: "#94a3b8", padding: "13px 28px", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(8px)" }}>
              View Services
            </button>
            <button onClick={() => scrollTo("#api")} style={{ background: "transparent", border: "1px solid #2e2e4e", color: "#94a3b8", padding: "13px 28px", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
              System Flow
            </button>
          </div>

          {/* Metrics */}
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {METRICS.map((m) => (
              <div key={m.label} style={{ textAlign: "center", background: "#0a0a12", border: "1px solid #1e1e2e", borderRadius: 12, padding: "16px 24px", minWidth: 120, animation: "float 4s ease-in-out infinite" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#a5b4fc", fontFamily: "monospace", letterSpacing: "-0.02em" }}>{m.value}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── ABOUT ─────────────────── */}
      <section style={{ padding: "100px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <RevealSection>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            <div>
              <div className="section-divider" style={{ margin: "0 0 20px" }} />
              <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.2 }}>
                Why RentSmart<br />
                <span style={{ color: "#6366f1" }}>was built.</span>
              </h2>
              <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.8, marginBottom: 20 }}>
                Real estate platforms in India are fragmented, slow, and built on legacy tech. Property seekers deal with fake listings, hidden contacts, and no real-time interaction. Owners lack tools to manage, share, or monetize their listings intelligently.
              </p>
              <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.8 }}>
                RentSmart solves this with a service-oriented backend, real-time chat, a secure payment-gated contact system, and smart search — engineered for scale from day one.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { icon: "🏗️", title: "Service-oriented", desc: "Each domain is an isolated Express service with its own route group and responsibility" },
                { icon: "⚡", title: "Real-time first", desc: "Socket.IO powers instant messaging between users and owners with room-based delivery" },
                { icon: "🔒", title: "Secure by design", desc: "JWT auth on every route, Razorpay webhooks verified, env-isolated secrets" },
                { icon: "📦", title: "Containerized", desc: "Docker Compose orchestrates all services with shared networking and volume mounts" },
              ].map((c) => (
                <div key={c.title} style={{ background: "#0a0a12", border: "1px solid #1e1e2e", borderRadius: 14, padding: "20px" }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{c.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ─────────────────── ARCHITECTURE ─────────────────── */}
      <section id="architecture" style={{ padding: "100px 40px", background: "#080810" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div className="section-divider" />
              <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>
                System <span className="glow-text">Architecture</span>
              </h2>
              <p style={{ fontSize: 16, color: "#64748b", maxWidth: 520, margin: "0 auto" }}>
                End-to-end request lifecycle from client to database — every layer visualized.
              </p>
            </div>
          </RevealSection>

          <RevealSection delay={200}>
            <div style={{ background: "#0a0a12", border: "1px solid #1e1e2e", borderRadius: 20, padding: "32px", boxShadow: "0 0 60px rgba(99,102,241,0.08)" }}>
              <ArchitectureDiagram />
            </div>
          </RevealSection>

          <RevealSection delay={300}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24 }}>
              {[
                { label: "Request enters API Gateway", color: "#06b6d4" },
                { label: "JWT middleware validates token", color: "#6366f1" },
                { label: "Routed to correct service", color: "#8b5cf6" },
                { label: "Service queries MongoDB", color: "#22c55e" },
                { label: "Socket.IO emits events", color: "#10b981" },
                { label: "Response returned to client", color: "#f59e0b" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 10, padding: "12px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color, fontFamily: "monospace", minWidth: 20 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─────────────────── MICROSERVICES ─────────────────── */}
      <section id="services" style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div className="section-divider" />
              <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>
                Microservices <span className="glow-text">Design</span>
              </h2>
              <p style={{ fontSize: 16, color: "#64748b", maxWidth: 520, margin: "0 auto" }}>
                Five isolated service domains. Each owns its routes, logic, and data responsibilities.
              </p>
            </div>
          </RevealSection>

          {/* Monolith vs Microservices */}
          <RevealSection delay={100}>
            <div style={{ background: "#0a0a12", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24, marginBottom: 40 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                {["monolith", "microservices"].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{ fontSize: 13, fontWeight: 600, padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.06em",
                      background: activeTab === tab ? "#6366f1" : "#1e1e2e", color: activeTab === tab ? "#fff" : "#475569", transition: "all 0.2s" }}>
                    {tab}
                  </button>
                ))}
              </div>
              {activeTab === "monolith" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  <div style={{ flex: 1, background: "#1e1e2e", borderRadius: 12, padding: "20px", textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "#ef4444", fontFamily: "monospace", marginBottom: 8 }}>MONOLITH</div>
                    {["Auth", "Listings", "Payments", "Chat", "Share"].map((s) => (
                      <div key={s} style={{ background: "#2e1e1e", border: "1px solid #ef4444aa", borderRadius: 6, padding: "8px 0", margin: "4px 0", fontSize: 12, color: "#fca5a5", fontFamily: "monospace" }}>{s}</div>
                    ))}
                    <div style={{ fontSize: 11, color: "#ef4444", marginTop: 12 }}>↓ Single point of failure. Tightly coupled. Hard to scale.</div>
                  </div>
                  <div style={{ padding: "0 24px", fontSize: 20, color: "#334155" }}>→</div>
                  <div style={{ flex: 1, background: "#0d1e0d", borderRadius: 12, padding: "20px", textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "#22c55e", fontFamily: "monospace", marginBottom: 8 }}>MICROSERVICES</div>
                    {["Auth Service", "Listing Service", "Payment Service", "Chat Service", "Share Service"].map((s) => (
                      <div key={s} style={{ background: "#0f2e0f", border: "1px solid #22c55eaa", borderRadius: 6, padding: "8px 0", margin: "4px 0", fontSize: 12, color: "#86efac", fontFamily: "monospace" }}>{s}</div>
                    ))}
                    <div style={{ fontSize: 11, color: "#22c55e", marginTop: 12 }}>↑ Isolated. Independently deployable. Horizontally scalable.</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                  {SERVICES.map((svc) => (
                    <div key={svc.id} style={{ background: `${svc.color}0d`, border: `1px solid ${svc.color}33`, borderRadius: 12, padding: "16px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{svc.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: svc.color, fontFamily: "monospace" }}>{svc.name.toUpperCase().replace(" SERVICE", "")}</div>
                      <div style={{ fontSize: 10, color: "#475569", marginTop: 8 }}>{svc.endpoints.length} endpoints</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </RevealSection>

          <RevealSection delay={200}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
              {SERVICES.map((svc) => (
                <ServiceCard key={svc.id} svc={svc} active={activeService === svc.id} onClick={() => setActiveService(svc.id === activeService ? null : svc.id)} />
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─────────────────── REAL-TIME CHAT ─────────────────── */}
      <section style={{ padding: "100px 40px", background: "#080810" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
              <div>
                <div className="section-divider" style={{ margin: "0 0 20px" }} />
                <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 20 }}>
                  Real-time Chat<br /><span style={{ color: "#10b981" }}>System</span>
                </h2>
                <p style={{ color: "#64748b", lineHeight: 1.8, marginBottom: 24 }}>
                  Socket.IO powers instant messaging between buyers and property owners. Each conversation gets its own room namespace, ensuring message delivery isolation and zero cross-talk.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Room-based isolation", color: "#10b981" },
                    { label: "Event-driven emit/broadcast", color: "#06b6d4" },
                    { label: "Connection state management", color: "#6366f1" },
                    { label: "Persistent chat history via MongoDB", color: "#8b5cf6" },
                  ].map((f) => (
                    <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: "#94a3b8" }}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#0a0a12", border: "1px solid #1e1e2e", borderRadius: 16, padding: "28px" }}>
                <ChatFlowDiagram />
                <div style={{ marginTop: 20 }}>
                  <TerminalBlock lines={[
                    { text: "socket.emit('join-room', { roomId, userId })", color: "#10b981" },
                    { text: "socket.on('message', (data) => { ... })", color: "#06b6d4" },
                    { text: "io.to(roomId).emit('new-message', payload)", color: "#a5b4fc" },
                  ]} />
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─────────────────── AUTH FLOW ─────────────────── */}
      <section id="auth" style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
              <div style={{ background: "#0a0a12", border: "1px solid #1e1e2e", borderRadius: 16, padding: "28px", display: "flex", justifyContent: "center" }}>
                <AuthFlowDiagram />
              </div>
              <div>
                <div className="section-divider" style={{ margin: "0 0 20px" }} />
                <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 20 }}>
                  Authentication<br /><span style={{ color: "#6366f1" }}>Flow</span>
                </h2>
                <p style={{ color: "#64748b", lineHeight: 1.8, marginBottom: 24 }}>
                  Dual-mode auth: email/password with bcrypt hashing + Google OAuth via Passport.js. JWT tokens carry userId and role, verified on every protected route through Express middleware.
                </p>
                <TerminalBlock lines={[
                  { text: "const token = jwt.sign({ id, role }, SECRET, { expiresIn: '7d' })", color: "#a5b4fc" },
                  { text: "const decoded = jwt.verify(token, SECRET)", color: "#6ee7b7" },
                  { text: "req.user = decoded // injected into route handler", color: "#67e8f9" },
                ]} />
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─────────────────── PAYMENT / CONTACT UNLOCK ─────────────────── */}
      <section style={{ padding: "100px 40px", background: "#080810" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div className="section-divider" />
              <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>
                Premium Contact <span className="glow-text">Unlock</span>
              </h2>
              <p style={{ fontSize: 16, color: "#64748b", maxWidth: 540, margin: "0 auto" }}>Razorpay-powered monetization. Pay to unlock verified owner contact — no fake leads.</p>
            </div>
          </RevealSection>
          <RevealSection delay={150}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
              {[
                { icon: "👤", label: "User requests\ncontact", color: "#6366f1" },
                { icon: "💳", label: "Razorpay\norder created", color: "#8b5cf6" },
                { icon: "✅", label: "Payment\nverified", color: "#06b6d4" },
                { icon: "🔓", label: "Contact\nunlocked", color: "#10b981" },
                { icon: "📞", label: "Owner details\nrevealed", color: "#22c55e" },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ textAlign: "center", padding: "24px 20px", background: "#0a0a12", border: `1px solid ${step.color}44`, borderRadius: 14, minWidth: 120 }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{step.icon}</div>
                    <div style={{ fontSize: 11, color: step.color, fontFamily: "monospace", lineHeight: 1.5, whiteSpace: "pre-line" }}>{step.label}</div>
                  </div>
                  {i < 4 && <div style={{ width: 32, height: 2, background: `linear-gradient(90deg, ${step.color}, #1e1e2e)`, margin: "0 4px", flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─────────────────── DATABASE ─────────────────── */}
      <section style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div className="section-divider" />
              <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>
                Database <span className="glow-text">Design</span>
              </h2>
              <p style={{ fontSize: 16, color: "#64748b", maxWidth: 500, margin: "0 auto" }}>MongoDB collections structured around domain boundaries, not joins.</p>
            </div>
          </RevealSection>
          <RevealSection delay={150}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {DB_COLLECTIONS.map((col) => <DBCard key={col.name} col={col} />)}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─────────────────── DEVOPS ─────────────────── */}
      <section id="devops" style={{ padding: "100px 40px", background: "#080810" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div className="section-divider" />
              <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>
                DevOps <span style={{ color: "#06b6d4" }}>&</span> Docker
              </h2>
              <p style={{ fontSize: 16, color: "#64748b", maxWidth: 520, margin: "0 auto" }}>Three isolated containers. One compose file. Zero environment leakage.</p>
            </div>
          </RevealSection>
          <RevealSection delay={150}>
            <div style={{ background: "#0a0a12", border: "1px solid #1e1e2e", borderRadius: 20, padding: 32 }}>
              <DockerSection />
            </div>
          </RevealSection>
          <RevealSection delay={250}>
            <div style={{ marginTop: 32 }}>
              <TerminalBlock lines={[
                { text: "docker-compose up --build -d", color: "#22c55e" },
                { text: "✓ frontend  built in 12.4s  → localhost:5173", color: "#6ee7b7" },
                { text: "✓ backend   built in 8.1s   → localhost:5000", color: "#6ee7b7" },
                { text: "✓ mongodb   pulled mongo:7  → localhost:27017", color: "#6ee7b7" },
                { text: "All services running on rentsmart_net", color: "#67e8f9" },
              ]} />
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─────────────────── API SYSTEM ─────────────────── */}
      <section id="api" style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div className="section-divider" />
              <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>
                REST API <span className="glow-text">System</span>
              </h2>
              <p style={{ fontSize: 16, color: "#64748b", maxWidth: 500, margin: "0 auto" }}>Structured route groups, JWT middleware, and a consistent error response contract.</p>
            </div>
          </RevealSection>
          <RevealSection delay={150}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#475569", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Auth Routes</div>
                <ApiBlock method="POST" path="/api/auth/register" desc="Create account" />
                <ApiBlock method="POST" path="/api/auth/login" desc="Issue JWT" />
                <ApiBlock method="GET" path="/api/auth/google" desc="OAuth redirect" />
                <ApiBlock method="POST" path="/api/auth/refresh" desc="Rotate token" />
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#475569", margin: "24px 0 14px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Listing Routes</div>
                <ApiBlock method="GET" path="/api/listings" desc="Paginated search" />
                <ApiBlock method="POST" path="/api/listings" desc="Create listing" />
                <ApiBlock method="PUT" path="/api/listings/:id" desc="Update listing" />
                <ApiBlock method="DELETE" path="/api/listings/:id" desc="Remove listing" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#475569", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Payment Routes</div>
                <ApiBlock method="POST" path="/api/pay/create-order" desc="Init Razorpay" />
                <ApiBlock method="POST" path="/api/pay/verify" desc="Validate payment" />
                <ApiBlock method="GET" path="/api/pay/history" desc="User history" />
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#475569", margin: "24px 0 14px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Share + Chat</div>
                <ApiBlock method="POST" path="/api/share/generate" desc="Share token" />
                <ApiBlock method="GET" path="/api/share/:token" desc="Resolve token" />
                <ApiBlock method="GET" path="/api/chat/history/:id" desc="Load messages" />
                <ApiBlock method="POST" path="/api/save/:listingId" desc="Save property" />
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─────────────────── PERFORMANCE & SECURITY ─────────────────── */}
      <section style={{ padding: "100px 40px", background: "#080810" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60 }}>
            <RevealSection>
              <div>
                <div className="section-divider" style={{ margin: "0 0 20px" }} />
                <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 20 }}>
                  Performance &<br /><span style={{ color: "#f59e0b" }}>Scalability</span>
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { title: "Service isolation", desc: "Each service scales independently — chat load won't impact listing queries", color: "#f59e0b" },
                    { title: "Lazy loading", desc: "React route-based code splitting reduces initial bundle by 60%+", color: "#06b6d4" },
                    { title: "Query optimization", desc: "MongoDB indexes on listingId, userId, and createdAt for fast lookups", color: "#10b981" },
                    { title: "Pagination", desc: "Cursor-based pagination prevents N+1 query patterns on listing endpoints", color: "#8b5cf6" },
                  ].map((f) => (
                    <div key={f.title} style={{ borderLeft: `2px solid ${f.color}`, paddingLeft: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{f.title}</div>
                      <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>

            <RevealSection delay={150}>
              <div>
                <div className="section-divider" style={{ margin: "0 0 20px" }} />
                <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 20 }}>
                  Security<br /><span style={{ color: "#ef4444" }}>Hardening</span>
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { title: "JWT + expiry", desc: "Short-lived access tokens, rotate on refresh, signed with HS256 and env secret", color: "#ef4444" },
                    { title: "Razorpay webhook validation", desc: "Signature verification on every payment callback prevents replay attacks", color: "#f59e0b" },
                    { title: "Environment isolation", desc: ".env vars never shipped in Docker image; injected at runtime via compose", color: "#6366f1" },
                    { title: "Route authorization", desc: "Role-based middleware: owner can edit listings, users can only view", color: "#10b981" },
                  ].map((f) => (
                    <div key={f.title} style={{ borderLeft: `2px solid ${f.color}`, paddingLeft: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{f.title}</div>
                      <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ─────────────────── ROADMAP ─────────────────── */}
      <section id="roadmap" style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div className="section-divider" />
              <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>
                Future <span className="glow-text">Roadmap</span>
              </h2>
              <p style={{ fontSize: 16, color: "#64748b", maxWidth: 500, margin: "0 auto" }}>From ML to Kubernetes — the evolution path is already scoped.</p>
            </div>
          </RevealSection>
          <RevealSection delay={150}>
            <div style={{ position: "relative" }}>
              {/* Timeline line */}
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "linear-gradient(180deg, #6366f1, #8b5cf6, transparent)", transform: "translateX(-50%)", zIndex: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {ROADMAP.map((item, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
                    {i % 2 === 0 ? (
                      <>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ background: "#0a0a12", border: `1px solid ${item.color}33`, borderRadius: 14, padding: "20px 24px", display: "inline-block", maxWidth: 340, textAlign: "left" }}>
                            <div style={{ fontSize: 11, color: item.color, fontFamily: "monospace", marginBottom: 8 }}>{item.phase}</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>{item.title}</div>
                            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{item.desc}</div>
                            <div style={{ marginTop: 10, fontSize: 10, fontFamily: "monospace", color: item.status === "planned" ? "#10b981" : "#475569" }}>
                              {item.status === "planned" ? "● PLANNED" : "○ FUTURE"}
                            </div>
                          </div>
                        </div>
                        <div />
                      </>
                    ) : (
                      <>
                        <div />
                        <div>
                          <div style={{ background: "#0a0a12", border: `1px solid ${item.color}33`, borderRadius: 14, padding: "20px 24px", display: "inline-block", maxWidth: 340 }}>
                            <div style={{ fontSize: 11, color: item.color, fontFamily: "monospace", marginBottom: 8 }}>{item.phase}</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>{item.title}</div>
                            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{item.desc}</div>
                            <div style={{ marginTop: 10, fontSize: 10, fontFamily: "monospace", color: item.status === "planned" ? "#10b981" : "#475569" }}>
                              {item.status === "planned" ? "● PLANNED" : "○ FUTURE"}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─────────────────── TECH STACK GRID ─────────────────── */}
      <section style={{ padding: "80px 40px", background: "#080810" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="section-divider" />
              <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em" }}>Tech <span className="glow-text">Stack</span></h2>
            </div>
          </RevealSection>
          <RevealSection delay={100}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              {["React.js", "Vite", "Tailwind CSS", "Node.js", "Express.js", "Socket.IO", "MongoDB", "JWT", "Google OAuth", "Razorpay", "Docker", "Docker Compose", "REST API", "Mongoose"].map((tech) => (
                <div key={tech} style={{ background: "#0a0a12", border: "1px solid #1e1e2e", borderRadius: 8, padding: "8px 18px", fontSize: 13, color: "#94a3b8", fontFamily: "monospace", transition: "all 0.2s" }}>{tech}</div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─────────────────── FOOTER ─────────────────── */}
      <footer style={{ position: "relative", padding: "80px 40px 40px", borderTop: "1px solid #1e1e2e", overflow: "hidden" }}>
        <GlowOrb style={{ width: 500, height: 300, background: "rgba(99,102,241,0.06)", bottom: 0, left: "50%", transform: "translateX(-50%)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <blockquote style={{ fontSize: 22, fontStyle: "italic", color: "#475569", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
              "Any application that can be built with microservices, eventually will be built with microservices."
            </blockquote>
            <div style={{ fontSize: 13, color: "#334155", marginTop: 12 }}>— Software Architecture Principle</div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 48 }}>
            <a href="https://github.com" style={{ display: "flex", alignItems: "center", gap: 8, background: "#0a0a12", border: "1px solid #2e2e4e", color: "#94a3b8", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 500, transition: "all 0.2s" }}>
              GitHub — View Source ↗
            </a>
            <a href="https://linkedin.com" style={{ display: "flex", alignItems: "center", gap: 8, background: "#0a0a12", border: "1px solid #2e2e4e", color: "#94a3b8", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 500, transition: "all 0.2s" }}>
              LinkedIn — Connect ↗
            </a>
          </div>

          <div style={{ textAlign: "center", borderTop: "1px solid #1e1e2e", paddingTop: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>R</div>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>RentSmart</span>
            </div>
            <p style={{ fontSize: 12, color: "#334155" }}>Built with scalability in mind. Engineered for production. Deployed with Docker.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}