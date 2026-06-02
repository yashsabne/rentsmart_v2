import { useState, useEffect, useRef, useCallback } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import useSocket from "../../chat/useSocket";
import useChatEvents from "../../chat/useChatEvents";
import { useSocketContext } from "../../chat/socketContext";
import { sendMessage, getMessages, markRead } from "../../services/chatApi";

const ChatArea = ({ conversation, onBack, onConversationUpdate, currentUser }) => {
  const { onlineUsers } = useSocketContext();
  const { emitTyping, emitStopTyping, emitMessage, emitRead } = useSocket(
    conversation.conversationSlug
  );

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const typingTimerRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isLoadingMoreRef = useRef(false);

  const myUserId = String(currentUser?._id);

  const otherParticipant = conversation.participants.find(
    (p) => String(p.userId) !== myUserId
  );
 

  const isOtherOnline = onlineUsers.has(String(otherParticipant?.userId));

  useEffect(() => {
    setMessages([]);
    setHasMore(false);
    loadMessages();
  }, [conversation.conversationSlug]);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  const loadMessages = async (before = null) => {
    try {
      if (before) {
        isLoadingMoreRef.current = true;
      } else {
        setLoading(true);
      }

      const data = await getMessages(conversation.conversationSlug, before);
      const msgs = data.messages || [];
 
      setHasMore(data.hasMore || false);
 

      if (before) {
        const container = messagesContainerRef.current;
        const prevScrollHeight = container?.scrollHeight ?? 0;



        setMessages((prev) => [...msgs, ...prev]);

        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - prevScrollHeight;
          }
          isLoadingMoreRef.current = false;
        });
      } else {
        setMessages(msgs);

        requestAnimationFrame(scrollToBottom);
        await markRead(conversation.conversationSlug);
        emitRead();
      }
    } catch (err) {
      console.error("[ChatArea] Failed to load messages:", err);
      isLoadingMoreRef.current = false;
    } finally {
      setLoading(false);
    }
  };

 
  const handleScroll = useCallback(
    async (e) => {
      const { scrollTop } = e.target;
      if (
        scrollTop === 0 &&
        hasMore &&
        !loading &&
        !isLoadingMoreRef.current &&
        messages.length > 0
      ) {
        await loadMessages(messages[0]._id);
      }
    },
    [hasMore, loading, messages]
  );

  useChatEvents(conversation.conversationSlug, {
    onMessage: (msg) => {
      setMessages((prev) => {
        const existsByRealId = prev.some((m) => m._id === msg._id);
        if (existsByRealId) return prev;

        const withoutOptimistic = prev.filter(
          (m) => !(m.isOptimistic && m.text === msg.text && String(m.senderUserId) === myUserId)
        );
        return [...withoutOptimistic, msg];
      });
      requestAnimationFrame(scrollToBottom);
      markRead(conversation.conversationSlug);
      emitRead();
    },
    onTyping: () => setIsTyping(true),
    onStopTyping: () => setIsTyping(false),
 onRead: async (data) => { 

  const response = await getMessages(
    conversation.conversationSlug
  );

  setMessages(response.messages || []);
},
    onDelivered: () => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m.senderUserId) === myUserId && m.status === "sent"
            ? { ...m, status: "delivered" }
            : m
        )
      );
    },
  });

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    emitTyping();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emitStopTyping();
    }, 1500);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    emitStopTyping();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg = {
      _id: optimisticId,
      senderUserId: myUserId,
      text,
      status: "sent",
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");
    requestAnimationFrame(scrollToBottom);

    try {
      const result = await sendMessage(conversation.conversationSlug, text);
      setMessages((prev) =>
        prev.map((m) => (m._id === optimisticId ? result.message : m))
      );
      emitMessage(result.message);
    } catch (err) {
      console.error("[ChatArea] Failed to send message:", err);
      setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
      setInputText(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const groupedMessages = groupByDate(messages);
 

  return (
    <div className="chat-area">
      <div className="chat-area__header">
        <button className="chat-area__back-btn" onClick={onBack}>
          ←
        </button>

        <div className="chat-area__header-info">
          <div className="chat-area__avatar-wrap">
            {conversation.propertyImage ? (
              <img
                src={conversation.propertyImage}
                alt=""
                className="chat-area__avatar"
              />
            ) : (
              <div className="chat-area__avatar chat-area__avatar--placeholder">
                🏠
              </div>
            )}
            {isOtherOnline && <span className="chat-area__online-dot" />}
          </div>

          <div>
            <div className="chat-area__other-name">
              {otherParticipant?.fullName}
            </div>
            <div className="chat-area__status">
              {isOtherOnline ? (
                <span className="chat-area__online-text">● Online</span>
              ) : (
                <span className="chat-area__offline-text">● Offline</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="chat-area__messages"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {hasMore && (
          <div className="chat-area__load-more">
            <button
              onClick={() => loadMessages(messages[0]?._id)}
              disabled={isLoadingMoreRef.current}
            >
              Load older messages
            </button>
          </div>
        )}

        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`msg-bubble-skeleton ${
                i % 2 === 0
                  ? "msg-bubble-skeleton--left"
                  : "msg-bubble-skeleton--right"
              }`}
            >
              <div className="skeleton skeleton--bubble" />
            </div>
          ))
        ) : groupedMessages.length === 0 ? (
          <div className="chat-area__no-messages">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="chat-area__date-sep">
                <span>{group.date}</span>
              </div>
              {group.messages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isMine={String(msg.senderUserId) === myUserId}
                />
              ))}
            </div>
          ))
        )}

        {isTyping && <TypingIndicator name={otherParticipant?.fullName} />}
      </div>

      <div className="chat-area__input-row">
        <textarea
          ref={inputRef}
          className="chat-area__input"
          placeholder="Type a message..."
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={sending}
        />
        <button
          className={`chat-area__send-btn ${
            !inputText.trim() || sending ? "chat-area__send-btn--disabled" : ""
          }`}
          onClick={handleSend}
          disabled={!inputText.trim() || sending}
        >
          {sending ? "···" : "➤"}
        </button>
      </div>
    </div>
  );
};

const groupByDate = (messages) => {
  const groups = [];
  const map = {};
  messages.forEach((msg) => {
    const dateLabel = getDateLabel(msg.createdAt);
    if (!map[dateLabel]) {
      map[dateLabel] = { date: dateLabel, messages: [] };
      groups.push(map[dateLabel]);
    }
    map[dateLabel].messages.push(msg);
  });
  return groups;
};

const getDateLabel = (dateStr) => {
  if (!dateStr) return "Unknown";

  const msgDate = new Date(dateStr);
  const now = new Date();

  const msgDay = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = today.getTime() - msgDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return msgDate.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

export default ChatArea;