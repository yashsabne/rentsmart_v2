import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ConversationList from "./ConversationList";
import ChatArea from "./ChatArea";
import PropertyInfoPanel from "./PropertyInfoPanel";
import { getConversations } from "../../services/chatApi";
import "./messages.css"

const MessagesPage = ({currentUser} ) => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState("list");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getConversations();
        
        setConversations(data.conversations || []);
      } catch (err) {
        console.error("[MessagesPage] Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (slug && conversations.length > 0) {
      const found = conversations.find((c) => c.conversationSlug === slug);
      if (found) {
        setActiveConversation(found);
        setMobileView("chat");
      }
    }
  }, [slug, conversations]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setMobileView("chat");
    navigate(`/dashboard/messages/${conv.conversationSlug}`);
  };

  const handleBackToList = () => {
    setMobileView("list");
    setActiveConversation(null);
    navigate("/dashboard/messages");
  };

  const handleConversationUpdate = (updatedConv) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.conversationSlug === updatedConv.conversationSlug ? updatedConv : c
      )
    );
  };

  return (
    <div className="messages-page">
      <div
        className={`messages-sidebar ${
          mobileView !== "list" ? "messages-sidebar--hidden-mobile" : ""
        }`}
      >
        <ConversationList
          conversations={conversations}
          activeSlug={activeConversation?.conversationSlug}
          loading={loading}
          onSelect={handleSelectConversation}
        />
      </div>

      <div
        className={`messages-main ${
          mobileView !== "chat" ? "messages-main--hidden-mobile" : ""
        }`}
      >
        {activeConversation ? (
          <ChatArea
            conversation={activeConversation}
            onBack={handleBackToList}
            onConversationUpdate={handleConversationUpdate}
            currentUser={currentUser}
          />
        ) : (
          <div className="messages-empty-state">
            <div className="messages-empty-state__icon">💬</div>
            <h3 className="messages-empty-state__title">Your Messages</h3>
            <p className="messages-empty-state__text">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>

      <div
        className={`messages-info-panel ${
          mobileView !== "chat" ? "messages-info-panel--hidden-mobile" : ""
        }`}
      >
        {activeConversation ? (
          <PropertyInfoPanel conversation={activeConversation} currentUser={currentUser} />
        ) : (
          <div className="messages-info-panel__placeholder">
            <p>Property details will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
