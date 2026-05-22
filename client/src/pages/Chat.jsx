import { useState, useRef, useEffect } from "react";

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
  bubble:  "#F0EFEC",
};

const contacts = [
  {
    id: 1, name: "Rajesh Sharma", role: "Property Owner",
    avatar: "RS", online: true,
    property: "Skyline Penthouse, Bandra",
    messages: [
      { id: 1, from: "them", text: "Hello! I saw your inquiry about the Skyline Penthouse.", time: "10:02 AM", date: "Today" },
      { id: 2, from: "me",   text: "Hi Rajesh! Yes, I'm very interested. Is it still available?", time: "10:04 AM", date: "Today" },
      { id: 3, from: "them", text: "Yes, it's available. Would you like to schedule a visit this weekend?", time: "10:05 AM", date: "Today" },
      { id: 4, from: "me",   text: "That would be great. Saturday afternoon works for me.", time: "10:07 AM", date: "Today" },
      { id: 5, from: "them", text: "Perfect. How does 3 PM on Saturday sound?", time: "10:08 AM", date: "Today" },
    ],
    unread: 1,
  },
  {
    id: 2, name: "Priya Nair", role: "Property Owner",
    avatar: "PN", online: true,
    property: "Garden Villa, Pune",
    messages: [
      { id: 1, from: "them", text: "Thanks for your interest in the Garden Villa.", time: "9:15 AM", date: "Today" },
      { id: 2, from: "me",   text: "Could you share more details about the maintenance charges?", time: "9:20 AM", date: "Today" },
      { id: 3, from: "them", text: "Sure, maintenance is ₹8,000 per month including water and security.", time: "9:22 AM", date: "Today" },
    ],
    unread: 0,
  },
  {
    id: 3, name: "Arjun Mehta", role: "Tenant",
    avatar: "AM", online: false,
    property: "Studio Loft, Bangalore",
    messages: [
      { id: 1, from: "me",   text: "Hi, I've listed the Studio Loft. Let me know if you have questions.", time: "Yesterday", date: "Yesterday" },
      { id: 2, from: "them", text: "Thanks. What is the minimum lock-in period?", time: "Yesterday", date: "Yesterday" },
    ],
    unread: 0,
  },
  {
    id: 4, name: "Sneha Patel", role: "Buyer",
    avatar: "SP", online: false,
    property: "Riverside Apartment, Ahmedabad",
    messages: [
      { id: 1, from: "them", text: "Is there any flexibility on the asking price?", time: "Mon", date: "Monday" },
    ],
    unread: 2,
  },
  {
    id: 5, name: "RentSmart Support", role: "Support",
    avatar: "RS", online: true,
    property: "Help & Assistance",
    messages: [
      { id: 1, from: "them", text: "Welcome to RentSmart! How can we help you today?", time: "Apr 1", date: "Apr 1" },
    ],
    unread: 0,
  },
];

function Avatar({ initials, size = 40, online = false }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: C.goldBg, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700 }}>
        {initials}
      </div>
      {online && (
        <div style={{ position: "absolute", bottom: 1, right: 1, width: size * 0.25, height: size * 0.25, borderRadius: "50%", background: C.green, border: `2px solid ${C.white}` }} />
      )}
    </div>
  );
}

export default function Chat() {
  const [activeId,  setActiveId]  = useState(1);
  const [allChats,  setAllChats]  = useState(contacts);
  const [input,     setInput]     = useState("");
  const [search,    setSearch]    = useState("");
  const [infoOpen,  setInfoOpen]  = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const active = allChats.find(c => c.id === activeId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, active?.messages.length]);

  // Mark as read on open
  useEffect(() => {
    setAllChats(prev => prev.map(c => c.id === activeId ? { ...c, unread: 0 } : c));
  }, [activeId]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const newMsg = { id: Date.now(), from: "me", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), date: "Today" };
    setAllChats(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, newMsg] } : c));
    setInput("");
    inputRef.current?.focus();
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const filteredContacts = allChats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.property.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = allChats.reduce((s, c) => s + c.unread, 0);

  // Group messages by date
  const groupedMessages = active?.messages.reduce((acc, msg) => {
    const key = msg.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {}) || {};

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", background: C.cream, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif !important; overflow: hidden; }
        .pf { font-family: 'Playfair Display', serif !important; }
        button, input, textarea { font-family: 'DM Sans', sans-serif; cursor: pointer; }
        a { text-decoration: none; color: inherit; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp .3s both; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        textarea:focus { outline: none; }
        .contact-row:hover { background: ${C.cream} !important; }

        @media (max-width: 700px) {
          .sidebar { display: none !important; }
          .info-panel { display: none !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ height: 60, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0, zIndex: 10 }}>
        <a href="/" className="pf" style={{ fontSize: 20, fontWeight: 700, color: C.ink }}>
          Rent<span style={{ color: C.gold }}>Smart</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 13, color: C.muted }}>Messages
            {totalUnread > 0 && (
              <span style={{ marginLeft: 6, background: C.ink, color: C.white, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 100 }}>{totalUnread}</span>
            )}
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.goldBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.gold }}>YS</div>
        </div>
      </nav>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── SIDEBAR ── */}
        <div className="sidebar" style={{ width: 300, background: C.white, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Search */}
          <div style={{ padding: "16px 16px 12px" }}>
            <input
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.ink, background: C.cream, outline: "none" }}
              onFocus={e => e.currentTarget.style.borderColor = C.ink}
              onBlur={e => e.currentTarget.style.borderColor = C.border}
            />
          </div>

          {/* Contact list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredContacts.map(c => {
              const lastMsg = c.messages[c.messages.length - 1];
              const isActive = c.id === activeId;
              return (
                <div key={c.id} className="contact-row"
                  onClick={() => setActiveId(c.id)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", background: isActive ? C.cream : C.white, borderLeft: `3px solid ${isActive ? C.ink : "transparent"}`, transition: "all .15s" }}>
                  <Avatar initials={c.avatar} size={42} online={c.online} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: isActive || c.unread ? 600 : 500, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: C.light, flexShrink: 0 }}>{lastMsg?.time}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>
                        {lastMsg?.from === "me" ? "You: " : ""}{lastMsg?.text}
                      </span>
                      {c.unread > 0 && (
                        <span style={{ background: C.ink, color: C.white, fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 100, flexShrink: 0, marginLeft: 4 }}>{c.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredContacts.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", fontSize: 13, color: C.light }}>No conversations found</div>
            )}
          </div>
        </div>

        {/* ── CHAT AREA ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Chat header */}
          <div style={{ height: 64, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar initials={active?.avatar} size={38} online={active?.online} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{active?.name}</div>
                <div style={{ fontSize: 12, color: active?.online ? C.green : C.light }}>
                  {active?.online ? "Online" : "Offline"} · {active?.role}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setInfoOpen(!infoOpen)}
                style={{ padding: "7px 16px", borderRadius: 10, border: `1.5px solid ${infoOpen ? C.ink : C.border}`, background: infoOpen ? C.ink : "none", color: infoOpen ? C.white : C.muted, fontSize: 13, fontWeight: 500, transition: "all .2s" }}>
                Details
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 16px" }}>
            {/* Property context chip */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 100, padding: "6px 16px", fontSize: 12, color: C.muted }}>
                Re: <span style={{ color: C.ink, fontWeight: 500 }}>{active?.property}</span>
              </div>
            </div>

            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date separator */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  <span style={{ fontSize: 11, color: C.light, fontWeight: 500 }}>{date}</span>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>

                {msgs.map((msg, i) => {
                  const isMe = msg.from === "me";
                  const showAvatar = !isMe && (i === 0 || msgs[i - 1]?.from !== "them");
                  return (
                    <div key={msg.id} className="fu" style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 6, alignItems: "flex-end", gap: 8 }}>
                      {!isMe && (
                        <div style={{ width: 28, flexShrink: 0 }}>
                          {showAvatar && <Avatar initials={active?.avatar} size={28} />}
                        </div>
                      )}
                      <div style={{ maxWidth: "62%" }}>
                        <div style={{
                          padding: "10px 14px",
                          borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                          background: isMe ? C.ink : C.bubble,
                          color: isMe ? C.white : C.ink,
                          fontSize: 14, lineHeight: 1.55,
                        }}>
                          {msg.text}
                        </div>
                        <div style={{ fontSize: 11, color: C.light, marginTop: 4, textAlign: isMe ? "right" : "left" }}>
                          {msg.time}{isMe && " · Sent"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{ padding: "14px 24px 18px", background: C.white, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, background: C.cream, borderRadius: 14, padding: "10px 14px", border: `1.5px solid ${C.border}`, transition: "border-color .2s" }}
              onFocus={() => {}} >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a message…"
                rows={1}
                style={{ flex: 1, border: "none", background: "transparent", resize: "none", fontSize: 14, color: C.ink, lineHeight: 1.5, maxHeight: 100, outline: "none" }}
                onInput={e => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: input.trim() ? C.ink : C.border, color: input.trim() ? C.white : C.light, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .2s" }}
                onMouseEnter={e => { if (input.trim()) e.currentTarget.style.background = "#2a2a2a"; }}
                onMouseLeave={e => { if (input.trim()) e.currentTarget.style.background = C.ink; }}>
                ↑
              </button>
            </div>
            <p style={{ fontSize: 11, color: C.light, marginTop: 6, textAlign: "center" }}>Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>

        {/* ── INFO PANEL ── */}
        {infoOpen && (
          <div className="info-panel" style={{ width: 260, background: C.white, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
            <div style={{ padding: "24px 20px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>
              <Avatar initials={active?.avatar} size={56} online={active?.online} />
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{active?.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{active?.role}</div>
                <div style={{ fontSize: 12, color: active?.online ? C.green : C.light, marginTop: 3 }}>{active?.online ? "Online now" : "Offline"}</div>
              </div>
            </div>

            <div style={{ padding: "20px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 12 }}>Property</div>
              <div style={{ background: C.cream, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, lineHeight: 1.5 }}>{active?.property}</div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 12, marginTop: 20 }}>Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["View Property", "Schedule Visit", "Share Contact"].map(action => (
                  <button key={action}
                    style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "none", color: C.ink, fontSize: 13, fontWeight: 500, textAlign: "left", transition: "all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.background = C.cream; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "none"; }}>
                    {action}
                  </button>
                ))}
                <button
                  style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid #fde`, background: "none", color: C.red, fontSize: 13, fontWeight: 500, textAlign: "left", marginTop: 4, transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#fff5f5"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
                  Block User
                </button>
              </div>

              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 12, marginTop: 20 }}>Conversation</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[["Messages", active?.messages.length], ["Started", "Mar 24, 2025"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, color: C.muted }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}