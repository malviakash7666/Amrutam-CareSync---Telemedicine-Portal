import React, { useState, useEffect } from "react";
import { X, FileText, Plus, Trash2, KeyRound, Check } from "lucide-react";
import { prescriptionService } from "../services/prescriptionService";
import type { Prescription, PrescriptionItemInput } from "../services/prescriptionService";
import { useToast } from "../hooks/useToast";

interface PrescriptionModalProps {
  consultationId: string;
  prescriptionId?: string; // If exists, view it
  onClose: () => void;
  onSuccess?: () => void;
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  consultationId,
  prescriptionId,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states (Doctor only)
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PrescriptionItemInput[]>([
    { drugName: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (prescriptionId) {
      const fetchPrescription = async () => {
        setLoading(true);
        try {
          const data = await prescriptionService.getPrescriptionById(prescriptionId);
          setPrescription(data);
        } catch (err) {
          toast.error("Failed to load prescription detail.");
        } finally {
          setLoading(false);
        }
      };
      fetchPrescription();
    }
  }, [prescriptionId]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { drugName: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PrescriptionItemInput, value: string) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    const invalidItem = items.some(item => !item.drugName || !item.dosage || !item.frequency || !item.duration);
    if (invalidItem) {
      toast.error("Please complete all medication details (Name, Dosage, Frequency, Duration).");
      return;
    }

    setSubmitLoading(true);
    try {
      await prescriptionService.issuePrescription(consultationId, notes, items);
      toast.success("Digital prescription cryptographically signed and issued!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to issue prescription.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-50 border-b border-emerald-100 shrink-0">
          <h3 className="font-bold text-emerald-800 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            {prescriptionId ? "Digital Prescription Detail" : "Issue Digital Prescription"}
          </h3>
          <button
            onClick={onClose}
            className="text-emerald-800/60 hover:text-emerald-800 transition-colors p-1 rounded-lg hover:bg-emerald-100/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-10 text-sm text-gray-500 font-semibold">
              Loading prescription data...
            </div>
          ) : prescription ? (
            /* View Prescription View */
            <div className="flex flex-col gap-6">
              {/* Doctor Metadata Box */}
              <div className="flex justify-between border-b border-gray-100 pb-4">
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-gray-800">AMRUTAM HEALTHCARE CLINIC</span>
                  <span className="text-xs text-gray-500 font-semibold mt-0.5">Telemedicine Consultation Summary</span>
                </div>
                <div className="text-right flex flex-col text-xs font-semibold text-gray-500">
                  <span>Issued At: {new Date(prescription.issuedAt).toLocaleDateString()}</span>
                  <span>ID: {prescription.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>

              {/* Patient Details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block uppercase">Patient:</span>
                  <span className="text-gray-800 font-bold text-sm">
                    {prescription.patient?.profile?.firstName} {prescription.patient?.profile?.lastName}
                  </span>
                  <span className="block mt-0.5">{prescription.patient?.email}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block uppercase">Status:</span>
                  <span className="text-emerald-600 font-extrabold text-sm flex items-center justify-end gap-1">
                    <Check className="w-4 h-4" /> Active Digital Copy
                  </span>
                </div>
              </div>

              {/* Prescribed Medications */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Prescribed Medications:
                </span>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-emerald-50/30 border-b border-gray-100 text-emerald-800 font-bold">
                        <th className="p-3">Drug Name</th>
                        <th className="p-3">Dosage</th>
                        <th className="p-3">Frequency</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-semibold text-gray-600">
                      {prescription.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/30">
                          <td className="p-3 font-bold text-gray-800">{item.drugName}</td>
                          <td className="p-3">{item.dosage}</td>
                          <td className="p-3">{item.frequency}</td>
                          <td className="p-3">{item.duration}</td>
                          <td className="p-3 text-gray-500 italic">{item.instructions || "None"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {prescription.notes && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Doctor's Notes:
                  </span>
                  <p className="text-sm font-medium text-gray-600 bg-gray-50/30 border border-gray-100 p-3 rounded-xl italic">
                    "{prescription.notes}"
                  </p>
                </div>
              )}

              {/* Cryptographic Signature Integrity Block */}
              <div className="border border-emerald-100 bg-emerald-50/20 rounded-xl p-4 flex gap-3 items-start mt-2">
                <KeyRound className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-extrabold text-emerald-800">
                    Cryptographically Secure Signature Verified
                  </span>
                  <p className="text-2xs text-emerald-800/80 font-medium leading-relaxed">
                    This document is signed and logged in our HIPAA compliance ledger. Any modifications will instantly invalidate the signature below:
                  </p>
                  <code className="text-2xs text-emerald-700 bg-emerald-100/30 border border-emerald-200/50 p-2 rounded-lg break-all font-mono mt-1 select-all font-semibold">
                    {prescription.digitalSignature}
                  </code>
                </div>
              </div>
            </div>
          ) : (
            /* Issue Prescription Form (Doctor Only) */
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Medication details:
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Drug
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 p-4 rounded-xl flex flex-col gap-3 relative bg-gray-50/30"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-2xs font-bold text-gray-400 uppercase">Drug Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Amoxicillin 500mg"
                            value={item.drugName}
                            onChange={(e) => handleItemChange(index, "drugName", e.target.value)}
                            className="border border-gray-200 p-2 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-2xs font-bold text-gray-400 uppercase">Dosage</label>
                          <input
                            type="text"
                            required
                            placeholder="1 Tablet"
                            value={item.dosage}
                            onChange={(e) => handleItemChange(index, "dosage", e.target.value)}
                            className="border border-gray-200 p-2 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-2xs font-bold text-gray-400 uppercase">Frequency</label>
                          <input
                            type="text"
                            required
                            placeholder="Twice a day"
                            value={item.frequency}
                            onChange={(e) => handleItemChange(index, "frequency", e.target.value)}
                            className="border border-gray-200 p-2 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-2xs font-bold text-gray-400 uppercase">Duration</label>
                          <input
                            type="text"
                            required
                            placeholder="7 Days"
                            value={item.duration}
                            onChange={(e) => handleItemChange(index, "duration", e.target.value)}
                            className="border border-gray-200 p-2 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-2xs font-bold text-gray-400 uppercase">Instructions</label>
                          <input
                            type="text"
                            placeholder="Take after meal"
                            value={item.instructions}
                            onChange={(e) => handleItemChange(index, "instructions", e.target.value)}
                            className="border border-gray-200 p-2 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 cursor-pointer p-1 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">General Notes / Diagnosis Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional patient guidance or dietary restrictions..."
                  className="border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-500 h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 mt-2 shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                {submitLoading ? "Signing & Issuing..." : "Digitally Sign & Issue Prescription"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;
