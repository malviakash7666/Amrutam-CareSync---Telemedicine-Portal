export default (sequelize, DataTypes) => {

  const DoctorSpecialization = sequelize.define(
    "DoctorSpecialization",
    {
      doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        field: "doctor_id",
        references: {
          model: "doctors",
          key: "id",
        },
      },

      specializationId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        field: "specialization_id",
        references: {
          model: "specializations",
          key: "id",
        },
      },
    },
    {
      tableName: "doctor_specializations",
      timestamps: true,
      underscored: true,
    }
  );


  DoctorSpecialization.associate = (models) => {

    DoctorSpecialization.belongsTo(models.Doctor, {
      foreignKey: "doctorId",
      as: "doctor",
    });

    DoctorSpecialization.belongsTo(models.Specialization, {
      foreignKey: "specializationId",
      as: "specialization",
    });

  };


  return DoctorSpecialization;
};
