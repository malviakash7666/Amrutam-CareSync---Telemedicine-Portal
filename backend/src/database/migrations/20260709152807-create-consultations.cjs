'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('consultations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
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
      slot_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'availability_slots',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      status: {
        type: Sequelize.ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'),
        defaultValue: 'SCHEDULED',
        allowNull: false
      },
      reason_for_visit: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      diagnosis_notes: {
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
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addIndex('consultations', ['patient_id', 'status']);
    await queryInterface.addIndex('consultations', ['doctor_id', 'status']);
    await queryInterface.addIndex('consultations', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('consultations');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_consultations_status";');
  }
};
