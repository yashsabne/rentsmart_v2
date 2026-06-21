import { useEffect, useState } from "react";
import { API } from "../../apis";
import { trackInteraction } from "../utils/trackInteraction";

const SaveButton = ({ id }) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      const localSaved = JSON.parse(localStorage.getItem("savedProperties")) || [];
      setIsSaved(localSaved.includes(id));
      return;
    }

    fetchSavedStatus();
  }, [id]);

  const fetchSavedStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API.PROPERTY}/api/saved/ids`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setIsSaved(data.savedIds.includes(id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSave = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");

    if (!token) {
      let localSaved = JSON.parse(localStorage.getItem("savedProperties")) || [];
      if (localSaved.includes(id)) {
        localSaved = localSaved.filter((item) => item !== id);
        setIsSaved(false);
      } else {
        localSaved.push(id);
        setIsSaved(true);
      }
      localStorage.setItem("savedProperties", JSON.stringify(localSaved));
      return;
    }

    try {
      setIsSaved((prev) => !prev);
      const res = await fetch(`${API.PROPERTY}/api/saved/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        setIsSaved((prev) => !prev);
      } else {
        trackInteraction(id, "SAVE");
      }
    } catch (err) {
      console.error(err);
      setIsSaved((prev) => !prev);
    }
  };

  return (
    <button
      onClick={toggleSave}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      aria-label={isSaved ? "Remove from saved" : "Save property"}
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.92)",
        border: "none",
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all .2s",
      }}
    >
      {isSaved ? "❤️" : "🤍"}
    </button>
  );
};

export default SaveButton;