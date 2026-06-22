import express from "express"; 
import { activatePromotion } from "../controllers/promoteController.js"; 
import { verifyInternalSecret } from "../middleware/verifyInternalSecret.js";
const router = express.Router();

 
router.post("/listings/promote/activate",verifyInternalSecret,activatePromotion);
export default router;