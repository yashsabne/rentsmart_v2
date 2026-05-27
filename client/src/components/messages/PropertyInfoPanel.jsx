import { useNavigate } from "react-router-dom";

const PropertyInfoPanel = ({ conversation,currentUser }) => {
  const navigate = useNavigate();

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
