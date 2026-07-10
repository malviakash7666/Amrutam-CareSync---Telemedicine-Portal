export default (sequelize, DataTypes) => {

  const Profile = sequelize.define(
    "Profile",
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

      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "first_name",
      },

      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "last_name",
      },

      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "date_of_birth",
      },

      gender: {
        type: DataTypes.ENUM("MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"),
        allowNull: true,
      },

      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      emergencyContact: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: "emergency_contact",
      },

      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "deleted_at",
      },
    },
    {
      tableName: "profiles",
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        {
          fields: ["last_name", "first_name"],
        },
      ],
    }
  );


  Profile.associate = (models) => {

    Profile.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

  };


  return Profile;
};
