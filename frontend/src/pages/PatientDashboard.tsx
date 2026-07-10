import React, { useState, useEffect } from "react";
import { useToast } from "../hooks/useToast";
import { consultationService } from "../services/consultationService";
import type { Consultation } from "../services/consultationService";
import PaymentModal from "../components/PaymentModal";
import PrescriptionModal from "../components/PrescriptionModal";
import { Calendar, CreditCard, FileText, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const PatientDashboard: React.FC = () => {
  const toast = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal target states
  const [checkoutTarget, setCheckoutTarget] = useState<{ id: string; fee: number } | null>(null);
  const [prescriptionTarget, setPrescriptionTarget] = useState<{ consultationId: string; prescriptionId: string } | null>(null);

  const fetchConsultations = async () => {
    try {
      const data = await consultationService.getConsultations();
      setConsultations(data);
    } catch (err) {
      toast.error("Failed to load your consultations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const getStatusBadge = (status: string) => {
    const maps = {
      SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
      IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
      COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
      NO_SHOW: "bg-gray-50 text-gray-700 border-gray-200",
    };
    const active = maps[status as keyof typeof maps] || maps.SCHEDULED;

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${active}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-emerald-100/30 px-6 py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-gray-800">My Consultations</h2>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Review calendar reservations, checkout invoices, and download signed digital prescriptions.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 font-semibold">
            Loading consultations...
          </div>
        ) : consultations.length > 0 ? (
          <div className="flex flex-col gap-4">
            {consultations.map((c) => {
              const payment = c.payments?.[0];
              const isPaid = payment?.status === "SUCCESS";
              const isRefunded = payment?.status === "REFUNDED";

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                      <Calendar className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-emerald-700">
                        {c.doctor?.user?.profile?.firstName ? `Dr. ${c.doctor.user.profile.firstName} ${c.doctor.user.profile.lastName}` : "CareSync Doctor"}
                      </span>
                      <span className="text-sm font-black text-gray-800 mt-0.5">
                        {new Date(c.slot?.startTime || c.createdAt).toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(c.slot?.startTime || c.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {c.reasonForVisit && (
                        <p className="text-xs text-gray-400 mt-1 italic font-medium">
                          Note: "{c.reasonForVisit}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                    {getStatusBadge(c.status)}

                    {/* Payment Trigger */}
                    {!isPaid && !isRefunded && c.status !== "CANCELLED" ? (
                      <button
                        onClick={() =>
                          setCheckoutTarget({ id: c.id, fee: Number(c.doctor?.consultationFee || 500) })
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl cursor-pointer shadow-md shadow-amber-100 transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay Fee
                      </button>
                    ) : isRefunded ? (
                      <span className="text-2xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 border border-rose-100 rounded-full">
                        REFUNDED
                      </span>
                    ) : (
                      <span className="text-2xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                      </span>
                    )}

                    {/* Prescription trigger */}
                    {c.prescription ? (
                      <button
                        onClick={() =>
                          setPrescriptionTarget({
                            consultationId: c.id,
                            prescriptionId: c.prescription.id,
                          })
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer shadow-md shadow-emerald-100 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Rx Prescription
                      </button>
                    ) : (
                      c.status === "COMPLETED" && (
                        <span className="text-xs font-semibold text-gray-400 italic">
                          Awaiting Rx
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center flex flex-col items-center gap-3">
            <Calendar className="w-12 h-12 text-gray-300" />
            <h4 className="font-bold text-gray-700">No appointments booked yet</h4>
            <p className="text-xs text-gray-400 mt-1">
              Select Find Doctors from the top nav and secure your first slot!
            </p>
          </div>
        )}
      </div>

      {/* Checkout Modal Dialog */}
      {checkoutTarget && (
        <PaymentModal
          consultationId={checkoutTarget.id}
          amount={checkoutTarget.fee}
          onClose={() => setCheckoutTarget(null)}
          onSuccess={() => fetchConsultations()}
        />
      )}

      {/* View signed prescription details */}
      {prescriptionTarget && (
        <PrescriptionModal
          consultationId={prescriptionTarget.consultationId}
          prescriptionId={prescriptionTarget.prescriptionId}
          onClose={() => setPrescriptionTarget(null)}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
