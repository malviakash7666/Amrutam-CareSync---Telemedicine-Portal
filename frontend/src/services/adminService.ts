import { apiCall } from "../authenticator/api";

export interface AuditLogRecord {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    email: string;
    role: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface SystemAnalytics {
  users: {
    totalPatients: number;
    totalDoctors: number;
  };
  consultations: {
    totalCount: number;
    completedCount: number;
    statusBreakdown: Array<{ status: string; count: string }>;
  };
  revenue: {
    totalEarnings: number | string;
  };
}

export const adminService = {
  /**
   * Retrieve compliance audit logs (Admin Only)
   */
  getAuditLogs: async (filters: {
    action?: string;
    resourceType?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ total: number; logs: AuditLogRecord[] }> => {
    const query = new URLSearchParams();
    if (filters.action) query.append("action", filters.action);
    if (filters.resourceType) query.append("resourceType", filters.resourceType);
    if (filters.userId) query.append("userId", filters.userId);
    if (filters.limit) query.append("limit", String(filters.limit));
    if (filters.offset) query.append("offset", String(filters.offset));

    const res = await apiCall(`/admin/audit-logs?${query.toString()}`);
    return {
      total: res.total || 0,
      logs: res.logs || [],
    };
  },

  /**
   * Fetch aggregate system analytics dashboard metrics (Admin Only)
   */
  getAnalytics: async (): Promise<SystemAnalytics> => {
    const res = await apiCall("/admin/analytics");
    return res.analytics;
  },
};
