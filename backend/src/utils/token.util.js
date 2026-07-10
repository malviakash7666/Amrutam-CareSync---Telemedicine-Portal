import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "default_access_secret_caresync_2026";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_caresync_2026";

/**
 * Generates an Access Token valid for 15 minutes.
 * @param {Object} user - The user instance or object containing user info.
 * @returns {string} Signed JWT Access Token.
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

/**
 * Generates a Refresh Token valid for 7 days.
 * @param {Object} user - The user instance or object containing user info.
 * @returns {string} Signed JWT Refresh Token.
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Verifies an Access Token.
 * @param {string} token - The access token to verify.
 * @returns {Object} Decoded payload.
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

/**
 * Verifies a Refresh Token.
 * @param {string} token - The refresh token to verify.
 * @returns {Object} Decoded payload.
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
