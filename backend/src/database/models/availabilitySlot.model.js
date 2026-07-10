export default (sequelize, DataTypes) => {

  const AvailabilitySlot = sequelize.define(
    "AvailabilitySlot",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "doctor_id",
      },

      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "start_time",
      },

      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "end_time",
      },

      status: {
        type: DataTypes.ENUM("AVAILABLE", "RESERVED", "BOOKED", "BLOCKED"),
        defaultValue: "AVAILABLE",
        allowNull: false,
      },

      version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
      },

      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "deleted_at",
      },
    },
    {
      tableName: "availability_slots",
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        {
          fields: ["doctor_id", "start_time", "status"],
        },
        {
          fields: ["start_time", "end_time"],
        },
      ],
    }
  );


  AvailabilitySlot.associate = (models) => {

    AvailabilitySlot.belongsTo(models.Doctor, {
      foreignKey: "doctorId",
      as: "doctor",
    });

    AvailabilitySlot.hasOne(models.Consultation, {
      foreignKey: "slotId",
      as: "consultation",
    });

  };


  return AvailabilitySlot;
};
