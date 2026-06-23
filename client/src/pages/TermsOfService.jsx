import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using RentSmart (rentsmart.fun), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform. These terms apply to all users of the platform — property seekers, property owners, and general visitors.",
  },
  {
    title: "2. About RentSmart",
    content:
      "RentSmart is an online property rental marketplace that connects property owners with potential tenants and buyers. The platform allows users to list rental and sale properties, search and filter listings, communicate with owners via real-time chat, and make payments to access full property contact details. RentSmart does not own, manage, or physically inspect any property listed on the platform.",
  },
  {
    title: "3. User Accounts",
    content:
      "To access certain features of RentSmart — including creating listings, messaging, and making payments — you must register for an account. You agree to provide accurate and complete information during registration and to keep your account credentials secure. You are responsible for all activity that occurs under your account. RentSmart requires email verification before you can create listings or initiate payments.",
  },
  {
    title: "4. Property Listings",
    content:
      "Property owners who list on RentSmart are solely responsible for the accuracy, legality, and authenticity of their listing information, including photos, pricing, location, and property details. RentSmart does not verify the accuracy of listings and is not liable for any disputes arising from misleading or inaccurate listing content. RentSmart reserves the right to remove any listing that violates these terms or platform guidelines.",
  },
  {
    title: "5. Payments",
    content:
      "RentSmart uses Razorpay as its payment gateway for processing transactions. Payments made on the platform are for accessing full property contact details or for promoting a listing. All payment transactions are processed securely by Razorpay and are subject to Razorpay's own terms and conditions. RentSmart does not store your card details or banking information. Payment amounts are displayed clearly before you confirm any transaction.",
  },
  {
    title: "6. Refund Policy",
    content:
      "Payments made to access property contact details or to promote a listing are generally non-refundable once the service has been delivered. If you believe a payment was charged in error or a service was not delivered, please contact us at support@rentsmart.fun within 7 days of the transaction. Refund requests are reviewed on a case-by-case basis.",
  },
  {
    title: "7. Real-Time Messaging",
    content:
      "RentSmart provides a real-time chat feature to facilitate communication between property seekers and owners. Users are expected to communicate respectfully and professionally. You must not use the messaging system to share illegal content, spam, or misleading information. RentSmart reserves the right to review messages in cases of reported abuse and to suspend accounts that violate this policy.",
  },
  {
    title: "8. User Conduct",
    content:
      "You agree not to use RentSmart for any unlawful purpose or in a way that could harm other users. Prohibited conduct includes: posting false or fraudulent property listings, impersonating another person or entity, attempting to gain unauthorized access to other user accounts, scraping or harvesting data from the platform, and using the platform for spam or unsolicited communication.",
  },
  {
    title: "9. Intellectual Property",
    content:
      "All content on RentSmart — including the platform design, codebase, logos, and written content — is the intellectual property of RentSmart. Property photos and listing content uploaded by users remain the property of the respective owners. By uploading content to RentSmart, you grant RentSmart a non-exclusive license to display that content on the platform.",
  },
  {
    title: "10. Disclaimer of Warranties",
    content:
      "RentSmart is provided on an 'as is' basis. We do not guarantee that the platform will be available at all times or that listings are accurate, complete, or up to date. RentSmart is not a party to any rental or sale agreement between users and is not responsible for any outcome of transactions that occur between property seekers and owners.",
  },
  {
    title: "11. Limitation of Liability",
    content:
      "To the fullest extent permitted by law, RentSmart shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to financial loss, property disputes, or loss of data. Your sole remedy for dissatisfaction with the platform is to stop using it.",
  },
  {
    title: "12. Termination",
    content:
      "RentSmart reserves the right to suspend or terminate your account at any time if you are found to be in violation of these Terms of Service. Upon termination, your right to use the platform ceases immediately. Any listings or data associated with your account may be removed.",
  },
  {
    title: "13. Governing Law",
    content:
      "These Terms of Service are governed by the laws of India. Any disputes arising from the use of RentSmart shall be subject to the jurisdiction of the courts of India. By using this platform, you consent to this jurisdiction.",
  },
  {
    title: "14. Changes to Terms",
    content:
      "RentSmart reserves the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated effective date. Continued use of the platform after any changes constitutes your acceptance of the revised terms. We encourage you to review this page periodically.",
  },
];

export default function TermsOfService() {
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
          <h1 style={styles.title}>Terms of Service</h1>
          <p style={styles.subtitle}>
            Please read these terms carefully before using RentSmart. By using
            rentsmart.fun, you agree to the following terms and conditions.
          </p>
          <p style={styles.date}>Effective date: June 2026 · rentsmart.fun</p>
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
            For any questions regarding these terms, contact us at{" "}
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