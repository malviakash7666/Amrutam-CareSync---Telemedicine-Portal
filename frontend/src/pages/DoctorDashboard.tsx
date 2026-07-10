import React, { useState, useEffect } from "react";
import { useToast } from "../hooks/useToast";
import { consultationService } from "../services/consultationService";
import type { Consultation } from "../services/consultationService";
import { doctorService } from "../services/doctorService";
import PrescriptionModal from "../components/PrescriptionModal";
import { Calendar, Clock, Plus, Users, UserCheck, ShieldAlert, Award, FileSpreadsheet } from "lucide-react";

const DoctorDashboard: React.FC = () => {
  const toast = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  // New slot states
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);

  // Modal target
  const [prescriptionTargetId, setPrescriptionTargetId] = useState<string | null>(null);

  const fetchConsultations = async () => {
    try {
      const data = await consultationService.getConsultations();
      setConsultations(data);
    } catch (err) {
      toast.error("Failed to load your patient consultations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handlePublishSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      toast.error("Please fill in date, start time, and end time.");
      return;
    }

    const startISO = new Date(`${date}T${startTime}`).toISOString();
    const endISO = new Date(`${date}T${endTime}`).toISOString();

    if (new Date(startISO) <= new Date()) {
      toast.error("Slot start time must be in the future.");
      return;
    }

    if (new Date(endISO) <= new Date(startISO)) {
      toast.error("Slot end time must be after the start time.");
      return;
    }

    setPublishLoading(true);
    try {
      await doctorService.publishAvailability([{ startTime: startISO, endTime: endISO }]);
      toast.success("Availability slot published successfully.");
      setDate("");
      setStartTime("");
      setEndTime("");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish slot.");
    } finally {
      setPublishLoading(false);
    }
  };

  const handleStartSession = async (id: string) => {
    try {
      await consultationService.updateStatus(id, "IN_PROGRESS");
      toast.success("Consultation session started. Patient is in room.");
      fetchConsultations();
    } catch (err) {
      toast.error("Failed to start session.");
    }
  };

  const handleCancelSession = async (id: string) => {
    try {
      await consultationService.updateStatus(id, "CANCELLED");
      toast.success("Consultation session cancelled.");
      fetchConsultations();
    } catch (err) {
      toast.error("Failed to cancel session.");
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-emerald-100/30 px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Availability Slot Publisher */}
        <div className="lg:col-span-1 bg-white/70 backdrop-blur-md border border-white/40 p-6 rounded-2xl shadow-md h-fit flex flex-col gap-5">
          <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            Publish Availability Slot
          </h3>

          <form onSubmit={handlePublishSlot} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-200 p-2 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border border-gray-200 p-2 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 text-center"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border border-gray-200 p-2 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 text-center"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={publishLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-100"
            >
              <Clock className="w-4 h-4" />
              {publishLoading ? "Publishing..." : "Publish Slot"}
            </button>
          </form>
        </div>

        {/* Patient Appointment Queue */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h3 className="font-extrabold text-xl text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-600" />
              Patient Consultation Queue
            </h3>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Real-time updates
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500 font-semibold">
              Loading queue details...
            </div>
          ) : consultations.length > 0 ? (
            <div className="flex flex-col gap-4">
              {consultations.map((c) => {
                const isPaid = c.payments?.[0]?.status === "SUCCESS";

                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                          <UserCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-emerald-700">
                            {c.patient?.profile?.firstName} {c.patient?.profile?.lastName}
                          </span>
                          <span className="text-xs text-gray-400 font-semibold">{c.patient?.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-right text-xs font-bold text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(c.slot?.startTime || c.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          ({new Date(c.slot?.startTime || c.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })})
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-gray-800 uppercase font-black">{c.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Payment:</span>
                        <span className={`uppercase font-black ${isPaid ? "text-emerald-600" : "text-amber-600"}`}>
                          {isPaid ? "PAID" : "PENDING"}
                        </span>
                      </div>
                    </div>

                    {/* Operational Triggers */}
                    <div className="flex justify-end gap-2 mt-2">
                      {c.status === "SCHEDULED" && (
                        <>
                          <button
                            onClick={() => handleCancelSession(c.id)}
                            className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Cancel Appointment
                          </button>
                          <button
                            onClick={() => handleStartSession(c.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-100"
                          >
                            Start Consultation
                          </button>
                        </>
                      )}

                      {c.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => setPrescriptionTargetId(c.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-100 flex items-center gap-1"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          Complete & Issue Rx
                        </button>
                      )}

                      {c.status === "COMPLETED" && c.prescription && (
                        <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1.5 border border-emerald-100 rounded-lg flex items-center gap-1">
                          Prescription Issued
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center flex flex-col items-center gap-3">
              <ShieldAlert className="w-12 h-12 text-gray-300" />
              <h4 className="font-bold text-gray-700">No appointments scheduled</h4>
              <p className="text-xs text-gray-400 mt-1">
                Patients will appear here once they secure published availability slots.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Issue Composer Modal */}
      {prescriptionTargetId && (
        <PrescriptionModal
          consultationId={prescriptionTargetId}
          onClose={() => setPrescriptionTargetId(null)}
          onSuccess={() => fetchConsultations()}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
