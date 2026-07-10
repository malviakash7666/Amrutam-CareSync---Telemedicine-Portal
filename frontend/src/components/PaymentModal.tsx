import React, { useState } from "react";
import { X, CreditCard, Mail, ShieldCheck } from "lucide-react";
import { paymentService } from "../services/paymentService";
import { useToast } from "../hooks/useToast";

interface PaymentModalProps {
  consultationId: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ consultationId, amount, onClose, onSuccess }) => {
  const toast = useToast();
  const [billingEmail, setBillingEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Dummy credit card states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await paymentService.processCheckout(consultationId, billingEmail || undefined);
      toast.success("Checkout processed successfully! Payment confirmed.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Payment checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <h3 className="font-bold text-emerald-800 text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Complete Consultation Payment
          </h3>
          <button
            onClick={onClose}
            className="text-emerald-800/60 hover:text-emerald-800 transition-colors p-1 rounded-lg hover:bg-emerald-100/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="text-center bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
            <span className="text-xs font-semibold text-gray-500 uppercase">Consultation Fee</span>
            <div className="text-3xl font-black text-emerald-700 mt-1">₹{amount}</div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-semibold mt-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure 256-bit SSL checkout</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Billing Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="billing@email.com"
                className="border border-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm w-full focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Card Information</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 •••• •••• ••••"
                className="border border-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm w-full focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Expiration</label>
              <input
                type="text"
                required
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                className="border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500 text-center"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">CVC Code</label>
              <input
                type="password"
                required
                maxLength={3}
                placeholder="•••"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
                className="border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500 text-center"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 mt-2 shadow-lg shadow-emerald-100"
          >
            {loading ? "Processing checkout..." : `Confirm Payment: ₹${amount}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
