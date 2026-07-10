'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('prescriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      consultation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'consultations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      patient_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      issued_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      digital_signature: {
        type: Sequelize.STRING(512),
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

    await queryInterface.addIndex('prescriptions', ['patient_id']);
    await queryInterface.addIndex('prescriptions', ['doctor_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('prescriptions');
  }
};
