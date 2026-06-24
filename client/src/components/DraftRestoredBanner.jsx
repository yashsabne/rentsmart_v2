import { useState } from "react";
import { C } from "../constants"; 

/**
 * Shown at the top of the form when a draft was restored.
 * Props:
 *   onDiscard — clears draft and resets form to blank
 */
export default function DraftRestoredBanner({ onDiscard }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "11px 18px",
      borderRadius: 10,
      background: "#FFF8E7",
      border: `1px solid ${C.gold}`,
      marginBottom: 24,
      flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ fontSize: 16 }}>📋</span>
        <span style={{ fontSize: 13, color: "#92670A", fontWeight: 500 }}>
          Your draft has been restored — pick up where you left off.
        </span>
      </div>

      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <button
          onClick={() => setVisible(false)}
          style={{
            fontSize: 12, fontWeight: 600, color: "#92670A",
            background: "none", border: `1px solid ${C.gold}`,
            borderRadius: 8, padding: "5px 12px", cursor: "pointer",
          }}
        >
          Keep Draft
        </button>
        <button
          onClick={onDiscard}
          style={{
            fontSize: 12, fontWeight: 500, color: C.muted,
            background: "none", border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "5px 12px", cursor: "pointer",
          }}
        >
          Start Fresh
        </button>
      </div>
    </div>
  );
}