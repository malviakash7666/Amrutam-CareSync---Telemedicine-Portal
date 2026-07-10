export default (sequelize, DataTypes) => {

  const Doctor = sequelize.define(
    "Doctor",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: "user_id",
      },

      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      experienceYears: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "experience_years",
      },

      consultationFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "consultation_fee",
      },

      licenseNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: "license_number",
      },

      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: "is_verified",
      },

      ratingAvg: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.00,
        allowNull: false,
        field: "rating_avg",
      },

      ratingCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        field: "rating_count",
      },

      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "deleted_at",
      },
    },
    {
      tableName: "doctors",
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        {
          fields: ["rating_avg"],
        },
      ],
    }
  );


  Doctor.associate = (models) => {

    Doctor.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    Doctor.hasMany(models.AvailabilitySlot, {
      foreignKey: "doctorId",
      as: "availabilitySlots",
    });

    Doctor.hasMany(models.Consultation, {
      foreignKey: "doctorId",
      as: "consultations",
    });

    Doctor.belongsToMany(models.Specialization, {
      through: models.DoctorSpecialization,
      foreignKey: "doctorId",
      otherKey: "specializationId",
      as: "specializations",
    });

  };


  return Doctor;
};
