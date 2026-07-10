import { apiCall } from "../authenticator/api";

export interface PrescriptionItemInput {
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  issuedAt: string;
  notes?: string;
  digitalSignature: string;
  createdAt: string;
  items?: Array<{
    id: string;
    prescriptionId: string;
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  patient?: {
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

export const prescriptionService = {
  /**
   * Issue digital prescription for completed consultation (Doctor Only)
   */
  issuePrescription: async (
    consultationId: string,
    notes: string | undefined,
    items: PrescriptionItemInput[]
  ): Promise<Prescription> => {
    const res = await apiCall(`/prescriptions/consultations/${consultationId}`, {
      method: "POST",
      body: JSON.stringify({ notes, items }),
    });
    return res.prescription;
  },

  /**
   * Get prescription detail by ID
   */
  getPrescriptionById: async (id: string): Promise<Prescription> => {
    const res = await apiCall(`/prescriptions/${id}`);
    return res.prescription;
  },
};
