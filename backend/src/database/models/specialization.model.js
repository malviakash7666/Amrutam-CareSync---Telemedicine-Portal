export default (sequelize, DataTypes) => {

  const Specialization = sequelize.define(
    "Specialization",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "specializations",
      timestamps: true,
      underscored: true,
    }
  );


  Specialization.associate = (models) => {

    Specialization.belongsToMany(models.Doctor, {
      through: models.DoctorSpecialization,
      foreignKey: "specializationId",
      otherKey: "doctorId",
      as: "doctors",
    });

  };


  return Specialization;
};
