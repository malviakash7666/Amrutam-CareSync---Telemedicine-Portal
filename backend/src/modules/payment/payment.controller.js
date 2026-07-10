import db from "../../database/models/index.js";

/**
 * Process Consultation Checkout / Payment (Patient Only)
 * POST /api/payments/checkout
 */
export const processCheckout = async (req, res, next) => {
  const { consultationId, billingEmail } = req.body;

  if (!consultationId) {
    return res.status(400).json({
      success: false,
      message: "Please provide consultationId.",
    });
  }

  const transaction = await db.sequelize.transaction();

  try {
    // 1. Fetch PENDING payment record linked to the consultation
    const payment = await db.Payment.findOne({
      where: { consultationId, status: "PENDING" },
      include: [
        {
          model: db.Consultation,
          as: "consultation",
          where: { patientId: req.user.id }, // Security constraint: Patient owns the consultation
        },
      ],
      transaction,
    });

    if (!payment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Pending payment not found for this consultation.",
      });
    }

    const providerTransactionId = `ch_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

    // 2. Mark payment as SUCCESS
    await payment.update(
      {
        status: "SUCCESS",
        providerTransactionId,
        billingEmail: billingEmail || req.user.email,
        paidAt: new Date(),
      },
      { transaction }
    );

    // 3. Write Compliance Audit Log
    await db.AuditLog.create(
      {
        userId: req.user.id,
        action: "UPDATE",
        resourceType: "PAYMENT",
        resourceId: payment.id,
        newValues: { status: "SUCCESS", transactionId: providerTransactionId },
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully.",
      payment,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Refund Payment (Admin Only)
 * POST /api/payments/:id/refund
 */
export const refundPayment = async (req, res, next) => {
  const { id } = req.params; // Payment ID

  const transaction = await db.sequelize.transaction();

  try {
    const payment = await db.Payment.findOne({
      where: { id, status: "SUCCESS" },
      transaction,
    });

    if (!payment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Successful payment record not found for refund eligibility.",
      });
    }

    // Update payment status to REFUNDED
    await payment.update({ status: "REFUNDED" }, { transaction });

    // Write Compliance Audit Log
    await db.AuditLog.create(
      {
        userId: req.user.id,
        action: "UPDATE",
        resourceType: "PAYMENT",
        resourceId: payment.id,
        oldValues: { status: "SUCCESS" },
        newValues: { status: "REFUNDED" },
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Payment refunded successfully.",
      payment,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
