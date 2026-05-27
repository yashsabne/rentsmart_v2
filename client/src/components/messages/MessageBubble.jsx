const MessageBubble = ({ message, isMine }) => {
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };



  const getStatusIcon = (status) => {
    if (!isMine) return null;
 
    if (status === "read") return <span className="msg-status msg-status--read">✓✓</span>;
    if (status === "sent") return <span className="msg-status msg-status--delivered">✓✓</span>;
    return <span className="msg-status msg-status--sent">✓</span>;
  };

  return (
    <div
      className={`msg-bubble-wrap ${
        isMine ? "msg-bubble-wrap--mine" : "msg-bubble-wrap--theirs"
      }`}
    >
      <div
        className={`msg-bubble ${
          isMine ? "msg-bubble--mine" : "msg-bubble--theirs"
        } ${message.isOptimistic ? "msg-bubble--optimistic" : ""}`}
      >
        <p className="msg-bubble__text">{message.text}</p>
        <div className="msg-bubble__meta">
          <span className="msg-bubble__time">
            {formatTime(message.createdAt)}
          </span>
          {getStatusIcon(message.status)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
