'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Enable extensions needed for UUID generation and range check exclusion constraints
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS btree_gist;');

    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('PATIENT', 'DOCTOR', 'ADMIN'),
        defaultValue: 'PATIENT',
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
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

    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  }
};
