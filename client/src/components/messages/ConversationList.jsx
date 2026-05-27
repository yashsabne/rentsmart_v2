import { useState, useMemo } from "react";
import { useSocketContext } from "../../chat/socketContext";

const ConversationList = ({ conversations, activeSlug, loading, onSelect }) => {
  const { onlineUsers } = useSocketContext();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const matchesSearch =
        c.propertyTitle.toLowerCase().includes(search.toLowerCase()) ||
        c.participants.some((p) =>
          p.fullName.toLowerCase().includes(search.toLowerCase())
        );
      if (filter === "unread") return matchesSearch && c.unreadCount > 0;
      if (filter === "archived") return matchesSearch && c.isArchived;
      return matchesSearch && !c.isArchived;
    });
  }, [conversations, search, filter]);

  const getOtherParticipant = (conv) => {
    const myUserId = localStorage.getItem("userId");
    return (
      conv.participants.find((p) => p.userId !== myUserId) ||
      conv.participants[0]
    );
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="conv-list">
      <div className="conv-list__header">
        <h2 className="conv-list__title">Messages</h2>
      </div>

      <div className="conv-list__search-wrap">
        <span className="conv-list__search-icon">🔍</span>
        <input
          className="conv-list__search"
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="conv-list__filters">
        {["all", "unread", "archived"].map((f) => (
          <button
            key={f}
            className={`conv-list__filter-btn ${
              filter === f ? "conv-list__filter-btn--active" : ""
            }`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="conv-list__items">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="conv-item conv-item--skeleton">
              <div className="conv-item__avatar-skeleton skeleton" />
              <div className="conv-item__content">
                <div className="skeleton skeleton--line skeleton--short" />
                <div className="skeleton skeleton--line skeleton--long" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="conv-list__empty">
            <p>No conversations found</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const other = getOtherParticipant(conv);
            const isActive = conv.conversationSlug === activeSlug;
            const isOnline = onlineUsers.has(other?.userId);
            const preview = conv.lastMessage || "No messages yet";

            return (
              <button
                key={conv.conversationSlug}
                className={`conv-item ${isActive ? "conv-item--active" : ""}`}
                onClick={() => onSelect(conv)}
              >
                <div className="conv-item__avatar-wrap">
                  {conv.propertyImage ? (
                    <img
                      src={conv.propertyImage}
                      alt={conv.propertyTitle}
                      className="conv-item__avatar"
                    />
                  ) : (
                    <div className="conv-item__avatar conv-item__avatar--placeholder">
                      🏠
                    </div>
                  )}
                  {isOnline && <span className="conv-item__online-dot" />}
                </div>

                <div className="conv-item__content">
                  <div className="conv-item__top">
                    <span className="conv-item__property-title">
                      {conv.propertyTitle}
                    </span>
                    <span className="conv-item__time">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <span className="conv-item__other-name">
                    {other?.fullName}
                  </span>
                  <div className="conv-item__bottom">
                    <span className="conv-item__preview">{preview}</span>
                    {conv.unreadCount > 0 && (
                      <span className="conv-item__unread-badge">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
