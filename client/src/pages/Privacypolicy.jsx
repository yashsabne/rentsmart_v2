import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    title: "1. Overview",
    content:
      "This Privacy Policy explains how RentSmart (rentsmart.fun) collects, uses, stores, and protects your personal information when you use our platform. By registering or using RentSmart, you consent to the data practices described in this policy. We are committed to handling your data responsibly and transparently.",
  },
  {
    title: "2. Information We Collect",
    content:
      "When you register on RentSmart, we collect your first name, last name, email address, phone number, city, and property preferences (such as 1BHK, 2BHK, Villa, etc.). When you create a property listing, we collect the listing details you provide including property photos, location, price, and description. When you use our chat feature, your messages are stored to maintain conversation history. When you make a payment, transaction metadata (order ID, payment status) is recorded — we do not store card or banking details.",
  },
  {
    title: "3. How We Use Your Information",
    content:
      "We use your information to operate and improve the RentSmart platform. Specifically: your email is used for account verification, password resets, and platform notifications; your city and preferences are used to generate personalized property recommendations; your listing data is displayed to other users searching for properties; your chat messages are stored to maintain conversation continuity between buyers and owners; and your payment records are maintained for transaction history and access control.",
  },
  {
    title: "4. Email Communications",
    content:
      "RentSmart sends transactional emails for account verification, password reset requests, and important platform notifications. These emails are sent via Nodemailer using our platform email. We do not send unsolicited marketing emails. You can contact us to opt out of non-essential communications at any time.",
  },
  {
    title: "5. Payment Data",
    content:
      "All payment processing on RentSmart is handled by Razorpay, a PCI-DSS compliant payment gateway. RentSmart does not store your credit card number, debit card number, CVV, UPI ID, or net banking credentials. We only store transaction metadata such as the Razorpay order ID, payment ID, and payment status to verify access and maintain your payment history.",
  },
  {
    title: "6. Property Photos & Media",
    content:
      "Photos uploaded with property listings are stored on Cloudinary, a cloud media management service. By uploading photos to RentSmart, you confirm that you own the rights to those images or have permission to use them. Cloudinary operates under its own privacy and data handling policies.",
  },
  {
    title: "7. Real-Time Chat & Messages",
    content:
      "Messages exchanged through RentSmart's real-time chat feature are stored in our database to maintain conversation history between buyers and property owners. Messages are tied to your user account and the specific property listing. We do not read or monitor private messages unless required to investigate a reported abuse case.",
  },
  {
    title: "8. Data Storage & Security",
    content:
      "Your data is stored in MongoDB Atlas, a cloud database service with encryption at rest and in transit. All communication between your browser and RentSmart is encrypted via HTTPS. We use JSON Web Tokens (JWT) for secure session management and bcrypt for password hashing — your passwords are never stored in plain text. We also implement Redis-based rate limiting to protect against brute-force attacks on login and registration.",
  },
  {
    title: "9. Third-Party Services",
    content:
      "RentSmart integrates with the following third-party services, each operating under their own privacy policies: Razorpay (payment processing), Cloudinary (image storage), MongoDB Atlas (database hosting), Vercel (frontend hosting and analytics), and Render (backend service hosting). We encourage you to review their respective privacy policies.",
  },
  {
    title: "10. Cookies & Analytics",
    content:
      "RentSmart uses Vercel Analytics and Vercel Speed Insights to collect anonymized, aggregated usage data such as page views and performance metrics. These tools do not identify individual users. We do not use advertising cookies or third-party tracking pixels. Your authentication session is managed via a JWT stored in your browser's local storage.",
  },
  {
    title: "11. Data Sharing",
    content:
      "RentSmart does not sell, rent, or trade your personal information to third parties. Your data is only shared with the third-party services listed in Section 9 to the extent necessary to operate the platform. Property listing information (excluding your private contact details) is visible to other users as part of the platform's core functionality. Full contact details are only revealed to users who have completed a payment for that listing.",
  },
  {
    title: "12. Your Rights",
    content:
      "You have the right to access the personal data we hold about you, request corrections to inaccurate data, request deletion of your account and associated data, and withdraw consent for non-essential data processing. To exercise any of these rights, please contact us at yashsabne39@gmail.com. We will respond to your request within a reasonable timeframe.",
  },
  {
    title: "13. Data Retention",
    content:
      "We retain your account data for as long as your account is active on RentSmart. Property listings are retained until deleted by the owner or removed by RentSmart. Payment records are retained for a minimum of one year for transaction integrity purposes. Chat messages are retained as long as the associated conversation exists.",
  },
  {
    title: "14. Children's Privacy",
    content:
      "RentSmart is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has registered on the platform, please contact us and we will promptly remove the account.",
  },
  {
    title: "15. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this page periodically. Continued use of RentSmart after changes are posted constitutes your acceptance of the revised policy.",
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <button onClick={() => navigate(-1)} style={styles.back}>
          ← Back
        </button>

        <div style={styles.header}>
          <span style={styles.eyebrow}>Legal</span>
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.subtitle}>
            RentSmart takes your privacy seriously. This policy explains exactly
            what data we collect, why we collect it, and how it is protected.
          </p>
          <p style={styles.date}>Effective date: June 2026 · rentsmart.fun</p>
        </div>

        <div style={styles.divider} />

        <div style={styles.highlights}>
          {[
            { icon: "🔒", text: "Passwords are bcrypt hashed" },
            { icon: "💳", text: "No card data stored — Razorpay handles it" },
            { icon: "🖼️", text: "Photos stored on Cloudinary" },
            { icon: "📊", text: "Anonymous analytics only" },
          ].map((h, i) => (
            <div key={i} style={styles.highlight}>
              <span style={styles.highlightIcon}>{h.icon}</span>
              <span style={styles.highlightText}>{h.text}</span>
            </div>
          ))}
        </div>

        <div style={styles.divider} />

        <div style={styles.sections}>
          {sections.map((s, i) => (
            <div key={i} style={styles.section}>
              <h2 style={styles.sectionTitle}>{s.title}</h2>
              <p style={styles.sectionText}>{s.content}</p>
            </div>
          ))}
        </div>

        <div style={styles.divider} />

        <div style={styles.footer}>
          <p style={styles.footerText}>
            For privacy-related questions or data requests, contact us at{" "}
            <a href="mailto:yashsabne39@gmail.com" style={styles.link}>
              yashsabne39@gmail.com
            </a>
          </p>
          <button onClick={() => navigate(-1)} style={styles.backBottom}>
            ← Go back
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#fafafa",
    color: "#1a1a1a",
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    padding: "60px 20px 80px",
  },
  container: {
    maxWidth: 680,
    margin: "0 auto",
  },
  back: {
    background: "none",
    border: "none",
    fontSize: 13,
    color: "#888",
    cursor: "pointer",
    padding: 0,
    marginBottom: 40,
    letterSpacing: 0.2,
  },
  header: {
    marginBottom: 36,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#aaa",
    display: "block",
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 600,
    letterSpacing: -0.5,
    margin: "0 0 14px",
    color: "#111",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    lineHeight: 1.7,
    margin: "0 0 10px",
  },
  date: {
    fontSize: 12,
    color: "#bbb",
    margin: 0,
  },
  divider: {
    height: 1,
    backgroundColor: "#ebebeb",
    margin: "36px 0",
  },
  highlights: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  highlight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    padding: "8px 14px",
  },
  highlightIcon: {
    fontSize: 14,
  },
  highlightText: {
    fontSize: 12,
    color: "#555",
    fontWeight: 500,
  },
  sections: {
    display: "flex",
    flexDirection: "column",
    gap: 36,
  },
  section: {},
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#111",
    margin: "0 0 10px",
    letterSpacing: 0.1,
  },
  sectionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 1.8,
    margin: 0,
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  footerText: {
    fontSize: 13,
    color: "#888",
    margin: 0,
  },
  link: {
    color: "#555",
    borderBottom: "1px solid #ddd",
    textDecoration: "none",
  },
  backBottom: {
    background: "none",
    border: "none",
    fontSize: 13,
    color: "#888",
    cursor: "pointer",
    padding: 0,
    width: "fit-content",
  },
};