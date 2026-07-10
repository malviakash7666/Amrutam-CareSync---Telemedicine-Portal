import { Router } from "express";
import { 
  getDoctors, 
  getDoctorById, 
  publishAvailability, 
  getDoctorAvailability 
} from "./doctor.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", getDoctors);
router.get("/:id", getDoctorById);
router.get("/:id/availability", getDoctorAvailability);

// Protected routes
router.post("/availability", authenticate, authorize("DOCTOR"), publishAvailability);

export default router;
