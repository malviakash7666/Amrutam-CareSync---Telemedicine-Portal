import { Router } from "express";
import { 
  processCheckout, 
  refundPayment 
} from "./payment.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/checkout", authorize("PATIENT"), processCheckout);
router.post("/:id/refund", authorize("ADMIN"), refundPayment);

export default router;
