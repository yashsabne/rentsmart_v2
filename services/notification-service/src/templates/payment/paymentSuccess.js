
import {
  emailLayout,
  escapeHtml,
} from "../../utils/emailLayout.js";

export const paymentSuccessTemplate = ({
  tenantName,
  ownerName,
  propertyTitle,
}) => {
  if (!tenantName || !ownerName || !propertyTitle) {
    throw new Error("Missing payment success email fields");
  }

  const content = `
    <h2 style="color:#1e293b;">Payment Successful!</h2>

    <p>Hello ${escapeHtml(tenantName)},</p>

    <p>
      Your payment for the property has been successfully processed.
    </p>

    <div style="
      background:#f1f5f9;
      padding:18px;
      border-radius:8px;
      margin:20px 0;
    ">
      <p><strong>Property:</strong> ${escapeHtml(propertyTitle)}</p>
      <p><strong>Owner:</strong> ${escapeHtml(ownerName)}</p>
    </div>

    <p>
      Thank you for choosing RentSmart.
      We hope you have a great experience!
    </p>
  `;

  return {
    subject: "Payment Successful - RentSmart",
    html: emailLayout({
      title: "Payment Successful",
      preheader: "Your RentSmart payment was successful.",
      content,
    }),
  };
};
