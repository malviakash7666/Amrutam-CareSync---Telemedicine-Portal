import bcrypt from "bcryptjs";
import db from "./src/database/models/index.js";

const seed = async () => {
  console.log("Starting CareSync Database Seeding... 🚀");
  const transaction = await db.sequelize.transaction();

  try {
    // 1. Clear existing data to prevent duplicate primary keys / constraints
    console.log("Cleaning existing records...");
    await db.PrescriptionItem.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await db.Prescription.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await db.Payment.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await db.Consultation.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await db.AvailabilitySlot.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await db.DoctorSpecialization.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await db.Specialization.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await db.Doctor.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await db.Profile.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await db.AuditLog.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await db.User.destroy({ where: {}, truncate: true, cascade: true, transaction });

    // 2. Hash default password
    const passwordHash = await bcrypt.hash("password123", 10);

    // 3. Create Specializations
    console.log("Seeding Specializations...");
    const specs = [
      { name: "General Medicine", description: "Primary care, wellness, and preventive medicine." },
      { name: "Pediatrics", description: "Medical care for infants, children, and adolescents." },
      { name: "Dermatology", description: "Skin, hair, nail diagnostic and therapeutic care." },
      { name: "Cardiology", description: "Heart and cardiovascular disorders medicine." },
      { name: "Psychiatry", description: "Mental health and behavioral counseling." },
    ];
    const createdSpecs = await db.Specialization.bulkCreate(specs, { transaction, returning: true });

    // 4. Seed Patients (5)
    console.log("Seeding Patients...");
    for (let i = 1; i <= 5; i++) {
      const user = await db.User.create(
        {
          email: `patient${i}@caresync.com`,
          passwordHash,
          role: "PATIENT",
        },
        { transaction }
      );

      await db.Profile.create(
        {
          userId: user.id,
          firstName: `Patient`,
          lastName: `${i}`,
          phoneNumber: `987654320${i}`,
        },
        { transaction }
      );
    }

    // 5. Seed Doctors (5)
    console.log("Seeding Doctors...");
    const doctorBios = [
      "Experienced physician committed to family medicine and proactive health screenings.",
      "Dedicated pediatrician prioritizing child milestones and gentle therapeutic plans.",
      "Certified dermatologist specializing in advanced acne care and skin cancer checks.",
      "Cardiovascular specialist focusing on stroke prevention and cardiac rehab.",
      "Compassionate psychiatrist offering integrated counseling and drug management.",
    ];

    const fees = [500, 600, 800, 1000, 750];
    const experiences = [8, 12, 15, 20, 10];

    for (let i = 1; i <= 5; i++) {
      const user = await db.User.create(
        {
          email: `doctor${i}@caresync.com`,
          passwordHash,
          role: "DOCTOR",
        },
        { transaction }
      );

      await db.Profile.create(
        {
          userId: user.id,
          firstName: `Doctor`,
          lastName: `${i}`,
          phoneNumber: `998877660${i}`,
        },
        { transaction }
      );

      const doctor = await db.Doctor.create(
        {
          userId: user.id,
          bio: doctorBios[i - 1],
          experienceYears: experiences[i - 1],
          consultationFee: fees[i - 1],
          licenseNumber: `LIC-DOC-2026-00${i}`,
          isVerified: true,
          ratingAvg: parseFloat((4.2 + i * 0.15).toFixed(2)),
          ratingCount: 10 + i * 4,
        },
        { transaction }
      );

      // Link Doctor to a Specialization
      await db.DoctorSpecialization.create(
        {
          doctorId: doctor.id,
          specializationId: createdSpecs[i - 1].id,
        },
        { transaction }
      );

      // Seed 3 upcoming availability slots for each doctor
      const baseDate = new Date();
      for (let s = 1; s <= 3; s++) {
        const startTime = new Date(baseDate);
        startTime.setDate(baseDate.getDate() + s); // s days in the future
        startTime.setHours(9 + i + s, 0, 0, 0); // distinct hours

        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 1); // 1-hour slot

        await db.AvailabilitySlot.create(
          {
            doctorId: doctor.id,
            startTime,
            endTime,
            status: "AVAILABLE",
            version: 1,
          },
          { transaction }
        );
      }
    }

    // 6. Seed Admins (5)
    console.log("Seeding Admins...");
    for (let i = 1; i <= 5; i++) {
      const user = await db.User.create(
        {
          email: `admin${i}@caresync.com`,
          passwordHash,
          role: "ADMIN",
        },
        { transaction }
      );

      await db.Profile.create(
        {
          userId: user.id,
          firstName: `Admin`,
          lastName: `${i}`,
          phoneNumber: `990011220${i}`,
        },
        { transaction }
      );
    }

    await transaction.commit();
    console.log("CareSync Database seeded successfully! 🎉");
    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seed();
