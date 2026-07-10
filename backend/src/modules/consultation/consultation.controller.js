import db from "../../database/models/index.js";

/**
 * Book an Appointment / Create Consultation
 * POST /api/consultations
 */
export const bookConsultation = async (req, res, next) => {
  const { slotId, reasonForVisit } = req.body;

  if (!slotId) {
    return res.status(400).json({
      success: false,
      message: "Please provide a slotId.",
    });
  }

  const patientId = req.user.id;
  const transaction = await db.sequelize.transaction();

  try {
    // 1. Pessimistic Lock on the slot to prevent race conditions during booking
    const slot = await db.AvailabilitySlot.findOne({
      where: { id: slotId, status: "AVAILABLE" },
      lock: transaction.LOCK.UPDATE, // SELECT FOR UPDATE
      transaction,
    });

    if (!slot) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "The requested slot is already booked or unavailable.",
      });
    }

    // 2. Mark the slot as BOOKED
    await slot.update(
      { status: "BOOKED", version: slot.version + 1 },
      { transaction }
    );

    // 3. Create the Consultation
    const consultation = await db.Consultation.create(
      {
        patientId,
        doctorId: slot.doctorId,
        slotId,
        status: "SCHEDULED",
        reasonForVisit: reasonForVisit || null,
      },
      { transaction }
    );

    // Fetch Doctor's consultation fee to initialize Payment
    const doctor = await db.Doctor.findByPk(slot.doctorId, { transaction });
    if (!doctor) {
      throw new Error("Associated practitioner profile not found.");
    }

    // 4. Create pending payment record
    const payment = await db.Payment.create(
      {
        consultationId: consultation.id,
        amount: doctor.consultationFee,
        currency: "INR",
        status: "PENDING",
        provider: "STRIPE",
      },
      { transaction }
    );

    // 5. Write Compliance Audit Log
    await db.AuditLog.create(
      {
        userId: patientId,
        action: "CREATE",
        resourceType: "CONSULTATION",
        resourceId: consultation.id,
        newValues: { slotId, status: "SCHEDULED" },
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Consultation booked successfully. Payment is pending.",
      consultation,
      payment,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Booking Error:", error);
    next(error);
  }
};

/**
 * List consultations for the active user (Patient or Doctor)
 * GET /api/consultations
 */
export const getConsultations = async (req, res, next) => {
  try {
    const whereClause = {};

    if (req.user.role === "PATIENT") {
      whereClause.patientId = req.user.id;
    } else if (req.user.role === "DOCTOR") {
      if (!req.user.doctor) {
        return res.status(403).json({
          success: false,
          message: "Doctor profile missing.",
        });
      }
      whereClause.doctorId = req.user.doctor.id;
    }

    const consultations = await db.Consultation.findAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: "patient",
          attributes: ["id", "email"],
          include: [{ model: db.Profile, as: "profile" }],
        },
        {
          model: db.Doctor,
          as: "doctor",
          include: [
            {
              model: db.User,
              as: "user",
              attributes: ["id", "email"],
              include: [{ model: db.Profile, as: "profile" }],
            },
          ],
        },
        {
          model: db.AvailabilitySlot,
          as: "slot",
        },
        {
          model: db.Payment,
          as: "payments",
        },
        {
          model: db.Prescription,
          as: "prescription",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      consultations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Transition consultation lifecycle state (Doctor Only)
 * POST /api/consultations/:id/status
 */
export const updateConsultationStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW

  const allowedStatuses = ["IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Choose from: ${allowedStatuses.join(", ")}`,
    });
  }

  if (!req.user.doctor) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only practitioners can transition lifecycle status.",
    });
  }

  const transaction = await db.sequelize.transaction();

  try {
    const consultation = await db.Consultation.findOne({
      where: { id, doctorId: req.user.doctor.id },
      transaction,
    });

    if (!consultation) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Consultation not found or not assigned to you.",
      });
    }

    const oldStatus = consultation.status;

    // Update status
    await consultation.update({ status }, { transaction });

    // If cancelled, return the availability slot back to AVAILABLE
    if (status === "CANCELLED") {
      await db.AvailabilitySlot.update(
        { status: "AVAILABLE" },
        { where: { id: consultation.slotId }, transaction }
      );
    }

    // Write Compliance Audit Log
    await db.AuditLog.create(
      {
        userId: req.user.id,
        action: "UPDATE",
        resourceType: "CONSULTATION",
        resourceId: consultation.id,
        oldValues: { status: oldStatus },
        newValues: { status },
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: `Consultation status transitioned from ${oldStatus} to ${status}.`,
      consultation,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
