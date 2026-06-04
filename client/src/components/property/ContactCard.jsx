// src/components/property/ContactCard.jsx

import OwnerCard from "./OwnerCard";
import PaymentUnlockCard from "./PaymentUnlockCard";
import MessageBox from "./MessageBox";
import { useEffect } from "react";

const ContactCard = ({
  isOwner,
  owner,
  property,
  currentUser,
  message,
  setMessage,
  sent,
  handleSend,
  C,
  token,  
  onPropertyUpdate 
}) => {
 
 
  return (
    <div> 
      {isOwner ? (
        <OwnerCard owner={owner} C={C} property={property}  token={token} onPropertyUpdate={onPropertyUpdate} />
      ) : (
        <>
        <PaymentUnlockCard
          owner={owner}
          property={property}
          currentUser={currentUser}
          C={C}
        />
        <MessageBox
        owner={owner}
        property={property}
        message={message}
        setMessage={setMessage}
        sent={sent}
        handleSend={handleSend}
        C={C}
      />

      </>
      )}

   
    </div>
  );
};

export default ContactCard;