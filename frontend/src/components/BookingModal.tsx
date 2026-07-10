import React, { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { doctorService } from "../services/doctorService";
import type { DoctorProfile, AvailabilitySlot } from "../services/doctorService";
import { consultationService } from "../services/consultationService";
import { useToast } from "../hooks/useToast";

interface BookingModalProps {
  doctor: DoctorProfile;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ doctor, onClose, onSuccess }) => {
  const toast = useToast();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const availableSlots = await doctorService.getDoctorAvailability(doctor.id);
        setSlots(availableSlots);
      } catch (err) {
        toast.error("Failed to load doctor availability.");
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [doctor.id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId) {
      toast.error("Please select a time slot.");
      return;
    }

    setBookingLoading(true);
    try {
      await consultationService.bookConsultation(selectedSlotId, reason);
      toast.success("Appointment booked successfully! Please complete checkout.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to book appointment.");
    } finally {
      setBookingLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <h3 className="font-bold text-emerald-800 text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Select Appointment Slot
          </h3>
          <button
            onClick={onClose}
            className="text-emerald-800/60 hover:text-emerald-800 transition-colors p-1 rounded-lg hover:bg-emerald-100/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4 items-center mb-6">
            <div>
              <h4 className="font-extrabold text-gray-800 text-sm">
                Dr. {doctor.user?.profile?.firstName} {doctor.user?.profile?.lastName}
              </h4>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">
                Specialty: {doctor.specializations?.[0]?.name || "General Medicine"}
              </p>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">
                Consultation Fee: <span className="text-emerald-600 font-extrabold">₹{doctor.consultationFee}</span>
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-6 text-sm text-gray-500 font-semibold">
              Loading available slots...
            </div>
          ) : slots.length > 0 ? (
            <form onSubmit={handleBooking} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Available Slots:
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {slots.map((slot) => (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                        selectedSlotId === slot.id
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200"
                          : "border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-200"
                      }`}
                    >
                      <span className="opacity-90">{formatDate(slot.startTime)}</span>
                      <span className="text-sm font-black">{formatTime(slot.startTime)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <label className="text-xs font-semibold text-gray-500">Reason for visit (optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Share a short note on symptoms..."
                  className="border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-500 h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading || !selectedSlotId}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 mt-2"
              >
                {bookingLoading ? "Booking slot..." : "Confirm Booking"}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
              <p className="text-sm text-gray-500 font-semibold">
                No active availability slots found.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Please check back later or choose another practitioner.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
