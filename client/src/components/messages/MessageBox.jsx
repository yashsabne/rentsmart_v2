import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createConversation } from "../../services/chatApi";

const MessageBox = ({ property }) => {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setSending(true);
    setError("");

    try {
      const result = await createConversation({
        propertyId: property._id,
        propertyTitle: property.title,
        propertyImage: property.images?.[0] || "",
        propertyLocation: property.location || "",
        propertyPrice: property.price ? `₹${property.price}` : "",
        owner: {
          userId: property.owner._id,
          fullName: property.owner.fullName,
          email: property.owner.email,
          avatar: property.owner.avatar || "",
        },
        text: trimmed,
      });  
      
      sessionStorage.setItem("activeNav", "messages");
      navigate(`/dashboard/messages/${result.conversationSlug}?nav=messages`);
    } catch (err) {
      console.error("[MessageBox] Error:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-box">
      <h3 className="message-box__title">Contact Owner</h3>
      <p className="message-box__subtitle">
        Send your first message to enquire about this property.
        <br />
        You'll be redirected to your messages dashboard.
      </p>

      <textarea
        className="message-box__input"
        placeholder="Hi, I'm interested in this property..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={4}
        disabled={sending}
      />

      {error && <p className="message-box__error">{error}</p>}

      <button
        className="message-box__btn"
        onClick={handleSend}
        disabled={!text.trim() || sending}
      >
        {sending ? "Sending..." : "Send Message"}
      </button>
    </div>
  );
};

export default MessageBox;
