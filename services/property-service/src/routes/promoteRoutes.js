import express from "express"; 
import { activatePromotion } from "../controllers/promoteController.js"; 
const router = express.Router();

router.post("/listings/promote/activate", activatePromotion);


export default router;