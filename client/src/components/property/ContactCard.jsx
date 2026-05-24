// src/components/property/ContactCard.jsx

import OwnerCard from "./OwnerCard";
import PaymentUnlockCard from "./PaymentUnlockCard";
import MessageBox from "./MessageBox";

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
}) => {
  return (
    <div> 
      {isOwner ? (
        <OwnerCard owner={owner} C={C} property_id={property._id} />
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