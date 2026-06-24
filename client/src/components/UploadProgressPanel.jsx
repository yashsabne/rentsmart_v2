import { useEffect, useRef, useState } from "react";

// ─── Keyframe injector (runs once) ────────────────────────────────────────────
// Since we use inline styles, we inject only the keyframes we can't do inline.
function useKeyframes() {
    useEffect(() => {
        const id = "upload-panel-keyframes";
        if (document.getElementById(id)) return;
        const style = document.createElement("style");
        style.id = id;
        style.textContent = `
      @keyframes shimmer {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
      @keyframes pulse-dot {
        0%, 100% { opacity: 1;   transform: scale(1);    }
        50%       { opacity: 0.4; transform: scale(0.75); }
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0);   }
      }
      @keyframes checkPop {
        0%   { transform: scale(0);   }
        80%  { transform: scale(1.2); }
        100% { transform: scale(1);   }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0);   }
        50%       { transform: translateY(-3px); }
      }
      @keyframes spin {
         from { transform: rotate(0deg); }
         to   { transform: rotate(360deg); }
      }
    `;
        document.head.appendChild(style);
    }, []);
}

const C = {
    ink: "#1A1A1A",
    white: "#FFFFFF",
    cream: "#F5F3EE",
    muted: "#6B6B6B",
    light: "#ADADAD",
    border: "#E5E2DC",
    green: "#3A7D5C",
    greenBg: "#EAF4EE",
    gold: "#C49A3C",
    goldBg: "#FBF5E6",
    red: "#C0392B",
    redBg: "#FDF0EE",
};

function barColor(pct) {
    if (pct >= 100) return C.green;
    if (pct > 60) return "#1D9E75";
    if (pct > 30) return "#5DCAA5";
    return C.light;
}

// ─── Single thumbnail in the strip ───────────────────────────────────────────
function ThumbItem({ item, index, isUploaded, isUploading }) {
    return (
        <div
            style={{
                position: "relative",
                width: 44,
                height: 40,
                borderRadius: 8,
                overflow: "hidden",
                flexShrink: 0,
                border: `1.5px solid ${isUploaded ? C.green : C.border}`,
                transition: "border-color .3s",
            }}
        >
            {/* actual thumbnail */}
            <img
                src={item.preview}
                alt={`Photo ${index + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />

            {/* dark overlay when pending */}
            {!isUploaded && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.35)",
                        transition: "opacity .4s",
                    }}
                />
            )}

            {/* uploading spinner ring */}
            {isUploading && !isUploaded && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTop: "2px solid #fff",
                            animation: "spin 0.8s linear infinite",
                        }}
                    />
                </div>
            )}

            {/* green checkmark when done */}
            {isUploaded && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(58,125,92,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "fadeUp .3s both",
                    }}
                >
                    <svg
                        width="14" height="14" viewBox="0 0 14 14" fill="none"
                        style={{ animation: "checkPop .35s cubic-bezier(.36,.07,.19,.97) both" }}
                    >
                        <path d="M2.5 7L5.5 10L11.5 4" stroke="#fff" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            )}

            {/* "Cover" badge on first photo */}
            {index === 0 && (
                <span
                    style={{
                        position: "absolute",
                        bottom: 3,
                        left: 3,
                        fontSize: 9,
                        fontWeight: 600,
                        padding: "1px 5px",
                        borderRadius: 100,
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        letterSpacing: "0.3px",
                    }}
                >
                    Cover
                </span>
            )}
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * UploadProgressPanel
 *
 * Props:
 *   progress      {number}   0–100
 *   elapsed       {number}   seconds elapsed
 *   isSlow        {boolean}  show slow-connection warning
 *   photoFiles    {Array}    array of { id, preview, file } — your existing photoFiles state
 *   isComplete    {boolean}  true when upload finished (triggers success state)
 */
export default function UploadProgressPanel({
    progress = 0,
    elapsed = 0,
    isSlow = false,
    photoFiles = [],
    isComplete = false,
}) {
    useKeyframes();

    // How many thumbs to show as "done" — scale with progress
    const uploadedCount = isComplete
        ? photoFiles.length
        : Math.floor((progress / 100) * photoFiles.length);

    // Which index is currently uploading (the one right after all done ones)
    const uploadingIndex = isComplete ? -1 : uploadedCount;

    // ── Status copy ────────────────────────────────────────────────────────────
    const statusTitle = isComplete
        ? "All photos uploaded"
        : progress >= 95
            ? "Finalising — almost there…"
            : progress > 0
                ? `Uploading photo ${Math.min(uploadedCount + 1, photoFiles.length)} of ${photoFiles.length}`
                : "Preparing upload…";

    const statusSub = isComplete
        ? `${photoFiles.length} photo${photoFiles.length !== 1 ? "s" : ""} ready for your listing`
        : isSlow
            ? "Slow connection detected — keep this tab open."
            : "Uploading directly to secure cloud storage";

    const pctLabel = `${Math.round(progress)}%`;

    // ── Elapsed string ─────────────────────────────────────────────────────────
    const elapsedStr = elapsed < 60
        ? `${elapsed}s`
        : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;

    return (
        <div
            style={{
                marginTop: 16,
                borderRadius: 14,
                border: `1.5px solid ${isComplete ? C.green : C.border}`,
                background: C.white,
                padding: "18px 20px",
                transition: "border-color .4s",
                animation: "fadeUp .35s both",
                fontFamily: "'DM Sans', sans-serif",
            }}
        >

            {/* ── TOP ROW: icon + label + elapsed + % ─────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>

                {/* Animated icon circle */}
                <div
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: isComplete ? C.greenBg : C.cream,
                        border: `1.5px solid ${isComplete ? C.green : C.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "background .4s, border-color .4s",
                        animation: isComplete ? "none" : "float 2.4s ease-in-out infinite",
                    }}
                >
                    {isComplete ? (
                        // Checkmark
                        <svg
                            width="18" height="18" viewBox="0 0 18 18" fill="none"
                            style={{ animation: "checkPop .4s cubic-bezier(.36,.07,.19,.97) both" }}
                        >
                            <path d="M3 9.5L7 13.5L15 5.5" stroke={C.green} strokeWidth="2.2"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : (
                        // Upload arrow
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                            <path d="M8.5 11V4M8.5 4L5.5 7M8.5 4L11.5 7" stroke={C.muted}
                                strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3 13h11" stroke={C.muted} strokeWidth="1.7" strokeLinecap="round" />
                        </svg>
                    )}
                </div>

                {/* Label + progress bar */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isComplete ? C.green : C.ink }}>
                            {statusTitle}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            <span style={{ fontSize: 11, color: C.light }}>{elapsedStr}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: isComplete ? C.green : C.ink, minWidth: 32, textAlign: "right" }}>
                                {pctLabel}
                            </span>
                        </div>
                    </div>

                    {/* Track */}
                    <div
                        style={{
                            height: 5,
                            borderRadius: 100,
                            background: C.cream,
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        {/* Fill */}
                        <div
                            style={{
                                height: "100%",
                                borderRadius: 100,
                                width: `${progress}%`,
                                background: barColor(progress),
                                transition: "width .5s ease, background .5s ease",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            {/* Shimmer sweep — only while uploading */}
                            {!isComplete && progress > 0 && progress < 100 && (
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
                                        animation: "shimmer 1.5s ease-in-out infinite",
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── THUMBNAIL STRIP ──────────────────────────────────────────────── */}
            {photoFiles.length > 0 && (
                <div
                    style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        marginBottom: 14,
                    }}
                >
                    {photoFiles.map((item, idx) => (
                        <ThumbItem
                            key={item.id}
                            item={item}
                            index={idx}
                            isUploaded={idx < uploadedCount}
                            isUploading={idx === uploadingIndex}
                        />
                    ))}
                </div>
            )}

            {/* ── STATUS BAR ───────────────────────────────────────────────────── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    padding: "9px 12px",
                    borderRadius: 10,
                    background: isComplete ? C.greenBg : C.cream,
                    border: `1px solid ${isComplete ? "#b8dfc9" : C.border}`,
                    transition: "background .4s, border-color .4s",
                }}
            >
                {/* Pulsing dot — stops when complete */}
                <span
                    style={{
                        display: "inline-block",
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: isComplete ? C.green : C.muted,
                        flexShrink: 0,
                        marginTop: 5,
                        animation: isComplete ? "none" : "pulse-dot 1.2s ease-in-out infinite",
                    }}
                />
                <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: isComplete ? C.green : C.ink, margin: "0 0 2px" }}>
                        {statusSub}
                    </p>
                    {!isComplete && (
                        <p style={{ fontSize: 11, color: C.light, margin: 0 }}>
                            {photoFiles.length} photo{photoFiles.length !== 1 ? "s" : ""} selected · keep this tab open
                        </p>
                    )}
                </div>
            </div>

            {/* ── SLOW WARNING ─────────────────────────────────────────────────── */}
            {isSlow && !isComplete && (
                <div
                    style={{
                        marginTop: 12,
                        padding: "12px 14px",
                        borderRadius: 10,
                        background: C.goldBg,
                        border: `1px solid ${C.gold}`,
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        animation: "fadeUp .4s both",
                    }}
                >
                    {/* Wifi-off icon (inline SVG) */}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                        <path d="M1 1l14 14M6.5 6.5A5 5 0 0113.5 9M2.5 9a5 5 0 014-1.9M8 13h.01"
                            stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, margin: "0 0 3px" }}>
                            Taking longer than usual
                        </p>
                        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, margin: 0 }}>
                            This may be due to a slow connection or large file sizes.
                            Please keep this tab open — we'll finish as soon as possible.
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}