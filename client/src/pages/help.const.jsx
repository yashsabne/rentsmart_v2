
import { useState } from "react";
import { styles } from "./help.const";

export function CategoryCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...styles.catCard,
        boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
        borderColor: hovered ? "#c0392b" : "#e8e4de",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.catIcon}>{icon}</div>
      <p style={styles.catTitle}>{title}</p>
      <p style={styles.catDesc}>{desc}</p>
      <span style={styles.catLink}>Learn More →</span>
    </div>
  );
}

export function FaqAccordion({ faqs }) {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {faqs.map((item, i) => (
        <div key={i} style={styles.faqItem}>
          <div style={styles.faqQ} onClick={() => setOpen(open === i ? null : i)}>
            <p style={styles.faqQText}>{item.q}</p>
            <span
              style={{
                ...styles.faqChevron,
                transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▾
            </span>
          </div>
          {open === i && <p style={styles.faqA}>{item.a}</p>}
        </div>
      ))}
    </div>
  );
}

export function GuideCard({ label, title, steps }) {
  return (
    <div style={styles.guideCard}>
      <div style={styles.guideHeader}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#c0392b",
            margin: "0 0 4px",
            fontFamily: "'Georgia', serif",
          }}
        >
          {label}
        </p>
        <p style={styles.guideTitle}>{title}</p>
      </div>
      <div style={styles.guideSteps}>
        {steps.map((s, i) => (
          <div key={i} style={styles.guideStep}>
            <div style={styles.guideStepNum}>{i + 1}</div>
            <div style={styles.guideStepText}>
              <p style={styles.guideStepTitle}>{s.title}</p>
              <p style={styles.guideStepDesc}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TroubleCard({ icon, title, causes, solutions }) {
  return (
    <div style={styles.troubleCard}>
      <p style={styles.troubleTitle}>
        <span>{icon}</span> {title}
      </p>
      <div style={styles.troubleSection}>
        <p style={styles.troubleLabel}>Common Causes</p>
        <ul style={styles.troubleList}>
          {causes.map((c, i) => (
            <li key={i} style={styles.troubleListItem}>
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  color: "#c0392b",
                  fontWeight: "700",
                }}
              >
                ·
              </span>
              {c}
            </li>
          ))}
        </ul>
      </div>
      <div style={styles.troubleSection}>
        <p style={styles.troubleLabel}>Suggested Solutions</p>
        <ul style={styles.troubleList}>
          {solutions.map((s, i) => (
            <li key={i} style={styles.troubleListItem}>
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  color: "#27ae60",
                  fontWeight: "700",
                }}
              >
                ✓
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}