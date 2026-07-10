import { apiCall } from "../authenticator/api";

export interface DoctorProfile {
  id: string;
  userId: string;
  bio?: string;
  experienceYears: number;
  consultationFee: number;
  licenseNumber: string;
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  user?: {
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  specializations?: Array<{ id: string; name: string }>;
}

export interface AvailabilitySlot {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "RESERVED" | "BOOKED" | "BLOCKED";
  version: number;
}

export const doctorService = {
  /**
   * Search and filter verified doctors
   */
  getDoctors: async (filters: {
    specialization?: string;
    feeMin?: number;
    feeMax?: number;
    experienceMin?: number;
    search?: string;
  } = {}): Promise<DoctorProfile[]> => {
    const query = new URLSearchParams();
    if (filters.specialization) query.append("specialization", filters.specialization);
    if (filters.feeMin) query.append("feeMin", String(filters.feeMin));
    if (filters.feeMax) query.append("feeMax", String(filters.feeMax));
    if (filters.experienceMin) query.append("experienceMin", String(filters.experienceMin));
    if (filters.search) query.append("search", filters.search);

    const res = await apiCall(`/doctors?${query.toString()}`);
    return res.doctors || [];
  },

  /**
   * Get doctor by PK id
   */
  getDoctorById: async (id: string): Promise<DoctorProfile> => {
    const res = await apiCall(`/doctors/${id}`);
    return res.doctor;
  },

  /**
   * Publish doctor availability slots (Doctor Only)
   */
  publishAvailability: async (slots: Array<{ startTime: string; endTime: string }>): Promise<AvailabilitySlot[]> => {
    const res = await apiCall("/doctors/availability", {
      method: "POST",
      body: JSON.stringify({ slots }),
    });
    return res.slots || [];
  },

  /**
   * Retrieve active upcoming available slots for a doctor
   */
  getDoctorAvailability: async (id: string): Promise<AvailabilitySlot[]> => {
    const res = await apiCall(`/doctors/${id}/availability`);
    return res.slots || [];
  },
};
