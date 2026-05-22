// =============================================
// components/ShareButton.jsx
// =============================================

import React, { useState } from "react";
import { API } from "../../apis";

const ShareButton = ({
  listing,
  currentUser,
  C,
}) => {

  const [loading, setLoading] =
    useState(false);

  // ===================================
  // HANDLE SHARE
  // ===================================

  const handleShare = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      // generate share link
      const response = await fetch(
        `${API.PROPERTY}/api/share/create-link`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            listingId: listing?._id,
            userId: currentUser?._id,
          }),
        }
      );

      const data =
        await response.json();

      if (!data.success) {
        alert(
          "Failed to generate link"
        );
        return;
      }

      const shareUrl =
        data.shareUrl;

      // native mobile share
      if (navigator.share) {

        await navigator.share({
          title:
            listing?.title ||
            "RentSmart Property",

          text:
            "Check out this property 🏡",

          url: shareUrl,
        });

      }

      // desktop fallback
      else {

        await navigator.clipboard.writeText(
          shareUrl
        );

        alert(
          "Share link copied!"
        );

      }

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={loading}
      style={{
        flex: 1,
        padding: "11px",
        borderRadius: 12,
        border: `1.5px solid ${C.border}`,
        background: "none",
        color: C.ink,
        fontSize: 13,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        transition: "all .2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background =
          C.ink;

        e.currentTarget.style.color =
          "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background =
          "none";

        e.currentTarget.style.color =
          C.ink;
      }}
    >
      {loading
        ? "Sharing..."
        : "🔗 Share"}
    </button>
  );
};

export default ShareButton;