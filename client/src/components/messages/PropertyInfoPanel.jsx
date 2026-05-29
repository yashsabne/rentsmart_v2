import { useNavigate } from "react-router-dom";

const PropertyInfoPanel = ({ conversation,currentUser }) => {
  const navigate = useNavigate();


if (!currentUser || !conversation) {
  return (
    <>
      <style>
        {`
          .skeleton {
            background: linear-gradient(
              90deg,
              #2a2a2a 25%,
              #3a3a3a 50%,
              #2a2a2a 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 10px;
          }

          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }

          .skeleton-panel {
            padding: 16px;
            color: white;
          }

          .skeleton-title {
            height: 20px;
            width: 120px;
            margin-bottom: 16px;
          }

          .skeleton-image {
            width: 100%;
            height: 180px;
            margin-bottom: 16px;
          }

          .skeleton-text-lg {
            height: 18px;
            width: 70%;
            margin-bottom: 10px;
          }

          .skeleton-text-sm {
            height: 14px;
            width: 50%;
            margin-bottom: 24px;
          }

          .skeleton-user {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }

          .skeleton-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
          }

          .skeleton-user-info {
            flex: 1;
          }

          .skeleton-line {
            height: 12px;
            margin-bottom: 8px;
          }

          .w-60 { width: 60%; }
          .w-40 { width: 40%; }
          .w-30 { width: 30%; }
        `}
      </style>

      <div className="skeleton-panel">
        <div className="skeleton skeleton-title"></div>

        <div className="skeleton skeleton-image"></div>

        <div className="skeleton skeleton-text-lg"></div>
        <div className="skeleton skeleton-text-sm"></div>

        <div className="skeleton skeleton-title"></div>

        <div className="skeleton-user">
          <div className="skeleton skeleton-avatar"></div>
          <div className="skeleton-user-info">
            <div className="skeleton skeleton-line w-60"></div>
            <div className="skeleton skeleton-line w-40"></div>
            <div className="skeleton skeleton-line w-30"></div>
          </div>
        </div>

        <div className="skeleton-user">
          <div className="skeleton skeleton-avatar"></div>
          <div className="skeleton-user-info">
            <div className="skeleton skeleton-line w-60"></div>
            <div className="skeleton skeleton-line w-40"></div>
            <div className="skeleton skeleton-line w-30"></div>
          </div>
        </div>
      </div>
    </>
  );
}

  const myUserId = currentUser.id; 
  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== myUserId
  );
  const myProfile = conversation.participants.find(
    (p) => p.userId === myUserId
  );

  
  return (
    <div className="prop-panel">
      <div className="prop-panel__section">
        <h3 className="prop-panel__section-title">Property</h3>

        {conversation.propertyImage && (
          
          <img
            onClick={() => navigate(`/details/${conversation.propertyId}`)}
            style={{ cursor: "pointer" }}
            src={conversation.propertyImage}
            alt={conversation.propertyTitle}
            className="prop-panel__image"
            
          />
        )}

        <div className="prop-panel__details">
          <h4 className="prop-panel__property-title">
            {conversation.propertyTitle}
          </h4>

          {conversation.propertyLocation && (
            <p className="prop-panel__location">
              📍 {conversation.propertyLocation}
            </p>
          )}
        </div>

     
      </div>

      <div className="prop-panel__section">
        <h3 className="prop-panel__section-title">Participants</h3>

        {[otherParticipant, myProfile].filter(Boolean).map((p) => (
          <div key={p.email} className="prop-panel__participant">
            <div className="prop-panel__participant-avatar">
              {p.avatar ? (
                <img src={p.avatar} alt={p.fullName} />
              ) : (
                <span>{p.fullName?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="prop-panel__participant-info">
              <div className="prop-panel__participant-name">
                {p.fullName}
                {p.userId === myUserId && (
                  <span className="prop-panel__you-badge"> (You)</span>
                )}
              </div> 
              <div className="prop-panel__participant-email">{p.email}</div>
              <div className="prop-panel__participant-role ">
                {p.role === "owner" ? "Owner" : "Buyer"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyInfoPanel;
