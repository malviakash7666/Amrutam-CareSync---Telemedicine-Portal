import db from "../../database/models/index.js";

const { Op } = db.Sequelize;

/**
 * Get list of verified doctors with filters
 * GET /api/doctors
 */
export const getDoctors = async (req, res, next) => {
  const { specialization, feeMin, feeMax, experienceMin, search } = req.query;

  try {
    const doctorWhere = { isVerified: true };
    const userWhere = {};
    const specWhere = {};

    if (feeMin || feeMax) {
      doctorWhere.consultationFee = {};
      if (feeMin) doctorWhere.consultationFee[Op.gte] = parseFloat(feeMin);
      if (feeMax) doctorWhere.consultationFee[Op.lte] = parseFloat(feeMax);
    }

    if (experienceMin) {
      doctorWhere.experienceYears = { [Op.gte]: parseInt(experienceMin, 10) };
    }

    if (specialization) {
      specWhere.name = specialization;
    }

    if (search) {
      userWhere[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
      ];
      // Note: Full text searching name from Profiles
    }

    const doctors = await db.Doctor.findAll({
      where: doctorWhere,
      include: [
        {
          model: db.User,
          as: "user",
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
          include: [
            {
              model: db.Profile,
              as: "profile",
            },
          ],
        },
        {
          model: db.Specialization,
          as: "specializations",
          where: Object.keys(specWhere).length > 0 ? specWhere : undefined,
          through: { attributes: [] }, // Exclude join table details from output
        },
      ],
      order: [["ratingAvg", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.error("GetDoctors Error:", error);
    next(error);
  }
};

/**
 * Get doctor by ID
 * GET /api/doctors/:id
 */
export const getDoctorById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const doctor = await db.Doctor.findOne({
      where: { id },
      include: [
        {
          model: db.User,
          as: "user",
          include: [
            {
              model: db.Profile,
              as: "profile",
            },
          ],
        },
        {
          model: db.Specialization,
          as: "specializations",
          through: { attributes: [] },
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish Availability Slots (Doctor Only)
 * POST /api/doctors/availability
 */
export const publishAvailability = async (req, res, next) => {
  const { slots } = req.body; // Array of slots: [{ startTime, endTime }]

  if (!slots || !Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide an array of slots with startTime and endTime.",
    });
  }

  // Doctor ID corresponds to the doctor record linked to req.user.id
  if (!req.user || !req.user.doctor) {
    return res.status(403).json({
      success: false,
      message: "Profile metadata is missing or user is not a registered doctor.",
    });
  }

  const doctorId = req.user.doctor.id;
  const transaction = await db.sequelize.transaction();

  try {
    const createdSlots = [];

    for (const slot of slots) {
      const { startTime, endTime } = slot;

      if (!startTime || !endTime) {
        throw new Error("Each slot must contain startTime and endTime.");
      }

      if (new Date(startTime) <= new Date()) {
        throw new Error("Availability slot cannot be set in the past.");
      }

      const newSlot = await db.AvailabilitySlot.create(
        {
          doctorId,
          startTime,
          endTime,
          status: "AVAILABLE",
          version: 1,
        },
        { transaction }
      );
      createdSlots.push(newSlot);
    }

    // Write Compliance Audit Log
    await db.AuditLog.create(
      {
        userId: req.user.id,
        action: "CREATE",
        resourceType: "AVAILABILITY_SLOTS",
        resourceId: doctorId,
        newValues: { slotCount: slots.length },
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Availability slots published successfully.",
      slots: createdSlots,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("PublishAvailability Error:", error);
    
    // Check if error is due to exclusion constraint
    if (error.name === "SequelizeUniqueConstraintError" || error.parent?.code === "23P01") {
      return res.status(409).json({
        success: false,
        message: "Overlap detected: One or more slots clash with your existing calendar.",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to publish slots.",
    });
  }
};

/**
 * Get active availability slots for a doctor
 * GET /api/doctors/:id/availability
 */
export const getDoctorAvailability = async (req, res, next) => {
  const { id } = req.params;

  try {
    const slots = await db.AvailabilitySlot.findAll({
      where: {
        doctorId: id,
        status: "AVAILABLE",
        startTime: {
          [Op.gt]: new Date(),
        },
      },
      order: [["startTime", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      slots,
    });
  } catch (error) {
    next(error);
  }
};
