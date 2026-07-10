import { Router } from "express";
import { 
  getAuditLogs, 
  getAnalytics 
} from "./admin.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

// All admin routes require authentication and ADMIN role check
router.use(authenticate, authorize("ADMIN"));

router.get("/audit-logs", getAuditLogs);
router.get("/analytics", getAnalytics);

export default router;
