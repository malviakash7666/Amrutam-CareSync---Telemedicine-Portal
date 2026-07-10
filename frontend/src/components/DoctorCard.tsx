import React from "react";
import { Star, ShieldCheck, Award, DollarSign, Calendar } from "lucide-react";
import type { DoctorProfile } from "../services/doctorService";

interface DoctorCardProps {
  doctor: DoctorProfile;
  onBook: () => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBook }) => {
  const defaultAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300";

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex gap-4 items-start">
          <img
            src={defaultAvatar}
            alt={doctor.user?.profile?.firstName}
            className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500/20"
          />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-gray-800 text-md">
                Dr. {doctor.user?.profile?.firstName} {doctor.user?.profile?.lastName}
              </h4>
              {doctor.isVerified && (
                <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-50 shrink-0" />
              )}
            </div>
            <p className="text-xs font-semibold text-emerald-700 bg-emerald-50/50 px-2 py-0.5 rounded-full inline-block mt-0.5">
              {doctor.specializations?.[0]?.name || "General Medicine"}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-gray-500">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-gray-800">{doctor.ratingAvg}</span>
              <span>({doctor.ratingCount} reviews)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-gray-50 text-xs font-semibold text-gray-500">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>{doctor.experienceYears} Years Exp</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-gray-800 font-bold">₹{doctor.consultationFee}</span>
            <span>Fee</span>
          </div>
        </div>
      </div>

      <button
        onClick={onBook}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-xl transition-colors cursor-pointer mt-5 flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
      >
        <Calendar className="w-4 h-4" />
        Book Slot
      </button>
    </div>
  );
};

export default DoctorCard;
