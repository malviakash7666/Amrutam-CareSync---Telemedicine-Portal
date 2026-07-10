'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      consultation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'consultations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(10),
        defaultValue: 'USD',
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'),
        defaultValue: 'PENDING',
        allowNull: false
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      provider_transaction_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      billing_email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      paid_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('payments', ['consultation_id']);
    await queryInterface.addIndex('payments', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_status";');
  }
};
