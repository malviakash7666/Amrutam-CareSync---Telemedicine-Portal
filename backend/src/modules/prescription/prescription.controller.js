import crypto from "crypto";
import db from "../../database/models/index.js";

const PRESCRIPTION_SIGNING_SECRET = process.env.PRESCRIPTION_SECRET || "default_prescription_signing_hash_secret_2026";

/**
 * Issue a Digital Prescription for a Consultation (Doctor Only)
 * POST /api/consultations/:id/prescription
 */
export const issuePrescription = async (req, res, next) => {
  const { id } = req.params; // Consultation ID
  const { notes, items } = req.body; // Items: [{ drugName, dosage, frequency, duration, instructions }]

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide an array of prescribed medications (items).",
    });
  }

  if (!req.user.doctor) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only registered doctors can issue prescriptions.",
    });
  }

  const transaction = await db.sequelize.transaction();

  try {
    // 1. Verify consultation belongs to this doctor
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

    // Check if prescription already exists for this consultation
    const existingPrescription = await db.Prescription.findOne({
      where: { consultationId: id },
      transaction,
    });

    if (existingPrescription) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "A prescription has already been issued for this consultation.",
      });
    }

    // 2. Generate Cryptographic Hash Signature for Integrity & Non-Repudiation (HIPAA Compliance)
    const payload = JSON.stringify({
      consultationId: id,
      patientId: consultation.patientId,
      doctorId: req.user.doctor.id,
      items: items.map(i => ({ name: i.drugName, dose: i.dosage, freq: i.frequency })),
      timestamp: Date.now(),
    });

    const digitalSignature = crypto
      .createHmac("sha256", PRESCRIPTION_SIGNING_SECRET)
      .update(payload)
      .digest("hex");

    // 3. Create Prescription Record
    const prescription = await db.Prescription.create(
      {
        consultationId: id,
        patientId: consultation.patientId,
        doctorId: req.user.doctor.id,
        notes: notes || null,
        digitalSignature,
        issuedAt: new Date(),
      },
      { transaction }
    );

    // 4. Create Prescription Items
    const createdItems = [];
    for (const item of items) {
      const { drugName, dosage, frequency, duration, instructions } = item;

      if (!drugName || !dosage || !frequency || !duration) {
        throw new Error("Medication details missing (drugName, dosage, frequency, duration).");
      }

      const newItem = await db.PrescriptionItem.create(
        {
          prescriptionId: prescription.id,
          drugName,
          dosage,
          frequency,
          duration,
          instructions: instructions || null,
        },
        { transaction }
      );
      createdItems.push(newItem);
    }

    // 5. Transition consultation status to COMPLETED
    await consultation.update({ status: "COMPLETED" }, { transaction });

    // 6. Write Compliance Audit Log
    await db.AuditLog.create(
      {
        userId: req.user.id,
        action: "CREATE",
        resourceType: "PRESCRIPTION",
        resourceId: prescription.id,
        newValues: { consultationId: id, signature: digitalSignature },
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Digital prescription issued and signed successfully.",
      prescription: {
        ...prescription.toJSON(),
        items: createdItems,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Prescription Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to issue prescription.",
    });
  }
};

/**
 * Fetch Prescription Details (Patient & Doctor)
 * GET /api/prescriptions/:id
 */
export const getPrescriptionById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const prescription = await db.Prescription.findOne({
      where: { id },
      include: [
        {
          model: db.PrescriptionItem,
          as: "items",
        },
        {
          model: db.Consultation,
          as: "consultation",
          attributes: ["id", "status", "reasonForVisit"],
        },
        {
          model: db.User,
          as: "patient",
          attributes: ["id", "email"],
          include: [{ model: db.Profile, as: "profile" }],
        },
      ],
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
    }

    // Authorize: Patient who owns the prescription or Doctor who issued it
    const isPatientOwner = prescription.patientId === req.user.id;
    const isDoctorIssuer = req.user.doctor && prescription.doctorId === req.user.doctor.id;

    if (!isPatientOwner && !isDoctorIssuer && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not authorized to view this prescription.",
      });
    }

    return res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    next(error);
  }
};
