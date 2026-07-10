import db from "../database/models/index.js";
import { 
  verifyAccessToken, 
  verifyRefreshToken, 
  generateAccessToken 
} from "../utils/token.util.js";

/**
 * Authentication Middleware.
 * Verifies JWT access token from cookies. If expired, attempts to silently
 * refresh using the refresh token before continuing or returning 401.
 */
export const authenticate = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Authentication tokens missing. Please login.",
    });
  }

  try {
    // 1. Try verifying Access Token first
    if (accessToken) {
      try {
        const decoded = verifyAccessToken(accessToken);
        
        // Fetch user from DB (including associated Profile or Doctor details)
        const user = await db.User.findOne({
          where: { id: decoded.id, isActive: true },
          include: [
            { model: db.Profile, as: "profile" },
            { model: db.Doctor, as: "doctor" },
          ],
        });

        if (!user) {
          return res.status(401).json({
            success: false,
            message: "User account is inactive or does not exist.",
          });
        }

        req.user = user;
        return next();
      } catch (accessErr) {
        // If it's a token expiration error and refresh token is available, proceed to refresh
        if (accessErr.name !== "TokenExpiredError" || !refreshToken) {
          return res.status(401).json({
            success: false,
            message: "Invalid or expired access token.",
          });
        }
      }
    }

    // 2. Access token is expired/missing, attempt to use Refresh Token
    if (refreshToken) {
      try {
        const decodedRefresh = verifyRefreshToken(refreshToken);

        const user = await db.User.findOne({
          where: { id: decodedRefresh.id, isActive: true },
          include: [
            { model: db.Profile, as: "profile" },
            { model: db.Doctor, as: "doctor" },
          ],
        });

        if (!user) {
          return res.status(401).json({
            success: false,
            message: "User associated with refresh token not found.",
          });
        }

        // Silent Refresh: Generate new Access Token
        const newAccessToken = generateAccessToken(user);

        // Store new access token in Cookie
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000, // 15 minutes
        });

        req.user = user;
        return next();
      } catch (refreshErr) {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again.",
        });
      }
    }
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server authentication error.",
    });
  }
};

/**
 * Authorization Middleware.
 * Enforces Role-Based Access Control (RBAC).
 * @param {...string} allowedRoles - Roles allowed to access the route.
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden: Insufficient permissions.",
      });
    }

    next();
  };
};
