import User from "../models/User.js";

export const requireVerifiedEmail = async (req,res,next) => {
 try {

  const user = await User.findById(req.user.id);

  if(!user) return res.status(404).json({ message:"User not found" });

  if(!user.isEmailVerified){
   return res.status(403).json({
    success:false,
    message:"Please verify your email first"
   });
  }

  next();

 } catch(err){
  res.status(500).json({ error:err.message });
 }
};