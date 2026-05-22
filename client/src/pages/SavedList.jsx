// pages/SavedPropertiesPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/reuse/Navbar"; 
import { C } from "../constants";
import { API } from "../../apis";

const SavedPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedProperties();
  }, []);

  const fetchSavedProperties = async () => {
    try {
      const token = localStorage.getItem("token");

      // Guest user
      if (!token) {
        const localSaved =
          JSON.parse(localStorage.getItem("savedProperties")) || [];

        if (localSaved.length === 0) {
          setProperties([]);
          setLoading(false);
          return;
        }

        const query = localSaved.join(",");

        const res = await fetch(
          `${API.PROPERTY}/api/property/by-ids?ids=${query}`
        );

        const data = await res.json();

        setProperties(data.properties || []);
        setLoading(false);
        return;
      }
 
      const res = await fetch(
        `${API.PROPERTY}/api/saved/properties`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setProperties(data.properties || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: C.cream
      }}>
        <Navbar scrolled />
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
          color: C.inkMuted
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
// SavedPropertiesPage.jsx

<div style={{ width: "100%" }}>
  {/* Saved Properties */}
<div style={{
  background: C.white,
  borderRadius: 20,
  border: `1px solid ${C.border}`,
  boxShadow: C.cardShadow,
  maxHeight: 520,
  display: "flex",
  flexDirection: "column"
}}>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 24px 16px",
      borderBottom: `1px solid ${C.border}`,
      flexShrink: 0
    }}>
      <div>
        <div style={{
          fontSize: 15,
          fontWeight: 600,
          color: C.ink
        }}>
          Saved Properties
        </div>

        <div style={{
          fontSize: 12,
          color: C.inkMuted,
          marginTop: 2
        }}>
          Total: <b>{properties.length}</b>
        </div>
      </div>
    </div>

    <div style={{ overflowY: "auto", flex: 1 }}>

      {properties.length === 0 ? (

        <div style={{
          padding: "48px 24px",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: 36,
            marginBottom: 12
          }}>
            ❤️
          </div>

          <div style={{
            fontSize: 14,
            fontWeight: 500,
            color: C.ink,
            marginBottom: 6
          }}>
            No saved properties yet
          </div>

          <div style={{
            fontSize: 12,
            color: C.inkMuted
          }}>
            Save properties to view them later
          </div>
        </div>

      ) : (

        properties.map((p, i) => {
          const isRent =
            p.buyOrSell?.toLowerCase() === "rent";

          return (
            <div
              key={p._id}

              onClick={() =>
                navigate(`/details/${p._id}`)
              }

              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 24px",

                borderBottom:
                  i < properties.length - 1
                    ? `1px solid ${C.border}`
                    : "none",

                transition: "background .2s",
                cursor: "pointer"
              }}

              onMouseEnter={e =>
                e.currentTarget.style.background =
                  C.cream
              }

              onMouseLeave={e =>
                e.currentTarget.style.background =
                  "transparent"
              }
            >

              {/* Thumbnail */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                overflow: "hidden",
                flexShrink: 0,
                background: C.border
              }}>
                {p.listingPhotos?.[0] ? (
                  <img
                    src={p.listingPhotos[0]}
                    alt={p.title}

                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22
                  }}>
                    🏠
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{
                flex: 1,
                minWidth: 0
              }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.ink,
                  marginBottom: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {p.title}
                </div>

                <div style={{
                  fontSize: 11,
                  color: C.inkMuted
                }}>
                  📍 {p.address?.city}
                </div>

                <div style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 5
                }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 100,

                    background:
                      isRent
                        ? C.greenBg
                        : C.redBg,

                    color:
                      isRent
                        ? C.green
                        : C.red
                  }}>
                    {p.buyOrSell}
                  </span>

                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 100,
                    background: C.border,
                    color: C.inkMuted
                  }}>
                    {p.category}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div style={{
                textAlign: "right",
                flexShrink: 0
              }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.ink,
                  marginBottom: 5
                }}>
                  ₹{Number(p.price)
                    .toLocaleString("en-IN")}

                  {p.buyOrSell !== "Sell" &&
                    "/mo"}
                </div>

                <div style={{
                  fontSize: 11,
                  color: C.inkMuted
                }}>
                  🛏 {p.details?.bedroomCount ?? 0}
                  &nbsp;
                  🚿 {p.details?.bathroomCount ?? 0}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>

</div>
  );
};

export default SavedPropertiesPage;