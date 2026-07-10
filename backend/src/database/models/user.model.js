export default (sequelize, DataTypes) => {

  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "password_hash",
      },

      role: {
        type: DataTypes.ENUM("PATIENT", "DOCTOR", "ADMIN"),
        defaultValue: "PATIENT",
        allowNull: false,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        field: "is_active",
      },

      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "deleted_at",
      },
    },
    {
      tableName: "users",
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );


  User.associate = (models) => {

    User.hasOne(models.Profile, {
      foreignKey: "userId",
      as: "profile",
    });

    User.hasOne(models.Doctor, {
      foreignKey: "userId",
      as: "doctor",
    });

    User.hasMany(models.Consultation, {
      foreignKey: "patientId",
      as: "consultations",
    });

    User.hasMany(models.AuditLog, {
      foreignKey: "userId",
      as: "auditLogs",
    });

  };


  return User;
};
