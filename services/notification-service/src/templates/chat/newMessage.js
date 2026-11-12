
import {
  emailLayout,
  escapeHtml,
  emailButton,
} from "../../utils/emailLayout.js";

export const newMessageTemplate = ({
  recipientName,
  senderName,
  messagePreview,
  chatLink,
}) => {
  if (!recipientName || !senderName || !messagePreview || !chatLink) {
    throw new Error("Missing new message email fields");
  }

  const content = `
    <h2>You've Received a New Message!</h2>

    <p>Hello ${escapeHtml(recipientName)},</p>

    <p>
      <strong>${escapeHtml(senderName)}</strong>
      sent you a message on RentSmart.
    </p>

    <div style="
      background:#f1f5f9;
      padding:18px;
      border-left:4px solid #2563eb;
      border-radius:6px;
      margin:20px 0;
    ">
      ${escapeHtml(messagePreview)}
    </div>

    ${emailButton(chatLink, "View Conversation")}

    <p style="color:#64748b;font-size:13px;">
      Log in to RentSmart to continue your conversation.
    </p>
  `;

  return {
    subject: `New message from ${senderName} - RentSmart`,
    html: emailLayout({
      title: "New Message",
      preheader: `You have a new message from ${senderName}.`,
      content,
    }),
  };
};
