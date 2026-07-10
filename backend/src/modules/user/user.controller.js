import bcrypt from "bcryptjs";
import db from "../../database/models/index.js";
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} from "../../utils/token.util.js";

/**
 * Controller handling User Authentication & Lifecycle
 */

/**
 * Signup / Register a new user
 * POST /api/users/signup
 */
export const signup = async (req, res, next) => {
  const { email, password, role, firstName, lastName, phone } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: "Please provide email, password, firstName, and lastName.",
    });
  }

  const transaction = await db.sequelize.transaction();

  try {
    // 1. Check if user already exists
    const existingUser = await db.User.findOne({
      where: { email },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create User record
    const user = await db.User.create(
      {
        email,
        passwordHash,
        role: role || "PATIENT",
        isActive: true,
      },
      { transaction }
    );

    // 4. Create User Profile
    const profile = await db.Profile.create(
      {
        userId: user.id,
        firstName,
        lastName,
        phone: phone || null,
      },
      { transaction }
    );

    // If role is DOCTOR, pre-create empty Doctor metadata
    let doctor = null;
    if (role === "DOCTOR") {
      doctor = await db.Doctor.create(
        {
          userId: user.id,
          experienceYears: 0,
          consultationFee: 0.00,
          licenseNumber: `TEMP-LIC-${user.id.slice(0, 8).toUpperCase()}`,
          isVerified: false,
        },
        { transaction }
      );
    }

    await transaction.commit();

    // 5. Generate Auth Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 6. Set Cookies
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove password hash from response payload
    const userResponse = user.toJSON();
    delete userResponse.passwordHash;

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        ...userResponse,
        profile,
        doctor,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Signup Error:", error);
    next(error);
  }
};

/**
 * Log in an existing user
 * POST /api/users/login
 */
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password.",
    });
  }

  try {
    // 1. Find User by email
    const user = await db.User.findOne({
      where: { email, isActive: true },
      include: [
        { model: db.Profile, as: "profile" },
        { model: db.Doctor, as: "doctor" },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 2. Compare Passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3. Generate Auth Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 4. Set HTTP-Only cookies
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove password hash from response
    const userResponse = user.toJSON();
    delete userResponse.passwordHash;

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      user: userResponse,
    });
  } catch (error) {
    console.error("Login Error:", error);
    next(error);
  }
};

/**
 * Log out user (Clear auth cookies)
 * POST /api/users/logout
 */
export const logout = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current logged-in user profile details (User, Profile, Doctor)
 * GET /api/users/me
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user has already been loaded with associations in auth middleware
    const userResponse = req.user.toJSON();
    delete userResponse.passwordHash;

    return res.status(200).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually refresh tokens (if needed by client)
 * POST /api/users/refresh
 */
export const refresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token is missing. Please log in again.",
    });
  }

  try {
    // 1. Verify Refresh Token
    const decoded = verifyRefreshToken(refreshToken);

    // 2. Fetch active user
    const user = await db.User.findOne({
      where: { id: decoded.id, isActive: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or suspended.",
      });
    }

    // 3. Issue new Access Token
    const newAccessToken = generateAccessToken(user);

    // 4. Set Cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token. Please login again.",
    });
  }
};
