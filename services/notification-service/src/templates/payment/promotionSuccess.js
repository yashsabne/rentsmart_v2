
import {
  emailLayout,
  escapeHtml,
} from "../../utils/emailLayout.js";

export const promotionSuccessTemplate = ({
  ownerName,
  propertyTitle,
}) => {
  if (!ownerName || !propertyTitle) {
    throw new Error("Missing promotion email fields");
  }

  const content = `
    <h2 style="color:#1e293b;">Property Promotion Activated!</h2>

    <p>Hello ${escapeHtml(ownerName)},</p>

    <p>
      Your property promotion has been successfully activated.
    </p>

    <div style="
      background:#f1f5f9;
      padding:18px;
      border-radius:8px;
      margin:20px 0;
    ">
      <strong>Property:</strong>
      ${escapeHtml(propertyTitle)}
    </div>

    <p>
      Your property is now eligible for the benefits
      associated with your promotion plan.
    </p>

    <p>Thank you for using RentSmart!</p>
  `;

  return {
    subject: "Property Promotion Activated - RentSmart",
    html: emailLayout({
      title: "Promotion Activated",
      preheader: "Your property promotion is now active.",
      content,
    }),
  };
};
