// src/components/property/MessageBox.jsx

const MessageBox = ({
  owner,
  property,
  message,
  setMessage,
  sent,
  handleSend,
  C,
}) => {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.inkMuted,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 8,
          }}
        >
          Send a Message
        </label>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Hi ${
            owner?.firstName || ""
          }, I'm interested in "${property.title}"`}
          rows={4}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 12,
            border: `1.5px solid ${C.border}`,
            fontSize: 13,
            resize: "none",
          }}
        />
      </div>

      {sent && (
        <div
          style={{
            padding: "10px 14px",
            background: C.greenBg,
            color: C.green,
            borderRadius: 10,
            fontSize: 13,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          ✅ Message sent successfully!
        </div>
      )}

      <button
        onClick={handleSend}
        style={{
          width: "100%",
          padding: "13px",
          borderRadius: 12,
          border: "none",
          background: C.ink,
          color: "#FFFFFF",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
         Send Message
      </button>

      <button
        style={{
          width: "100%",
          padding: "13px",
          borderRadius: 12,
          border: `1.5px solid ${C.border}`,
          background: "none",
          color: C.ink,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
         Request a Callback
      </button>
    </>
  );
};

export default MessageBox;