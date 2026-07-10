import { Router } from "express";
import { 
  bookConsultation, 
  getConsultations, 
  updateConsultationStatus 
} from "./consultation.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

// All consultation routes require authentication
router.use(authenticate);

router.post("/", authorize("PATIENT"), bookConsultation);
router.get("/", getConsultations);
router.post("/:id/status", authorize("DOCTOR"), updateConsultationStatus);

export default router;
