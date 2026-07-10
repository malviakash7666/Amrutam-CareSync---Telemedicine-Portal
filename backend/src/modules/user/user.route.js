import { Router } from "express";
import { 
  signup, 
  login, 
  logout, 
  getMe, 
  refresh 
} from "./user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);

// Protected routes
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

export default router;
