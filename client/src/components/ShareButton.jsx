import { useState } from "react";
import { API } from "../../apis";
import { trackInteraction } from "../utils/trackInteraction";

const ShareButton = ({ listing, currentUser }) => {
  const [loading, setLoading] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const response = await fetch(`${API.PROPERTY}/api/share/create-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing?._id,
          userId: currentUser?._id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert("Failed to generate link");
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: listing?.title || "RentSmart Property",
          text: "Check out this property 🏡",
          url: data.shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(data.shareUrl);
        alert("Share link copied!");
      }

      trackInteraction(listing?._id, "SHARE");
    } catch (err) {
      console.error(err);
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
        padding: "11px",
        borderRadius: 10,
        border: "0.5px solid rgba(0,0,0,.08)",
        background: "#fff",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {loading ? "Sharing..." : "🔗 Share"}
    </button>
  );
};

export default ShareButton;