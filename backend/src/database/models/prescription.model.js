export default (sequelize, DataTypes) => {

  const Prescription = sequelize.define(
    "Prescription",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      consultationId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: "consultation_id",
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

      issuedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        field: "issued_at",
      },

      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      digitalSignature: {
        type: DataTypes.STRING(512),
        allowNull: false,
        field: "digital_signature",
      },

      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "deleted_at",
      },
    },
    {
      tableName: "prescriptions",
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        {
          fields: ["patient_id"],
        },
        {
          fields: ["doctor_id"],
        },
      ],
    }
  );


  Prescription.associate = (models) => {

    Prescription.belongsTo(models.Consultation, {
      foreignKey: "consultationId",
      as: "consultation",
    });

    Prescription.belongsTo(models.Doctor, {
      foreignKey: "doctorId",
      as: "doctor",
    });

    Prescription.belongsTo(models.User, {
      foreignKey: "patientId",
      as: "patient",
    });

    Prescription.hasMany(models.PrescriptionItem, {
      foreignKey: "prescriptionId",
      as: "items",
    });

  };


  return Prescription;
};
