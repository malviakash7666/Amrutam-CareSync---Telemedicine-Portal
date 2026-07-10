export default (sequelize, DataTypes) => {

  const PrescriptionItem = sequelize.define(
    "PrescriptionItem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      prescriptionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "prescription_id",
      },

      drugName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "drug_name",
      },

      dosage: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      frequency: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      duration: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "prescription_items",
      timestamps: true,
      underscored: true,
    }
  );


  PrescriptionItem.associate = (models) => {

    PrescriptionItem.belongsTo(models.Prescription, {
      foreignKey: "prescriptionId",
      as: "prescription",
    });

  };


  return PrescriptionItem;
};
