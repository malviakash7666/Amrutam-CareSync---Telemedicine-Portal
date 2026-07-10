'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('doctors', {
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
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      experience_years: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      consultation_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      license_number: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      rating_avg: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      rating_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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

    await queryInterface.addIndex('doctors', ['rating_avg']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('doctors');
  }
};
