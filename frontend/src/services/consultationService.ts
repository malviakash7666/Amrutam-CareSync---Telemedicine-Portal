import { apiCall } from "../authenticator/api";
import type { AvailabilitySlot } from "./doctorService";

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  reasonForVisit?: string;
  diagnosisNotes?: string;
  createdAt: string;
  slot?: AvailabilitySlot;
  payments?: any[];
  prescription?: any;
  patient?: {
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  doctor?: {
    consultationFee: number;
    user?: {
      profile?: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

export const consultationService = {
  /**
   * Book a slot
   */
  bookConsultation: async (slotId: string, reasonForVisit?: string): Promise<{ consultation: Consultation; payment: any }> => {
    const res = await apiCall("/consultations", {
      method: "POST",
      body: JSON.stringify({ slotId, reasonForVisit }),
    });
    return {
      consultation: res.consultation,
      payment: res.payment,
    };
  },

  /**
   * Get historical and upcoming consultations
   */
  getConsultations: async (): Promise<Consultation[]> => {
    const res = await apiCall("/consultations");
    return res.consultations || [];
  },

  /**
   * Update lifecycle status of consultation (Doctor Only)
   */
  updateStatus: async (id: string, status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW"): Promise<Consultation> => {
    const res = await apiCall(`/consultations/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
    return res.consultation;
  },
};
