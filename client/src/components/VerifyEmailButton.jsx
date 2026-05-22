import { useState } from "react";
import { API } from "../../apis";

const VerifyEmailButton = ({ user, token }) => {

  const [open,setOpen] = useState(false);
  const [loading,setLoading] = useState(false);
  const [sent,setSent] = useState(false);

  const sendVerification = async () => {

    try {

      setLoading(true);

      const res = await fetch(
        `${API.AUTH}/api/auth/resend-verification`,  
        {
          method:"POST",
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      console.log(data)

      if(!res.ok){
        throw new Error(data.message);
      }

      setSent(true);

    } catch(err){
      alert(err.message);
    } finally {
      setLoading(false);
    }

  };

  if(user?.isEmailVerified){
    return (
      <div
        style={{
          padding:"8px 14px",
          borderRadius:999,
          background:"#ECFDF3",
          color:"#027A48",
          fontSize:13,
          fontWeight:600
        }}
      >
        ✓ Verified
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          border:"none",
          background:"#FFF7E6",
          color:"#B54708",
          padding:"10px 16px",
          borderRadius:999,
          fontWeight:600,
          cursor:"pointer"
        }}
      >
        Verify Email
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position:"fixed",
            inset:0,
            background:"rgba(0,0,0,.45)",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            zIndex:9999
          }}
        >
          <div
            onClick={(e)=>e.stopPropagation()}
            style={{
              width:480,
              background:"#fff",
              borderRadius:20,
              padding:28
            }}
          >

            <h2
              style={{
                marginBottom:10,
                color:"#111827"
              }}
            >
              Verify your email
            </h2>

            <p
              style={{
                color:"#6B7280",
                lineHeight:1.7,
                marginBottom:20
              }}
            >
              To create listings, reveal owner contact details and send property inquiries, please verify your email address.
            </p>

            <div
              style={{
                background:"#F9FAFB",
                padding:14,
                borderRadius:12,
                marginBottom:20
              }}
            >
              {user?.email}
            </div>

            {sent ? (
              <div
                style={{
                  background:"#ECFDF3",
                  color:"#027A48",
                  padding:12,
                  borderRadius:12,
                  marginBottom:16
                }}
              >
                Verification email sent successfully. Check your inbox and click the verification link.
              </div>
            ) : null}

            <button
              onClick={sendVerification}
              disabled={loading}
              style={{
                width:"100%",
                border:"none",
                background:"#111827",
                color:"#fff",
                padding:"14px",
                borderRadius:12,
                cursor:"pointer",
                fontWeight:600
              }}
            >
              {loading ? "Sending..." : "Send Verification Email"}
            </button>

          </div>
        </div>
      )}
    </>
  );
};

export default VerifyEmailButton;