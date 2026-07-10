export default (sequelize, DataTypes) => {

  const Payment = sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      consultationId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "consultation_id",
      },

      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      currency: {
        type: DataTypes.STRING(10),
        defaultValue: "USD",
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED", "REFUNDED"),
        defaultValue: "PENDING",
        allowNull: false,
      },

      provider: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      providerTransactionId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        field: "provider_transaction_id",
      },

      billingEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "billing_email",
        validate: {
          isEmail: true,
        },
      },

      paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "paid_at",
      },
    },
    {
      tableName: "payments",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["consultation_id"],
        },
        {
          fields: ["status"],
        },
      ],
    }
  );


  Payment.associate = (models) => {

    Payment.belongsTo(models.Consultation, {
      foreignKey: "consultationId",
      as: "consultation",
    });

  };


  return Payment;
};
