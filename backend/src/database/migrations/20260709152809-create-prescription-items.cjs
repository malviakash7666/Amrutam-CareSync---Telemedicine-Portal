'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('prescription_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      prescription_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'prescriptions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      drug_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      dosage: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      frequency: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      duration: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.dropTable('prescription_items');
  }
};
