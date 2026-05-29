import { useRef } from "react";
import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../../apis";

const VerifyEmailPage = () => {

  const { token } = useParams();

  const called = useRef(false);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {

    if (called.current) {
      return;
    }

    called.current = true;

    const verify = async () => {

      try {

        const res = await fetch(
          `${API.AUTH}/api/auth/verify-email/${token}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        setSuccess(true);
        setMessage(data.message);

      } catch (err) {

        setSuccess(false);

        setMessage(
          err.message || "Verification failed"
        );

      } finally {

        setLoading(false);

      }

    };

    verify();

  }, [token]);

  return (
    <div
      style={{
        minHeight:"100vh",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        background:"#f8fafc"
      }}
    >
      <div
        style={{
          width:500,
          background:"#fff",
          borderRadius:20,
          padding:40,
          textAlign:"center",
          boxShadow:"0 10px 40px rgba(0,0,0,.08)"
        }}
      >

        {loading && (
          <>
            <h2>Verifying Email...</h2>
            <p>Please wait</p>
          </>
        )}

        {!loading && success && (
          <>
            <div style={{fontSize:60}}>✅</div>

            <h2>Email Verified</h2>

            <p>{message}</p>

            <a
              href="/dashboard"
              style={{
                display:"inline-block",
                marginTop:20,
                padding:"12px 24px",
                background:"#111827",
                color:"#fff",
                borderRadius:12,
                textDecoration:"none"
              }}
            >
              Go To Dashboard
            </a>
          </>
        )}

        {!loading && !success && (
          <>
            <div style={{fontSize:60}}>❌</div>

            <h2>Verification Failed</h2>

            <p>{message}</p>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyEmailPage;
