export default (sequelize, DataTypes) => {

  const Consultation = sequelize.define(
    "Consultation",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      patientId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "patient_id",
      },

      doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "doctor_id",
      },

      slotId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: "slot_id",
      },

      status: {
        type: DataTypes.ENUM("SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"),
        defaultValue: "SCHEDULED",
        allowNull: false,
      },

      reasonForVisit: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "reason_for_visit",
      },

      diagnosisNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "diagnosis_notes",
      },

      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "deleted_at",
      },
    },
    {
      tableName: "consultations",
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        {
          fields: ["patient_id", "status"],
        },
        {
          fields: ["doctor_id", "status"],
        },
        {
          fields: ["created_at"],
        },
      ],
    }
  );


  Consultation.associate = (models) => {

    Consultation.belongsTo(models.User, {
      foreignKey: "patientId",
      as: "patient",
    });

    Consultation.belongsTo(models.Doctor, {
      foreignKey: "doctorId",
      as: "doctor",
    });

    Consultation.belongsTo(models.AvailabilitySlot, {
      foreignKey: "slotId",
      as: "slot",
    });

    Consultation.hasOne(models.Prescription, {
      foreignKey: "consultationId",
      as: "prescription",
    });

    Consultation.hasMany(models.Payment, {
      foreignKey: "consultationId",
      as: "payments",
    });

  };


  return Consultation;
};
