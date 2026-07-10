import { apiCall } from "../authenticator/api";

export interface PaymentRecord {
  id: string;
  consultationId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  provider: string;
  providerTransactionId?: string;
  billingEmail?: string;
  paidAt?: string;
}

export const paymentService = {
  /**
   * Process a PENDING consultation payment (Patient Only)
   */
  processCheckout: async (consultationId: string, billingEmail?: string): Promise<PaymentRecord> => {
    const res = await apiCall<PaymentRecord>("/payments/checkout", {
      method: "POST",
      body: JSON.stringify({ consultationId, billingEmail }),
    });
    if (!res.payment) {
      throw new Error(res.message || "Payment checkout failed.");
    }
    return res.payment;
  },

  /**
   * Request refund for a successful payment (Admin Only)
   */
  refundPayment: async (paymentId: string): Promise<PaymentRecord> => {
    const res = await apiCall<PaymentRecord>(`/payments/${paymentId}/refund`, {
      method: "POST",
    });
    if (!res.payment) {
      throw new Error(res.message || "Payment refund request failed.");
    }
    return res.payment;
  },
};
