import { Router } from "express";
import { 
  issuePrescription, 
  getPrescriptionById 
} from "./prescription.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

// Note: endpoint maps both routes
router.post("/consultations/:id", authorize("DOCTOR"), issuePrescription);
router.get("/:id", getPrescriptionById);

export default router;
