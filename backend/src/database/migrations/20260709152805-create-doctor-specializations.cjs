'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('doctor_specializations', {
      doctor_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      specialization_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'specializations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('doctor_specializations');
  }
};
