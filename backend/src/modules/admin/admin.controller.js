import db from "../../database/models/index.js";

/**
 * Fetch compliance audit trail history (Admin Only)
 * GET /api/admin/audit-logs
 */
export const getAuditLogs = async (req, res, next) => {
  const { action, resourceType, userId, limit = 50, offset = 0 } = req.query;

  try {
    const whereClause = {};
    if (action) whereClause.action = action;
    if (resourceType) whereClause.resourceType = resourceType;
    if (userId) whereClause.userId = userId;

    const { count, rows: logs } = await db.AuditLog.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "email", "role"],
          include: [{ model: db.Profile, as: "profile", attributes: ["firstName", "lastName"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      total: count,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Compile Admin Analytics (Admin Only)
 * GET /api/admin/analytics
 */
export const getAnalytics = async (req, res, next) => {
  try {
    // 1. Total Counts
    const totalPatients = await db.User.count({ where: { role: "PATIENT" } });
    const totalDoctors = await db.Doctor.count();
    const totalConsultations = await db.Consultation.count();
    const completedConsultations = await db.Consultation.count({ where: { status: "COMPLETED" } });

    // 2. Financial aggregations
    const earningsSum = await db.Payment.sum("amount", { where: { status: "SUCCESS" } });

    // 3. Consultations by status breakdown
    const statusBreakdown = await db.Consultation.findAll({
      attributes: ["status", [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"]],
      group: ["status"],
    });

    return res.status(200).json({
      success: true,
      analytics: {
        users: {
          totalPatients,
          totalDoctors,
        },
        consultations: {
          totalCount: totalConsultations,
          completedCount: completedConsultations,
          statusBreakdown,
        },
        revenue: {
          totalEarnings: earningsSum || 0.00,
        },
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    next(error);
  }
};
