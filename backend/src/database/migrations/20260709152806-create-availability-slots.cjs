'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('availability_slots', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('AVAILABLE', 'RESERVED', 'BOOKED', 'BLOCKED'),
        defaultValue: 'AVAILABLE',
        allowNull: false
      },
      version: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
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

    // Add performance indexes
    await queryInterface.addIndex('availability_slots', ['doctor_id', 'start_time', 'status']);
    await queryInterface.addIndex('availability_slots', ['start_time', 'end_time']);

    // Add PostgreSQL GIST Exclusion Constraint to prevent overlapping slot bookings for the same doctor
    await queryInterface.sequelize.query(`
      ALTER TABLE availability_slots
      ADD CONSTRAINT no_overlapping_slots
      EXCLUDE USING gist (
        doctor_id WITH =,
        tstzrange(start_time, end_time) WITH &&
      )
      WHERE (deleted_at IS NULL);
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('availability_slots');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_availability_slots_status";');
  }
};
