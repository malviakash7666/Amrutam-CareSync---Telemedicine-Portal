export default (sequelize, DataTypes) => {

  const AuditLog = sequelize.define(
    "AuditLog",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "user_id",
      },

      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      resourceType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "resource_type",
      },

      resourceId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "resource_id",
      },

      oldValues: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: "old_values",
      },

      newValues: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: "new_values",
      },

      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: "ip_address",
      },

      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "user_agent",
      },
    },
    {
      tableName: "audit_logs",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["resource_type", "resource_id"],
        },
        {
          fields: ["user_id"],
        },
        {
          fields: ["created_at"],
        },
      ],
    }
  );


  AuditLog.associate = (models) => {

    AuditLog.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

  };


  return AuditLog;
};
