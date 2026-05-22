import crypto from "crypto";

export const generateAdvancedShareToken = () => {
 
  const random =
    crypto.randomBytes(8).toString("hex");
 
  const time =
    Date.now().toString(36);
 
  return `rs_${time}${random}`;
};