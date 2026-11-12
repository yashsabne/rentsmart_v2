
import {
  emailLayout,
  escapeHtml,
} from "../../utils/emailLayout.js";

export const contactRevealedTemplate = ({
  tenantName,
  ownerName,
  ownerPhone,
  buyerName,
  buyerEmail,
  buyerPhone,
  propertyTitle,
  recipientType,
}) => {
  if (!propertyTitle || !recipientType) {
    throw new Error("Missing contact revealed email fields");
  }

  let content;

  if (recipientType === "TENANT") {
    if (!tenantName || !ownerName || !ownerPhone) {
      throw new Error("Missing tenant contact details");
    }

    content = `
      <h2>Owner Contact Revealed!</h2>

      <p>Hello ${escapeHtml(tenantName)},</p>

      <p>
        You can now contact the owner of the property
        you're interested in.
      </p>

      <div style="
        background:#f1f5f9;
        padding:18px;
        border-radius:8px;
      ">
        <p><strong>Property:</strong> ${escapeHtml(propertyTitle)}</p>
        <p><strong>Owner:</strong> ${escapeHtml(ownerName)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(ownerPhone)}</p>
      </div>
    `;
  } else if (recipientType === "OWNER") {
    if (!buyerName || !buyerEmail || !buyerPhone || !ownerName) {
      throw new Error("Missing owner contact details");
    }

    content = `
      <h2>Your Property Contact Was Revealed!</h2>

      <p>Hello ${escapeHtml(ownerName)},</p>

      <p>A prospective tenant has revealed your contact details.</p>

      <div style="
        background:#f1f5f9;
        padding:18px;
        border-radius:8px;
      ">
        <p><strong>Property:</strong> ${escapeHtml(propertyTitle)}</p>
        <p><strong>Buyer:</strong> ${escapeHtml(buyerName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(buyerEmail)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(buyerPhone)}</p>
      </div>
    `;
  } else {
    throw new Error("Invalid contact recipient type");
  }

  return {
    subject:
      recipientType === "TENANT"
        ? "Owner Contact Details - RentSmart"
        : "A Buyer Is Interested in Your Property - RentSmart",

    html: emailLayout({
      title: "Contact Revealed",
      preheader: "New property contact information is available.",
      content,
    }),
  };
};
