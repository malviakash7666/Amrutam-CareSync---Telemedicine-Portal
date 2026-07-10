'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      gender: {
        type: Sequelize.ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      emergency_contact: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addIndex('profiles', ['last_name', 'first_name']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('profiles');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_profiles_gender";');
  }
};
