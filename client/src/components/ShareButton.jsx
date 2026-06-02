// =============================================
// components/ShareButton.jsx
// =============================================

import React, { useState } from "react";
import { API } from "../../apis";
import { C } from "../constants";

const ShareButton = ({
  listing,
  currentUser,
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
   style={{ padding: "11px", borderRadius: 10, border: "0.5px solid rgba(0,0,0,.08)", background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
      
    >
      {loading
        ? "Sharing..."
        : "🔗 Share"}
    </button>


 
  );
};

export default ShareButton;