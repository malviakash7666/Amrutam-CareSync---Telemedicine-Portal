import React, { useState, useEffect } from "react";
import { useToast } from "../hooks/useToast";
import { adminService } from "../services/adminService";
import type { AuditLogRecord, SystemAnalytics } from "../services/adminService";
import { Users, FileText, IndianRupee, ShieldAlert, BarChart3, Database } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [activeTab, setActiveTab] = useState<"analytics" | "audit">("analytics");

  // Filters for audit log
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await adminService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      toast.error("Failed to load aggregate analytics.");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const { logs: data } = await adminService.getAuditLogs({
        action: actionFilter || undefined,
        resourceType: resourceFilter || undefined,
        limit: 50,
      });
      setLogs(data);
    } catch (err) {
      toast.error("Failed to load audit trail logs.");
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics();
    } else {
      fetchLogs();
    }
  }, [activeTab, actionFilter, resourceFilter]);

  return (
    <div className="flex-1 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-emerald-100/30 px-6 py-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header and tab buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-gray-800">Admin Console</h2>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Monitor systems analytics, track transactions, and perform compliance security checks.
            </p>
          </div>

          <div className="flex gap-1.5 bg-gray-200/50 border border-gray-200 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "analytics"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "audit"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Database className="w-4 h-4" />
              Audit Trail
            </button>
          </div>
        </div>

        {/* Tab contents */}
        {activeTab === "analytics" ? (
          loadingAnalytics ? (
            <div className="text-center py-20 text-gray-500 font-semibold">
              Compiling system aggregates...
            </div>
          ) : analytics ? (
            <div className="flex flex-col gap-8">
              {/* Statistic Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xs font-extrabold text-gray-400 uppercase">Total Patients</span>
                    <span className="text-2xl font-black text-gray-800">{analytics.users.totalPatients}</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xs font-extrabold text-gray-400 uppercase">Total Doctors</span>
                    <span className="text-2xl font-black text-gray-800">{analytics.users.totalDoctors}</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-sky-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xs font-extrabold text-gray-400 uppercase">Consultations</span>
                    <span className="text-2xl font-black text-gray-800">{analytics.consultations.totalCount}</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xs font-extrabold text-gray-400 uppercase">Total Revenue</span>
                    <span className="text-2xl font-black text-gray-800">
                      ₹{Number(analytics.revenue.totalEarnings).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation Status Breakdown */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-md">
                <h3 className="font-extrabold text-gray-800 text-sm mb-4 border-b border-gray-50 pb-2 uppercase tracking-wider text-gray-400">
                  Consultations Status Breakdown
                </h3>
                <div className="flex flex-col gap-3 font-semibold text-xs">
                  {analytics.consultations.statusBreakdown?.map((item) => (
                    <div key={item.status} className="flex justify-between items-center bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                      <span className="text-gray-600">{item.status}</span>
                      <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold text-2xs">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 font-semibold">
              No analytics details compiled yet.
            </div>
          )
        ) : (
          /* Audit Logs Tab Content */
          <div className="flex flex-col gap-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-white/50 backdrop-blur border border-white/60 p-4 rounded-xl shadow-sm">
              <div className="flex flex-col gap-1 w-full sm:w-48">
                <label className="text-2xs font-bold text-gray-400 uppercase">Action</label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="border border-gray-200 p-2 rounded-lg text-xs bg-white font-semibold"
                >
                  <option value="">All</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="AUTH_LOGIN">LOGIN</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 w-full sm:w-48">
                <label className="text-2xs font-bold text-gray-400 uppercase">Resource Type</label>
                <select
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                  className="border border-gray-200 p-2 rounded-lg text-xs bg-white font-semibold"
                >
                  <option value="">All</option>
                  <option value="USER">USER</option>
                  <option value="AVAILABILITY_SLOTS">AVAILABILITY_SLOTS</option>
                  <option value="CONSULTATION">CONSULTATION</option>
                  <option value="PRESCRIPTION">PRESCRIPTION</option>
                  <option value="PAYMENT">PAYMENT</option>
                </select>
              </div>
            </div>

            {/* Audit Logs Table */}
            {loadingLogs ? (
              <div className="text-center py-20 text-gray-500 font-semibold">
                Loading compliance history...
              </div>
            ) : logs.length > 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-50/30 border-b border-gray-100 text-emerald-800 font-bold">
                      <th className="p-3">Audited Action</th>
                      <th className="p-3">Resource</th>
                      <th className="p-3">User Email</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Values Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-semibold text-gray-600">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/30">
                        <td className="p-3 font-bold text-gray-800">
                          <span className={`px-2 py-0.5 rounded text-2xs uppercase ${
                            log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-700' :
                            log.action === 'UPDATE' ? 'bg-amber-50 text-amber-700' :
                            'bg-gray-50 text-gray-700'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 uppercase text-2xs font-extrabold tracking-wider">{log.resourceType}</td>
                        <td className="p-3">{log.user?.email || "System"}</td>
                        <td className="p-3 text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="p-3 text-2xs font-mono break-all max-w-xs text-gray-400">
                          {JSON.stringify(log.newValues || log.oldValues || {})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center flex flex-col items-center gap-3">
                <ShieldAlert className="w-12 h-12 text-gray-300" />
                <h4 className="font-bold text-gray-700">No logs found</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Adjust active filter categories to search audit logs.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
