import React from "react";
import { Activity, Shield, Calendar, CreditCard, Lock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 bg-gradient-to-br from-emerald-50/55 via-teal-50/30 to-emerald-100/20 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/60 border border-emerald-200/50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Shield className="w-4 h-4 text-emerald-600" />
          HIPAA & GDPR Secure Telemedicine
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-800 leading-tight">
          Smarter Care, <span className="text-emerald-600">Committed to Health</span>
        </h1>
        <p className="text-gray-600 text-base md:text-lg font-semibold max-w-xl">
          Amrutam CareSync is a production-grade virtual care network delivering secure consultations, verified practitioner listings, and cryptographically signed digital prescriptions.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md flex flex-col items-center gap-3">
            <Calendar className="w-8 h-8 text-emerald-600" />
            <h3 className="font-extrabold text-gray-800">Instant Slots</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Practitioners publish slot intervals. Exclusion constraints eliminate double bookings.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md flex flex-col items-center gap-3">
            <Lock className="w-8 h-8 text-emerald-600" />
            <h3 className="font-extrabold text-gray-800">PHI Encryption</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Protected Health Information (PHI) is secured dynamically with application-level keys.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md flex flex-col items-center gap-3">
            <CreditCard className="w-8 h-8 text-emerald-600" />
            <h3 className="font-extrabold text-gray-800">Direct Checkout</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Fast credit card integration and Stripe checkout simulations log transaction ledgers.
            </p>
          </div>
        </div>

        {/* Dynamic CTA */}
        <div className="mt-8">
          {user ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-500">
                Welcome back, <span className="font-extrabold text-emerald-600">{user.profile?.firstName}</span>!
              </span>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Please select your dashboard option from the navigation header.
              </p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-gray-500">
              Please sign in using the top header button to access practitioner schedules and dashboard options.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
