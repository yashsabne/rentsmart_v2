
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { API } from "../../../apis";

const PaymentUnlockCard = ({ owner, property, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [ownerPhone, setOwnerPhone] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API.PAYMENT}/api/payment/check-access?listingId=${property._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.accessGranted) {
          setUnlocked(true);
          setOwnerPhone(data.ownerPhone);
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkAccess();
  }, [property._id]);



  const handleUnlockPhone = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const orderRes = await fetch(`${API.PAYMENT}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: property._id,
          ownerId: owner._id,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(orderData.message || "Payment failed.");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "RentSmart",
        description: "Unlock Owner Contact",
        order_id: orderData.order.id,

        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API.PAYMENT}/api/payment/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              toast.error(verifyData.message || "Payment verification failed");
              return;
            }

            if (verifyData.success) {
              setUnlocked(true);
              setOwnerPhone(verifyData.payment.ownerPhone);
              toast.success("Phone Number Unlocked Successfully");
            }
          } catch (err) {
            console.error(err);
            toast.error("Payment verification failed");
          }
        },
        theme: { color: "#111827" },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 24, borderRadius: 28, padding: 24, background: "#fff", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 6 }}>
            Contact Property Owner
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            Unlock verified contact details securely and connect directly with the property owner.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 20, background: "#fafafa", border: "1px solid rgba(0,0,0,0.05)", marginBottom: 20 }}>
        <div style={{ width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(135deg,#f5d365,#fda085)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: "#111" }}>
          {owner?.firstName?.[0] || "O"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
            {owner?.name || `${owner?.firstName || ""} ${owner?.lastName || ""}`}
          </div>
          <div style={{ fontSize: 13, color: unlocked ? "#111827" : "#6b7280", fontWeight: unlocked ? 700 : 400 }}>
            {unlocked && ownerPhone ? <a href={`tel:${ownerPhone}`} style={{ color: "inherit", textDecoration: "none" }}>{ownerPhone}</a> : "Phone Hidden"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <button
          onClick={handleUnlockPhone}
          disabled={loading || unlocked}
          style={{ width: "100%", padding: 17, borderRadius: 18, border: "none", background: unlocked ? "#10b981" : "linear-gradient(135deg,#111827,#1f2937)", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 15 }}
        >
          {loading ? "Processing..." : unlocked ? "Phone Number Unlocked" : "Reveal Phone Number • ₹39"}
        </button>
      </div>

      <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 18, background: "#fafafa", border: "1px solid rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.7 }}>
          Secure one-time payment unlock. Contact details become instantly accessible after successful payment.
        </div>
      </div>
    </div>
  );
};

export default PaymentUnlockCard;